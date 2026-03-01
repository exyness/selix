'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is Selix?',
      answer: 'Selix is a decentralized token swap platform built on Solana. It allows users to create custom listings with specific exchange rates, durations, and fill requirements, or instantly execute swaps against existing listings.'
    },
    {
      question: 'How does Selix differ from other DEXs?',
      answer: 'Unlike traditional AMM-based DEXs, Selix uses an order book model where you set your own terms. Create listings with custom rates and wait for the market, or browse existing listings for instant swaps. You have full control over pricing and timing.'
    },
    {
      question: 'What are the fees?',
      answer: 'Selix charges a small platform fee on each swap (typically 0.1-0.3%), plus standard Solana network transaction fees. All fees are transparent and displayed before you confirm any transaction.'
    },
    {
      question: 'Is my wallet safe?',
      answer: 'Yes. Selix is non-custodial, meaning your tokens remain in your wallet until a swap executes. The smart contracts are open source and auditable. We never have access to your private keys or funds.'
    },
    {
      question: 'What tokens can I trade?',
      answer: 'You can trade any SPL token that has been whitelisted by the platform. The whitelist ensures only verified, legitimate tokens are available for trading, protecting users from scams.'
    },
    {
      question: 'Can I cancel my listing?',
      answer: 'Yes, you can cancel your listing at any time before it\'s filled or expires. Your deposited tokens will be returned to your wallet immediately upon cancellation.'
    },
    {
      question: 'What are partial fills?',
      answer: 'Partial fills allow your listing to be filled incrementally by multiple swaps. For example, if you list 1000 tokens with a minimum fill of 100, traders can swap in increments of 100 or more until your listing is fully filled.'
    },
    {
      question: 'How do I get started?',
      answer: 'Connect your Solana wallet (Phantom, Solflare, etc.), browse existing listings to execute instant swaps, or create your own listing with custom parameters. It\'s that simple!'
    }
  ];

  return (
    <section className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto">
      <div className="mb-12 md:mb-20 text-center">
        <span className="font-mono text-[10px] text-muted-foreground tracking-[0.4em] uppercase mb-4 block">
          {`/// Support`}
        </span>
        <h2 className="text-3xl md:text-4xl font-medium mb-4">Frequently Asked Questions</h2>
        <p className="text-muted-foreground">
          Everything you need to know about Selix
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="bg-card border border-border overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
            >
              <span className="font-medium pr-8">{faq.question}</span>
              <ChevronDown 
                className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div 
              className={`overflow-hidden transition-all duration-200 ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
