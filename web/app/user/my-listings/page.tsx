'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
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
import { useFetchListings, useCancelListing, useUserProfile } from '@/lib/solana/hooks';
import { toast } from 'sonner';

function formatAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatTimeRemaining(expiresAt: bigint) {
  const now = Math.floor(Date.now() / 1000);
  const remaining = Number(expiresAt) - now;
  
  if (remaining <= 0) return 'Expired';
  
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function MyListingsPage() {
  const { publicKey, connected } = useWallet();
  const { listings, loading } = useFetchListings();
  const { cancelListing, loading: cancelLoading } = useCancelListing();
  const { profile } = useUserProfile();

  // Filter listings by connected wallet
  const myListings = useMemo(() => {
    if (!publicKey) return [];
    return listings.filter(listing => 
      listing.maker.toString() === publicKey.toString()
    );
  }, [listings, publicKey]);

  const activeListings = myListings.filter(l => l.status.active !== undefined);
  const completedListings = myListings.filter(l => l.status.completed !== undefined);
  const cancelledListings = myListings.filter(l => l.status.cancelled !== undefined);
  const expiredListings = myListings.filter(l => l.status.expired !== undefined);

  const handleCancelListing = async (listingPubkey: string, tokenMint: string) => {
    try {
      const result = await cancelListing(
        new (await import('@solana/web3.js')).PublicKey(listingPubkey),
        new (await import('@solana/web3.js')).PublicKey(tokenMint)
      );
      
      if (result) {
        toast.success('Listing cancelled successfully!');
      }
    } catch (error) {
      console.error('Error cancelling listing:', error);
    }
  };

  if (!connected) {
    return (
      <div className="w-full min-h-screen bg-[#050505] text-[#EAEAEA]">
        <Navigation />
        <main className="pt-32 pb-24 px-8 max-w-[1280px] mx-auto">
          <div className="text-center py-12">
            <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">
              Please connect your wallet to view your listings
            </p>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#EAEAEA]">
      <Navigation />

      <main className="pt-32 pb-24 px-8 max-w-[1280px] mx-auto">
        {/* Stats Grid */}
        <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Created', value: profile?.listingsCreated?.toString() || '0', highlight: false },
            { label: 'Active Listings', value: activeListings.length.toString(), highlight: true },
            { label: 'Completion Rate', value: completedListings.length > 0 ? `${((completedListings.length / myListings.length) * 100).toFixed(1)}%` : '0%', highlight: false },
            { label: 'Total Volume', value: profile?.volumeAsMaker ? `${Number(profile.volumeAsMaker) / 1e9} SOL` : '0 SOL', highlight: false },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0A0A0A] border border-white/5 p-6 space-y-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{stat.label}</span>
              <div className={`text-2xl font-mono ${stat.highlight ? 'text-[#0CA5B0]' : 'text-white'}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs + New Listing */}
        <div className="flex items-center justify-between border-b border-white/5 mb-8">
          <div className="flex gap-10">
            {[
              { label: 'Active', count: activeListings.length, active: true },
              { label: 'Completed', count: completedListings.length, active: false },
              { label: 'Cancelled', count: cancelledListings.length, active: false },
              { label: 'Expired', count: expiredListings.length, active: false },
            ].map((tab) => (
              <button
                key={tab.label}
                className={`pb-4 text-[11px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors ${
                  tab.active ? 'text-[#0CA5B0] border-b-2 border-[#0CA5B0]' : 'text-gray-600 hover:text-white'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge className="text-[9px] bg-[#0CA5B0]/20 text-[#0CA5B0] border-[#0CA5B0]/20">
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
          <Link href="/create">
            <Button className="mb-4 bg-[#0CA5B0] text-black hover:bg-[#0CA5B0]/90 border-[#0CA5B0]" size="sm">
              + New Listing
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-[#0CA5B0] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">Loading your listings...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && activeListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest mb-4">
              You don't have any active listings
            </p>
            <Link href="/create">
              <Button className="bg-[#0CA5B0] text-black hover:bg-[#0CA5B0]/90 border-[#0CA5B0]" size="sm">
                Create Your First Listing
              </Button>
            </Link>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && activeListings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeListings.map((listing) => {
              const progress = Number(listing.amountSourceTotal - listing.amountSourceRemaining) / Number(listing.amountSourceTotal) * 100;
              const filled = Number(listing.amountSourceTotal - listing.amountSourceRemaining);
              const total = Number(listing.amountSourceTotal);
              const isPartiallyFilled = progress > 0 && progress < 100;

              return (
                <div key={listing.publicKey.toString()} className="bg-[#0A0A0A] border border-white/5 p-6 relative group hover:border-[#0CA5B0]/30 transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <div className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-xs font-mono">
                          {formatAddress(listing.tokenMintSource.toString())[0]}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-xs font-mono">
                          {formatAddress(listing.tokenMintDestination.toString())[0]}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-mono font-bold text-white">
                          {formatAddress(listing.tokenMintSource.toString())} → {formatAddress(listing.tokenMintDestination.toString())}
                        </h3>
                        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">
                          ID: {formatAddress(listing.publicKey.toString())}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={isPartiallyFilled 
                        ? 'text-orange-500 bg-orange-500/10 border-orange-500/20'
                        : 'text-green-500 bg-green-500/10 border-green-500/20'
                      }>
                        {isPartiallyFilled ? 'Partially Filled' : 'Active'}
                      </Badge>
                      <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {formatTimeRemaining(listing.expiresAt)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                      <span>Progress: {progress.toFixed(1)}% Filled</span>
                      <span>{filled.toLocaleString()} / {total.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 overflow-hidden">
                      <div className="h-full bg-[#0CA5B0]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex gap-2">
                      <Link href={`/listings/${listing.publicKey.toString()}`}>
                        <Button variant="outline" size="icon-sm" title="View Details">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            className="hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500" 
                            title="Cancel"
                            disabled={cancelLoading}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel this listing?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cancellation returns your deposited tokens minus network fees.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Listing</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-500 hover:bg-red-600 border-red-500 text-white"
                              onClick={() => handleCancelListing(
                                listing.publicKey.toString(),
                                listing.tokenMintSource.toString()
                              )}
                            >
                              Cancel Listing
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <Button variant="ghost" size="xs" className="gap-1.5 text-gray-500">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      Share
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <StatusBar />
    </div>
  );
}
