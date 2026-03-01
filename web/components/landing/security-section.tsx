'use client';

import { Lock, Code, FileCheck, AlertCircle } from 'lucide-react';

export default function SecuritySection() {
  const features = [
    {
      icon: Lock,
      title: 'Non-Custodial',
      description: 'Your tokens never leave your wallet until a swap executes. Maintain full control of your assets at all times.'
    },
    {
      icon: Code,
      title: 'Open Source',
      description: 'Our smart contracts are publicly auditable. Transparency and community review ensure code integrity.'
    },
    {
      icon: FileCheck,
      title: 'Verified Contracts',
      description: 'All program code is verified on-chain. What you see is what runs on the Solana blockchain.'
    },
    {
      icon: AlertCircle,
      title: 'Risk Controls',
      description: 'Built-in slippage protection, expiration times, and minimum fill amounts protect your trades.'
    }
  ];

  return (
    <section className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <span className="font-mono text-[10px] text-muted-foreground tracking-[0.4em] uppercase mb-4 block">
            {`/// Security First`}
          </span>
          <h2 className="text-3xl md:text-4xl font-medium mb-6">
            Built for Trust
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Security isn&apos;t an afterthought—it&apos;s the foundation. Selix is built on battle-tested Solana smart contracts with multiple layers of protection to keep your assets safe.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Decentralized execution</span> - No central authority can access or freeze your funds
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Atomic swaps</span> - Trades execute completely or not at all, no partial failures
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Whitelist protection</span> - Only verified tokens can be traded on the platform
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-card border border-border p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 border border-primary/30 bg-primary/5 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
