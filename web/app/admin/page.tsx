'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@/components/ui/alert';
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
import { usePlatform, useAdmin } from '@/lib/solana/hooks';
import { toast } from 'sonner';
import WalletRequired from '@/components/wallet/wallet-required';

export default function AdminDashboardPage() {
  const { publicKey, connected } = useWallet();
  const { platform, loading: platformLoading } = usePlatform();
  const { pausePlatform, updateConfig, setFeeCollector, loading: adminLoading } = useAdmin();
  const router = useRouter();

  // Form state
  const [feeBps, setFeeBps] = useState('10');
  const [maxListings, setMaxListings] = useState('100');
  const [minDuration, setMinDuration] = useState('60');
  const [maxDuration, setMaxDuration] = useState('2592000'); // 30 days in seconds
  const [whitelistEnabled, setWhitelistEnabled] = useState(true);
  const [newCollector, setNewCollector] = useState('');

  // Update form when platform data loads
  useEffect(() => {
    if (platform) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setFeeBps(platform.feeBasisPoints.toString());
      setMaxListings(platform.maxListingsPerUser.toString());
      setMinDuration(platform.minListingDuration.toString());
      setMaxDuration(platform.maxListingDuration.toString());
      setWhitelistEnabled(platform.whitelistEnabled);
    }
  }, [platform]);

  const isAuthority = connected && publicKey && platform && 
    publicKey.toString() === platform.authority.toString();

  const handlePausePlatform = async () => {
    const result = await pausePlatform(true);
    if (result) {
      toast.success('Platform paused successfully');
      router.refresh();
    }
  };

  const handleResumePlatform = async () => {
    const result = await pausePlatform(false);
    if (result) {
      toast.success('Platform resumed successfully');
      router.refresh();
    }
  };

  const handleSaveConfig = async () => {
    const result = await updateConfig({
      feeBasisPoints: parseInt(feeBps),
      maxListingsPerUser: parseInt(maxListings),
      minListingDuration: parseInt(minDuration),
      maxListingDuration: parseInt(maxDuration),
      whitelistEnabled: whitelistEnabled,
    });
    
    if (result) {
      toast.success('Configuration saved successfully');
      router.refresh();
    }
  };

  const handleUpdateCollector = async () => {
    if (!newCollector) {
      toast.error('Please enter a collector address');
      return;
    }

    try {
      const collectorPubkey = new PublicKey(newCollector);
      const result = await setFeeCollector(collectorPubkey);
      
      if (result) {
        setNewCollector('');
        toast.success('Fee collector updated successfully');
        router.refresh();
      }
    } catch {
      toast.error('Invalid public key');
    }
  };

  if (platformLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-10 max-w-[1280px] mx-auto">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Loading platform data...</p>
          </div>
        </main>
        <StatusBar />
      </div>
    );
  }

  if (!platform) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-10 max-w-[1280px] mx-auto">
          <Alert variant="destructive">
            <AlertIcon>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </AlertIcon>
            <div>
              <AlertTitle>Platform Not Initialized</AlertTitle>
              <AlertDescription>The platform needs to be initialized by the authority wallet.</AlertDescription>
            </div>
          </Alert>
          <div className="mt-6 text-center">
            <Link href="/admin/initialize">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold">
                Initialize Platform
              </Button>
            </Link>
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
        <main className="pt-32 pb-24 px-10 max-w-[1280px] mx-auto">
          <WalletRequired 
            title="Wallet Required"
            description="Please connect your Solana wallet to access the admin dashboard."
            backLink="/"
            backLinkText="← Back to Home"
          />
        </main>
        <StatusBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Restricted Banner - Only show if NOT authority */}
      {!isAuthority && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-destructive/20 to-background px-6 py-2 border-b border-destructive/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-[10px] font-mono font-bold text-destructive tracking-[0.2em] uppercase">
              ACCESS RESTRICTED — Authority wallet required
            </span>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground uppercase">Security Protocol Level 4</span>
        </div>
      )}

      <div className={isAuthority ? "pt-0" : "pt-10"}>
        <Navigation />
      </div>

      <main className={`pb-20 px-10 max-w-[1280px] mx-auto ${isAuthority ? "pt-32" : "pt-40"}`}>
        {/* Header */}
        <header className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-mono text-primary tracking-[0.3em] uppercase mb-2">{'/// Admin Panel'}</div>
            <h1 className="text-4xl font-mono font-bold tracking-tight text-foreground uppercase">Admin</h1>
          </div>
          <Link href="/admin/whitelist">
            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Manage Whitelist
            </Button>
          </Link>
        </header>

        {!isAuthority && (
          <Alert variant="restricted" className="mb-8">
            <AlertIcon>
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </AlertIcon>
            <div>
              <AlertTitle>Read-Only Mode — Authority wallet not connected</AlertTitle>
              <AlertDescription>Connect the program authority wallet to make configuration changes.</AlertDescription>
            </div>
          </Alert>
        )}

        {/* Platform Status */}
        <section className="mb-10">
          <div className="bg-card border border-border p-8 flex items-center justify-between">
            <div className="flex gap-12">
              <div>
                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Platform Status</div>
                <Badge className={`gap-2 px-4 py-1.5 ${
                  platform.isPaused 
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-green-500/10 text-green-500 border-green-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${platform.isPaused ? 'bg-destructive' : 'bg-green-500 animate-pulse'} inline-block`} />
                  {platform.isPaused ? 'PAUSED' : 'ACTIVE'}
                </Badge>
              </div>
              {[
                { label: 'Current Fee', value: `${platform.feeBasisPoints} BPS` },
                { label: 'Max Listings', value: `${platform.maxListingsPerUser}/USER` },
                { label: 'Min Duration', value: `${Number(platform.minListingDuration) / 60}m` },
                { label: 'Whitelist', value: platform.whitelistEnabled ? 'ENABLED' : 'DISABLED', teal: platform.whitelistEnabled },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-3">{item.label}</div>
                  <div className={`text-xl font-mono ${item.teal ? 'text-primary' : 'text-foreground'}`}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              {!platform.isPaused ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={!isAuthority || adminLoading}>
                      Pause Platform
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Pause the platform?</AlertDialogTitle>
                      <AlertDialogDescription>
                        All listing creation and swaps will be halted. Active listings will remain in escrow.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-500 hover:bg-red-600 border-red-500 text-white"
                        onClick={handlePausePlatform}
                      >
                        Pause Platform
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!isAuthority || adminLoading}
                  onClick={handleResumePlatform}
                  className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                >
                  Resume Platform
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Configuration & Sidebar */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          {/* Configuration Management */}
          <section className="col-span-8 bg-card border border-border p-8">
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-8">
              Configuration Management
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Fee Basis Points (0-1000)</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={feeBps}
                    onChange={(e) => setFeeBps(e.target.value)}
                    disabled={!isAuthority}
                    className="bg-background border-border text-sm pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground">
                    BPS
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Max Listings Per User</label>
                <Input
                  type="number"
                  value={maxListings}
                  onChange={(e) => setMaxListings(e.target.value)}
                  disabled={!isAuthority}
                  className="bg-background border-border text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Min Listing Duration (seconds)</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={minDuration}
                    onChange={(e) => setMinDuration(e.target.value)}
                    disabled={!isAuthority}
                    className="bg-background border-border text-sm pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground">
                    SECS
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Max Listing Duration (seconds)</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={maxDuration}
                    onChange={(e) => setMaxDuration(e.target.value)}
                    disabled={!isAuthority}
                    className="bg-background border-border text-sm pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground">
                    SECS
                  </span>
                </div>
              </div>

              <div className="flex items-end pb-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Whitelist Enabled</span>
                  <button
                    onClick={() => isAuthority && setWhitelistEnabled(!whitelistEnabled)}
                    disabled={!isAuthority}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                      whitelistEnabled ? 'bg-primary' : 'bg-muted'
                    } ${!isAuthority && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-background rounded-full transition-all ${
                      whitelistEnabled ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-[8px] font-mono text-muted-foreground uppercase">Estimated Transaction Fee</span>
                <div className="text-[10px] font-mono text-foreground">~0.00201 SOL</div>
              </div>
              <Button 
                onClick={handleSaveConfig}
                disabled={!isAuthority || adminLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold text-[11px] uppercase tracking-[0.2em] border-primary disabled:opacity-50"
              >
                {adminLoading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </section>

          {/* Sidebar */}
          <section className="col-span-4 space-y-6">
            {/* Fee Collector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Fee Collector</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between bg-muted border border-border p-3">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {platform.feeCollector.toString().slice(0, 4)}...{platform.feeCollector.toString().slice(-4)}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(platform.feeCollector.toString());
                        toast.success('Address copied!');
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                    </Button>
                  </div>
                </div>
                <Input
                  type="text"
                  placeholder="New Collector Address..."
                  value={newCollector}
                  onChange={(e) => setNewCollector(e.target.value)}
                  disabled={!isAuthority}
                  className="bg-background border-border text-[10px]"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-primary/30 text-primary hover:bg-primary/5"
                  onClick={handleUpdateCollector}
                  disabled={!isAuthority || adminLoading}
                >
                  Update Collector
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>

        <Separator className="mb-10" />

        {/* Bottom Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Listings', value: platform.totalListingsCreated.toString(), teal: false },
            { label: 'Total Swaps', value: platform.totalSwapsExecuted.toString(), teal: true },
            { label: 'Total Volume', value: `${Number(platform.totalVolumeTraded) / 1e9} SOL`, teal: false },
            { label: 'Fees Collected', value: `${Number(platform.totalFeesCollected) / 1e9} SOL`, teal: false },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border p-4">
              <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest block mb-1">{stat.label}</span>
              <span className={`text-lg font-mono ${stat.teal ? 'text-primary' : 'text-foreground'}`}>{stat.value}</span>
            </div>
          ))}
        </section>
      </main>

      <StatusBar />
    </div>
  );
}
