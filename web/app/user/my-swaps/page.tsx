'use client';

import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Coins } from 'lucide-react';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import WalletRequired from '@/components/wallet/wallet-required';
import { Button } from '@/components/ui/button';
import { useFetchSwaps, useTokensMetadata } from '@/lib/solana/hooks';
import { useUserProfile } from '@/lib/solana/hooks/user/use-user-profile';

interface TokenMetadata {
  mint: string;
  symbol?: string;
  name?: string;
  image?: string;
  decimals?: number;
}

function TokenDisplay({ metadata, size = 'sm' }: { metadata?: TokenMetadata; size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8'
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
      <Coins className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} style={{ display: metadata?.image ? 'none' : 'block' }} />
    </div>
  );
}

function formatAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit',
    year: 'numeric'
  }) + ', ' + date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

export default function MySwapsPage() {
  const { publicKey, connected } = useWallet();
  const { swaps, loading } = useFetchSwaps(publicKey);
  const { profile } = useUserProfile();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Get all unique token mints
  const tokenMints = useMemo(() => {
    const mints = new Set<string>();
    swaps.forEach(swap => {
      mints.add(swap.tokenMintSource.toString());
      mints.add(swap.tokenMintDestination.toString());
    });
    return Array.from(mints).map(mint => new PublicKey(mint));
  }, [swaps]);

  const { tokensMetadata, loading: metadataLoading } = useTokensMetadata(tokenMints);

  // Filter swaps by date range
  const filteredSwaps = useMemo(() => {
    if (!startDate && !endDate) return swaps;
    
    return swaps.filter(swap => {
      const swapDate = new Date(swap.blockTime * 1000);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && swapDate < start) return false;
      if (end && swapDate > end) return false;
      return true;
    });
  }, [swaps, startDate, endDate]);

  // Calculate stats - includes both full and partial swaps
  const stats = useMemo(() => {
    const totalSwaps = filteredSwaps.length;
    
    // Calculate total volume as taker (sum of amounts received)
    const totalVolumeTaker = filteredSwaps.reduce((sum, swap) => {
      const destDecimals = tokensMetadata.find(t => t.mint === swap.tokenMintDestination.toString())?.decimals || 9;
      return sum + (swap.amountDestination.toNumber() / Math.pow(10, destDecimals));
    }, 0);
    
    // Calculate total volume as maker (from user profile)
    const totalVolumeMaker = profile ? Number(profile.volumeAsMaker) / 1e9 : 0;
    
    // Calculate total fees - convert to destination token decimals
    const totalFees = filteredSwaps.reduce((sum, swap) => {
      const destDecimals = tokensMetadata.find(t => t.mint === swap.tokenMintDestination.toString())?.decimals || 9;
      return sum + (swap.fee.toNumber() / Math.pow(10, destDecimals));
    }, 0);
    
    const avgSwapSize = totalSwaps > 0 ? totalVolumeTaker / totalSwaps : 0;

    return {
      totalSwaps,
      totalVolumeTaker,
      totalVolumeMaker,
      totalFees,
      avgSwapSize,
    };
  }, [filteredSwaps, tokensMetadata, profile]);

  // Export to CSV function
  const exportToCSV = () => {
    if (filteredSwaps.length === 0) return;
    
    const headers = ['Date/Time', 'Token Pair', 'Sent', 'Received', 'Fee', 'Maker', 'Transaction'];
    const rows = filteredSwaps.map(swap => {
      const sourceToken = tokensMetadata.find(t => t.mint === swap.tokenMintSource.toString());
      const destToken = tokensMetadata.find(t => t.mint === swap.tokenMintDestination.toString());
      const sourceDecimals = sourceToken?.decimals || 9;
      const destDecimals = destToken?.decimals || 9;
      
      return [
        formatDate(swap.blockTime),
        `${sourceToken?.symbol || formatAddress(swap.tokenMintSource.toString())} → ${destToken?.symbol || formatAddress(swap.tokenMintDestination.toString())}`,
        (swap.amountSource.toNumber() / Math.pow(10, sourceDecimals)).toFixed(4),
        (swap.amountDestination.toNumber() / Math.pow(10, destDecimals)).toFixed(4),
        `${(swap.fee.toNumber() / Math.pow(10, destDecimals)).toFixed(6)} ${destToken?.symbol || 'tokens'}`,
        swap.maker.toString(),
        swap.signature || 'N/A'
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `selix-swaps-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!connected) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
          <WalletRequired
            title="Wallet Required"
            description="Please connect your Solana wallet to view your swap history."
            backLink="/listings"
            backLinkText="← Browse Listings"
            infoTitle="Connect Your Wallet"
            infoDescription="Click the wallet button in the navigation bar to connect your Solana wallet and view your swap history including partial fills."
          />
        </main>
        <StatusBar />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        {/* Stats Grid */}
        <div className="mb-8 lg:mb-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Swaps', value: stats.totalSwaps.toString(), highlight: false, subtitle: 'Executed' },
            { label: 'Volume (Taker)', value: `$${stats.totalVolumeTaker.toFixed(2)}`, highlight: true, subtitle: 'As Taker' },
            { label: 'Volume (Maker)', value: `$${stats.totalVolumeMaker.toFixed(2)}`, highlight: false, subtitle: 'As Maker' },
            { label: 'Total Fees', value: `${stats.totalFees.toFixed(4)}`, highlight: false, subtitle: 'Paid in Tokens' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border p-4 sm:p-6 space-y-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{stat.label}</span>
              <div className={`text-xl sm:text-2xl font-mono ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>{stat.value}</div>
              <span className="text-[9px] font-mono text-muted-foreground">{stat.subtitle}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 sm:mb-8 lg:hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card border border-border px-4 sm:px-6 py-4 rounded-lg">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 flex-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Date Range:</span>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-muted border border-border text-[10px] font-mono h-8 px-2 rounded text-foreground" 
                />
                <span className="text-muted-foreground">to</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-muted border border-border text-[10px] font-mono h-8 px-2 rounded text-foreground" 
                />
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={exportToCSV}
            disabled={filteredSwaps.length === 0}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </Button>
        </div>

        {/* Loading State */}
        {(loading || metadataLoading) && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Loading your swaps...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !metadataLoading && filteredSwaps.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
              {swaps.length === 0 ? 'No swaps yet' : 'No swaps in selected date range'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {swaps.length === 0 
                ? 'Your swap history (including partial fills) will appear here once you execute swaps'
                : 'Try adjusting your date filters to see more results'
              }
            </p>
          </div>
        )}

        {/* Swaps Table - Desktop */}
        {!loading && !metadataLoading && filteredSwaps.length > 0 && (
          <>
            <div className="hidden lg:block bg-card border border-border overflow-hidden rounded-lg">
              {/* Filters in Header */}
              <div className="bg-muted/30 border-b border-border px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Filter:</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-background border border-border text-[10px] font-mono h-8 px-2 rounded text-foreground" 
                      placeholder="Start date"
                    />
                    <span className="text-muted-foreground text-xs">to</span>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-background border border-border text-[10px] font-mono h-8 px-2 rounded text-foreground" 
                      placeholder="End date"
                    />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={exportToCSV}
                  disabled={filteredSwaps.length === 0}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      {['Date/Time', 'Token Pair', 'Sent', 'Received', 'Fee', 'Maker', 'TX'].map((h, i) => (
                        <th key={h} className={`px-6 py-4 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap ${i === 6 ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[11px] font-mono">
                    {filteredSwaps.map((swap, i) => {
                      const sourceToken = tokensMetadata.find(t => t.mint === swap.tokenMintSource.toString());
                      const destToken = tokensMetadata.find(t => t.mint === swap.tokenMintDestination.toString());
                      const sourceDecimals = sourceToken?.decimals || 9;
                      const destDecimals = destToken?.decimals || 9;
                      
                      return (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{formatDate(swap.blockTime)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <TokenDisplay metadata={sourceToken} size="sm" />
                              <span className="text-foreground font-medium">
                                {sourceToken?.symbol || formatAddress(swap.tokenMintSource.toString())}
                              </span>
                              <span className="text-primary">→</span>
                              <TokenDisplay metadata={destToken} size="sm" />
                              <span className="text-foreground font-medium">
                                {destToken?.symbol || formatAddress(swap.tokenMintDestination.toString())}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-foreground whitespace-nowrap">{(swap.amountSource.toNumber() / Math.pow(10, sourceDecimals)).toFixed(4)}</td>
                          <td className="px-6 py-4 text-foreground whitespace-nowrap">{(swap.amountDestination.toNumber() / Math.pow(10, destDecimals)).toFixed(4)}</td>
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                            {(swap.fee.toNumber() / Math.pow(10, destDecimals)).toFixed(6)} {destToken?.symbol || ''}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{formatAddress(swap.maker.toString())}</td>
                          <td className="px-6 py-4 text-right">
                            {swap.signature ? (
                              <a 
                                href={`https://explorer.solana.com/tx/${swap.signature}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
                              >
                                View
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Swaps Cards - Mobile */}
            <div className="lg:hidden space-y-4">
              {filteredSwaps.map((swap, i) => {
                const sourceToken = tokensMetadata.find(t => t.mint === swap.tokenMintSource.toString());
                const destToken = tokensMetadata.find(t => t.mint === swap.tokenMintDestination.toString());
                const sourceDecimals = sourceToken?.decimals || 9;
                const destDecimals = destToken?.decimals || 9;
                
                return (
                  <div key={i} className="bg-card border border-border p-4 rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono text-muted-foreground mb-2">
                          {formatDate(swap.blockTime)}
                        </div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <TokenDisplay metadata={sourceToken} size="md" />
                          <span className="text-sm font-mono text-foreground font-medium">
                            {sourceToken?.symbol || formatAddress(swap.tokenMintSource.toString())}
                          </span>
                          <span className="text-primary">→</span>
                          <TokenDisplay metadata={destToken} size="md" />
                          <span className="text-sm font-mono text-foreground font-medium">
                            {destToken?.symbol || formatAddress(swap.tokenMintDestination.toString())}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Sent</div>
                        <div className="font-mono text-foreground">{(swap.amountSource.toNumber() / Math.pow(10, sourceDecimals)).toFixed(4)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Received</div>
                        <div className="font-mono text-foreground">{(swap.amountDestination.toNumber() / Math.pow(10, destDecimals)).toFixed(4)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Fee</div>
                        <div className="font-mono text-muted-foreground">
                          {(swap.fee.toNumber() / Math.pow(10, destDecimals)).toFixed(6)} {destToken?.symbol || ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Maker</div>
                        <div className="font-mono text-muted-foreground">{formatAddress(swap.maker.toString())}</div>
                      </div>
                    </div>

                    {swap.signature && (
                      <div className="pt-3 border-t border-border">
                        <a 
                          href={`https://explorer.solana.com/tx/${swap.signature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
                        >
                          View Transaction
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <StatusBar />
    </div>
  );
}
