'use client';

export default function StatusBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-4 md:px-6 py-2 flex items-center justify-between text-[9px] font-mono uppercase tracking-widest">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-muted-foreground">Mainnet</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-muted-foreground">TPS:</span>
          <span className="text-foreground">3,421</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-muted-foreground">Block:</span>
          <span className="text-foreground">#254,192,842</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Slot:</span>
          <span className="text-foreground">12.4ms</span>
        </div>
      </div>
    </div>
  );
}
