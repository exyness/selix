import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function DocsPage() {
  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#EAEAEA]">
      <Navigation />

      <div className="flex pt-32 max-w-[1280px] mx-auto px-6 gap-12">
        {/* Sidebar */}
        <aside className="w-[240px] fixed h-[calc(100vh-160px)] flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#0CA5B0] tracking-[0.3em] uppercase mb-1">/// Docs</div>
            <h2 className="text-xl font-mono font-bold text-white uppercase mb-8">Documentation</h2>

            <div className="space-y-8">
              <div>
                <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-4">Guides</div>
                <ul className="space-y-3">
                  <li className="border-l-2 border-[#0CA5B0] pl-3">
                    <a href="#getting-started" className="text-[11px] font-mono text-[#0CA5B0] uppercase tracking-wider">Getting Started</a>
                  </li>
                  <li className="pl-3"><a href="#create-listing" className="text-[11px] font-mono text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Create a Listing</a></li>
                  <li className="pl-3"><a href="#execute-swap" className="text-[11px] font-mono text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Execute a Swap</a></li>
                  <li className="pl-3"><a href="#fees" className="text-[11px] font-mono text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Fees & Slippage</a></li>
                  <li className="pl-3"><a href="#partial-fills" className="text-[11px] font-mono text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Partial Fills</a></li>
                  <li className="pl-3"><a href="#expiration" className="text-[11px] font-mono text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Expiration & Closure</a></li>
                </ul>
              </div>

              <div>
                <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-4">Reference</div>
                <ul className="space-y-3">
                  <li className="pl-3"><a href="#faq" className="text-[11px] font-mono text-gray-400 hover:text-white uppercase tracking-wider transition-colors">FAQ</a></li>
                  <li className="pl-3"><a href="#troubleshooting" className="text-[11px] font-mono text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Troubleshooting</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#0CA5B0]/5 border border-[#0CA5B0]/20 p-4">
            <div className="text-[10px] font-mono text-[#0CA5B0] uppercase mb-2">Need help?</div>
            <Button variant="ghost" size="xs" className="text-white w-full justify-start px-0 hover:text-[#0CA5B0]">
              Join Discord Support →
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-[280px] max-w-[800px] pb-32">
          {/* Getting Started */}
          <section id="getting-started" className="mb-20 scroll-mt-32">
            <div className="text-[10px] font-mono text-[#0CA5B0] tracking-[0.3em] uppercase mb-2">/// Getting Started</div>
            <h1 className="text-4xl font-mono font-bold tracking-tight text-white uppercase mb-6">
              Welcome to Selix Protocol
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-2xl">
              Selix is a decentralized peer-to-peer liquidity protocol on Solana, enabling trustless atomic swaps
              and OTC desk functionality with full on-chain transparency.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { num: '01', title: 'Connect Wallet', desc: 'Link your Phantom or Solflare wallet to start trading.' },
                { num: '02', title: 'Browse Listings', desc: 'Discover peer-to-peer liquidity pairs across the market.' },
                { num: '03', title: 'Execute Swap', desc: 'Instantly swap assets with fixed rates and zero slippage.' },
              ].map((step) => (
                <div key={step.num} className="bg-[#0A0A0A] border border-white/5 p-6 hover:border-[#0CA5B0]/20 transition-colors">
                  <div className="text-[#0CA5B0] font-mono text-xs mb-4">{step.num}</div>
                  <h3 className="font-mono text-[11px] uppercase text-white mb-2">{step.title}</h3>
                  <p className="text-[10px] text-gray-500 leading-normal">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 border-primary">
                Browse Market
              </Button>
              <Button variant="outline">
                Create Listing
              </Button>
            </div>
          </section>

          <Separator className="mb-20" />

          {/* Create Listing */}
          <section id="create-listing" className="mb-20 scroll-mt-32">
            <h2 className="text-xl font-mono font-bold text-white uppercase border-l-4 border-[#0CA5B0] pl-4 mb-8">
              How to Create a Listing
            </h2>
            <div className="space-y-6">
              {[
                { num: '01', title: 'Select Assets', desc: 'Choose the token you wish to offer and the token you want to receive.' },
                { num: '02', title: 'Define Parameters', desc: 'Set the total amount, exchange rate, and listing duration (max 30 days).' },
                { num: '03', title: 'Initialize Account', desc: 'Call the create_listing instruction via the interface.' },
                { num: '04', title: 'Deposit Funds', desc: 'Transfer offered tokens into the secure escrow vault.' },
                { num: '05', title: 'Verify On-Chain', desc: 'Once finalized, your listing becomes active in the global market.' },
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <span className="font-mono text-[#0CA5B0] text-sm shrink-0">{step.num}</span>
                  <div>
                    <h4 className="font-mono text-white text-xs uppercase mb-1">{step.title}</h4>
                    <p className="text-[11px] text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator className="mb-20" />

          {/* FAQ */}
          <section id="faq" className="mb-20 scroll-mt-32">
            <h2 className="text-xl font-mono font-bold text-white uppercase border-l-4 border-[#0CA5B0] pl-4 mb-8">FAQ</h2>
            <div className="space-y-4">
              {[
                { q: 'Is Selix non-custodial?', a: 'Yes. Your funds are held in specialized Program Derived Address (PDA) vaults. Only you can cancel and reclaim them.' },
                { q: 'Why is there a listing fee?', a: 'The 0.02 SOL fee covers Solana rent costs and acts as an anti-spam mechanism to keep the orderbook healthy.' },
                { q: 'What tokens are supported?', a: 'Any SPL-compliant token can be listed, provided it has been whitelisted by the protocol authority.' },
                { q: 'How do I reclaim my deposit?', a: 'You can cancel an active listing at any time. If expired, you can close the account to return funds to your wallet.' },
              ].map((faq, i) => (
                <div key={i} className="bg-[#0A0A0A] border border-white/5 border-l-2 border-l-[#0CA5B0] p-5">
                  <div className="flex gap-3 mb-2">
                    <span className="text-[#0CA5B0] font-mono shrink-0">?</span>
                    <span className="font-mono text-[11px] text-white uppercase font-bold">{faq.q}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 pl-5">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <Separator className="mb-12" />

          <div className="text-center">
            <Badge variant="outline" className="text-gray-500">
              Selix Protocol — Open Source on Solana
            </Badge>
          </div>
        </main>
      </div>

      <StatusBar />
    </div>
  );
}
