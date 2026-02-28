'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlatform, useAdmin } from '@/lib/solana/hooks';
import { toast } from 'sonner';

export default function InitializePlatformPage() {
  const { publicKey, connected } = useWallet();
  const { platform, loading: platformLoading } = usePlatform();
  const { initializePlatform, loading: adminLoading } = useAdmin();

  const [feeCollector, setFeeCollector] = useState('');
  const [feeBasisPoints, setFeeBasisPoints] = useState('10');
  const [maxListingsPerUser, setMaxListingsPerUser] = useState('100');
  const [minListingDuration, setMinListingDuration] = useState('60');
  const [maxListingDuration, setMaxListingDuration] = useState('2592000');
  const [minTradeAmount, setMinTradeAmount] = useState('1000000'); // 1 token with 6 decimals

  const handleInitialize = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!feeCollector) {
      toast.error('Please enter a fee collector address');
      return;
    }

    try {
      const feeCollectorPubkey = new PublicKey(feeCollector);
      
      const result = await initializePlatform({
        feeCollector: feeCollectorPubkey,
        feeBasisPoints: parseInt(feeBasisPoints),
        maxListingsPerUser: parseInt(maxListingsPerUser),
        minListingDuration: parseInt(minListingDuration),
        maxListingDuration: parseInt(maxListingDuration),
        minTradeAmount: parseInt(minTradeAmount),
      });

      if (result) {
        toast.success('Platform initialized successfully! You are now the authority.');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Invalid fee collector address');
    }
  };

  if (platformLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-10 max-w-[800px] mx-auto">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Checking platform status...</p>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  if (platform) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-10 max-w-[800px] mx-auto">
          <div className="bg-card border border-border p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-mono font-bold text-foreground uppercase mb-2">Platform Already Initialized</h2>
              <p className="text-sm text-muted-foreground">The Selix platform is ready and operational</p>
            </div>

            <div className="bg-muted border border-border p-6 space-y-4 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Authority</span>
                <span className="font-mono text-sm text-foreground">{platform.authority.toString().slice(0, 8)}...{platform.authority.toString().slice(-8)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Fee Collector</span>
                <span className="font-mono text-sm text-foreground">{platform.feeCollector.toString().slice(0, 8)}...{platform.feeCollector.toString().slice(-8)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Platform Fee</span>
                <span className="font-mono text-sm text-primary">{platform.feeBasisPoints} BPS</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Max Listings/User</span>
                <span className="font-mono text-sm text-foreground">{platform.maxListingsPerUser}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Whitelist</span>
                <span className={`font-mono text-sm ${platform.whitelistEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                  {platform.whitelistEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Min Trade Amount</span>
                <span className="font-mono text-sm text-foreground">{platform.minTradeAmount.toString()} lamports</span>
              </div>
            </div>

            {connected && publicKey && publicKey.toString() === platform.authority.toString() ? (
              <Button 
                onClick={() => window.location.href = '/admin'}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-sm uppercase tracking-widest"
              >
                Go to Admin Dashboard
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full font-mono font-bold text-sm uppercase tracking-widest"
              >
                Back to Home
              </Button>
            )}
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
        <main className="pt-32 pb-24 px-10 max-w-[800px] mx-auto">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 mb-6">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-mono font-bold text-foreground uppercase mb-4">Wallet Required</h1>
              <p className="text-muted-foreground text-base mb-8">
                Please connect your Solana wallet to initialize the platform.
              </p>
            </div>
            
            <div className="bg-card border border-border p-8 rounded-lg">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-6">
                Connect Your Wallet
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Click the wallet button in the navigation bar to connect your Solana wallet. 
                Your connected wallet will become the platform authority.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-mono">Secure Connection</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span className="font-mono">Authority Wallet</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button 
                onClick={() => window.location.href = '/admin'}
                variant="outline"
                className="font-mono font-bold text-sm uppercase tracking-widest"
              >
                ← Back to Admin
              </Button>
            </div>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-32 pb-24 px-10 max-w-[800px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="text-[10px] font-mono text-primary tracking-[0.3em] uppercase mb-2">{'/// Platform Setup'}</div>
          <h1 className="text-4xl font-mono font-bold tracking-tight text-foreground uppercase mb-4">Initialize Platform</h1>
          <p className="text-muted-foreground text-sm">Set up the Selix platform. The connected wallet will become the platform authority.</p>
        </div>

        {/* Warning if not connected */}
        {!connected && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 mb-8 flex items-start gap-4">
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <div className="text-sm font-mono font-bold text-yellow-500 uppercase mb-1">Wallet Not Connected</div>
              <p className="text-xs text-yellow-500/80">Please connect your wallet to initialize the platform</p>
            </div>
          </div>
        )}

        {/* Configuration Form */}
        <div className="bg-card border border-border p-8">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-8">Platform Configuration</div>
          
          <div className="space-y-6">
            {/* Fee Collector */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">Fee Collector Address</label>
              <Input
                type="text"
                placeholder="Enter Solana address..."
                value={feeCollector}
                onChange={(e) => setFeeCollector(e.target.value)}
                disabled={!connected}
                className="font-mono text-sm h-12"
              />
              <p className="text-[9px] text-muted-foreground font-mono">Address that will receive platform fees</p>
            </div>

            {/* Fee and Max Listings */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">Fee Basis Points</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={feeBasisPoints}
                    onChange={(e) => setFeeBasisPoints(e.target.value)}
                    disabled={!connected}
                    className="text-sm h-12 pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground">BPS</span>
                </div>
                <p className="text-[9px] text-muted-foreground font-mono">10 BPS = 0.1%</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">Max Listings Per User</label>
                <Input
                  type="number"
                  value={maxListingsPerUser}
                  onChange={(e) => setMaxListingsPerUser(e.target.value)}
                  disabled={!connected}
                  className="text-sm h-12"
                />
              </div>
            </div>

            {/* Duration Settings */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">Min Duration (seconds)</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={minListingDuration}
                    onChange={(e) => setMinListingDuration(e.target.value)}
                    disabled={!connected}
                    className="text-sm h-12 pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground">SECS</span>
                </div>
                <p className="text-[9px] text-muted-foreground font-mono">60 = 1 minute</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">Max Duration (seconds)</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={maxListingDuration}
                    onChange={(e) => setMaxListingDuration(e.target.value)}
                    disabled={!connected}
                    className="text-sm h-12 pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground">SECS</span>
                </div>
                <p className="text-[9px] text-muted-foreground font-mono">2592000 = 30 days</p>
              </div>
            </div>

            {/* Min Trade Amount */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">Min Trade Amount (lamports)</label>
              <Input
                type="number"
                value={minTradeAmount}
                onChange={(e) => setMinTradeAmount(e.target.value)}
                disabled={!connected}
                className="text-sm h-12"
              />
              <p className="text-[9px] text-muted-foreground font-mono">Minimum amount in token base units (e.g., 1000000 = 1 token with 6 decimals)</p>
            </div>

            {/* Initialize Button */}
            <div className="pt-6 border-t border-border">
              <Button 
                onClick={handleInitialize}
                disabled={!connected || adminLoading || !feeCollector}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-sm uppercase tracking-widest h-12 disabled:opacity-50"
              >
                {adminLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Initializing...
                  </span>
                ) : (
                  'Initialize Platform'
                )}
              </Button>

              {connected && publicKey && (
                <div className="mt-4 text-center">
                  <p className="text-[9px] text-muted-foreground font-mono mb-2">Your wallet will become the platform authority</p>
                  <div className="inline-flex items-center gap-2 bg-muted border border-border px-4 py-2">
                    <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span className="text-[10px] font-mono text-foreground">{publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <StatusBar />
    </div>
  );
}
