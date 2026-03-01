'use client';

import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import Footer from '@/components/layout/footer';
import HeroSection from '@/components/landing/hero-section';
import StatsBar from '@/components/landing/stats-bar';
import FeaturesSection from '@/components/landing/features-section';
import HowItWorks from '@/components/landing/how-it-works';
import WhySelix from '@/components/landing/why-selix';
import UseCases from '@/components/landing/use-cases';
import SecuritySection from '@/components/landing/security-section';
import FAQSection from '@/components/landing/faq-section';
import CTASection from '@/components/landing/cta-section';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navigation />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorks />
      <WhySelix />
      <UseCases />
      <SecuritySection />
      <FAQSection />
      <CTASection />
      <Footer />
      <StatusBar />
    </div>
  );
}
