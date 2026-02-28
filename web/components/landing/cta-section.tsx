'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="mx-4 sm:mx-6 lg:mx-8 mb-16 md:mb-32">
      <div className="bg-primary/5 border border-primary/20 py-16 md:py-24 px-4 sm:px-6 lg:px-8 text-center">
        <span className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase mb-6 block">
          /// Get Started
        </span>
        <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase tracking-tight mb-8 md:mb-12">
          Start Trading on Selix Protocol.
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-widest px-8 md:px-10 py-4 hover:opacity-90 transition-all active:scale-[0.98]">
            Connect Wallet
          </button>
          <Link href="/docs" className="w-full sm:w-auto">
            <button className="w-full border border-border font-mono text-xs font-bold uppercase tracking-widest px-8 md:px-10 py-4 hover:bg-muted transition-all active:scale-[0.98]">
              View Docs
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
