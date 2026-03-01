'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Twitter, Github, FileText } from 'lucide-react';

export default function Footer() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme to get the actual theme (handles 'system' preference)
  const currentTheme = mounted ? (resolvedTheme || theme) : 'dark';
  const logoSrc = currentTheme === 'dark' ? '/selix-logo-dark.png' : '/selix-logo-light.png';

  return (
    <footer className="bg-background border-t border-border pt-12 md:pt-20 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
        <div className="space-y-6">
          <div className="flex items-center">
            {mounted && (
              <Image 
                src={logoSrc} 
                alt="Selix Protocol" 
                width={120} 
                height={32}
                className="h-8 w-auto"
              />
            )}
            {!mounted && (
              <div className="h-8 w-[120px] bg-muted animate-pulse" />
            )}
          </div>
          <p className="text-muted-foreground text-sm">Decentralized OTC protocol on Solana.</p>
          <div className="flex items-center gap-3">
            <a 
              href="#" 
              className="w-9 h-9 flex items-center justify-center border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="w-9 h-9 flex items-center justify-center border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="w-9 h-9 flex items-center justify-center border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              aria-label="Documentation"
            >
              <FileText className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest mb-6 md:mb-8">Protocol</h4>
          <ul className="space-y-3 md:space-y-4 text-muted-foreground text-xs font-mono">
            <li><Link href="/listings" className="hover:text-primary transition-colors">Market</Link></li>
            <li><Link href="/create" className="hover:text-primary transition-colors">Create Listing</Link></li>
            <li><Link href="/user/listings" className="hover:text-primary transition-colors">My Listings</Link></li>
            <li><Link href="/user/swaps" className="hover:text-primary transition-colors">My Swaps</Link></li>
            <li><Link href="/user/profile" className="hover:text-primary transition-colors">Profile</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest mb-6 md:mb-8">Resources</h4>
          <ul className="space-y-3 md:space-y-4 text-muted-foreground text-xs font-mono">
            <li><Link href="/admin" className="hover:text-primary transition-colors">Admin</Link></li>
            <li><Link href="/admin/stats" className="hover:text-primary transition-colors">Statistics</Link></li>
            <li><Link href="/admin/whitelist" className="hover:text-primary transition-colors">Whitelist</Link></li>
          </ul>
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
