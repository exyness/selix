'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlatform, useAdmin } from '@/lib/solana/hooks';
import { toast } from 'sonner';

export default function InitializePlatformPage() {
  const { publicKey, connected } = useWallet();
  const { platform, loading: platformLoading } = usePlatform();
  const { initializePlatform, loading: adminLoading } = useAdmin();

  const [feeCollector, setFeeCollector] = useState('');
  const [feeBasisPoints, setFeeBasisPoints] = useState('10');
  const [maxListingsPerUser, setMaxListingsPerUser] = useState('100');
  const [minTradeDuration, setMinTradeDuration] = useState('60'); // 1 minute
  const [maxTradeDuration, setMaxTradeDuration] = useState('2592000'); // 30 days
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);

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
        minTradeDuration: parseInt(minTradeDuration),
        maxTradeDuration: parseInt(maxTradeDuration),
        whitelistEnabled,
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
      <div className="min-h-screen bg-[#050505] text-[#EAEAEA]">
        <Navigation />
        <main className="pt-32 pb-24 px-10 max-w-[800px] mx-auto">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-[#0CA5B0] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">Checking platform status...</p>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  if (platform) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#EAEAEA]">
        <Navigation />
        <main className="pt-32 pb-24 px-10 max-w-[800px] mx-auto">
          <Card className="bg-[#0A0A0A] border-white/5">
            <CardHeader>
              <CardTitle className="text-2xl font-mono text-white">Platform Already Initialized</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">The platform has already been initialized.</p>
              <div className="bg-black border border-white/5 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Authority:</span>
                  <span className="font-mono text-white">{platform.authority.toString().slice(0, 8)}...{platform.authority.toString().slice(-8)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fee Collector:</span>
                  <span className="font-mono text-white">{platform.feeCollector.toString().slice(0, 8)}...{platform.feeCollector.toString().slice(-8)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fee (BPS):</span>
                  <span className="font-mono text-white">{platform.feeBasisPoints}</span>
                </div>
              </div>
              {connected && publicKey && publicKey.toString() === platform.authority.toString() && (
                <Button 
                  onClick={() => window.location.href = '/admin'}
                  className="w-full bg-[#0CA5B0] text-black hover:bg-[#0CA5B0]/90"
                >
                  Go to Admin Dashboard
                </Button>
              )}
            </CardContent>
          </Card>
        </main>
        <StatusBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA]">
      <Navigation />
      <main className="pt-32 pb-24 px-10 max-w-[800px] mx-auto">
        <div className="mb-10">
          <div className="text-[10px] font-mono text-[#0CA5B0] tracking-[0.3em] uppercase mb-2">/// Platform Setup</div>
          <h1 className="text-4xl font-mono font-bold tracking-tight text-white uppercase mb-4">Initialize Platform</h1>
          <p className="text-gray-400">Set up the Selix platform. The connected wallet will become the platform authority.</p>
        </div>

        {!connected && (
          <Card className="bg-[#0A0A0A] border-white/5 mb-6">
            <CardContent className="p-6">
              <p className="text-yellow-500 text-sm">⚠️ Please connect your wallet to initialize the platform</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-[#0A0A0A] border-white/5">
          <CardHeader>
            <CardTitle className="text-xl font-mono text-white">Platform Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Fee Collector Address</label>
              <Input
                type="text"
                placeholder="Enter Solana address..."
                value={feeCollector}
                onChange={(e) => setFeeCollector(e.target.value)}
                disabled={!connected}
                className="bg-black border-white/10 font-mono text-sm"
              />
              <p className="text-[9px] text-gray-600">Address that will receive platform fees</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Fee Basis Points</label>
                <Input
                  type="number"
                  value={feeBasisPoints}
                  onChange={(e) => setFeeBasisPoints(e.target.value)}
                  disabled={!connected}
                  className="bg-black border-white/10 text-sm"
                />
                <p className="text-[9px] text-gray-600">10 BPS = 0.1%</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Max Listings Per User</label>
                <Input
                  type="number"
                  value={maxListingsPerUser}
                  onChange={(e) => setMaxListingsPerUser(e.target.value)}
                  disabled={!connected}
                  className="bg-black border-white/10 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Min Duration (seconds)</label>
                <Input
                  type="number"
                  value={minTradeDuration}
                  onChange={(e) => setMinTradeDuration(e.target.value)}
                  disabled={!connected}
                  className="bg-black border-white/10 text-sm"
                />
                <p className="text-[9px] text-gray-600">60 = 1 minute</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Max Duration (seconds)</label>
                <Input
                  type="number"
                  value={maxTradeDuration}
                  onChange={(e) => setMaxTradeDuration(e.target.value)}
                  disabled={!connected}
                  className="bg-black border-white/10 text-sm"
                />
                <p className="text-[9px] text-gray-600">2592000 = 30 days</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-black border border-white/5">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-1">Whitelist Enabled</span>
                <span className="text-[9px] text-gray-600">Require tokens to be whitelisted</span>
              </div>
              <button
                onClick={() => connected && setWhitelistEnabled(!whitelistEnabled)}
                disabled={!connected}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                  whitelistEnabled ? 'bg-[#0CA5B0]' : 'bg-gray-600'
                } ${!connected && 'opacity-50 cursor-not-allowed'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                  whitelistEnabled ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            <Button 
              onClick={handleInitialize}
              disabled={!connected || adminLoading || !feeCollector}
              className="w-full bg-[#0CA5B0] text-black hover:bg-[#0CA5B0]/90 font-mono font-bold text-sm uppercase tracking-widest"
            >
              {adminLoading ? 'Initializing...' : 'Initialize Platform'}
            </Button>

            {connected && publicKey && (
              <div className="text-center text-[9px] text-gray-600 font-mono">
                Your wallet will become the platform authority:<br />
                {publicKey.toString()}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <StatusBar />
    </div>
  );
}
