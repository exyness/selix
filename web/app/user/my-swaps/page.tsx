import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const swaps = [
  { date: '2023-11-24 14:12:08', pair: ['USDC', 'SOL'], sent: '1,200.00 USDC', received: '20.45 SOL', fee: '1.20 USDC', maker: '8vKb...Lp2Q', status: 'COMPLETED', statusColor: 'green', tx: '4fX2...9eWz' },
  { date: '2023-11-24 12:45:30', pair: ['JitoSOL', 'USDC'], sent: '5.00 JitoSOL', received: '342.12 USDC', fee: '0.34 USDC', maker: '2xNr...Pk9s', status: 'FAILED', statusColor: 'red', tx: '7gT9...1aBc' },
  { date: '2023-11-23 23:10:11', pair: ['SOL', 'BONK'], sent: '1.50 SOL', received: '8.4M BONK', fee: '0.09 USDC', maker: '5yUv...Qm4h', status: 'COMPLETED', statusColor: 'green', tx: '9hR5...0kLy' },
];

export default function MySwapsPage() {
  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#EAEAEA]">
      <Navigation />

      <main className="pt-32 pb-24 px-8 max-w-[1280px] mx-auto">
        {/* Stats Grid */}
        <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Swaps Executed', value: '1,242', highlight: false },
            { label: 'Total Volume (Taker)', value: '$842.5K', highlight: true },
            { label: 'Total Fees Paid', value: '$1,104.20', highlight: false },
            { label: 'Average Swap Size', value: '$678.34', highlight: false },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0A0A0A] border border-white/5 p-6 space-y-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{stat.label}</span>
              <div className={`text-2xl font-mono ${stat.highlight ? 'text-[#0CA5B0]' : 'text-white'}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 bg-white/[0.02] border border-white/5 px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">From:</span>
              <Input type="date" className="bg-black border-white/10 text-[10px] font-mono h-8 w-36" />
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">To:</span>
              <Input type="date" className="bg-black border-white/10 text-[10px] font-mono h-8 w-36" />
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Select>
              <SelectTrigger className="bg-black border-white/10 text-[10px] h-8 w-32">
                <SelectValue placeholder="Token Mint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tokens</SelectItem>
                <SelectItem value="usdc">USDC</SelectItem>
                <SelectItem value="sol">SOL</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="bg-black border-white/10 text-[10px] h-8 w-36">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm">Export CSV</Button>
        </div>

        {/* Swaps Table */}
        <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5">
                {['Date/Time', 'Token Pair', 'Amount Sent', 'Amount Received', 'Fee Paid', 'Maker', 'Status', 'TX'].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest ${i === 7 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px] font-mono">
              {swaps.map((swap, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-gray-400">{swap.date}</td>
                  <td className="px-6 py-4 text-white">
                    {swap.pair[0]} <span className="text-[#0CA5B0]">→</span> {swap.pair[1]}
                  </td>
                  <td className="px-6 py-4">{swap.sent}</td>
                  <td className="px-6 py-4">{swap.received}</td>
                  <td className="px-6 py-4 text-gray-400">{swap.fee}</td>
                  <td className="px-6 py-4 text-gray-500">{swap.maker}</td>
                  <td className="px-6 py-4">
                    <Badge className={`text-${swap.statusColor}-500 bg-${swap.statusColor}-500/10 border-${swap.statusColor}-500/20`}>
                      {swap.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href="#" className="text-gray-500 hover:text-[#0CA5B0] flex items-center justify-end gap-1 transition-colors">
                      {swap.tx}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-between items-center">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Showing 1–10 of 1,242 swaps</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </Button>
            <Button size="xs" className="w-8 border-[#0CA5B0] text-[#0CA5B0] bg-transparent">1</Button>
            <Button variant="outline" size="xs" className="w-8 text-gray-500">2</Button>
            <Button variant="outline" size="xs" className="w-8 text-gray-500">3</Button>
            <Button variant="outline" size="icon-sm">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </Button>
          </div>
        </div>
      </main>

      <StatusBar />
    </div>
  );
}
