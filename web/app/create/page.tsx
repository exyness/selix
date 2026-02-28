'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useCreateListing, useUserProfile } from '@/lib/solana/hooks';
import { toast } from 'sonner';

const DURATIONS = [
  { label: '5 MIN', seconds: 5 * 60 },
  { label: '1 HR', seconds: 60 * 60 },
  { label: '1 DAY', seconds: 24 * 60 * 60 },
  { label: '7 DAYS', seconds: 7 * 24 * 60 * 60 },
];

// Common test tokens (you'll need to replace with actual mints)
const TEST_TOKENS = [
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
];

export default function CreateListingPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { profile, loading: profileLoading, initializeProfile } = useUserProfile();
  const { createListing, loading: createLoading } = useCreateListing();

  const [step, setStep] = useState(1);
  const [activeDuration, setActiveDuration] = useState('1 HR');
  const [customDuration, setCustomDuration] = useState('');
  const [slippage, setSlippage] = useState(1.0);

  // Form state
  const [sourceToken, setSourceToken] = useState('USDC');
  const [destToken, setDestToken] = useState('SOL');
  const [sourceAmount, setSourceAmount] = useState('5000.00');
  const [destAmount, setDestAmount] = useState('35.10');
  const [minFillAmount, setMinFillAmount] = useState('0.00');

  // Redirect if not connected
  useEffect(() => {
    if (!connected) {
      toast.error('Please connect your wallet to create a listing');
      router.push('/listings');
    }
  }, [connected, router]);

  // Initialize profile if needed
  useEffect(() => {
    if (connected && !profileLoading && !profile) {
      toast.info('Initializing your profile...');
      initializeProfile();
    }
  }, [connected, profile, profileLoading, initializeProfile]);

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

    const sourceTokenData = TEST_TOKENS.find(t => t.symbol === sourceToken);
    const destTokenData = TEST_TOKENS.find(t => t.symbol === destToken);

    if (!sourceTokenData || !destTokenData) {
      toast.error('Invalid token selection');
      return;
    }

    const sourceAmountNum = parseFloat(sourceAmount);
    const destAmountNum = parseFloat(destAmount);
    const minFillNum = parseFloat(minFillAmount) || 0;

    if (sourceAmountNum <= 0 || destAmountNum <= 0) {
      toast.error('Amounts must be greater than 0');
      return;
    }

    try {
      const expiresAt = Math.floor(Date.now() / 1000) + getSelectedDuration();
      
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
        toast.success('Listing created successfully!');
        router.push(`/listings/${result.listing.toString()}`);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  const activeListingsCount = profile?.activeListings || 0;
  const maxListings = 100; // TODO: Get from platform config

  if (!connected) {
    return null; // Will redirect
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#EAEAEA]">
      <Navigation />

      <main className="pt-32 pb-24 px-6 max-w-[720px] mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Active Listings</span>
            <Badge variant="outline">{activeListingsCount} / {maxListings}</Badge>
          </div>
          <Link href="/listings">
            <Button variant="ghost" size="xs" className="text-gray-500">
              Cancel
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </Button>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="relative flex items-start justify-between px-4 mb-12">
          <div className="absolute top-4 left-[16.66%] right-[16.66%] h-[1px] bg-white/5 z-0" />
          {[
            { num: '1', label: 'Tokens', active: step >= 1 },
            { num: '2', label: 'Terms', active: step >= 2 },
            { num: '3', label: 'Review', active: step >= 3 },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-3 relative z-10">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-[#050505] ${
                s.active ? 'border-[#0CA5B0] text-[#0CA5B0]' : 'border-[#222] text-[#333]'
              }`}>
                <span className="text-[11px] font-mono font-bold">{s.num}</span>
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-widest ${s.active ? 'text-[#0CA5B0]' : 'text-gray-600'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Token Selection */}
          <div className="bg-[#0A0A0A] border border-white/5 p-8">
            <span className="text-[10px] font-mono text-white uppercase tracking-[0.2em] block mb-8">
              Step 1: Token Selection
            </span>

            <div className="space-y-8">
              {/* You Sell */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">You Sell (Deposit)</label>
                  <span className="text-[10px] font-mono text-gray-500">Bal: -- {sourceToken}</span>
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <Select value={sourceToken} onValueChange={setSourceToken}>
                      <SelectTrigger className="bg-[#111] border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEST_TOKENS.map(token => (
                          <SelectItem key={token.symbol} value={token.symbol}>{token.symbol}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-8 relative bg-[#111] border border-white/10 p-3 flex items-center focus-within:border-[#0CA5B0]/50 transition-colors">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={sourceAmount}
                      onChange={(e) => setSourceAmount(e.target.value)}
                      className="border-0 bg-transparent text-xl h-auto p-0 focus-visible:ring-0 w-full"
                    />
                    <Button 
                      variant="ghost" 
                      size="xs" 
                      className="text-[#0CA5B0] shrink-0 h-auto py-0.5"
                      onClick={() => setSourceAmount('1000')} // TODO: Get actual balance
                    >
                      MAX
                    </Button>
                  </div>
                </div>
              </div>

              {/* Rate Divider */}
              <div className="flex items-center">
                <div className="flex-1 h-[1px] bg-white/5" />
                <div className="px-6 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-[#111] border border-white/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7m14-8l-7 7-7-7" /></svg>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                    Rate: {calculateRate().toFixed(4)}
                  </span>
                </div>
                <div className="flex-1 h-[1px] bg-white/5" />
              </div>

              {/* You Receive */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">You Receive</label>
                  <span className="text-[10px] font-mono text-gray-500">Bal: -- {destToken}</span>
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <Select value={destToken} onValueChange={setDestToken}>
                      <SelectTrigger className="bg-[#111] border-[#0CA5B0]/40 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEST_TOKENS.map(token => (
                          <SelectItem key={token.symbol} value={token.symbol}>{token.symbol}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-8 bg-[#111] border border-white/10 p-3 flex items-center">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={destAmount}
                      onChange={(e) => setDestAmount(e.target.value)}
                      className="border-0 bg-transparent text-xl h-auto p-0 focus-visible:ring-0 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Advanced Options */}
          <div className="bg-[#0A0A0A] border border-white/5">
            <div className="px-8 py-4 border-b border-white/5">
              <span className="text-[10px] font-mono text-white uppercase tracking-[0.2em]">Step 2: Advanced Options</span>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Min Fill Amount</label>
                  <div className="bg-[#111] border border-white/10 p-3">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={minFillAmount}
                      onChange={(e) => setMinFillAmount(e.target.value)}
                      className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 w-full"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-gray-500">in {sourceToken}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Max Slippage</label>
                    <span className="text-[9px] font-mono text-[#0CA5B0]">{slippage.toFixed(2)}%</span>
                  </div>
                  <input
                    type="range"
                    className="w-full h-1 cursor-pointer"
                    min="0.1" max="10" step="0.1"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Expiration Duration</label>
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
                          ? 'bg-[#0CA5B0]/10 border-[#0CA5B0]/30 text-[#0CA5B0]'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                  <div className="bg-[#111] border border-white/10 px-2 flex items-center">
                    <input 
                      type="number" 
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
                {customDuration && (
                  <span className="text-[9px] font-mono text-gray-500">Custom duration in minutes</span>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Review */}
          <div className="bg-[#0A0A0A] border border-white/5">
            <div className="px-8 py-4 border-b border-white/5">
              <span className="text-[10px] font-mono text-white uppercase tracking-[0.2em]">Step 3: Review & Deploy</span>
            </div>
            <div className="p-8">
              <div className="p-4 bg-[#0CA5B0]/5 border border-[#0CA5B0]/20 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-gray-500">Platform Fee (0.1%)</span>
                  <span className="text-white">{(parseFloat(sourceAmount) * 0.001).toFixed(2)} {sourceToken}</span>
                </div>
                <Separator className="border-white/5" />
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gray-500">Initial Deposit</span>
                    <span className="text-white">{sourceAmount} {sourceToken}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gray-500">Expected Receive</span>
                    <span className="text-white">{destAmount} {destToken}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gray-500">Expires In</span>
                    <span className="text-white">{customDuration || activeDuration}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono font-bold pt-2">
                    <span className="text-white uppercase">Total Required</span>
                    <span className="text-[#0CA5B0]">{sourceAmount} {sourceToken}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button 
              onClick={handleCreateListing}
              disabled={createLoading || !profile}
              className="w-full bg-[#0CA5B0] hover:bg-[#0CA5B0]/90 text-black font-mono font-bold text-[11px] uppercase tracking-[0.2em] h-14 border-[#0CA5B0] shadow-[0_0_30px_rgba(12,165,176,0.15)] disabled:opacity-50"
            >
              {createLoading ? 'Creating...' : 'Create Listing'}
            </Button>
            <p className="mt-4 text-center text-[9px] font-mono text-gray-500 uppercase tracking-widest">
              Funds will be escrowed in the protocol contract
            </p>
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

      <main className="pt-32 pb-24 px-6 max-w-[720px] mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Active Listings</span>
            <Badge variant="outline">12 / 100</Badge>
          </div>
          <Link href="/listings">
            <Button variant="ghost" size="xs" className="text-gray-500">
              Cancel
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </Button>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="relative flex items-start justify-between px-4 mb-12">
          <div className="absolute top-4 left-[16.66%] right-[16.66%] h-[1px] bg-white/5 z-0" />
          {[
            { num: '1', label: 'Tokens', active: true },
            { num: '2', label: 'Terms', active: true },
            { num: '3', label: 'Review', active: false },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center gap-3 relative z-10">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-[#050505] ${
                step.active ? 'border-[#0CA5B0] text-[#0CA5B0]' : 'border-[#222] text-[#333]'
              }`}>
                <span className="text-[11px] font-mono font-bold">{step.num}</span>
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-widest ${step.active ? 'text-[#0CA5B0]' : 'text-gray-600'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Token Selection */}
          <div className="bg-[#0A0A0A] border border-white/5 p-8">
            <span className="text-[10px] font-mono text-white uppercase tracking-[0.2em] block mb-8">
              Step 1: Token Selection
            </span>

            <div className="space-y-8">
              {/* You Sell */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">You Sell (Deposit)</label>
                  <span className="text-[10px] font-mono text-gray-500">Bal: 1,420.50 USDC</span>
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <Select defaultValue="usdc">
                      <SelectTrigger className="bg-[#111] border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usdc">USDC</SelectItem>
                        <SelectItem value="sol">SOL</SelectItem>
                        <SelectItem value="jitosol">JitoSOL</SelectItem>
                        <SelectItem value="bonk">BONK</SelectItem>
                        <SelectItem value="pyth">PYTH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-8 relative bg-[#111] border border-white/10 p-3 flex items-center focus-within:border-[#0CA5B0]/50 transition-colors">
                    <Input
                      type="number"
                      placeholder="0.00"
                      defaultValue="5000.00"
                      className="border-0 bg-transparent text-xl h-auto p-0 focus-visible:ring-0 w-full"
                    />
                    <Button variant="ghost" size="xs" className="text-[#0CA5B0] shrink-0 h-auto py-0.5">MAX</Button>
                  </div>
                </div>

                <Alert variant="warning">
                  <AlertIcon>
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </AlertIcon>
                  <div>
                    <AlertDescription>Insufficient USDC balance (Required: 5,000.00 + fees)</AlertDescription>
                  </div>
                </Alert>
              </div>

              {/* Rate Divider */}
              <div className="flex items-center">
                <div className="flex-1 h-[1px] bg-white/5" />
                <div className="px-6 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-[#111] border border-white/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7m14-8l-7 7-7-7" /></svg>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Rate: 142.45</span>
                </div>
                <div className="flex-1 h-[1px] bg-white/5" />
              </div>

              {/* You Receive */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">You Receive</label>
                  <span className="text-[10px] font-mono text-gray-500">Bal: 0.00 SOL</span>
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <Select defaultValue="sol">
                      <SelectTrigger className="bg-[#111] border-[#0CA5B0]/40 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sol">SOL</SelectItem>
                        <SelectItem value="usdc">USDC</SelectItem>
                        <SelectItem value="jitosol">JitoSOL</SelectItem>
                        <SelectItem value="bonk">BONK</SelectItem>
                        <SelectItem value="pyth">PYTH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-8 bg-[#111] border border-white/10 p-3 flex items-center">
                    <Input
                      type="number"
                      placeholder="0.00"
                      defaultValue="35.10"
                      readOnly
                      className="border-0 bg-transparent text-xl h-auto p-0 focus-visible:ring-0 w-full text-white/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Advanced Options */}
          <div className="bg-[#0A0A0A] border border-white/5">
            <div className="px-8 py-4 border-b border-white/5">
              <span className="text-[10px] font-mono text-white uppercase tracking-[0.2em]">Step 2: Advanced Options</span>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Min Fill Amount</label>
                  <div className="bg-[#111] border border-white/10 p-3">
                    <Input
                      type="text"
                      defaultValue="0.00 USDC"
                      className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 w-full"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Max Slippage</label>
                    <span className="text-[9px] font-mono text-[#0CA5B0]">{slippage.toFixed(2)}%</span>
                  </div>
                  <input
                    type="range"
                    className="w-full h-1 cursor-pointer"
                    min="0.1" max="10" step="0.1"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Expiration Duration</label>
                <div className="grid grid-cols-5 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setActiveDuration(d)}
                      className={`py-2.5 border text-[9px] font-mono transition-colors ${
                        activeDuration === d
                          ? 'bg-[#0CA5B0]/10 border-[#0CA5B0]/30 text-[#0CA5B0]'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                  <div className="bg-[#111] border border-white/10 px-2 flex items-center">
                    <input type="text" placeholder="Custom" className="bg-transparent w-full text-[9px] font-mono outline-none text-center" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Review */}
          <div className="bg-[#0A0A0A] border border-white/5">
            <div className="px-8 py-4 border-b border-white/5">
              <span className="text-[10px] font-mono text-white uppercase tracking-[0.2em]">Step 3: Review & Deploy</span>
            </div>
            <div className="p-8">
              <div className="p-4 bg-[#0CA5B0]/5 border border-[#0CA5B0]/20 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-gray-500">Platform Fee (10 bps)</span>
                  <span className="text-white">5.00 USDC</span>
                </div>
                <Separator className="border-white/5" />
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gray-500">Initial Deposit</span>
                    <span className="text-white">5,000.00 USDC</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gray-500">Listing Fee</span>
                    <span className="text-white">0.02 SOL</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono font-bold pt-2">
                    <span className="text-white uppercase">Total Required</span>
                    <span className="text-[#0CA5B0]">5,005.00 USDC + 0.02 SOL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button className="w-full bg-[#0CA5B0] hover:bg-[#0CA5B0]/90 text-black font-mono font-bold text-[11px] uppercase tracking-[0.2em] h-14 border-[#0CA5B0] shadow-[0_0_30px_rgba(12,165,176,0.15)]">
              Create Listing
            </Button>
            <p className="mt-4 text-center text-[9px] font-mono text-gray-500 uppercase tracking-widest">
              Funds will be escrowed in the protocol contract
            </p>
          </div>
        </div>
      </main>

      <StatusBar />
    </div>
  );
}
