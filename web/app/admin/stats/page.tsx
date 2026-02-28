'use client';

import { usePlatform } from '@/lib/solana/hooks';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock data for charts
const volumeData = [
  { date: 'Nov 18', volume: 180 },
  { date: 'Nov 19', volume: 150 },
  { date: 'Nov 20', volume: 170 },
  { date: 'Nov 21', volume: 90 },
  { date: 'Nov 22', volume: 120 },
  { date: 'Nov 23', volume: 200 },
  { date: 'Nov 24', volume: 160 },
];

const swapsData = [
  { day: 'Mon', swaps: 1200 },
  { day: 'Tue', swaps: 1650 },
  { day: 'Wed', swaps: 1350 },
  { day: 'Thu', swaps: 2100 },
  { day: 'Fri', swaps: 2550 },
  { day: 'Sat', swaps: 2850 },
  { day: 'Sun', swaps: 2250 },
];

const listingsTrendData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  listings: Math.floor(800 + Math.random() * 400 + i * 10),
}));

export default function PlatformStatisticsPage() {
  const { platform, loading } = usePlatform();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-28 pb-20 px-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <header className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-mono text-primary tracking-[0.3em] uppercase mb-2">
              {'/// Platform Analytics'}
            </div>
            <h1 className="text-4xl font-mono font-bold tracking-tight text-foreground uppercase">
              Statistics
            </h1>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Live Data</span>
          </div>
        </header>

        {/* Top Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { 
              label: 'Total Listings Created', 
              value: loading ? '...' : platform ? platform.totalListingsCreated.toString() : '0',
              highlight: false 
            },
            { 
              label: 'Total Swaps Executed', 
              value: loading ? '...' : platform ? platform.totalSwapsExecuted.toString() : '0',
              highlight: true 
            },
            { 
              label: 'Total Volume Traded', 
              value: loading ? '...' : platform ? `${(Number(platform.totalVolumeTraded) / 1e9).toFixed(2)} SOL` : '0 SOL',
              highlight: false 
            },
            { 
              label: 'Total Fees Collected', 
              value: loading ? '...' : platform ? `${(Number(platform.totalFeesCollected) / 1e9).toFixed(4)} SOL` : '0 SOL',
              highlight: false 
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
                  {stat.label}
                </div>
                <div className={`text-3xl font-mono font-bold ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>
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
              <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Volume Over Time (7D)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0CA5B0" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0CA5B0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666" 
                    style={{ fontSize: '10px', fontFamily: 'monospace' }}
                  />
                  <YAxis 
                    stroke="#666" 
                    style={{ fontSize: '10px', fontFamily: 'monospace' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0A0A0A', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '11px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#0CA5B0" 
                    strokeWidth={2}
                    fill="url(#colorVolume)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Swaps Per Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={swapsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#666" 
                    style={{ fontSize: '10px', fontFamily: 'monospace' }}
                  />
                  <YAxis 
                    stroke="#666" 
                    style={{ fontSize: '10px', fontFamily: 'monospace' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0A0A0A', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="swaps" fill="#0CA5B0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Token Pairs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
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
                    <span className="text-foreground">{item.pair}</span>
                    <span className="text-muted-foreground">{item.percent}%</span>
                  </div>
                  <div className="h-1 bg-muted">
                    <div className="h-full bg-primary transition-all" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Listings Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Active Listings Trend (30D)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={listingsTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#666" 
                    style={{ fontSize: '10px', fontFamily: 'monospace' }}
                    ticks={[1, 10, 20, 30]}
                  />
                  <YAxis 
                    stroke="#666" 
                    style={{ fontSize: '10px', fontFamily: 'monospace' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0A0A0A', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '11px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="listings" 
                    stroke="rgba(255,255,255,0.3)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
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
                <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  {board.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {board.rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                    {row.rank && <span className="text-[11px] font-mono text-primary w-8">{row.rank}</span>}
                    <span className="text-[11px] font-mono text-foreground flex-1">{row.label}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </section>

        <Separator className="mb-10" />

        {/* Bottom Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-card border border-border p-8">
          <div>
            <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Active Listings</div>
            <div className="text-xl font-mono text-primary">1,204</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Avg Listing Duration</div>
            <div className="text-xl font-mono text-foreground">6.2 HRS</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Avg Fill Rate</div>
            <div className="text-xl font-mono text-foreground">78.4%</div>
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
