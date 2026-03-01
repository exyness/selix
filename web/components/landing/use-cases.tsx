'use client';

import { TrendingUp, Clock, Repeat, Target } from 'lucide-react';

export default function UseCases() {
  const cases = [
    {
      icon: TrendingUp,
      title: 'Price Discovery',
      description: 'Set your desired exchange rate and let the market come to you. Perfect for traders who want to buy or sell at specific price points.',
      example: 'Example: List 1000 USDC for 5 SOL and wait for the market to reach your target rate.'
    },
    {
      icon: Clock,
      title: 'Time-Based Trading',
      description: 'Create listings with custom expiration times. Ideal for time-sensitive opportunities or scheduled portfolio rebalancing.',
      example: 'Example: Offer tokens for 24 hours during a specific market window.'
    },
    {
      icon: Repeat,
      title: 'Partial Fills',
      description: 'Allow your listing to be filled incrementally. Great for large orders that need flexibility in execution.',
      example: 'Example: Sell 10,000 tokens with a minimum fill of 100 tokens per swap.'
    },
    {
      icon: Target,
      title: 'Custom Orders',
      description: 'Define exact parameters for your trades. Set minimum amounts, slippage tolerance, and more for precise execution.',
      example: 'Example: Swap tokens with 1% max slippage and 500 token minimum fills.'
    }
  ];

  return (
    <section className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto bg-muted/30">
      <div className="mb-12 md:mb-20">
        <span className="font-mono text-[10px] text-muted-foreground tracking-[0.4em] uppercase mb-4 block">
          {`/// Applications`}
        </span>
        <h2 className="text-3xl md:text-4xl font-medium mb-4">Use Cases</h2>
        <p className="text-muted-foreground max-w-2xl">
          Discover how Selix empowers different trading strategies and workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {cases.map((useCase, index) => {
          const Icon = useCase.icon;
          return (
            <div 
              key={index}
              className="bg-card border border-border p-6 md:p-8 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 border border-primary/30 bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {useCase.description}
                  </p>
                </div>
              </div>
              <div className="pl-14">
                <div className="bg-muted/50 border border-border/50 p-4 rounded-sm">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-2">
                    Use Case
                  </span>
                  <p className="text-xs text-foreground/80 font-mono leading-relaxed">
                    {useCase.example}
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
