'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PublicKey } from '@solana/web3.js';
import { Coins } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { useFetchListings, useTokensMetadata } from '@/lib/solana/hooks';
import { toast } from 'sonner';

function formatAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function MarketplacePage() {
  const [sortMode, setSortMode] = useState<'best' | 'expiring' | 'newest'>('best');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [destFilter, setDestFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'partial'>('all');
  const [minAmount, setMinAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { listings, loading } = useFetchListings();
  
  // Get all unique token mints from listings
  const allTokenMints = useMemo(() => {
    const mints = new Set<string>();
    listings.forEach(listing => {
      mints.add(listing.tokenMintSource.toString());
      mints.add(listing.tokenMintDestination.toString());
    });
    return Array.from(mints).map(mint => new PublicKey(mint));
  }, [listings]);
  
  // Fetch metadata for all tokens
  const { tokensMetadata, loading: metadataLoading } = useTokensMetadata(allTokenMints);
  
  // Get unique tokens for filters
  const uniqueSourceTokens = useMemo(() => {
    const tokens = new Map<string, { mint: string; symbol?: string; image?: string }>();
    listings.forEach(listing => {
      const mint = listing.tokenMintSource.toString();
      if (!tokens.has(mint)) {
        const metadata = tokensMetadata.find(t => t.mint === mint);
        tokens.set(mint, {
          mint,
          symbol: metadata?.symbol,
          image: metadata?.image
        });
      }
    });
    return Array.from(tokens.values());
  }, [listings, tokensMetadata]);

  const uniqueDestTokens = useMemo(() => {
    const tokens = new Map<string, { mint: string; symbol?: string; image?: string }>();
    listings.forEach(listing => {
      const mint = listing.tokenMintDestination.toString();
      if (!tokens.has(mint)) {
        const metadata = tokensMetadata.find(t => t.mint === mint);
        tokens.set(mint, {
          mint,
          symbol: metadata?.symbol,
          image: metadata?.image
        });
      }
    });
    return Array.from(tokens.values());
  }, [listings, tokensMetadata]);
  
  // Helper to get token metadata
  const getTokenMetadata = (mint: string) => {
    return tokensMetadata.find(t => t.mint === mint);
  };
  
  // Helper to format token amounts with decimals
  const formatTokenAmount = (amount: bigint, decimals: number = 9) => {
    const num = Number(amount) / Math.pow(10, decimals);
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };
  
  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let filtered = [...listings];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => {
        const listingId = listing.publicKey.toString().toLowerCase();
        const maker = listing.maker.toString().toLowerCase();
        const sourceMetadata = tokensMetadata.find(t => t.mint === listing.tokenMintSource.toString());
        const destMetadata = tokensMetadata.find(t => t.mint === listing.tokenMintDestination.toString());
        
        return listingId.includes(query) ||
               maker.includes(query) ||
               sourceMetadata?.symbol?.toLowerCase().includes(query) ||
               destMetadata?.symbol?.toLowerCase().includes(query);
      });
    }
    
    // Token filters
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(listing => 
        listing.tokenMintSource.toString() === sourceFilter
      );
    }
    
    if (destFilter !== 'all') {
      filtered = filtered.filter(listing => 
        listing.tokenMintDestination.toString() === destFilter
      );
    }
    
    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(listing => listing.status.active !== undefined);
    } else if (statusFilter === 'partial') {
      filtered = filtered.filter(listing => {
        const filled = Number(listing.amountSourceTotal - listing.amountSourceRemaining);
        return filled > 0 && listing.amountSourceRemaining > 0n;
      });
    }
    
    // Min amount filter
    if (minAmount && !isNaN(parseFloat(minAmount))) {
      const minAmountNum = parseFloat(minAmount);
      filtered = filtered.filter(listing => {
        const sourceMetadata = tokensMetadata.find(t => t.mint === listing.tokenMintSource.toString());
        const amount = Number(listing.amountSourceRemaining) / Math.pow(10, sourceMetadata?.decimals || 9);
        return amount >= minAmountNum;
      });
    }
    
    // Sort
    if (sortMode === 'expiring') {
      filtered.sort((a, b) => Number(a.expiresAt) - Number(b.expiresAt));
    } else if (sortMode === 'newest') {
      filtered.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    } else {
      // Best rate - sort by fill progress (most filled first)
      filtered.sort((a, b) => {
        const progressA = Number(a.amountSourceTotal - a.amountSourceRemaining) / Number(a.amountSourceTotal);
        const progressB = Number(b.amountSourceTotal - b.amountSourceRemaining) / Number(b.amountSourceTotal);
        return progressB - progressA;
      });
    }
    
    return filtered;
  }, [listings, searchQuery, sourceFilter, destFilter, statusFilter, minAmount, sortMode, tokensMetadata]);

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const paginatedListings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredListings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredListings, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, sourceFilter, destFilter, statusFilter, minAmount, sortMode]);

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-32 pb-24 px-4 sm:px-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] uppercase">/// Active Listings</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/20">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-mono text-primary tracking-wider uppercase">Live</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight">Marketplace</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Input
              placeholder="Search by ID or Maker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 md:w-80 bg-card border-border font-mono text-[11px]"
            />
            <div className="flex bg-card border border-border p-1">
              {(['best', 'expiring', 'newest'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    sortMode === mode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode === 'best' ? 'Best Rate' : mode === 'expiring' ? 'Expiring' : 'Newest'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-4 sm:space-y-6">
            <div className="bg-card border border-border p-4 sm:p-6">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4 sm:mb-6 flex items-center justify-between">
                Filters
                <Button 
                  variant="ghost" 
                  size="xs" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSourceFilter('all');
                    setDestFilter('all');
                    setSearchQuery('');
                    setStatusFilter('all');
                    setMinAmount('');
                  }}
                >
                  Reset
                </Button>
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Source Token</label>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="bg-muted border-border text-[11px]">
                      <SelectValue placeholder="All Assets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assets</SelectItem>
                      {uniqueSourceTokens.map(token => (
                        <SelectItem key={token.mint} value={token.mint}>
                          <div className="flex items-center gap-2">
                            {token.image && <img src={token.image} alt={token.symbol} className="w-4 h-4 rounded-full" />}
                            <span>{token.symbol || formatAddress(token.mint)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Destination Token</label>
                  <Select value={destFilter} onValueChange={setDestFilter}>
                    <SelectTrigger className="bg-muted border-border text-[11px]">
                      <SelectValue placeholder="All Assets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assets</SelectItem>
                      {uniqueDestTokens.map(token => (
                        <SelectItem key={token.mint} value={token.mint}>
                          <div className="flex items-center gap-2">
                            {token.image && <img src={token.image} alt={token.symbol} className="w-4 h-4 rounded-full" />}
                            <span>{token.symbol || formatAddress(token.mint)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="mb-6" />

              <div className="space-y-3 mb-6">
                <label className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Status</label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="status" 
                    checked={statusFilter === 'all'} 
                    onChange={() => setStatusFilter('all')}
                    className="hidden peer" 
                  />
                  <div className="w-3.5 h-3.5 border border-border peer-checked:bg-primary peer-checked:border-primary transition-all" />
                  <span className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground">All Listings</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="status" 
                    checked={statusFilter === 'active'} 
                    onChange={() => setStatusFilter('active')}
                    className="hidden peer" 
                  />
                  <div className="w-3.5 h-3.5 border border-border peer-checked:bg-primary peer-checked:border-primary transition-all" />
                  <span className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground">Active Only</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="status" 
                    checked={statusFilter === 'partial'} 
                    onChange={() => setStatusFilter('partial')}
                    className="hidden peer" 
                  />
                  <div className="w-3.5 h-3.5 border border-border peer-checked:bg-primary peer-checked:border-primary transition-all" />
                  <span className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground">Partially Filled</span>
                </label>
              </div>

              <Separator className="mb-6" />

              <div>
                <label className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Min Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="bg-muted border-border text-[11px]"
                />
              </div>
            </div>
          </aside>

          {/* Listings Table */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="bg-card border border-border p-8 sm:p-12 text-center">
                <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Loading listings...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="bg-card border border-border p-8 sm:p-12 text-center">
                <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">No listings found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {paginatedListings.map((listing) => {
                    const progress = Number(listing.amountSourceTotal - listing.amountSourceRemaining) / Number(listing.amountSourceTotal) * 100;
                    const rate = Number(listing.amountDestinationTotal) / Number(listing.amountSourceTotal);
                    const sourceMetadata = getTokenMetadata(listing.tokenMintSource.toString());
                    const destMetadata = getTokenMetadata(listing.tokenMintDestination.toString());
                    const remaining = formatTokenAmount(listing.amountSourceRemaining, sourceMetadata?.decimals || 9);
                    
                    return (
                      <Link key={listing.publicKey.toString()} href={`/listings/${listing.publicKey.toString()}`}>
                        <div className="bg-card border border-border p-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 shrink-0">
                                {sourceMetadata?.image ? (
                                  <img src={sourceMetadata.image} alt={sourceMetadata.symbol} className="w-5 h-5 rounded-full" />
                                ) : (
                                  <Coins className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-mono font-medium truncate">
                                  {sourceMetadata?.symbol || formatAddress(listing.tokenMintSource.toString())} → {destMetadata?.symbol || formatAddress(listing.tokenMintDestination.toString())}
                                </div>
                                <div className="text-xs font-mono text-muted-foreground">
                                  Rate: {rate.toFixed(4)}
                                </div>
                              </div>
                            </div>
                            <Badge className={listing.status.active !== undefined ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-muted-foreground bg-muted'}>
                              {listing.status.active !== undefined ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                            <span>{progress.toFixed(0)}% filled</span>
                            <CountdownTimer expiresAt={listing.expiresAt} className="text-xs font-mono" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-card border border-border overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 xl:px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.15em]">Token Pair</th>
                        <th className="px-4 xl:px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.15em]">Rate</th>
                        <th className="px-4 xl:px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.15em]">Availability</th>
                        <th className="px-4 xl:px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.15em]">TTL</th>
                        <th className="px-4 xl:px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.15em]">Maker</th>
                        <th className="px-4 xl:px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.15em]">Status</th>
                        <th className="px-4 xl:px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.15em] text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedListings.map((listing) => {
                        const progress = Number(listing.amountSourceTotal - listing.amountSourceRemaining) / Number(listing.amountSourceTotal) * 100;
                        const rate = Number(listing.amountDestinationTotal) / Number(listing.amountSourceTotal);
                        const sourceMetadata = getTokenMetadata(listing.tokenMintSource.toString());
                        const destMetadata = getTokenMetadata(listing.tokenMintDestination.toString());
                        const remaining = formatTokenAmount(listing.amountSourceRemaining, sourceMetadata?.decimals || 9);
                        const total = formatTokenAmount(listing.amountSourceTotal, sourceMetadata?.decimals || 9);
                        
                        return (
                          <tr key={listing.publicKey.toString()} className="hover:bg-muted/50 transition-colors group">
                            <td className="px-4 xl:px-6 py-4 sm:py-6">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                  {sourceMetadata?.image ? (
                                    <img src={sourceMetadata.image} alt={sourceMetadata.symbol} className="w-5 h-5 rounded-full" />
                                  ) : (
                                    <Coins className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <span className="text-xs font-mono font-medium">
                                    {sourceMetadata?.symbol || formatAddress(listing.tokenMintSource.toString())}
                                  </span>
                                </div>
                                <span className="text-muted-foreground font-mono text-[10px]">→</span>
                                <div className="flex items-center gap-1.5">
                                  {destMetadata?.image ? (
                                    <img src={destMetadata.image} alt={destMetadata.symbol} className="w-5 h-5 rounded-full" />
                                  ) : (
                                    <Coins className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <span className="text-xs font-mono font-medium">
                                    {destMetadata?.symbol || formatAddress(listing.tokenMintDestination.toString())}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4 sm:py-6 font-mono text-xs text-primary">
                              {rate.toFixed(4)}
                            </td>
                            <td className="px-4 xl:px-6 py-4 sm:py-6 w-48">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  {remaining} / {total}
                                </span>
                                <div className="w-full h-[2px] bg-muted">
                                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4 sm:py-6 font-mono text-[11px]">
                              <CountdownTimer expiresAt={listing.expiresAt} className="text-[11px] font-mono text-muted-foreground" />
                            </td>
                            <td className="px-4 xl:px-6 py-4 sm:py-6">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] text-muted-foreground">
                                  {formatAddress(listing.maker.toString())}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigator.clipboard.writeText(listing.maker.toString());
                                    toast.success('Maker address copied!');
                                  }}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                  </svg>
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4 sm:py-6">
                              <Badge
                                className={listing.status.active !== undefined
                                  ? 'text-green-500 bg-green-500/10 border-green-500/20'
                                  : 'text-muted-foreground bg-muted'
                                }
                              >
                                {listing.status.active !== undefined ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="px-4 xl:px-6 py-4 sm:py-6 text-right">
                              <Link href={`/listings/${listing.publicKey.toString()}`}>
                                <Button variant="outline" size="xs">
                                  Swap Now
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-0">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredListings.length)} of {filteredListings.length} Listing{filteredListings.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon-sm" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button 
                            key={pageNum}
                            size="xs" 
                            variant={currentPage === pageNum ? "default" : "outline"}
                            className="w-8"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon-sm" 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <StatusBar />
    </div>
  );
}
