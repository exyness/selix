'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
import { useFetchListings, useExecuteSwap, useCancelListing } from '@/lib/solana/hooks';
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

function formatDate(timestamp: bigint) {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) + ', ' + 
         date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' UTC';
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { listings, loading } = useFetchListings();
  const { executeSwap, loading: swapLoading } = useExecuteSwap();
  const { cancelListing, loading: cancelLoading } = useCancelListing();

  const [swapAmount, setSwapAmount] = useState('');
  const [listing, setListing] = useState<any>(null);

  const listingId = params.id as string;

  useEffect(() => {
    if (!loading && listings.length > 0) {
      const found = listings.find(l => l.publicKey.toString() === listingId);
      if (found) {
        setListing(found);
      }
    }
  }, [listings, loading, listingId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#050505] text-[#EAEAEA]">
        <Navigation />
        <main className="pt-32 pb-24 px-6 max-w-[1280px] mx-auto">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-[#0CA5B0] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">Loading listing...</p>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="w-full min-h-screen bg-[#050505] text-[#EAEAEA]">
        <Navigation />
        <main className="pt-32 pb-24 px-6 max-w-[1280px] mx-auto">
          <div className="text-center py-12">
            <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">Listing not found</p>
            <Link href="/listings">
              <Button variant="outline" size="sm" className="mt-4">Back to Market</Button>
            </Link>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  const progress = Number(listing.amountSourceTotal - listing.amountSourceRemaining) / Number(listing.amountSourceTotal) * 100;
  const rate = Number(listing.amountDestinationTotal) / Number(listing.amountSourceTotal);
  const isMaker = connected && publicKey && listing.maker.toString() === publicKey.toString();
  const isActive = listing.status.active !== undefined;

  const handleExecuteSwap = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    const amount = parseFloat(swapAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const minFill = Number(listing.minFillAmount);
    const remaining = Number(listing.amountSourceRemaining);

    if (amount < minFill) {
      toast.error(`Minimum fill amount is ${minFill}`);
      return;
    }

    if (amount > remaining) {
      toast.error(`Only ${remaining} available`);
      return;
    }

    try {
      const result = await executeSwap({
        listing: listing.publicKey,
        maker: listing.maker,
        offeredMint: listing.tokenMintSource,
        requestedMint: listing.tokenMintDestination,
        fillAmount: amount,
      });

      if (result) {
        toast.success('Swap executed successfully!');
        setSwapAmount('');
        // Refresh listing data
      }
    } catch (error) {
      console.error('Error executing swap:', error);
    }
  };

  const handleCancelListing = async () => {
    try {
      const result = await cancelListing(listing.publicKey, listing.tokenMintSource);
      if (result) {
        toast.success('Listing cancelled successfully!');
        router.push('/my-listings');
      }
    } catch (error) {
      console.error('Error cancelling listing:', error);
    }
  };

  const receiveAmount = swapAmount ? (parseFloat(swapAmount) * rate).toFixed(6) : '0.00';

  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#EAEAEA]">
      <Navigation />

      <main className="pt-32 pb-24 px-6 max-w-[1280px] mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/listings">
            <Button variant="ghost" size="xs" className="text-gray-500 gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Back to Market
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column — Listing Details */}
          <div className="col-span-12 lg:col-span-7 space-y-8">

            {/* Listing Header */}
            <div className="bg-[#0A0A0A] border border-white/5 p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    <div className="w-12 h-12 rounded-full bg-[#111] border border-white/10 flex items-center justify-center relative z-10">
                      <span className="text-[10px] font-bold font-mono">{formatAddress(listing.tokenMintSource.toString()).slice(0, 2)}</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#111] border border-white/10 flex items-center justify-center relative z-0">
                      <span className="text-[10px] font-bold font-mono">{formatAddress(listing.tokenMintDestination.toString()).slice(0, 2)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-medium">
                        {formatAddress(listing.tokenMintSource.toString())} <span className="text-gray-600">→</span> {formatAddress(listing.tokenMintDestination.toString())}
                      </h2>
                      <Badge className={isActive 
                        ? 'text-green-500 bg-green-500/10 border-green-500/20'
                        : 'text-gray-500 bg-gray-500/10 border-gray-500/20'
                      }>
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[10px] text-gray-500 tracking-wider">
                      <span>ID: {formatAddress(listing.publicKey.toString())}</span>
                      <span>CREATED: {formatDate(listing.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Expires In</span>
                  <span className="text-xl font-mono text-white">{formatTimeRemaining(listing.expiresAt)}</span>
                </div>
              </div>

              {/* Exchange Details */}
              <div className="grid grid-cols-2 gap-y-8 pt-8 border-t border-white/5">
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Exchange Rate</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-mono text-[#0CA5B0]">{rate.toFixed(6)}</span>
                    <span className="text-[10px] font-mono text-gray-500">per token</span>
                  </div>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Fill Progress</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-mono text-white">{progress.toFixed(2)}%</span>
                    <span className="text-[10px] font-mono text-gray-500">
                      {Number(listing.amountSourceTotal - listing.amountSourceRemaining).toLocaleString()} / {Number(listing.amountSourceTotal).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="w-full h-[3px] bg-white/5 mb-2">
                    <div className="h-full bg-[#0CA5B0]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Min Fill Amount</span>
                  <span className="text-sm font-mono text-white">{Number(listing.minFillAmount).toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Max Slippage</span>
                  <span className="text-sm font-mono text-white">{(listing.maxSlippageBps / 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Fill Count</span>
                  <span className="text-sm font-mono text-white">{listing.fillCount}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Remaining</span>
                  <span className="text-sm font-mono text-white">{Number(listing.amountSourceRemaining).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Swap Form */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Swap Execution Form */}
            {!isMaker && isActive && (
              <div className="sticky top-24 bg-[#0A0A0A] border border-white/10 p-6">
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">You Send</label>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Available: {Number(listing.amountSourceRemaining).toLocaleString()}</span>
                  </div>
                  <div className="relative bg-[#111] border border-white/10 p-4 focus-within:border-[#0CA5B0]/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={swapAmount}
                        onChange={(e) => setSwapAmount(e.target.value)}
                        className="border-0 bg-transparent text-xl h-auto p-0 focus-visible:ring-0 w-full"
                        disabled={!connected}
                      />
                      <div className="flex items-center gap-3 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="xs" 
                          className="text-[#0CA5B0] h-auto py-0.5"
                          onClick={() => setSwapAmount(Number(listing.amountSourceRemaining).toString())}
                          disabled={!connected}
                        >
                          MAX
                        </Button>
                        <span className="text-sm font-medium">{formatAddress(listing.tokenMintDestination.toString())}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center -my-4 relative z-10">
                  <div className="w-8 h-8 bg-[#050505] border border-white/10 flex items-center justify-center">
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7m14-8l-7 7-7-7" /></svg>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">You Receive (Est.)</label>
                  </div>
                  <div className="bg-[#111] border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-mono text-white">{receiveAmount}</span>
                      <span className="text-sm font-medium">{formatAddress(listing.tokenMintSource.toString())}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-8 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Protocol Fee (0.1%)</span>
                    <span className="text-white">{swapAmount ? (parseFloat(swapAmount) * 0.001).toFixed(6) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Network Fee</span>
                    <span className="text-white">~0.000005 SOL</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-400 uppercase tracking-widest">Exchange Rate</span>
                    <span className="text-white">{rate.toFixed(6)}</span>
                  </div>
                </div>

                {connected ? (
                  <Button 
                    onClick={handleExecuteSwap}
                    disabled={swapLoading || !swapAmount}
                    className="w-full bg-[#0CA5B0] hover:bg-[#0CA5B0]/90 text-black font-mono font-bold text-[11px] uppercase tracking-[0.2em] h-12 border-[#0CA5B0] disabled:opacity-50"
                  >
                    {swapLoading ? 'Executing...' : 'Execute Swap'}
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-[#0CA5B0] hover:bg-[#0CA5B0]/90 text-black font-mono font-bold text-[11px] uppercase tracking-[0.2em] h-12 border-[#0CA5B0]"
                  >
                    Connect Wallet to Swap
                  </Button>
                )}
              </div>
            )}

            {/* Maker Info */}
            <div className="bg-[#0A0A0A] border border-white/5 p-6">
              <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-4">Listing Maker</span>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-full" />
                  <span className="text-xs font-mono">{formatAddress(listing.maker.toString())}</span>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(listing.maker.toString());
                      toast.success('Address copied!');
                    }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  </Button>
                  <Link href={`/profile/${listing.maker.toString()}`}>
                    <Button variant="ghost" size="icon-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy Link
              </Button>
            </div>

            {/* Maker Action Buttons */}
            {isMaker && isActive && (
              <div className="pt-4 border-t border-white/5">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full" disabled={cancelLoading}>
                      Cancel Listing
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Listing?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will return your deposited tokens minus network fees. The remaining {Number(listing.amountSourceRemaining).toLocaleString()} tokens will be refunded.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Listing</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-500 hover:bg-red-600 border-red-500 text-white"
                        onClick={handleCancelListing}
                      >
                        Cancel Listing
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </main>

      <StatusBar />
    </div>
  );
}
  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#EAEAEA]">
      <Navigation />

      <main className="pt-32 pb-24 px-6 max-w-[1280px] mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/listings">
            <Button variant="ghost" size="xs" className="text-gray-500 gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Back to Market
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column — Listing Details */}
          <div className="col-span-12 lg:col-span-7 space-y-8">

            {/* Listing Header */}
            <div className="bg-[#0A0A0A] border border-white/5 p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    <div className="w-12 h-12 rounded-full bg-[#111] border border-white/10 flex items-center justify-center relative z-10">
                      <span className="text-[10px] font-bold font-mono">USDC</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#111] border border-white/10 flex items-center justify-center relative z-0">
                      <span className="text-[10px] font-bold font-mono">SOL</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-medium">USDC <span className="text-gray-600">→</span> SOL</h2>
                      <Badge className="text-green-500 bg-green-500/10 border-green-500/20">Active</Badge>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[10px] text-gray-500 tracking-wider">
                      <span>ID: #SLX-00291</span>
                      <span>CREATED: 24 OCT, 14:02 UTC</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Expires In</span>
                  <span className="text-xl font-mono text-white">04:12:08</span>
                </div>
              </div>

              {/* Exchange Details */}
              <div className="grid grid-cols-2 gap-y-8 pt-8 border-t border-white/5">
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Exchange Rate</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-mono text-[#0CA5B0]">142.45</span>
                    <span className="text-[10px] font-mono text-gray-500">USDC / SOL</span>
                  </div>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Fill Progress</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-mono text-white">84.00%</span>
                    <span className="text-[10px] font-mono text-gray-500">4,200 / 5,000 USDC</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="w-full h-[3px] bg-white/5 mb-2">
                    <div className="h-full bg-[#0CA5B0]" style={{ width: '84%' }} />
                  </div>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Min Fill Amount</span>
                  <span className="text-sm font-mono text-white">10.00 USDC</span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Max Slippage</span>
                  <span className="text-sm font-mono text-white">0.50%</span>
                </div>
              </div>
            </div>

            {/* Fill History */}
            <div className="bg-[#0A0A0A] border border-white/5">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-mono text-[10px] text-white uppercase tracking-[0.2em]">Fill History</h3>
                <span className="text-[9px] font-mono text-gray-500">3 Events Found</span>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                    <th className="px-6 py-4">Taker</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4 text-right">TX</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {[
                    { taker: '4zHk...m9Q2', amount: '350.00 USDC', time: '2m ago' },
                    { taker: '8vP9...x3A1', amount: '1,200.00 USDC', time: '14m ago' },
                    { taker: 'K8m3...z5T8', amount: '2,650.00 USDC', time: '1h 04m ago' },
                  ].map((fill, i) => (
                    <tr key={i} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4 text-gray-400">{fill.taker}</td>
                      <td className="px-6 py-4 text-white">{fill.amount}</td>
                      <td className="px-6 py-4 text-gray-500">{fill.time}</td>
                      <td className="px-6 py-4 text-right">
                        <a href="#" className="text-[#0CA5B0] hover:underline">↗</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Simulation Preview */}
            <div className="p-6 bg-[#0CA5B0]/5 border border-[#0CA5B0]/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0CA5B0]" />
                <h4 className="text-[10px] font-mono text-[#0CA5B0] uppercase tracking-widest">Simulation Preview</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">Balance Change:</span>
                  <span className="text-white">-800.00 USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Receive:</span>
                  <span className="text-green-500">+5.616 SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Network State:</span>
                  <span className="text-white">Success</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Est. Compute:</span>
                  <span className="text-white">24,192 CU</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Swap Form */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Swap Execution Form */}
            <div className="sticky top-24 bg-[#0A0A0A] border border-white/10 p-6">
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">You Send</label>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Balance: 1,420.50</span>
                </div>
                <div className="relative bg-[#111] border border-white/10 p-4 focus-within:border-[#0CA5B0]/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="border-0 bg-transparent text-xl h-auto p-0 focus-visible:ring-0 w-full"
                    />
                    <div className="flex items-center gap-3 shrink-0">
                      <Button variant="ghost" size="xs" className="text-[#0CA5B0] h-auto py-0.5">MAX</Button>
                      <span className="text-sm font-medium">USDC</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center -my-4 relative z-10">
                <div className="w-8 h-8 bg-[#050505] border border-white/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7m14-8l-7 7-7-7" /></svg>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">You Receive (Est.)</label>
                </div>
                <div className="bg-[#111] border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-mono text-white/40">0.00</span>
                    <span className="text-sm font-medium">SOL</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-8 text-[10px] font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">Protocol Fee (0.1%)</span>
                  <span className="text-white">0.80 USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Network Fee</span>
                  <span className="text-white">0.000005 SOL</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span className="text-gray-400 uppercase tracking-widest">Total Cost</span>
                  <span className="text-white">800.80 USDC</span>
                </div>
              </div>

              <Button className="w-full bg-[#0CA5B0] hover:bg-[#0CA5B0]/90 text-black font-mono font-bold text-[11px] uppercase tracking-[0.2em] h-12 border-[#0CA5B0]">
                Execute Swap
              </Button>
            </div>

            {/* Maker Info */}
            <div className="bg-[#0A0A0A] border border-white/5 p-6">
              <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-4">Listing Maker</span>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-full" />
                  <span className="text-xs font-mono">7xR9...e2Lp</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  </Button>
                  <Button variant="ghost" size="icon-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 mb-1">Total Listings</span>
                  <span className="text-sm font-mono">42</span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 mb-1">Total Swaps</span>
                  <span className="text-sm font-mono">1.2k</span>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy Link
              </Button>
              <Button variant="outline" size="icon-sm">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </Button>
            </div>

            {/* Maker Action Buttons */}
            <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm">Update Listing</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">Cancel Listing</Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Listing #SLX-00291?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will return your deposited tokens minus network fees. The remaining 800 USDC will be refunded.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Listing</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-500 hover:bg-red-600 border-red-500 text-white">
                      Cancel Listing
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </main>

      <StatusBar />
    </div>
  );
}
