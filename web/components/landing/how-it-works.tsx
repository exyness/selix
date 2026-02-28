'use client';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Create a Listing',
      description: 'Deposit your tokens and set your desired parameters. Your listing goes live instantly on the Solana blockchain.'
    },
    {
      number: '02',
      title: 'Set Your Terms',
      description: 'Define exchange rates, listing duration from 5 minutes to 30 days, and minimum fill amounts for partial orders.'
    },
    {
      number: '03',
      title: 'Wait or Trade',
      description: 'Browse existing listings and execute swaps instantly, or wait for the market to fill your custom listing.'
    }
  ];

  return (
    <section className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto overflow-hidden">
      <div className="mb-12 md:mb-20">
        <span className="font-mono text-[10px] text-muted-foreground tracking-[0.4em] uppercase mb-4 block">
          /// Process
        </span>
        <h2 className="text-3xl md:text-4xl font-medium">How It Works</h2>
      </div>
      
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-24">
        {/* Connecting Line */}
        <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-[1px] bg-[repeating-linear-gradient(90deg,_oklch(65%_0.15_195)_0,_oklch(65%_0.15_195)_4px,_transparent_4px,_transparent_8px)] z-0" />
        
        {steps.map((step) => (
          <div key={step.number} className="relative z-10 flex flex-col items-start">
            <div className="w-16 h-16 border border-primary bg-background flex items-center justify-center font-mono text-xl text-primary mb-6 md:mb-8">
              {step.number}
            </div>
            <h3 className="text-lg md:text-xl font-medium mb-4">{step.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
