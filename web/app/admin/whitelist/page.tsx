'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { Coins } from 'lucide-react';
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
import { useAllWhitelisted, usePlatform, useAdmin, useTokensMetadata } from '@/lib/solana/hooks';
import { toast } from 'sonner';
import WalletRequired from '@/components/wallet/wallet-required';

interface TokenMetadata {
  mint: string;
  name?: string;
  symbol?: string;
  image?: string;
  decimals?: number;
}

interface WhitelistedToken {
  mint: PublicKey;
  updatedAt: bigint;
  metadata?: TokenMetadata;
}

interface TokenCardProps {
  token: WhitelistedToken;
  metadata?: TokenMetadata;
  isAuthority: boolean;
  adminLoading: boolean;
  onRemove: (mint: PublicKey) => Promise<void>;
}

function TokenCard({ token, metadata, isAuthority, adminLoading, onRemove }: TokenCardProps) {
  
  const mintStr = token.mint.toString();
  const shortMint = `${mintStr.slice(0, 4)}...${mintStr.slice(-4)}`;
  const addedDate = new Date(Number(token.updatedAt) * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-card border border-border p-6 relative group hover:border-primary/30 transition-all">
      {/* Approved Badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-primary/10 text-primary border-primary/40 text-[8px]">
          APPROVED
        </Badge>
      </div>

      {/* Token Header */}
      <div className="flex items-center gap-5 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {metadata?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={metadata.image} 
              alt={metadata.symbol || 'Token'} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <Coins className="w-8 h-8 text-primary" style={{ display: metadata?.image ? 'none' : 'block' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-mono font-bold text-foreground leading-tight truncate">
            {metadata?.name || shortMint}
          </h3>
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
            {metadata?.symbol || 'TOKEN'}
          </p>
        </div>
      </div>

      {/* Token Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-muted-foreground">MINT</span>
          <div className="flex items-center gap-2 text-foreground">
            {shortMint}
            <Button 
              variant="ghost" 
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => {
                navigator.clipboard.writeText(mintStr);
                toast.success('Mint address copied!');
              }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </Button>
          </div>
        </div>
        {metadata?.decimals && (
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground">DECIMALS</span>
            <span className="text-foreground">{metadata.decimals}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Whitelisted: {addedDate}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <a 
          href={`/listings?token=${mintStr}`}
          className="text-[10px] font-mono text-primary hover:text-primary/80 uppercase tracking-widest flex items-center gap-2 mb-3"
        >
          View Pair Listings <span>→</span>
        </a>
        
        {isAuthority && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-muted-foreground hover:text-primary hover:border-primary/30 text-[10px]"
              onClick={() => window.open(`https://solscan.io/token/${mintStr}?cluster=devnet`, '_blank')}
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
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove token from whitelist?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will prevent new listings using this token. Existing active listings will not be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={() => onRemove(token.mint)}
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
}

export default function AdminTokenWhitelistPage() {
  const { publicKey, connected } = useWallet();
  const { whitelisted, loading, refetch } = useAllWhitelisted();
  const { platform } = usePlatform();
  const { manageWhitelist, loading: adminLoading } = useAdmin();
  
  // Fetch metadata for all whitelisted tokens
  const whitelistedMints = whitelisted.map(entry => entry.mint);
  const { tokensMetadata, loading: metadataLoading } = useTokensMetadata(whitelistedMints);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'a-z' | 'z-a'>('newest');
  const [newTokenMint, setNewTokenMint] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const isAuthority: boolean = Boolean(
    connected && publicKey && platform && 
    publicKey.toString() === platform.authority.toString()
  );

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

  // Filter and sort tokens with metadata
  const tokensWithMetadata: WhitelistedToken[] = whitelisted.map((token) => {
    const metadata = tokensMetadata.find(m => m.mint === token.mint.toString());
    return { ...token, metadata };
  });

  const filteredTokens = tokensWithMetadata
    .filter((token) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const mintMatch = token.mint.toString().toLowerCase().includes(query);
      const symbolMatch = token.metadata?.symbol?.toLowerCase().includes(query);
      const nameMatch = token.metadata?.name?.toLowerCase().includes(query);
      return mintMatch || symbolMatch || nameMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return Number(b.updatedAt) - Number(a.updatedAt);
        case 'oldest':
          return Number(a.updatedAt) - Number(b.updatedAt);
        case 'a-z':
          return (a.metadata?.symbol || a.mint.toString()).localeCompare(
            b.metadata?.symbol || b.mint.toString()
          );
        case 'z-a':
          return (b.metadata?.symbol || b.mint.toString()).localeCompare(
            a.metadata?.symbol || a.mint.toString()
          );
        default:
          return 0;
      }
    });

  if (loading || metadataLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-10 max-w-[1280px] mx-auto">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Loading token metadata...</p>
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
        <div className="fixed top-[73px] left-0 right-0 z-[60] bg-gradient-to-r from-destructive/20 to-background px-6 py-2 border-b border-destructive/50 flex items-center justify-between">
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

      <Navigation />

      <main className={`pb-24 px-10 max-w-[1280px] mx-auto ${isAuthority ? "pt-32" : "pt-36"}`}>
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
              variant="outline" 
              size="default"
              onClick={() => refetch()}
              disabled={loading}
              className="h-12 border-border text-muted-foreground hover:text-foreground"
            >
              <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
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
            <div className="text-muted-foreground mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
              {searchQuery ? 'No tokens found matching your search' : 'No tokens whitelisted yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTokens.map((token) => {
              if (!token?.mint) return null;
              
              return (
                <TokenCard
                  key={token.mint.toString()}
                  token={token}
                  metadata={token.metadata}
                  isAuthority={isAuthority}
                  adminLoading={adminLoading}
                  onRemove={handleRemoveToken}
                />
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
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
