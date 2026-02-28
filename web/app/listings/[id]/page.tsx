'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { Coins } from 'lucide-react';
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
import { useFetchListings, useExecuteSwap, useCancelListing, useTokensMetadata } from '@/lib/solana/hooks';
import { toast } from 'sonner';
import { CountdownTimer } from '@/components/ui/countdown-timer';

function formatAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
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

  // Fetch token metadata for the listing
  const tokenMints = listing ? [listing.tokenMintSource.toString(), listing.tokenMintDestination.toString()] : [];
  const { tokensMetadata, loading: metadataLoading } = useTokensMetadata(
    tokenMints.map(mint => new PublicKey(mint))
  );

  const sourceTokenMetadata = tokensMetadata.find(t => t.mint === listing?.tokenMintSource.toString());
  const destTokenMetadata = tokensMetadata.find(t => t.mint === listing?.tokenMintDestination.toString());

  useEffect(() => {
    if (!loading && listings.length > 0) {
      const found = listings.find(l => l.publicKey.toString() === listingId);
      if (found) {
        setListing(found);
      }
    }
  }, [listings, loading, listingId]);

  if (loading || metadataLoading) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-6 max-w-[1280px] mx-auto">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Loading listing...</p>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-6 max-w-[1280px] mx-auto">
          <div className="text-center py-12">
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Listing not found</p>
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

  // Format amounts with decimals
  const formatTokenAmount = (amount: bigint, decimals: number = 9) => {
    const num = Number(amount) / Math.pow(10, decimals);
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const sourceDecimals = sourceTokenMetadata?.decimals || 9;
  const destDecimals = destTokenMetadata?.decimals || 9;

  const amountSourceTotal = formatTokenAmount(listing.amountSourceTotal, sourceDecimals);
  const amountSourceRemaining = formatTokenAmount(listing.amountSourceRemaining, sourceDecimals);
  const amountSourceFilled = formatTokenAmount(listing.amountSourceTotal - listing.amountSourceRemaining, sourceDecimals);
  const minFillFormatted = formatTokenAmount(listing.minFillAmount, sourceDecimals);

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

    const minFill = parseFloat(minFillFormatted.replace(/,/g, ''));
    const remaining = parseFloat(amountSourceRemaining.replace(/,/g, ''));

    if (amount < minFill) {
      toast.error(`Minimum fill amount is ${minFillFormatted}`);
      return;
    }

    if (amount > remaining) {
      toast.error(`Only ${amountSourceRemaining} available`);
      return;
    }

    try {
      // Convert to raw token amount (with decimals)
      const amountRaw = Math.floor(amount * Math.pow(10, sourceDecimals));
      
      const result = await executeSwap({
        listing: listing.publicKey,
        maker: listing.maker,
        offeredMint: listing.tokenMintSource,
        requestedMint: listing.tokenMintDestination,
        fillAmount: amountRaw,
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
        router.push('/user/listings');
      }
    } catch (error) {
      console.error('Error cancelling listing:', error);
    }
  };

  const receiveAmount = swapAmount ? (parseFloat(swapAmount) * rate).toFixed(6) : '0.00';

  // Token display component
  const TokenDisplay = ({ metadata, mint, size = 'md' }: { metadata?: any; mint: string; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    };
    
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden`}>
        {metadata?.image ? (
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
        <Coins className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} style={{ display: metadata?.image ? 'none' : 'block' }} />
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-32 pb-24 px-6 max-w-[1280px] mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/listings">
            <Button variant="ghost" size="xs" className="text-muted-foreground gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Back to Market
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column — Listing Details */}
          <div className="col-span-12 lg:col-span-7 space-y-8">

            {/* Listing Header */}
            <div className="bg-card border border-border p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    <div className="relative z-10">
                      <TokenDisplay metadata={sourceTokenMetadata} mint={listing.tokenMintSource.toString()} size="lg" />
                    </div>
                    <div className="relative z-0">
                      <TokenDisplay metadata={destTokenMetadata} mint={listing.tokenMintDestination.toString()} size="lg" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-medium">
                        {sourceTokenMetadata?.symbol || formatAddress(listing.tokenMintSource.toString())} 
                        <span className="text-muted-foreground mx-2">→</span> 
                        {destTokenMetadata?.symbol || formatAddress(listing.tokenMintDestination.toString())}
                      </h2>
                      <Badge className={isActive 
                        ? 'text-green-500 bg-green-500/10 border-green-500/20'
                        : 'text-muted-foreground bg-muted border-border'
                      }>
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground tracking-wider">
                      <span>ID: {formatAddress(listing.publicKey.toString())}</span>
                      <span>CREATED: {formatDate(listing.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Expires In</span>
                  <CountdownTimer expiresAt={listing.expiresAt} className="text-xl font-mono text-foreground" />
                </div>
              </div>

              {/* Exchange Details */}
              <div className="grid grid-cols-2 gap-y-8 pt-8 border-t border-border">
                <div>
                  <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Exchange Rate</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono text-primary">{rate.toFixed(6)}</span>
                    <span className="text-xs font-mono text-muted-foreground">per token</span>
                  </div>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Fill Progress</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono text-foreground">{progress.toFixed(2)}%</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {amountSourceFilled} / {amountSourceTotal}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="w-full h-[3px] bg-muted mb-2">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Min Fill Amount</span>
                  <span className="text-base font-mono text-foreground">{minFillFormatted}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Max Slippage</span>
                  <span className="text-base font-mono text-foreground">{(listing.maxSlippageBps / 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Fill Count</span>
                  <span className="text-base font-mono text-foreground">{listing.fillCount}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Remaining</span>
                  <span className="text-base font-mono text-foreground">{amountSourceRemaining}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Swap Form */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Swap Execution Form */}
            {!isMaker && isActive && (
              <div className="sticky top-24 bg-card border border-border p-6">
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">You Send</label>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Available: {amountSourceRemaining}</span>
                  </div>
                  <div className="relative bg-muted border border-border p-4 focus-within:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={swapAmount}
                        onChange={(e) => setSwapAmount(e.target.value)}
                        className="border-0 bg-transparent text-xl h-auto p-0 focus-visible:ring-0 w-full font-mono"
                        disabled={!connected}
                      />
                      <div className="flex items-center gap-3 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="xs" 
                          className="text-primary h-auto py-0.5"
                          onClick={() => setSwapAmount(parseFloat(amountSourceRemaining.replace(/,/g, '')).toString())}
                          disabled={!connected}
                        >
                          MAX
                        </Button>
                        <div className="flex items-center gap-2">
                          <TokenDisplay metadata={destTokenMetadata} mint={listing.tokenMintDestination.toString()} size="sm" />
                          <span className="text-sm font-medium">{destTokenMetadata?.symbol || formatAddress(listing.tokenMintDestination.toString())}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center -my-4 relative z-10">
                  <div className="w-8 h-8 bg-background border border-border flex items-center justify-center">
                    <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7m14-8l-7 7-7-7" /></svg>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">You Receive (Est.)</label>
                  </div>
                  <div className="bg-muted border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xl font-mono text-foreground">{receiveAmount}</span>
                      <div className="flex items-center gap-2">
                        <TokenDisplay metadata={sourceTokenMetadata} mint={listing.tokenMintSource.toString()} size="sm" />
                        <span className="text-sm font-medium">{sourceTokenMetadata?.symbol || formatAddress(listing.tokenMintSource.toString())}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-8 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protocol Fee (0.1%)</span>
                    <span className="text-foreground">{swapAmount ? (parseFloat(swapAmount) * 0.001).toFixed(6) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span className="text-foreground">~0.000005 SOL</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span className="text-muted-foreground uppercase tracking-widest">Exchange Rate</span>
                    <span className="text-foreground">{rate.toFixed(6)}</span>
                  </div>
                </div>

                {connected ? (
                  <Button 
                    onClick={handleExecuteSwap}
                    disabled={swapLoading || !swapAmount}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold text-[11px] uppercase tracking-[0.2em] h-12 disabled:opacity-50"
                  >
                    {swapLoading ? 'Executing...' : 'Execute Swap'}
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold text-[11px] uppercase tracking-[0.2em] h-12"
                  >
                    Connect Wallet to Swap
                  </Button>
                )}
              </div>
            )}

            {/* Maker Info */}
            <div className="bg-card border border-border p-6">
              <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-4">Listing Maker</span>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center border border-border">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
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
                  <Link href={`/user/profile/${listing.maker.toString()}`}>
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
              <div className="pt-4 border-t border-border">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full" disabled={cancelLoading}>
                      {cancelLoading ? 'Cancelling...' : 'Cancel Listing'}
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
