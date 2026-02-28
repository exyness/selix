'use client';

import { usePlatform } from '@/lib/solana/hooks';

export default function StatsBar() {
  const { platform, loading } = usePlatform();

  const stats = [
    { 
      label: 'Total Listings Created', 
      value: loading ? '...' : platform ? platform.totalListings.toString() : '0'
    },
    { 
      label: 'Total Swaps Executed', 
      value: loading ? '...' : platform ? platform.totalSwaps.toString() : '0',
      highlight: true 
    },
    { 
      label: 'Total Volume Traded', 
      value: loading ? '...' : platform ? `${(Number(platform.totalVolume) / 1e9).toFixed(2)} SOL` : '0 SOL'
    },
    { 
      label: 'Total Fees Collected', 
      value: loading ? '...' : platform ? `${(Number(platform.feesCollected) / 1e9).toFixed(2)} SOL` : '0 SOL'
    }
  ];

  return (
    <section className="bg-card border-y border-border py-8 md:py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
            <div className={`text-2xl md:text-3xl font-mono font-medium ${stat.highlight ? 'text-primary' : ''}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
