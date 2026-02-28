'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-12 md:pt-20 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="font-mono text-sm tracking-widest font-bold uppercase">
              SELIX_PROTOCOL
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Decentralized OTC protocol on Solana.</p>
          <div className="flex items-center gap-3">
            <a href="#" className="w-8 h-8 flex items-center justify-center border border-border bg-card text-primary hover:text-foreground transition-colors">
              𝕏
            </a>
            <a href="#" className="w-8 h-8 flex items-center justify-center border border-border bg-card text-primary hover:text-foreground transition-colors">
              D
            </a>
            <a href="#" className="w-8 h-8 flex items-center justify-center border border-border bg-card text-primary hover:text-foreground transition-colors">
              G
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest mb-6 md:mb-8">Protocol</h4>
          <ul className="space-y-3 md:space-y-4 text-muted-foreground text-xs font-mono">
            <li><Link href="/listings" className="hover:text-primary transition-colors">Market</Link></li>
            <li><Link href="/create" className="hover:text-primary transition-colors">Create Listing</Link></li>
            <li><Link href="/my-listings" className="hover:text-primary transition-colors">My Listings</Link></li>
            <li><Link href="/my-swaps" className="hover:text-primary transition-colors">My Swaps</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest mb-6 md:mb-8">Resources</h4>
          <ul className="space-y-3 md:space-y-4 text-muted-foreground text-xs font-mono">
            <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
            <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Solana Explorer</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Audit Report</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest mb-6 md:mb-8">Network Status</h4>
          <div className="space-y-3 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            <div>Network: <span className="text-foreground">Solana Mainnet</span></div>
            <div>TPS: <span className="text-green-500">3,421</span></div>
            <div>Block: <span className="text-foreground">#254,192,842</span></div>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1400px] mx-auto mt-12 md:mt-20 pt-6 md:pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
          Selix Protocol is open source. <a href="#" className="hover:text-foreground underline">View program on Solana Explorer</a>.
        </span>
        <div className="flex items-center gap-2 px-3 py-1 bg-card border border-border">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Built on Solana</span>
        </div>
      </div>
    </footer>
  );
}
