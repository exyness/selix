'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PublicKey } from '@solana/web3.js';
import { Copy, ExternalLink, Coins } from 'lucide-react';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { useProgram } from '@/lib/solana/use-program';
import { useQuery } from '@tanstack/react-query';
import { getUserProfilePDA } from '@/lib/anchor/setup';
import { useFetchListings, useFetchSwaps, useTokensMetadata } from '@/lib/solana/hooks';
import { toast } from 'sonner';

interface UserProfile {
  user: string;
  listingsCreated: number;
  swapsExecuted: number;
  totalVolume: bigint;
  referralCount: number;
  bump: number;
  createdAt: number;
  lastActivityAt: number;
  referrer?: string;
  activeListings: number;
  swapsReceived: number;
  volumeAsMaker: bigint;
  volumeAsTaker: bigint;
  totalFeesPaid: bigint;
  listingsCancelled: number;
}

interface TokenMetadata {
  mint: string;
  symbol?: string;
  name?: string;
  image?: string;
  decimals?: number;
}

function TokenDisplay({ metadata, mint, size = 'sm' }: { metadata?: TokenMetadata; mint: string; size?: 'sm' | 'xs' }) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5'
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
      <Coins className={size === 'xs' ? 'w-2 h-2' : 'w-2.5 h-2.5'} style={{ display: metadata?.image ? 'none' : 'block' }} />
    </div>
  );
}

function formatAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function formatJoinDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export default function UserProfilePage() {
  const params = useParams();
  const address = params.address as string;
  const { program } = useProgram();
  
  const userPublicKey = useMemo(() => {
    try {
      return new PublicKey(address);
    } catch {
      return null;
    }
  }, [address]);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', address],
    queryFn: async () => {
      if (!program || !userPublicKey) return null;
      
      try {
        const [profilePda] = getUserProfilePDA(userPublicKey);
        const profileAccount = await program.account.userProfile.fetch(profilePda);
        return profileAccount as unknown as UserProfile;
      } catch {
        return null;
      }
    },
    enabled: !!program && !!userPublicKey,
  });

  // Fetch user's listings
  const { listings } = useFetchListings();
  const userListings = useMemo(() => {
    if (!userPublicKey) return [];
    return listings.filter(l => l.maker.equals(userPublicKey));
  }, [listings, userPublicKey]);

  // Fetch user's swaps
  const { swaps } = useFetchSwaps(userPublicKey);

  // Get all unique token mints from user's listings and swaps
  const tokenMints = useMemo(() => {
    const mints = new Set<string>();
    userListings.forEach(listing => {
      mints.add(listing.tokenMintSource.toString());
      mints.add(listing.tokenMintDestination.toString());
    });
    swaps.forEach(swap => {
      mints.add(swap.tokenMintSource.toString());
      mints.add(swap.tokenMintDestination.toString());
    });
    return Array.from(mints).map(mint => new PublicKey(mint));
  }, [userListings, swaps]);

  const { tokensMetadata } = useTokensMetadata(tokenMints);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const openExplorer = () => {
    window.open(`https://explorer.solana.com/address/${address}?cluster=devnet`, '_blank');
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!profile) return null;
    
    const completionRate = profile.listingsCreated > 0 
      ? ((profile.listingsCreated - profile.listingsCancelled) / profile.listingsCreated * 100).toFixed(1)
      : '0.0';
    
    const totalSuccessfulSwaps = profile.swapsExecuted + profile.swapsReceived;
    
    return {
      completionRate: `${completionRate}%`,
      totalSuccessfulSwaps,
      volumeAsMaker: (Number(profile.volumeAsMaker) / 1e9).toFixed(2),
      volumeAsTaker: (Number(profile.volumeAsTaker) / 1e9).toFixed(2),
      totalFeesPaid: (Number(profile.totalFeesPaid) / 1e9).toFixed(2),
    };
  }, [profile]);

  // Recent listings (last 3)
  const recentListings = useMemo(() => {
    return userListings
      .sort((a, b) => b.createdAt.toNumber() - a.createdAt.toNumber())
      .slice(0, 3);
  }, [userListings]);

  // Recent swaps (last 3)
  const recentSwaps = useMemo(() => {
    return swaps.slice(0, 3);
  }, [swaps]);

  if (!userPublicKey) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-8 max-w-[1280px] mx-auto">
          <div className="text-center py-12">
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
              Invalid address
            </p>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-8 max-w-[1280px] mx-auto">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Loading profile...</p>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-8 max-w-[1280px] mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Coins className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-foreground uppercase mb-4">
              No Profile Yet
            </h1>
            <p className="text-muted-foreground text-base mb-8">
              This user hasn&apos;t created any listings or executed any swaps yet. 
              Profiles are automatically created when you interact with the platform.
            </p>
            
            <div className="bg-card border border-border p-8 rounded-lg mb-8">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-6">
                Get Started
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                To create your profile and start trading, you can:
              </p>
              <div className="space-y-4 text-left max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-mono text-primary">1</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground mb-1">Create a Listing</div>
                    <div className="text-xs text-muted-foreground">List your tokens for swap and set your preferred exchange rate</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-mono text-primary">2</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground mb-1">Execute a Swap</div>
                    <div className="text-xs text-muted-foreground">Browse the marketplace and swap tokens with other users</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/listings/create" 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded font-mono text-sm hover:bg-primary/90 transition-colors"
              >
                Create Your First Listing
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link 
                href="/listings" 
                className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded font-mono text-sm hover:bg-muted transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        {/* Profile Header */}
        <header className="mb-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-foreground">
                  {formatAddress(address)}
                </h1>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyAddress}
                    className="p-2 hover:bg-muted border border-border rounded transition-colors text-muted-foreground hover:text-foreground"
                    title="Copy Address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={openExplorer}
                    className="p-2 hover:bg-muted border border-border rounded transition-colors text-muted-foreground hover:text-foreground"
                    title="View on Solana Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-8 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <span>Joined: <span className="text-foreground ml-1">{formatJoinDate(profile.createdAt)}</span></span>
                <span>Last Active: <span className="text-foreground ml-1">{formatDate(profile.lastActivityAt)}</span></span>
                {profile.referrer && (
                  <span>Referrer: <a href={`/user/profile/${profile.referrer}`} className="text-primary hover:underline ml-1">{formatAddress(profile.referrer)}</a></span>
                )}
              </div>
            </div>
          </div>

          {/* Reputation Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Completion Rate', value: stats?.completionRate || '0%', highlight: true },
              { label: 'Avg Response Time', value: '—', highlight: false },
              { label: 'Total Successful Swaps', value: stats?.totalSuccessfulSwaps.toString() || '0', highlight: false },
            ].map((stat, i) => (
              <div key={i} className="p-4 border-l-2 border-primary bg-gradient-to-r from-primary/10 to-transparent">
                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</div>
                <div className={`text-xl font-mono ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Activity Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16">
          {[
            { label: 'Listings Created', value: profile.listingsCreated.toString(), highlight: false },
            { label: 'Listings Cancelled', value: profile.listingsCancelled.toString(), highlight: false },
            { label: 'Swaps Executed (Taker)', value: profile.swapsExecuted.toString(), highlight: false },
            { label: 'Swaps Received (Maker)', value: profile.swapsReceived.toString(), highlight: false },
            { label: 'Volume as Maker', value: `$${stats?.volumeAsMaker || '0.00'}`, highlight: true },
            { label: 'Volume as Taker', value: `$${stats?.volumeAsTaker || '0.00'}`, highlight: false },
            { label: 'Total Fees Paid', value: `$${stats?.totalFeesPaid || '0.00'}`, highlight: false },
            { label: 'Active Listings', value: profile.activeListings.toString(), highlight: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border p-4 sm:p-6">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-2">{stat.label}</span>
              <div className={`text-xl sm:text-2xl font-mono ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Listings */}
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-foreground">Recent Listings</h3>
              <a href="/user/my-listings" className="text-[9px] font-mono text-primary uppercase tracking-widest hover:underline">
                View All →
              </a>
            </div>
            <div className="bg-card border border-border overflow-hidden rounded-lg">
              {recentListings.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs font-mono text-muted-foreground">No listings yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {['Token Pair', 'Fill %', 'Status', 'Created'].map((h) => (
                          <th key={h} className="px-4 py-3 text-[9px] font-mono text-muted-foreground uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-[10px] font-mono">
                      {recentListings.map((listing, i) => {
                        const fillPercentage = listing.amountSourceTotal.gt(listing.amountSourceRemaining)
                          ? ((listing.amountSourceTotal.sub(listing.amountSourceRemaining).toNumber() / listing.amountSourceTotal.toNumber()) * 100).toFixed(0)
                          : '0';
                        
                        const statusInfo = 'active' in listing.status
                          ? { label: 'ACTIVE', color: 'text-primary bg-primary/10 border-primary/20' }
                          : 'partiallyFilled' in listing.status
                          ? { label: 'PARTIAL', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' }
                          : 'completed' in listing.status
                          ? { label: 'FILLED', color: 'text-green-500 bg-green-500/10 border-green-500/20' }
                          : 'cancelled' in listing.status
                          ? { label: 'CANCELLED', color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' }
                          : { label: 'EXPIRED', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
                        
                        const sourceToken = tokensMetadata.find(t => t.mint === listing.tokenMintSource.toString());
                        const destToken = tokensMetadata.find(t => t.mint === listing.tokenMintDestination.toString());
                        
                        return (
                          <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 text-foreground whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-1">
                                  <TokenDisplay metadata={sourceToken} mint={listing.tokenMintSource.toString()} size="xs" />
                                  <TokenDisplay metadata={destToken} mint={listing.tokenMintDestination.toString()} size="xs" />
                                </div>
                                <span>
                                  {sourceToken?.symbol || formatAddress(listing.tokenMintSource.toString())} / {destToken?.symbol || formatAddress(listing.tokenMintDestination.toString())}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{fillPercentage}%</td>
                            <td className="px-4 py-3">
                              <span className={`px-1.5 py-0.5 border text-[8px] ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(listing.createdAt.toNumber())}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Recent Swaps */}
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-foreground">Recent Swaps</h3>
              <a href="/user/my-swaps" className="text-[9px] font-mono text-primary uppercase tracking-widest hover:underline">
                View All →
              </a>
            </div>
            <div className="bg-card border border-border overflow-hidden rounded-lg">
              {recentSwaps.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs font-mono text-muted-foreground">No swaps yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {['Token Pair', 'Amount', 'Date', 'Status'].map((h) => (
                          <th key={h} className="px-4 py-3 text-[9px] font-mono text-muted-foreground uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-[10px] font-mono">
                      {recentSwaps.map((swap, i) => {
                        const sourceToken = tokensMetadata.find(t => t.mint === swap.tokenMintSource.toString());
                        const destToken = tokensMetadata.find(t => t.mint === swap.tokenMintDestination.toString());
                        const sourceDecimals = sourceToken?.decimals || 9;
                        
                        return (
                          <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 text-foreground whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-1">
                                  <TokenDisplay metadata={sourceToken} mint={swap.tokenMintSource.toString()} size="xs" />
                                  <TokenDisplay metadata={destToken} mint={swap.tokenMintDestination.toString()} size="xs" />
                                </div>
                                <span>
                                  {sourceToken?.symbol || formatAddress(swap.tokenMintSource.toString())} <span className="text-primary">→</span> {destToken?.symbol || formatAddress(swap.tokenMintDestination.toString())}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{(swap.amountSource.toNumber() / Math.pow(10, sourceDecimals)).toFixed(4)}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                              {new Date(swap.blockTime * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}, {new Date(swap.blockTime * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-green-500">SUCCESS</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            All profile data is sourced from on-chain accounts —{' '}
            <a href={`https://explorer.solana.com/address/${address}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Solana Explorer
            </a>
          </p>
        </div>
      </main>

      <StatusBar />
    </div>
  );
}
