'use client';

import { Shield, Zap, DollarSign, Users } from 'lucide-react';

export default function WhySelix() {
  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Trustless',
      description: 'Built on Solana smart contracts. No intermediaries, no custody risks. Your assets remain under your control until the swap executes.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Leverage Solana\'s high-speed blockchain for instant order matching and settlement. Execute swaps in seconds, not minutes.'
    },
    {
      icon: DollarSign,
      title: 'Low Fees',
      description: 'Minimal platform fees and Solana\'s low transaction costs mean more value stays in your pocket with every trade.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join a growing ecosystem of traders. Set your own terms, discover opportunities, and trade on your schedule.'
    }
  ];

  return (
    <section className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      <div className="mb-12 md:mb-20 text-center">
        <span className="font-mono text-[10px] text-muted-foreground tracking-[0.4em] uppercase mb-4 block">
          {`/// Advantages`}
        </span>
        <h2 className="text-3xl md:text-4xl font-medium mb-4">Why Choose Selix?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience the next generation of decentralized token swaps with unmatched speed, security, and flexibility.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div 
              key={index}
              className="group relative bg-card border border-border p-8 hover:border-primary/50 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all duration-300" />
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 border border-primary/30 bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
