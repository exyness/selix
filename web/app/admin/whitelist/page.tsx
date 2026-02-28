'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAllWhitelisted, usePlatform, useAdmin } from '@/lib/solana/hooks';
import { toast } from 'sonner';
import WalletRequired from '@/components/wallet/wallet-required';

export default function AdminTokenWhitelistPage() {
  const { publicKey, connected } = useWallet();
  const { whitelisted, loading, refetch } = useAllWhitelisted();
  const { platform } = usePlatform();
  const { manageWhitelist, loading: adminLoading } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'a-z' | 'z-a'>('newest');
  const [newTokenMint, setNewTokenMint] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const isAuthority = connected && publicKey && platform && 
    publicKey.toString() === platform.authority.toString();

  const handleAddToken = async () => {
    if (!newTokenMint) {
      toast.error('Please enter a token mint address');
      return;
    }

    try {
      const mintPubkey = new PublicKey(newTokenMint);
      const result = await manageWhitelist(mintPubkey, true);
      
      if (result) {
        setNewTokenMint('');
        setShowAddDialog(false);
        refetch();
      }
    } catch {
      toast.error('Invalid public key');
    }
  };

  const handleRemoveToken = async (tokenMint: PublicKey) => {
    const result = await manageWhitelist(tokenMint, false);
    if (result) {
      toast.success('Token removed from whitelist');
      refetch();
    }
  };

  // Filter and sort tokens
  console.log('Whitelisted tokens:', whitelisted);
  const filteredTokens = whitelisted
    .filter((token) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return token.mint.toString().toLowerCase().includes(query);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return Number(b.updatedAt) - Number(a.updatedAt);
        case 'oldest':
          return Number(a.updatedAt) - Number(b.updatedAt);
        case 'a-z':
          return a.mint.toString().localeCompare(b.mint.toString());
        case 'z-a':
          return b.mint.toString().localeCompare(a.mint.toString());
        default:
          return 0;
      }
    });
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-10 max-w-[1280px] mx-auto">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Loading whitelist...</p>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  // Show wallet connection prompt if not connected
  if (!connected) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-10 max-w-[1280px] mx-auto">
          <WalletRequired 
            title="Wallet Required"
            description="Please connect your Solana wallet to view the token whitelist."
            backLink="/admin"
            backLinkText="← Back to Admin"
          />
        </main>
        <StatusBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Restricted Banner - Only show if NOT authority */}
      {!isAuthority && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-destructive/20 to-background px-6 py-2 border-b border-destructive/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-[10px] font-mono font-bold text-destructive tracking-[0.2em] uppercase">
              ACCESS RESTRICTED — Authority wallet required for whitelist management
            </span>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground uppercase">Security Protocol Level 4</span>
        </div>
      )}

      <div className={isAuthority ? "pt-0" : "pt-10"}>
        <Navigation />
      </div>

      <main className={`pb-24 px-10 max-w-[1280px] mx-auto ${isAuthority ? "pt-32" : "pt-40"}`}>
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            </Link>
            <div className="flex-1 flex items-end justify-between">
              <div>
                <div className="text-[10px] font-mono text-primary tracking-[0.3em] uppercase mb-2">
                  {'/// Admin Panel — Token Management'}
                </div>
                <h1 className="text-4xl font-mono font-bold tracking-tight text-foreground uppercase">
                  Manage Whitelist
                </h1>
              </div>
              <Badge variant="outline" className="text-primary border-primary/30 px-4 py-1.5">
                {filteredTokens.length} TOKENS APPROVED
              </Badge>
            </div>
          </div>

          {/* Search & Sort */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                placeholder="Search by mint address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-card border-border h-12"
              />
            </div>
            <Button 
              onClick={() => setShowAddDialog(true)}
              disabled={!isAuthority || adminLoading}
              className="bg-primary text-primary-foreground border-primary font-bold h-12" 
              size="default"
            >
              + Add Token
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default" className="h-12 gap-3">
                  Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'a-z' ? 'A–Z' : 'Z–A'}
                  <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('a-z')}>A–Z</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('z-a')}>Z–A</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Token Grid */}
        {filteredTokens.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">
              {searchQuery ? 'No tokens found matching your search' : 'No tokens whitelisted yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTokens.map((token, index) => {
              if (!token?.mint) {
                console.log('Token missing mint:', token);
                return null;
              }
              
              const mintStr = token.mint.toString();
              const shortMint = `${mintStr.slice(0, 4)}...${mintStr.slice(-4)}`;
              const addedDate = new Date(Number(token.updatedAt) * 1000).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={mintStr} className="bg-[#0A0A0A] border border-white/5 p-6 relative group hover:border-[#0CA5B0]/30 transition-all">
                  {/* Approved Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-[#0CA5B0]/10 text-[#0CA5B0] border-[#0CA5B0]/40 text-[8px]">
                      APPROVED
                    </Badge>
                  </div>

                  {/* Token Header */}
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-full bg-[radial-gradient(circle_at_center,_rgba(12,165,176,0.2)_0%,_rgba(12,165,176,0.02)_100%)] border border-[#0CA5B0]/20 flex items-center justify-center font-mono text-2xl font-bold text-[#0CA5B0]">
                      {mintStr.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-mono font-bold text-white leading-tight">{shortMint}</h3>
                      <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">Token Mint</p>
                    </div>
                  </div>

                  {/* Token Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-gray-600">MINT</span>
                      <div className="flex items-center gap-2 text-gray-400">
                        {shortMint}
                        <Button 
                          variant="ghost" 
                          size="icon-xs" 
                          className="h-4 w-4"
                          onClick={() => {
                            navigator.clipboard.writeText(mintStr);
                            toast.success('Mint address copied!');
                          }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Whitelisted: {addedDate}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <a 
                      href={`/listings?token=${mintStr}`}
                      className="text-[10px] font-mono text-[#0CA5B0] hover:text-[#0CA5B0]/80 uppercase tracking-widest flex items-center gap-2 mb-3"
                    >
                      View Pair Listings <span>→</span>
                    </a>
                    
                    {isAuthority && (
                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-gray-400 hover:text-[#0CA5B0] hover:border-[#0CA5B0]/30 text-[10px]"
                          onClick={() => window.open(`https://solscan.io/token/${mintStr}`, '_blank')}
                        >
                          Solscan
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={adminLoading}
                              className="text-[10px]"
                            >
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove token from whitelist?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will prevent new listings using this token. Existing active listings will not be affected.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-500 hover:bg-red-600 border-red-500 text-white"
                                onClick={() => handleRemoveToken(token.mint)}
                              >
                                Remove Token
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Token Dialog */}
        <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Token to Whitelist</AlertDialogTitle>
              <AlertDialogDescription>
                Enter the SPL token mint address to add it to the whitelist. This will allow users to create listings with this token.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input
                placeholder="Token Mint Address (e.g., EPjFW...)"
                value={newTokenMint}
                onChange={(e) => setNewTokenMint(e.target.value)}
                className="bg-background border-border h-12 font-mono text-sm"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-[#0CA5B0] hover:bg-[#0CA5B0]/90 text-black border-[#0CA5B0]"
                onClick={handleAddToken}
                disabled={adminLoading}
              >
                {adminLoading ? 'Adding...' : 'Add Token'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <StatusBar />
    </div>
  );
}
