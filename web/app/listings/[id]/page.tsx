'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
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
import { useFetchListings, useExecuteSwap, useCancelListing, useTokensMetadata, type Listing } from '@/lib/solana/hooks';
import { toast } from 'sonner';
import { CountdownTimer } from '@/components/ui/countdown-timer';

interface TokenMetadata {
  mint: string;
  symbol?: string;
  name?: string;
  image?: string;
  decimals?: number;
}

interface TokenDisplayProps {
  metadata?: TokenMetadata;
  size?: 'sm' | 'md' | 'lg';
}

function TokenDisplay({ metadata, size = 'md' }: TokenDisplayProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden`}>
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
      <Coins className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} style={{ display: metadata?.image ? 'none' : 'block' }} />
    </div>
  );
}

function formatAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatDate(timestamp: BN) {
  const date = new Date(timestamp.toNumber() * 1000);
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) + ', ' + 
         date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' UTC';
}

function isListingExpired(expiresAt: BN): boolean {
  const now = Math.floor(Date.now() / 1000);
  return expiresAt.toNumber() <= now;
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
  
  if ('active' in status) {
    return {
      label: 'Active',
      className: 'text-green-500 bg-green-500/10 border-green-500/20'
    };
  }
  
  if ('partiallyFilled' in status) {
    return {
      label: 'Partial',
      className: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    };
  }
  
  return {
    label: 'Unknown',
    className: 'text-muted-foreground bg-muted'
  };
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { listings, loading } = useFetchListings();
  const { executeSwap, loading: swapLoading } = useExecuteSwap();
  const { cancelListing, loading: cancelLoading } = useCancelListing();

  const [swapAmount, setSwapAmount] = useState('');
  const [listing, setListing] = useState<Listing | null>(null);

  const listingId = params.id as string;

  // Fetch token metadata for the listing
  const tokenMints = listing ? [listing.tokenMintSource.toString(), listing.tokenMintDestination.toString()] : [];
  const { tokensMetadata, loading: metadataLoading } = useTokensMetadata(
    tokenMints.map(mint => new PublicKey(mint))
  );

  const sourceTokenMetadata = tokensMetadata.find(t => t.mint === listing?.tokenMintSource.toString());
  const destTokenMetadata = tokensMetadata.find(t => t.mint === listing?.tokenMintDestination.toString());

  // Derive listing from listings array
  const currentListing = listings.find(l => l.publicKey.toString() === listingId) || null;
  
  useEffect(() => {
    setListing(currentListing);
  }, [currentListing]);

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

  const progress = listing.amountSourceTotal.sub(listing.amountSourceRemaining).toNumber() / listing.amountSourceTotal.toNumber() * 100;
  const rate = listing.amountDestinationTotal.toNumber() / listing.amountSourceTotal.toNumber();
  const isMaker = connected && publicKey && listing.maker.toString() === publicKey.toString();
  const status = listing.status;
  const isActive = ('active' in status) || ('partiallyFilled' in status);
  const isExpired = isListingExpired(listing.expiresAt);

  // Format amounts with decimals
  const formatTokenAmount = (amount: BN, decimals: number = 9) => {
    const num = amount.toNumber() / Math.pow(10, decimals);
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const sourceDecimals = sourceTokenMetadata?.decimals || 9;

  const amountSourceTotal = formatTokenAmount(listing.amountSourceTotal, sourceDecimals);
  const amountSourceRemaining = formatTokenAmount(listing.amountSourceRemaining, sourceDecimals);
  const amountSourceFilled = formatTokenAmount(listing.amountSourceTotal.sub(listing.amountSourceRemaining), sourceDecimals);
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
        router.push('/listings');
      }
    } catch (error) {
      console.error('Error cancelling listing:', error);
    }
  };

  const receiveAmount = swapAmount ? (parseFloat(swapAmount) * rate).toFixed(6) : '0.00';

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-32 pb-24 px-4 sm:px-6 max-w-[1280px] mx-auto">
        {/* Back Button */}
        <div className="mb-6 sm:mb-8">
          <Link href="/listings">
            <Button variant="ghost" size="xs" className="text-muted-foreground gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Back to Market
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column — Listing Details */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-8">

            {/* Listing Header */}
            <div className="bg-card border border-border p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 lg:mb-8">
                <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 min-w-0 flex-1">
                  <div className="flex -space-x-3">
                    <div className="relative z-10">
                      <TokenDisplay metadata={sourceTokenMetadata} size="lg" />
                    </div>
                    <div className="relative z-0">
                      <TokenDisplay metadata={destTokenMetadata} size="lg" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-medium">
                        {sourceTokenMetadata?.symbol || formatAddress(listing.tokenMintSource.toString())} 
                        <span className="text-muted-foreground mx-2">→</span> 
                        {destTokenMetadata?.symbol || formatAddress(listing.tokenMintDestination.toString())}
                      </h2>
                      <Badge className={getListingStatus(listing).className}>
                        {getListingStatus(listing).label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px] sm:max-w-[300px] md:max-w-none">
                        {listing.publicKey.toString()}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon-xs"
                        className="shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(listing.publicKey.toString());
                          toast.success('Listing ID copied!');
                        }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground tracking-wider">
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
            {/* Expired Listing Message for Non-Makers */}
            {!isMaker && isExpired && (
              <div className="sticky top-24 bg-card border border-red-500/20 p-6">
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-mono font-medium mb-2">Listing Expired</h3>
                  <p className="text-xs font-mono text-muted-foreground">
                    This listing has expired and is no longer available for swapping.
                  </p>
                </div>
              </div>
            )}

            {/* Expired Listing Message for Makers */}
            {isMaker && isExpired && (
              <div className="sticky top-24 bg-card border border-yellow-500/20 p-6">
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-mono font-medium mb-2">Your Listing Has Expired</h3>
                  <p className="text-xs font-mono text-muted-foreground mb-6">
                    This listing is no longer active. You can close it to reclaim your tokens.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline"
                        className="w-full font-mono text-[11px] uppercase tracking-wider"
                      >
                        Close Listing
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Close Expired Listing</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will close the listing and return your remaining tokens to your wallet.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelListing} disabled={cancelLoading}>
                          {cancelLoading ? 'Closing...' : 'Close Listing'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {/* Swap Execution Form */}
            {!isMaker && isActive && !isExpired && (
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
                          <TokenDisplay metadata={destTokenMetadata} size="sm" />
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
                        <TokenDisplay metadata={sourceTokenMetadata} size="sm" />
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
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center border border-border shrink-0">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-mono truncate">{listing.maker.toString()}</span>
                </div>
                <div className="flex gap-1 shrink-0">
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
                        This will return your deposited tokens minus network fees. The remaining {formatTokenAmount(listing.amountSourceRemaining, sourceDecimals)} tokens will be refunded.
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
