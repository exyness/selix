'use client';

import { useState, useEffect } from 'react';
import { useProgram } from '../../use-program';
import { getUserProfilePDA } from '@/lib/anchor/setup';
import { toast } from 'sonner';
import { BN } from '@coral-xyz/anchor';

export interface UserProfile {
  user: string;
  referrer: string | null;
  listingsCreated: number;
  listingsCancelled: number;
  swapsExecuted: number;
  swapsReceived: number;
  activeListings: number;
  volumeAsMaker: bigint;
  volumeAsTaker: bigint;
  totalFeesPaid: number;
  defaultListingDuration: number;
  defaultSlippageBps: number;
  createdAt: number;
  lastActivityAt: number;
  bump: number;
}

export function useUserProfile() {
  const { program, wallet } = useProgram();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!program || !wallet.publicKey) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const [profilePda] = getUserProfilePDA(wallet.publicKey!);
        const profileAccount = await program.account.userProfile.fetch(profilePda);
        
        // Transform the account data to match the interface
        setProfile({
          user: profileAccount.user.toString(),
          referrer: profileAccount.referrer?.toString() || null,
          listingsCreated: profileAccount.listingsCreated.toNumber(),
          listingsCancelled: profileAccount.listingsCancelled.toNumber(),
          swapsExecuted: profileAccount.swapsExecuted.toNumber(),
          swapsReceived: profileAccount.swapsReceived.toNumber(),
          activeListings: profileAccount.activeListings,
          volumeAsMaker: BigInt(profileAccount.volumeAsMaker.toString()),
          volumeAsTaker: BigInt(profileAccount.volumeAsTaker.toString()),
          totalFeesPaid: profileAccount.totalFeesPaid.toNumber(),
          defaultListingDuration: profileAccount.defaultListingDuration.toNumber(),
          defaultSlippageBps: profileAccount.defaultSlippageBps,
          createdAt: profileAccount.createdAt.toNumber(),
          lastActivityAt: profileAccount.lastActivityAt.toNumber(),
          bump: profileAccount.bump,
        });
      } catch {
        // Profile doesn't exist yet
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [program, wallet.publicKey]);

  const initializeProfile = async () => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return null;
    }

    try {
      const [profilePda] = getUserProfilePDA(wallet.publicKey);
      
      const tx = await program.methods
        .initializeUser({
          referrer: null,
          defaultListingDuration: new BN(3600), // 1 hour default
          defaultSlippageBps: 100, // 1% default
        })
        .accounts({
          user: wallet.publicKey,
          referrer: null,
        })
        .rpc();

      toast.success('Profile initialized!');
      
      // Refetch profile
      const profileAccount = await program.account.userProfile.fetch(profilePda);
      setProfile({
        user: profileAccount.user.toString(),
        referrer: profileAccount.referrer?.toString() || null,
        listingsCreated: profileAccount.listingsCreated.toNumber(),
        listingsCancelled: profileAccount.listingsCancelled.toNumber(),
        swapsExecuted: profileAccount.swapsExecuted.toNumber(),
        swapsReceived: profileAccount.swapsReceived.toNumber(),
        activeListings: profileAccount.activeListings,
        volumeAsMaker: BigInt(profileAccount.volumeAsMaker.toString()),
        volumeAsTaker: BigInt(profileAccount.volumeAsTaker.toString()),
        totalFeesPaid: profileAccount.totalFeesPaid.toNumber(),
        defaultListingDuration: profileAccount.defaultListingDuration.toNumber(),
        defaultSlippageBps: profileAccount.defaultSlippageBps,
        createdAt: profileAccount.createdAt.toNumber(),
        lastActivityAt: profileAccount.lastActivityAt.toNumber(),
        bump: profileAccount.bump,
      });
      
      return { signature: tx };
    } catch (error: unknown) {
      console.error('Error initializing profile:', error);
      const message = error instanceof Error ? error.message : 'Failed to initialize profile';
      toast.error(message);
      return null;
    }
  };

  return { profile, loading, initializeProfile };
}
