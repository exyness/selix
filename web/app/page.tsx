'use client';

import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import Footer from '@/components/layout/footer';
import HeroSection from '@/components/landing/hero-section';
import StatsBar from '@/components/landing/stats-bar';
import FeaturesSection from '@/components/landing/features-section';
import HowItWorks from '@/components/landing/how-it-works';
import CTASection from '@/components/landing/cta-section';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navigation />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
      <Footer />
      <StatusBar />
    </div>
  );
}
