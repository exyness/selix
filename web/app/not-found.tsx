import Link from 'next/link';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-24 pb-20">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Display */}
          <div className="mb-6 sm:mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-3xl" />
              <h1 className="relative text-[80px] sm:text-[120px] md:text-[180px] font-mono font-bold leading-none tracking-tighter text-foreground">
                404
              </h1>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-mono text-destructive uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                Error — Page Not Found
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-bold uppercase tracking-tight text-foreground mb-3 sm:mb-4 px-4">
              Lost in the Blockchain
            </h2>
            
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-mono max-w-md mx-auto px-4">
              The page you&apos;re looking for doesn&apos;t exist on this protocol. It might have been moved, deleted, or never existed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-[10px] sm:text-xs uppercase tracking-widest px-6 sm:px-8">
                Return Home
              </Button>
            </Link>
            <Link href="/listings" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto font-mono font-bold text-[10px] sm:text-xs uppercase tracking-widest px-6 sm:px-8">
                Browse Market
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="bg-card border border-border p-4 sm:p-6 mx-4">
            <div className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3 sm:mb-4">
              Quick Links
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-[10px] sm:text-xs font-mono">
              <Link href="/listings" className="text-muted-foreground hover:text-primary transition-colors py-1">
                Market
              </Link>
              <Link href="/create" className="text-muted-foreground hover:text-primary transition-colors py-1">
                Create Listing
              </Link>
              <Link href="/user/listings" className="text-muted-foreground hover:text-primary transition-colors py-1">
                My Listings
              </Link>
              <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors py-1">
                Admin
              </Link>
            </div>
          </div>

          {/* Error Code */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border mx-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[8px] sm:text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              <span>Error Code: 404</span>
              <span className="hidden sm:inline">•</span>
              <span>Status: Not Found</span>
              <span className="hidden sm:inline">•</span>
              <span>Protocol: HTTP/1.1</span>
            </div>
          </div>
        </div>
      </main>

      <StatusBar />
    </div>
  );
}
