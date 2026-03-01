'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { Coins } from 'lucide-react';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import WalletRequired from '@/components/wallet/wallet-required';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useFetchListings, useCancelListing, useCloseExpiredListing, useUserProfile, useTokensMetadata, type Listing } from '@/lib/solana/hooks';
import { toast } from 'sonner';

interface TokenMetadata {
  mint: string;
  symbol?: string;
  name?: string;
  image?: string;
  decimals?: number;
}

function TokenDisplay({ metadata, mint, size = 'md' }: { metadata?: TokenMetadata; mint: string; size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0`}>
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
      <Coins className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} style={{ display: metadata?.image ? 'none' : 'block' }} />
    </div>
  );
}

function formatAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatTimeRemaining(expiresAt: BN) {
  const now = Math.floor(Date.now() / 1000);
  const remaining = expiresAt.toNumber() - now;
  
  if (remaining <= 0) return 'Expired';
  
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function isListingExpired(expiresAt: BN): boolean {
  const now = Math.floor(Date.now() / 1000);
  return expiresAt.toNumber() <= now;
}

function formatTokenAmount(amount: BN, decimals: number = 9): string {
  const num = amount.toNumber() / Math.pow(10, decimals);
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function getListingStatus(listing: Listing): { label: string; className: string } {
  const isExpired = isListingExpired(listing.expiresAt);
  const status = listing.status;
  
  if (isExpired) {
    return {
      label: 'Expired',
      className: 'text-red-500 bg-red-500/10 border-red-500/20'
    };
  }
  
  if ('completed' in status) {
    return {
      label: 'Completed',
      className: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    };
  }
  
  if ('cancelled' in status) {
    return {
      label: 'Cancelled',
      className: 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    };
  }
  
  if ('partiallyFilled' in status) {
    return {
      label: 'Partial',
      className: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    };
  }
  
  if ('active' in status) {
    return {
      label: 'Active',
      className: 'text-green-500 bg-green-500/10 border-green-500/20'
    };
  }
  
  return {
    label: 'Unknown',
    className: 'text-muted-foreground bg-muted'
  };
}

export default function MyListingsPage() {
  const { publicKey, connected } = useWallet();
  const { listings, loading } = useFetchListings();
  const { cancelListing, loading: cancelLoading } = useCancelListing();
  const { closeExpiredListing, loading: closeLoading } = useCloseExpiredListing();
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'expired'>('active');
  const [shareListingId, setShareListingId] = useState<string | null>(null);

  // Filter listings by connected wallet
  const myListings = useMemo(() => {
    if (!publicKey) return [];
    return listings.filter(listing => 
      listing.maker.toString() === publicKey.toString()
    );
  }, [listings, publicKey]);

  // Get all unique token mints from my listings
  const tokenMints = useMemo(() => {
    const mints = new Set<string>();
    myListings.forEach(listing => {
      mints.add(listing.tokenMintSource.toString());
      mints.add(listing.tokenMintDestination.toString());
    });
    return Array.from(mints).map(mint => new PublicKey(mint));
  }, [myListings]);

  // Fetch metadata for all tokens
  const { tokensMetadata, loading: metadataLoading } = useTokensMetadata(tokenMints);

  const activeListings = myListings.filter(l => 'active' in l.status || 'partiallyFilled' in l.status);
  const completedListings = myListings.filter(l => 'completed' in l.status);
  const expiredListings = myListings.filter(l => {
    const isExpired = isListingExpired(l.expiresAt);
    return isExpired || 'expired' in l.status;
  });

  // Get current tab listings
  const currentListings = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return activeListings;
      case 'completed':
        return completedListings;
      case 'expired':
        return expiredListings;
      default:
        return activeListings;
    }
  }, [activeTab, activeListings, completedListings, expiredListings]);

  const handleCancelListing = async (listingPubkey: PublicKey, tokenMint: PublicKey) => {
    try {
      const result = await cancelListing(listingPubkey, tokenMint);
      
      if (result) {
        toast.success('Listing cancelled successfully!');
      }
    } catch (error) {
      console.error('Error cancelling listing:', error);
    }
  };

  const handleCloseExpiredListing = async (listingPubkey: PublicKey, maker: PublicKey, tokenMint: PublicKey) => {
    try {
      const result = await closeExpiredListing(listingPubkey, maker, tokenMint);
      
      if (result) {
        toast.success('Expired listing closed successfully!');
      }
    } catch (error) {
      console.error('Error closing expired listing:', error);
    }
  };

  if (!connected) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
          <WalletRequired
            title="Wallet Required"
            description="Please connect your Solana wallet to view and manage your listings."
            backLink="/listings"
            backLinkText="← Browse Listings"
            infoTitle="Connect Your Wallet"
            infoDescription="Click the wallet button in the navigation bar to connect your Solana wallet and manage your token swap listings."
          />
        </main>
        <StatusBar />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        {/* Stats Grid */}
        <div className="mb-8 lg:mb-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Created', value: profile?.listingsCreated?.toString() || '0', highlight: false },
            { label: 'Active Listings', value: activeListings.length.toString(), highlight: true },
            { label: 'Completion Rate', value: completedListings.length > 0 ? `${((completedListings.length / myListings.length) * 100).toFixed(1)}%` : '0%', highlight: false },
            { label: 'Total Volume', value: profile ? `${(Number(profile.volumeAsMaker + profile.volumeAsTaker) / 1e9).toFixed(2)} SOL` : '0 SOL', highlight: false },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border p-4 sm:p-6 space-y-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{stat.label}</span>
              <div className={`text-xl sm:text-2xl font-mono ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs + New Listing */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border mb-6 sm:mb-8 gap-4">
          <div className="flex gap-4 sm:gap-6 lg:gap-10 overflow-x-auto w-full sm:w-auto pb-4 sm:pb-0">
            {[
              { label: 'Active', count: activeListings.length, value: 'active' as const },
              { label: 'Completed', count: completedListings.length, value: 'completed' as const },
              { label: 'Expired', count: expiredListings.length, value: 'expired' as const },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.value)}
                className={`pb-4 text-[11px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.value ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge className="text-[9px] bg-primary/20 text-primary border-primary/20">
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
          <Link href="/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto mb-4 bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
              + New Listing
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {(loading || metadataLoading) && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Loading your listings...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !metadataLoading && currentListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
              {activeTab === 'active' && "You don't have any active listings"}
              {activeTab === 'completed' && "You don't have any completed listings"}
              {activeTab === 'expired' && "You don't have any expired listings"}
            </p>
            {activeTab === 'active' && (
              <Link href="/create">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                  Create Your First Listing
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Listings Grid */}
        {!loading && !metadataLoading && currentListings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {currentListings.map((listing) => {
              const sourceTokenMetadata = tokensMetadata.find(t => t.mint === listing.tokenMintSource.toString());
              const destTokenMetadata = tokensMetadata.find(t => t.mint === listing.tokenMintDestination.toString());
              
              const sourceDecimals = sourceTokenMetadata?.decimals || 9;
              
              const progress = listing.amountSourceTotal.sub(listing.amountSourceRemaining).toNumber() / listing.amountSourceTotal.toNumber() * 100;
              const filled = formatTokenAmount(listing.amountSourceTotal.sub(listing.amountSourceRemaining), sourceDecimals);
              const total = formatTokenAmount(listing.amountSourceTotal, sourceDecimals);
              
              const status = getListingStatus(listing);

              return (
                <div key={listing.publicKey.toString()} className="bg-card border border-border p-4 sm:p-6 relative group hover:border-primary/30 transition-all">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="flex -space-x-2">
                        <TokenDisplay 
                          metadata={sourceTokenMetadata} 
                          mint={listing.tokenMintSource.toString()} 
                          size="md" 
                        />
                        <TokenDisplay 
                          metadata={destTokenMetadata} 
                          mint={listing.tokenMintDestination.toString()} 
                          size="md" 
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-sm font-mono font-bold text-foreground">
                          {sourceTokenMetadata?.symbol || formatAddress(listing.tokenMintSource.toString())} 
                          <span className="text-muted-foreground mx-1">→</span> 
                          {destTokenMetadata?.symbol || formatAddress(listing.tokenMintDestination.toString())}
                        </h3>
                        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-tighter break-all">
                          ID: {formatAddress(listing.publicKey.toString())}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                      <Badge className={status.className}>
                        {status.label}
                      </Badge>
                      <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {formatTimeRemaining(listing.expiresAt)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 sm:mb-8">
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                      <span>Progress: {progress.toFixed(1)}% Filled</span>
                      <span className="text-right">{filled} / {total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted overflow-hidden rounded-full">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 sm:pt-6 border-t border-border gap-3">
                    <div className="flex gap-2 flex-1">
                      <Link href={`/listings/${listing.publicKey.toString()}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          View Details
                        </Button>
                      </Link>
                      {(('active' in listing.status) || ('partiallyFilled' in listing.status) || isListingExpired(listing.expiresAt)) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 gap-2" 
                              disabled={isListingExpired(listing.expiresAt) ? closeLoading : cancelLoading}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              {isListingExpired(listing.expiresAt) ? 'Close' : 'Cancel'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{isListingExpired(listing.expiresAt) ? 'Close' : 'Cancel'} this listing?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {isListingExpired(listing.expiresAt)
                                  ? 'This will close the expired listing and return your remaining tokens.'
                                  : 'Cancellation returns your deposited tokens minus network fees.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Listing</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-500 hover:bg-red-600 border-red-500 text-white"
                                onClick={() => {
                                  if (isListingExpired(listing.expiresAt)) {
                                    handleCloseExpiredListing(
                                      listing.publicKey,
                                      listing.maker,
                                      listing.tokenMintSource
                                    );
                                  } else {
                                    handleCancelListing(
                                      listing.publicKey,
                                      listing.tokenMintSource
                                    );
                                  }
                                }}
                              >
                                {isListingExpired(listing.expiresAt) ? 'Close Listing' : 'Cancel Listing'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShareListingId(listing.publicKey.toString())}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      Share
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Share Modal */}
        <AlertDialog open={!!shareListingId} onOpenChange={(open) => !open && setShareListingId(null)}>
          <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Share Listing</AlertDialogTitle>
              <AlertDialogDescription>
                Share this listing link with others to let them view and swap.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="bg-muted border border-border rounded-md px-3 py-2 text-xs font-mono text-foreground break-all max-h-20 overflow-y-auto">
                  {shareListingId && `${typeof window !== 'undefined' ? window.location.origin : ''}/listings/${shareListingId}`}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (shareListingId) {
                      navigator.clipboard.writeText(`${window.location.origin}/listings/${shareListingId}`);
                      toast.success('Link copied to clipboard!');
                    }
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 justify-center"
                  onClick={() => {
                    if (shareListingId) {
                      window.open(`https://twitter.com/intent/tweet?text=Check out this token swap listing on Selix!&url=${encodeURIComponent(window.location.origin + '/listings/' + shareListingId)}`, '_blank');
                    }
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="hidden sm:inline">Share on X</span>
                  <span className="sm:hidden">X</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 justify-center"
                  onClick={() => {
                    if (shareListingId) {
                      window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin + '/listings/' + shareListingId)}&text=Check out this token swap listing on Selix!`, '_blank');
                    }
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                  </svg>
                  <span className="hidden sm:inline">Telegram</span>
                  <span className="sm:hidden">TG</span>
                </Button>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <StatusBar />
    </div>
  );
}
