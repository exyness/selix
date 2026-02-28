import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function UserProfilePage() {
  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#EAEAEA]">
      <Navigation />

      <main className="pt-32 pb-24 px-8 max-w-[1280px] mx-auto">
        {/* Profile Header */}
        <header className="mb-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl font-mono font-bold tracking-tight text-white">7xR9...e2Lp</h1>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon-sm" title="Copy Address">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </Button>
                  <Button variant="ghost" size="icon-sm" title="View on Solana Explorer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </Button>
                </div>
              </div>
              <div className="flex gap-8 text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <span>Joined: <span className="text-white ml-1">Oct 12, 2023</span></span>
                <span>Last Active: <span className="text-white ml-1">2 mins ago</span></span>
                <span>Referrer: <a href="#" className="text-[#0CA5B0] hover:underline ml-1">4kLp...9zWm</a></span>
              </div>
            </div>
          </div>

          {/* Reputation Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Completion Rate', value: '94.2%', highlight: true },
              { label: 'Avg Response Time', value: '2.4 min', highlight: false },
              { label: 'Total Successful Swaps', value: '1,204', highlight: false },
            ].map((stat, i) => (
              <div key={i} className="p-4 border-l-2 border-[#0CA5B0] bg-gradient-to-r from-[#0CA5B0]/10 to-transparent">
                <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className={`text-xl font-mono ${stat.highlight ? 'text-[#0CA5B0]' : 'text-white'}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Activity Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'Listings Created', value: '3,492', highlight: false },
            { label: 'Listings Cancelled', value: '124', highlight: false },
            { label: 'Swaps Executed (Taker)', value: '842', highlight: false },
            { label: 'Swaps Received (Maker)', value: '362', highlight: false },
            { label: 'Volume as Maker', value: '$1.2M', highlight: true },
            { label: 'Volume as Taker', value: '$842.5K', highlight: false },
            { label: 'Total Fees Paid', value: '$1,402.10', highlight: false },
            { label: 'Active Listings', value: '12', highlight: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0A0A0A] border border-white/5 p-6">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-2">{stat.label}</span>
              <div className={`text-2xl font-mono ${stat.highlight ? 'text-[#0CA5B0]' : 'text-white'}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        <Separator className="mb-12" />

        {/* Recent Activity Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Listings */}
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white">Recent Listings</h3>
              <Button variant="ghost" size="xs" className="text-[#0CA5B0]">View All →</Button>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    {['Token Pair', 'Rate', 'Fill %', 'Status', 'Created'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[9px] font-mono text-gray-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[10px] font-mono">
                  {[
                    { pair: 'SOL/USDC', rate: '58.42', fill: '100%', status: 'FILLED', statusColor: 'green', time: '2h ago' },
                    { pair: 'JitoSOL/SOL', rate: '1.08', fill: '45%', status: 'ACTIVE', statusColor: '[#0CA5B0]', time: '5h ago' },
                    { pair: 'BONK/USDC', rate: '0.000014', fill: '0%', status: 'CANCELLED', statusColor: 'gray', time: '1d ago' },
                  ].map((listing, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-3 text-white">{listing.pair}</td>
                      <td className="px-4 py-3">{listing.rate}</td>
                      <td className="px-4 py-3">{listing.fill}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-${listing.statusColor}-500 bg-${listing.statusColor}-500/10 border-${listing.statusColor}-500/20 text-[8px]`}>
                          {listing.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{listing.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Swaps */}
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white">Recent Swaps</h3>
              <Button variant="ghost" size="xs" className="text-[#0CA5B0]">View All →</Button>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    {['Token Pair', 'Amount', 'Date', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[9px] font-mono text-gray-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[10px] font-mono">
                  {[
                    { pair: ['USDC', 'SOL'], amount: '1,200 USDC', date: 'Nov 24, 14:12', status: 'SUCCESS', statusColor: 'green' },
                    { pair: ['SOL', 'BONK'], amount: '0.5 SOL', date: 'Nov 23, 23:10', status: 'SUCCESS', statusColor: 'green' },
                    { pair: ['JitoSOL', 'USDC'], amount: '5.00 JitoSOL', date: 'Nov 23, 12:45', status: 'FAILED', statusColor: 'red' },
                  ].map((swap, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-3 text-white">
                        {swap.pair[0]} <span className="text-[#0CA5B0]">→</span> {swap.pair[1]}
                      </td>
                      <td className="px-4 py-3">{swap.amount}</td>
                      <td className="px-4 py-3 text-gray-500">{swap.date}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-${swap.statusColor}-500 bg-${swap.statusColor}-500/10 border-${swap.statusColor}-500/20 text-[8px]`}>
                          {swap.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
            All profile data is sourced from on-chain accounts —{' '}
            <a href="#" className="text-[#0CA5B0] hover:underline">Solana Mainnet Explorer</a>
          </p>
        </div>
      </main>

      <StatusBar />
    </div>
  );
}
