'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PublicKey } from '@solana/web3.js';
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
import { useFetchListings } from '@/lib/solana/hooks';

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
  
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

export default function MarketplacePage() {
  const [sortMode, setSortMode] = useState<'best' | 'expiring' | 'newest'>('best');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [destFilter, setDestFilter] = useState('all');
  
  const { listings, loading } = useFetchListings();
  
  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let filtered = [...listings];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(listing => 
        listing.publicKey.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.maker.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
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
  }, [listings, searchQuery, sourceFilter, destFilter, sortMode]);

  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#EAEAEA]">
      <Navigation />

      <main className="pt-32 pb-24 px-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10px] text-[#555] tracking-[0.2em] uppercase">/// Active Listings</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0CA5B0]/10 border border-[#0CA5B0]/20">
                <div className="w-1 h-1 rounded-full bg-[#0CA5B0] animate-pulse" />
                <span className="text-[9px] font-mono text-[#0CA5B0] tracking-wider uppercase">Live</span>
              </div>
            </div>
            <h1 className="text-4xl font-medium tracking-tight text-white">Marketplace</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by ID or Maker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 bg-[#0A0A0A] border-white/10 font-mono text-[11px]"
            />
            <div className="flex bg-[#0A0A0A] border border-white/10 p-1">
              {(['best', 'expiring', 'newest'] as const).map((mode, i) => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    sortMode === mode ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {mode === 'best' ? 'Best Rate' : mode === 'expiring' ? 'Expiring' : 'Newest'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <aside className="col-span-12 lg:col-span-3 space-y-6">
            <div className="bg-[#0A0A0A] border border-white/5 p-6">
              <h3 className="font-mono text-[10px] text-white uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                Filters
                <Button 
                  variant="ghost" 
                  size="xs" 
                  className="text-gray-600 hover:text-white"
                  onClick={() => {
                    setSourceFilter('all');
                    setDestFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Reset
                </Button>
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Source Token</label>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="bg-[#111] border-white/10 text-white text-[11px]">
                      <SelectValue placeholder="All Assets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assets</SelectItem>
                      {/* TODO: Add dynamic token list */}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Destination Token</label>
                  <Select value={destFilter} onValueChange={setDestFilter}>
                    <SelectTrigger className="bg-[#111] border-white/10 text-white text-[11px]">
                      <SelectValue placeholder="All Assets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assets</SelectItem>
                      {/* TODO: Add dynamic token list */}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="mb-6" />

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Price Range</label>
                  <span className="text-[10px] font-mono text-white">$0 – $50k</span>
                </div>
                <input type="range" className="w-full cursor-pointer" />
              </div>

              <Separator className="mb-6" />

              <div className="space-y-3 mb-6">
                <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Status</label>
                {['Active Only', 'Partially Filled'].map((label, i) => (
                  <label key={label} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked={i === 0} className="hidden peer" />
                    <div className="w-3.5 h-3.5 border border-white/20 peer-checked:bg-[#0CA5B0] peer-checked:border-[#0CA5B0] transition-all" />
                    <span className="text-[11px] font-mono text-gray-400 group-hover:text-white">{label}</span>
                  </label>
                ))}
              </div>

              <Separator className="mb-6" />

              <div>
                <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">Min Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="bg-[#111] border-white/10 text-white text-[11px]"
                />
              </div>
            </div>
          </aside>

          {/* Listings Table */}
          <div className="col-span-12 lg:col-span-9">
            {loading ? (
              <div className="bg-[#080808] border border-white/5 p-12 text-center">
                <div className="inline-block w-8 h-8 border-2 border-[#0CA5B0] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">Loading listings...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="bg-[#080808] border border-white/5 p-12 text-center">
                <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">No listings found</p>
              </div>
            ) : (
              <>
                <div className="bg-[#080808] border border-white/5 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-[#0A0A0A]">
                        <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-[0.15em]">Token Pair</th>
                        <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-[0.15em]">Rate</th>
                        <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-[0.15em]">Availability</th>
                        <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-[0.15em]">TTL</th>
                        <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-[0.15em]">Maker</th>
                        <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-[0.15em]">Status</th>
                        <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-[0.15em] text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredListings.map((listing) => {
                        const progress = Number(listing.amountSourceTotal - listing.amountSourceRemaining) / Number(listing.amountSourceTotal) * 100;
                        const rate = Number(listing.amountDestinationTotal) / Number(listing.amountSourceTotal);
                        const isPartiallyFilled = progress > 0 && progress < 100;
                        
                        return (
                          <tr key={listing.publicKey.toString()} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-medium text-white">
                                  {formatAddress(listing.tokenMintSource.toString())}
                                </span>
                                <span className="text-gray-600 font-mono text-[10px]">→</span>
                                <span className="text-xs font-mono font-medium text-white">
                                  {formatAddress(listing.tokenMintDestination.toString())}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-6 font-mono text-xs text-[#0CA5B0]">
                              {rate.toFixed(4)}
                            </td>
                            <td className="px-6 py-6 w-48">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-mono text-gray-400">
                                  {Number(listing.amountSourceRemaining).toLocaleString()} / {Number(listing.amountSourceTotal).toLocaleString()}
                                </span>
                                <div className="w-full h-[2px] bg-white/5">
                                  <div className="h-full bg-[#0CA5B0]" style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 font-mono text-[11px] text-gray-400">
                              {formatTimeRemaining(listing.expiresAt)}
                            </td>
                            <td className="px-6 py-6 font-mono text-[11px] text-gray-500">
                              {formatAddress(listing.maker.toString())}
                            </td>
                            <td className="px-6 py-6">
                              <Badge
                                className={isPartiallyFilled 
                                  ? 'text-orange-500 bg-orange-500/10 border-orange-500/20'
                                  : 'text-green-500 bg-green-500/10 border-green-500/20'
                                }
                              >
                                {isPartiallyFilled ? 'Partially Filled' : 'Active'}
                              </Badge>
                            </td>
                            <td className="px-6 py-6 text-right">
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
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-600">
                    Showing {filteredListings.length} Listing{filteredListings.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon-sm" disabled>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </Button>
                    <div className="flex gap-1">
                      <Button size="xs" className="w-8 bg-[#1a1a1a] border-white/10">1</Button>
                    </div>
                    <Button variant="outline" size="icon-sm" disabled>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <StatusBar />
    </div>
  );
}
