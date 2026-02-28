'use client';

import { useState, useEffect } from 'react';
import { useProgram } from '../../use-program';
import { getUserProfilePDA } from '@/lib/anchor/setup';
import { toast } from 'sonner';
import { BN } from '@coral-xyz/anchor';

export interface UserProfile {
  user: string;
  listingsCreated: number;
  swapsExecuted: number;
  totalVolume: bigint;
  referralCount: number;
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
        setProfile(profileAccount as UserProfile);
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
          userProfile: profilePda,
          referrer: null,
        })
        .rpc();

      toast.success('Profile initialized!');
      
      // Refetch profile
      const profileAccount = await program.account.userProfile.fetch(profilePda);
      setProfile(profileAccount as UserProfile);
      
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
