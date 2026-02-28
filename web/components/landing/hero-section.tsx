'use client';

import Link from 'next/link';
import AnimatedGrid from './animated-grid';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-20 overflow-hidden">
      <AnimatedGrid />
      
      <div className="relative z-10 max-w-4xl w-full">
        <span className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase mb-6 block animate-fade-in">
          /// Decentralized OTC Protocol
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-bold uppercase tracking-tight leading-[1.1] mb-6 md:mb-8 animate-fade-in-up">
          Trustless Token Swaps on Solana.
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8 md:mb-12 px-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Peer-to-peer liquidity protocol enabling atomic swaps with fixed rates, partial fills, and zero slippage — fully on-chain.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 md:mb-20 px-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link href="/create" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-widest px-8 md:px-10 py-4 hover:opacity-90 transition-all active:scale-[0.98]">
              Create Listing
            </button>
          </Link>
          <Link href="/listings" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto border border-border hover:bg-muted font-mono text-xs font-bold uppercase tracking-widest px-8 md:px-10 py-4 transition-all active:scale-[0.98]">
              Browse Listings
            </button>
          </Link>
        </div>
        
        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 px-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Non-Custodial</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Atomic Execution</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">On-Chain Escrow</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
