'use client';

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useProgram } from '../../use-program';
import { getPlatformPDA, getWhitelistPDA } from '@/lib/anchor/setup';
import { toast } from 'sonner';

export function useAdmin() {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  // Initialize Platform (one-time setup)
  const initializePlatform = async (params: {
    feeCollector: PublicKey;
    feeBasisPoints: number;
    maxListingsPerUser: number;
    minTradeDuration: number;
    maxTradeDuration: number;
    whitelistEnabled: boolean;
  }) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const [platform] = getPlatformPDA(wallet.publicKey);

      const tx = await program.methods
        .initializePlatform({
          feeCollector: params.feeCollector,
          feeBasisPoints: params.feeBasisPoints,
          maxListingsPerUser: params.maxListingsPerUser,
          minTradeDuration: new BN(params.minTradeDuration),
          maxTradeDuration: new BN(params.maxTradeDuration),
          whitelistEnabled: params.whitelistEnabled,
        })
        .accounts({
          authority: wallet.publicKey,
          platform,
          feeCollector: params.feeCollector,
        })
        .rpc();

      toast.success('Platform initialized successfully!');
      return { signature: tx };
    } catch (error: unknown) {
      console.error('Error initializing platform:', error);
      const message = error instanceof Error ? error.message : 'Failed to initialize platform';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Pause/Resume Platform
  const pausePlatform = async (pause: boolean) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const [platform] = getPlatformPDA(wallet.publicKey);

      const tx = await program.methods
        .pausePlatform()
        .accounts({
          authority: wallet.publicKey,
          platform,
        })
        .rpc();

      toast.success(pause ? 'Platform paused' : 'Platform resumed');
      return { signature: tx };
    } catch (error: unknown) {
      console.error('Error pausing platform:', error);
      const message = error instanceof Error ? error.message : 'Failed to pause platform';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update Platform Configuration
  const updateConfig = async (params: {
    feeBasisPoints?: number;
    maxListingsPerUser?: number;
    minTradeDuration?: number;
    maxTradeDuration?: number;
    whitelistEnabled?: boolean;
  }) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const [platform] = getPlatformPDA(wallet.publicKey);

      const tx = await program.methods
        .updateConfig({
          feeBasisPoints: params.feeBasisPoints ?? null,
          maxListingsPerUser: params.maxListingsPerUser ?? null,
          minTradeDuration: params.minTradeDuration ? new BN(params.minTradeDuration) : null,
          maxTradeDuration: params.maxTradeDuration ? new BN(params.maxTradeDuration) : null,
          whitelistEnabled: params.whitelistEnabled ?? null,
        })
        .accounts({
          authority: wallet.publicKey,
          platform,
        })
        .rpc();

      toast.success('Configuration updated successfully!');
      return { signature: tx };
    } catch (error: unknown) {
      console.error('Error updating config:', error);
      const message = error instanceof Error ? error.message : 'Failed to update configuration';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Set Fee Collector
  const setFeeCollector = async (newCollector: PublicKey) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const [platform] = getPlatformPDA(wallet.publicKey);

      const tx = await program.methods
        .setFeeCollector({
          newCollector,
        })
        .accounts({
          authority: wallet.publicKey,
          platform,
        })
        .rpc();

      toast.success('Fee collector updated successfully!');
      return { signature: tx };
    } catch (error: unknown) {
      console.error('Error setting fee collector:', error);
      const message = error instanceof Error ? error.message : 'Failed to set fee collector';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Manage Whitelist (add or remove token)
  const manageWhitelist = async (tokenMint: PublicKey, isWhitelisted: boolean) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const [platform] = getPlatformPDA(wallet.publicKey);
      const [whitelistEntry] = getWhitelistPDA(tokenMint);

      const tx = await program.methods
        .manageWhitelist(isWhitelisted)
        .accounts({
          authority: wallet.publicKey,
          platform,
          tokenMint,
          whitelistEntry,
        })
        .rpc();

      toast.success(isWhitelisted ? 'Token added to whitelist' : 'Token removed from whitelist');
      return { signature: tx };
    } catch (error: unknown) {
      console.error('Error managing whitelist:', error);
      const message = error instanceof Error ? error.message : 'Failed to manage whitelist';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    initializePlatform,
    pausePlatform,
    updateConfig,
    setFeeCollector,
    manageWhitelist,
    loading,
  };
}
