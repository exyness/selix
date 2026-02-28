'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const DURATIONS = ['5 Min', '1 Hr', '1 Day', '7 Days'];

export default function SettingsPage() {
  const [activeDuration, setActiveDuration] = useState('1 Day');
  const [slippage, setSlippage] = useState(1.0);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserNotifs, setBrowserNotifs] = useState(false);
  const [theme, setTheme] = useState<'Dark' | 'Light' | 'System'>('Dark');
  const [currency, setCurrency] = useState<'USD' | 'SOL' | 'Both'>('Both');

  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#EAEAEA]">
      <Navigation />

      <main className="pt-32 pb-32 px-8 max-w-[720px] mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="text-[10px] font-mono text-[#0CA5B0] tracking-[0.3em] uppercase mb-2">/// Settings</div>
          <h1 className="text-4xl font-mono font-bold tracking-tight text-white uppercase">Preferences</h1>
        </header>

        {/* Wallet Management */}
        <section className="mb-12">
          <h2 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-6">Wallet Management</h2>
          <div className="bg-[#0A0A0A] border border-white/5 p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-[#0CA5B0]" />
                <div className="font-mono text-lg text-white">7xR9...e2Lp</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </Button>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-end">
              <Button variant="ghost" size="xs" className="text-red-500/80 hover:text-red-500">
                Disconnect Wallet
              </Button>
            </div>
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Default Preferences */}
        <section className="mb-12">
          <h2 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-8">Default Preferences</h2>

          <div className="mb-10">
            <div className="flex justify-between items-end mb-4">
              <label className="text-xs font-mono text-white uppercase tracking-widest">Default Listing Duration</label>
              <span className="text-xs font-mono text-[#0CA5B0] uppercase">{activeDuration}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="40"
              className="w-full mb-4"
            />
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDuration(d)}
                  className={`px-3 py-1.5 border text-[9px] font-mono uppercase tracking-widest transition-colors ${
                    activeDuration === d
                      ? 'border-[#0CA5B0]/50 bg-[#0CA5B0]/10 text-[#0CA5B0]'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-4">
              <label className="text-xs font-mono text-white uppercase tracking-widest">Default Slippage Tolerance</label>
              <span className="text-xs font-mono text-[#0CA5B0]">{slippage.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[9px] font-mono text-gray-600 mt-2 uppercase tracking-widest">
              <span>0.1%</span>
              <span>10%</span>
            </div>
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Notifications */}
        <section className="mb-12">
          <h2 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-8">Notifications</h2>

          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs font-mono text-white uppercase tracking-widest mb-1">Email Alerts for Swaps</div>
              <div className="text-[10px] text-gray-500">Receive an email whenever your listings are filled or expire.</div>
            </div>
            <button
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`w-10 h-5 rounded-full relative transition-colors ${emailAlerts ? 'bg-[#0CA5B0]' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${emailAlerts ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-white uppercase tracking-widest mb-1">Browser Notifications</div>
              <div className="text-[10px] text-gray-500">Push notifications for protocol updates and swap confirmations.</div>
            </div>
            <button
              onClick={() => setBrowserNotifs(!browserNotifs)}
              className={`w-10 h-5 rounded-full relative transition-colors ${browserNotifs ? 'bg-[#0CA5B0]' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${browserNotifs ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Display Preferences */}
        <section className="mb-12">
          <h2 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-8">Display Preferences</h2>

          <div className="mb-8">
            <label className="text-xs font-mono text-white uppercase tracking-widest block mb-4">Theme</label>
            <div className="flex border border-white/10 p-1 bg-[#0A0A0A] w-fit">
              {(['Dark', 'Light', 'System'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-6 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors ${
                    theme === t
                      ? 'border border-[#0CA5B0]/40 bg-[#0CA5B0]/10 text-[#0CA5B0]'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-white uppercase tracking-widest block mb-4">Currency Display</label>
            <div className="flex border border-white/10 p-1 bg-[#0A0A0A] w-fit">
              {(['USD', 'SOL', 'Both'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-6 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors ${
                    currency === c
                      ? 'border border-[#0CA5B0]/40 bg-[#0CA5B0]/10 text-[#0CA5B0]'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Account Actions */}
        <section className="mb-16">
          <h2 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-6">Account Actions</h2>
          <div className="grid gap-2">
            <Button variant="outline" className="w-full justify-between">
              <span>View on Solana Explorer</span>
              <svg className="w-4 h-4 text-gray-600 group-hover:text-[#0CA5B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </Button>
            <Button variant="outline" className="w-full justify-between">
              <span>Export Activity Data (CSV)</span>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </Button>
          </div>
        </section>

        {/* Save Button */}
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold text-xs uppercase tracking-[0.3em] h-14 gap-3 border-primary">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V4a1 1 0 10-2 0v7.586l-1.293-1.293z" /><path d="M5 15a2 2 0 002 2h6a2 2 0 002-2v-1a1 1 0 10-2 0v1H7v-1a1 1 0 10-2 0v1z" /></svg>
          Save Preferences
        </Button>
      </main>

      <StatusBar />
    </div>
  );
}
