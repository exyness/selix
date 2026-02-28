'use client';

import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PlatformStatisticsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA]">
      <Navigation />

      <main className="pt-28 pb-20 px-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <header className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#0CA5B0] tracking-[0.3em] uppercase mb-2">
              /// Platform Analytics
            </div>
            <h1 className="text-4xl font-mono font-bold tracking-tight text-white uppercase">
              Statistics
            </h1>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0CA5B0] animate-pulse" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Updated 12s ago</span>
          </div>
        </header>

        {/* Top Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Listings Created', value: '84,201', highlight: false },
            { label: 'Total Swaps Executed', value: '12.4M', highlight: true },
            { label: 'Total Volume Traded', value: '$1.2B', highlight: false },
            { label: 'Total Fees Collected', value: '$240K', highlight: false },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">
                  {stat.label}
                </div>
                <div className={`text-3xl font-mono font-bold ${stat.highlight ? 'text-[#0CA5B0]' : 'text-white'}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Charts Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {/* Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                Volume Over Time (7D)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 relative flex items-end gap-1 px-2">
                <div className="absolute inset-0 flex flex-col justify-between py-2 border-l border-white/5">
                  <span className="text-[8px] font-mono text-gray-600 pl-2">$250M</span>
                  <span className="text-[8px] font-mono text-gray-600 pl-2">$125M</span>
                  <span className="text-[8px] font-mono text-gray-600 pl-2">$0</span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart-grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0CA5B0" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#0CA5B0" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 L20,60 L40,70 L60,30 L80,45 L100,20 L100,100 L0,100 Z" fill="url(#chart-grad)" />
                  <path d="M0,80 L20,60 L40,70 L60,30 L80,45 L100,20" fill="none" stroke="#0CA5B0" strokeWidth="2" />
                </svg>
              </div>
              <div className="flex justify-between mt-4 px-2 text-[9px] font-mono text-gray-600">
                <span>NOV 18</span><span>NOV 20</span><span>NOV 22</span><span>NOV 24</span>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                Swaps Per Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-end justify-between gap-3">
                {[40, 55, 45, 70, 85, 95, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-[#0CA5B0] transition-all"
                    style={{ height: `${h}%`, opacity: 0.2 + (i * 0.12) }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[9px] font-mono text-gray-600">
                <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
              </div>
            </CardContent>
          </Card>

          {/* Top Token Pairs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                Top Token Pairs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { pair: 'USDC/SOL', percent: 42 },
                { pair: 'SOL/BONK', percent: 18 },
                { pair: 'JitoSOL/USDC', percent: 15 },
                { pair: 'SOL/PYTH', percent: 12 },
              ].map((item) => (
                <div key={item.pair}>
                  <div className="flex justify-between text-[9px] font-mono mb-1.5">
                    <span className="text-white">{item.pair}</span>
                    <span className="text-gray-500">{item.percent}%</span>
                  </div>
                  <div className="h-1 bg-white/5">
                    <div className="h-full bg-[#0CA5B0]" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Listings Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                Active Listings Trend (30D)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 relative">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,80 C10,75 20,85 30,70 C40,65 50,55 60,60 C70,65 80,45 90,40 C95,38 100,35 100,35 L100,100 L0,100 Z" fill="rgba(255,255,255,0.05)" />
                  <path d="M0,80 C10,75 20,85 30,70 C40,65 50,55 60,60 C70,65 80,45 90,40 C95,38 100,35 100,35" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="mt-4 flex justify-between text-[8px] font-mono text-gray-600">
                <span>30 DAYS AGO</span><span>TODAY</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Leaderboards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              title: 'Top Makers by Volume',
              rows: [
                { rank: '01', label: '8eK1...w2Mv', value: '$12.4M' },
                { rank: '02', label: '3zP9...9tKa', value: '$8.1M' },
                { rank: '03', label: 'H4m8...2pLx', value: '$5.2M' },
              ],
            },
            {
              title: 'Top Takers by Swaps',
              rows: [
                { rank: '01', label: '9uKk...o88P', value: '4,102' },
                { rank: '02', label: 'Bv3m...L1vQ', value: '3,894' },
                { rank: '03', label: 'Yw7z...m5oZ', value: '2,911' },
              ],
            },
            {
              title: 'Active Token Pairs',
              rows: [
                { rank: null, label: 'SOL/USDC', value: '2.4M (32%)' },
                { rank: null, label: 'SOL/BONK', value: '1.1M (15%)' },
                { rank: null, label: 'USDC/JUP', value: '0.8M (11%)' },
              ],
            },
          ].map((board) => (
            <Card key={board.title}>
              <CardHeader>
                <CardTitle className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  {board.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {board.rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
                    {row.rank && <span className="text-[11px] font-mono text-[#0CA5B0] w-8">{row.rank}</span>}
                    <span className="text-[11px] font-mono text-white flex-1">{row.label}</span>
                    <span className="text-[11px] font-mono text-gray-400">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </section>

        <Separator className="mb-10" />

        {/* Bottom Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-[#0A0A0A] border border-white/5 p-8">
          <div>
            <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-2">Active Listings</div>
            <div className="text-xl font-mono text-[#0CA5B0]">1,204</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-2">Avg Listing Duration</div>
            <div className="text-xl font-mono text-white">6.2 HRS</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-2">Avg Fill Rate</div>
            <div className="text-xl font-mono text-white">78.4%</div>
          </div>
          <div className="flex items-center justify-end">
            <Badge className="gap-2 bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              ACTIVE
            </Badge>
          </div>
        </section>
      </main>

      <StatusBar />
    </div>
  );
}
