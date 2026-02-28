'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import WalletRequired from '@/components/wallet/wallet-required';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateListing, useUserProfile, usePlatform, useAllWhitelisted } from '@/lib/solana/hooks';
import { toast } from 'sonner';
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { useConnection } from '@solana/wallet-adapter-react';

const DURATIONS = [
  { label: '5 MIN', seconds: 5 * 60 },
  { label: '1 HR', seconds: 60 * 60 },
  { label: '1 DAY', seconds: 24 * 60 * 60 },
  { label: '7 DAYS', seconds: 7 * 24 * 60 * 60 },
];

export default function CreateListingPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { profile, loading: profileLoading, initializeProfile } = useUserProfile();
  const { createListing, loading: createLoading } = useCreateListing();
  const { platform, loading: platformLoading } = usePlatform();
  const { whitelisted, loading: whitelistLoading } = useAllWhitelisted();

  const [step] = useState(1);
  const [activeDuration, setActiveDuration] = useState('1 HR');
  const [customDuration, setCustomDuration] = useState('');
  const [slippage, setSlippage] = useState(1.0);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  // Form state
  const [sourceToken, setSourceToken] = useState('');
  const [destToken, setDestToken] = useState('');
  const [sourceAmount, setSourceAmount] = useState('');
  const [destAmount, setDestAmount] = useState('');
  const [minFillAmount, setMinFillAmount] = useState('0.00');
  const [sourceBalance, setSourceBalance] = useState<number | null>(null);
  const [destBalance, setDestBalance] = useState<number | null>(null);

  // Get available tokens from whitelist
  const availableTokens = whitelisted
    .filter((entry) => entry.mint) // Filter out any entries without mint
    .map((entry) => ({
      symbol: entry.mint.toString().slice(0, 4) + '...' + entry.mint.toString().slice(-4),
      mint: entry.mint.toString(),
      decimals: 9, // Default, should fetch from token metadata
    }));

  // Set default tokens when whitelist loads
  useEffect(() => {
    if (availableTokens.length > 0 && !sourceToken) {
      setSourceToken(availableTokens[0].mint);
      if (availableTokens.length > 1) {
        setDestToken(availableTokens[1].mint);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTokens.length, sourceToken]);

  // Check if profile needs initialization
  useEffect(() => {
    if (connected && !profileLoading && !profile) {
      setShowProfilePrompt(true);
    } else {
      setShowProfilePrompt(false);
    }
  }, [connected, profileLoading, profile]);

  // Fetch token balances
  useEffect(() => {
    if (!publicKey || !connection || !sourceToken) return;

    const fetchBalance = async () => {
      try {
        const tokenMint = new PublicKey(sourceToken);
        const ata = getAssociatedTokenAddressSync(
          tokenMint,
          publicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );
        
        const balance = await connection.getTokenAccountBalance(ata);
        setSourceBalance(parseFloat(balance.value.uiAmount?.toString() || '0'));
      } catch {
        setSourceBalance(0);
      }
    };

    fetchBalance();
  }, [publicKey, connection, sourceToken]);

  useEffect(() => {
    if (!publicKey || !connection || !destToken) return;

    const fetchBalance = async () => {
      try {
        const tokenMint = new PublicKey(destToken);
        const ata = getAssociatedTokenAddressSync(
          tokenMint,
          publicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );
        
        const balance = await connection.getTokenAccountBalance(ata);
        setDestBalance(parseFloat(balance.value.uiAmount?.toString() || '0'));
      } catch {
        setDestBalance(0);
      }
    };

    fetchBalance();
  }, [publicKey, connection, destToken]);

  const getSelectedDuration = () => {
    if (customDuration) {
      return parseInt(customDuration) * 60; // Convert minutes to seconds
    }
    const selected = DURATIONS.find(d => d.label === activeDuration);
    return selected?.seconds || 3600;
  };

  const calculateRate = () => {
    const source = parseFloat(sourceAmount) || 0;
    const dest = parseFloat(destAmount) || 0;
    if (source === 0) return 0;
    return dest / source;
  };

  const handleCreateListing = async () => {
    if (!publicKey || !profile) {
      toast.error('Please connect your wallet and initialize your profile');
      return;
    }

    if (!sourceToken || !destToken) {
      toast.error('Please select both tokens');
      return;
    }

    const sourceAmountNum = parseFloat(sourceAmount);
    const destAmountNum = parseFloat(destAmount);
    const minFillNum = parseFloat(minFillAmount) || 0;

    if (sourceAmountNum <= 0 || destAmountNum <= 0) {
      toast.error('Amounts must be greater than 0');
      return;
    }

    if (sourceBalance !== null && sourceAmountNum > sourceBalance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      const sourceTokenData = availableTokens.find(t => t.mint === sourceToken);
      const destTokenData = availableTokens.find(t => t.mint === destToken);

      if (!sourceTokenData || !destTokenData) {
        toast.error('Invalid token selection');
        return;
      }

      const now = Date.now();
      const expiresAt = Math.floor(now / 1000) + getSelectedDuration();
      
      const result = await createListing({
        offeredMint: new PublicKey(sourceTokenData.mint),
        offeredAmount: sourceAmountNum * Math.pow(10, sourceTokenData.decimals),
        requestedMint: new PublicKey(destTokenData.mint),
        requestedAmount: destAmountNum * Math.pow(10, destTokenData.decimals),
        minFillAmount: minFillNum * Math.pow(10, sourceTokenData.decimals),
        maxSlippageBps: Math.floor(slippage * 100),
        expiresAt,
      });

      if (result) {
        router.push(`/listings/${result.listing.toString()}`);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  const activeListingsCount = profile?.listingsCreated ? Number(profile.listingsCreated) : 0;
  const maxListings = platform?.maxListingsPerUser ? Number(platform.maxListingsPerUser) : 100;
  const platformFeeBps = platform?.feeBasisPoints ? Number(platform.feeBasisPoints) : 10;
  const platformFeePercent = platformFeeBps / 100;

  const selectedSourceToken = availableTokens.find(t => t.mint === sourceToken);
  const selectedDestToken = availableTokens.find(t => t.mint === destToken);

  // Show wallet connection prompt if not connected
  if (!connected) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-6 max-w-[720px] mx-auto">
          <WalletRequired
            title="Connect Wallet to Create Listing"
            description="You need to connect your Solana wallet to create a token swap listing on the platform."
            backLink="/listings"
            backLinkText="Back to Listings"
          />
        </main>
        <StatusBar />
      </div>
    );
  }

  // Show profile initialization prompt
  if (showProfilePrompt) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-6 max-w-[720px] mx-auto">
          <div className="bg-card border border-border p-8">
            <h2 className="text-xl font-mono mb-4 text-foreground">Initialize Your Profile</h2>
            <p className="text-muted-foreground mb-6">
              Before creating listings, you need to initialize your user profile on the platform.
            </p>
            <button
              onClick={async () => {
                const result = await initializeProfile();
                if (result) {
                  setShowProfilePrompt(false);
                }
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold text-[11px] uppercase tracking-[0.2em] py-4 transition-all"
            >
              Initialize Profile
            </button>
            <Link href="/listings" className="block text-center mt-4 text-muted-foreground hover:text-foreground text-sm">
              Back to Listings
            </Link>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-6 max-w-[720px] mx-auto">
          <WalletRequired
            title="Connect Wallet to Create Listing"
            description="You need to connect your Solana wallet to create a token swap listing on the platform."
            backLink="/listings"
            backLinkText="Back to Listings"
          />
        </main>
        <StatusBar />
      </div>
    );
  }

  // Show loading state
  if (platformLoading || whitelistLoading) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-6 max-w-[720px] mx-auto">
          <div className="text-center text-muted-foreground">Loading platform data...</div>
        </main>
        <StatusBar />
      </div>
    );
  }

  // Show error if no whitelisted tokens
  if (availableTokens.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-6 max-w-[720px] mx-auto">
          <div className="bg-card border border-border p-8 text-center">
            <h2 className="text-xl font-mono mb-4">No Tokens Available</h2>
            <p className="text-muted-foreground mb-6">
              There are no whitelisted tokens available for trading. Please contact the platform administrator.
            </p>
            <Link href="/listings" className="text-primary hover:underline">
              Back to Listings
            </Link>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-32 pb-24 px-6 max-w-[720px] mx-auto">
        {/* Top Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Active Listings</span>
              <span className="px-2 py-0.5 bg-muted border border-border text-[9px] font-mono text-foreground">{activeListingsCount}/{maxListings}</span>
            </div>
            <Link href="/listings" className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest flex items-center gap-2">
              Cancel
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between px-4">
            <div className="flex flex-col items-center gap-3">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background z-10 ${
                step >= 1 ? 'border-primary text-primary' : 'border-[#222] text-[#333]'
              }`}>
                <span className="text-[11px] font-mono font-bold">1</span>
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-widest ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                Tokens
              </span>
            </div>
            <div className="flex-1 h-[1px] bg-border -mt-6" />
            <div className="flex flex-col items-center gap-3">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background z-10 ${
                step >= 2 ? 'border-primary text-primary' : 'border-[#222] text-[#333]'
              }`}>
                <span className="text-[11px] font-mono font-bold">2</span>
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-widest ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                Terms
              </span>
            </div>
            <div className="flex-1 h-[1px] bg-border -mt-6" />
            <div className="flex flex-col items-center gap-3">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background z-10 ${
                step >= 3 ? 'border-primary text-primary' : 'border-[#222] text-[#333]'
              }`}>
                <span className="text-[11px] font-mono font-bold">3</span>
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-widest ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                Review
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1: Token Selection */}
          <div className="bg-card border border-border p-8">
            <div className="space-y-8">
              {/* You Sell */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">You Sell (Deposit)</label>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Bal: {sourceBalance !== null ? (sourceBalance === 0 ? '0' : sourceBalance.toFixed(4)) : 'Loading...'} {selectedSourceToken?.symbol}
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4 relative">
                    <Select value={sourceToken} onValueChange={setSourceToken}>
                      <SelectTrigger className="bg-muted border-border text-foreground h-auto p-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTokens.map(token => (
                          <SelectItem key={token.mint} value={token.mint}>{token.symbol}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-8 relative bg-muted border border-border p-4 flex items-center focus-within:border-primary/50 transition-colors">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={sourceAmount}
                      onChange={(e) => setSourceAmount(e.target.value)}
                      className="bg-transparent text-xl font-mono text-foreground outline-none w-full"
                    />
                    <button 
                      className="text-[9px] font-mono text-primary hover:text-foreground px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => sourceBalance !== null && sourceBalance > 0 && setSourceAmount(sourceBalance.toString())}
                      disabled={!sourceBalance || sourceBalance === 0}
                    >
                      MAX
                    </button>
                  </div>
                </div>
                {sourceBalance === 0 && (
                  <div className="p-3 bg-blue-500/5 border border-blue-500/20">
                    <p className="text-[10px] font-mono text-blue-400 leading-relaxed">
                      You don&apos;t have any {selectedSourceToken?.symbol} tokens. You&apos;ll need to acquire some before creating a listing.
                    </p>
                  </div>
                )}
                {sourceBalance !== null && sourceBalance > 0 && parseFloat(sourceAmount || '0') > sourceBalance && (
                  <div className="p-3 bg-orange-500/5 border border-orange-500/20">
                    <p className="text-[10px] font-mono text-orange-500 leading-relaxed">
                      Warning: Insufficient {selectedSourceToken?.symbol} balance (Required: {sourceAmount} + fees)
                    </p>
                  </div>
                )}
              </div>

              {/* Rate Divider */}
              <div className="flex items-center justify-between">
                <div className="flex-1 h-[1px] bg-border" />
                <div className="px-6 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-muted border border-border flex items-center justify-center">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7m14-8l-7 7-7-7" /></svg>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                    Rate: {calculateRate().toFixed(2)}
                  </span>
                </div>
                <div className="flex-1 h-[1px] bg-border" />
              </div>

              {/* You Receive */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">You Receive</label>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Bal: {destBalance !== null ? (destBalance === 0 ? '0' : destBalance.toFixed(4)) : 'Loading...'} {selectedDestToken?.symbol}
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4 relative">
                    <Select value={destToken} onValueChange={setDestToken}>
                      <SelectTrigger className="bg-muted border-primary/40 text-foreground h-auto p-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTokens.map(token => (
                          <SelectItem key={token.mint} value={token.mint}>{token.symbol}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-8 bg-muted border border-border p-4 flex items-center">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={destAmount}
                      onChange={(e) => setDestAmount(e.target.value)}
                      className="bg-transparent text-xl font-mono text-foreground outline-none w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Advanced Options */}
          <div className="bg-card border border-border">
            <button className="w-full px-8 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="text-[10px] font-mono text-foreground uppercase tracking-[0.2em]">Step 2: Advanced Options</span>
              <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="p-8 pt-2 space-y-8 border-t border-border">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block">Min Fill Amount</label>
                  <div className="bg-muted border border-border p-3 focus-within:border-border">
                    <input
                      type="text"
                      value={`${minFillAmount} ${sourceToken}`}
                      onChange={(e) => setMinFillAmount(e.target.value.replace(` ${sourceToken}`, ''))}
                      className="bg-transparent w-full font-mono text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Max Slippage</label>
                    <span className="text-[9px] font-mono text-primary">{slippage.toFixed(2)}%</span>
                  </div>
                  <input
                    type="range"
                    className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                    min="0.1" max="10" step="0.1"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block">Expiration Duration</label>
                <div className="grid grid-cols-5 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.label}
                      onClick={() => {
                        setActiveDuration(d.label);
                        setCustomDuration('');
                      }}
                      className={`py-2.5 border text-[9px] font-mono transition-colors ${
                        activeDuration === d.label && !customDuration
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-muted border-border hover:bg-muted/50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                  <div className="bg-muted border border-border px-2 flex items-center">
                    <input 
                      type="text" 
                      placeholder="Custom" 
                      value={customDuration}
                      onChange={(e) => {
                        setCustomDuration(e.target.value);
                        setActiveDuration('');
                      }}
                      className="bg-transparent w-full text-[9px] font-mono outline-none text-center" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Review */}
          <div className="bg-card border border-border">
            <div className="px-8 py-4 border-b border-border">
              <span className="text-[10px] font-mono text-foreground uppercase tracking-[0.2em]">Step 3: Review & Deploy</span>
            </div>
            <div className="p-8 space-y-6">
              <div className="p-4 bg-primary/5 border border-primary/20 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground">Platform Fee ({platformFeeBps} bps)</span>
                  <span className="text-foreground">{(parseFloat(sourceAmount || '0') * platformFeePercent / 100).toFixed(4)} {selectedSourceToken?.symbol}</span>
                </div>
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">Initial Deposit</span>
                    <span className="text-foreground">{sourceAmount || '0.00'} {selectedSourceToken?.symbol}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">Expected Receive</span>
                    <span className="text-foreground">{destAmount || '0.00'} {selectedDestToken?.symbol}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">Expires In</span>
                    <span className="text-foreground">{customDuration ? `${customDuration} MIN` : activeDuration}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono font-bold pt-2">
                    <span className="text-foreground uppercase">Total Required</span>
                    <span className="text-primary">{sourceAmount || '0.00'} {selectedSourceToken?.symbol} + 0.02 SOL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button 
              onClick={handleCreateListing}
              disabled={createLoading || !profile}
              className="w-full bg-primary hover:bg-primary/90 text-black text-[11px] font-mono font-bold uppercase tracking-[0.2em] py-5 transition-all shadow-[0_0_30px_rgba(12,165,176,0.2)] disabled:opacity-50"
            >
              {createLoading ? 'Creating...' : 'Create Listing'}
            </button>
            <p className="mt-4 text-center text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              Funds will be escrowed in the protocol contract
            </p>
          </div>
        </div>
      </main>

      <StatusBar />
    </div>
  );
}
