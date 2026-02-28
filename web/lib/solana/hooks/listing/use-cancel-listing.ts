'use client';

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { useProgram } from '../../use-program';
import { getUserProfilePDA, getVaultPDA } from '@/lib/anchor/setup';
import { toast } from 'sonner';

export function useCancelListing() {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  const cancelListing = async (listing: PublicKey, offeredMint: PublicKey) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const [makerProfile] = getUserProfilePDA(wallet.publicKey);
      const [vault] = getVaultPDA(listing);
      
      const makerAta = getAssociatedTokenAddressSync(
        offeredMint,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const tx = await program.methods
        .cancelListing()
        .accounts({
          maker: wallet.publicKey,
          makerProfile,
          listing,
          vault,
          tokenMintSource: offeredMint,
          makerTokenAccountSource: makerAta,
        })
        .rpc();

      toast.success('Listing cancelled successfully!');
      return { signature: tx };
    } catch (error: unknown) {
      console.error('Error cancelling listing:', error);
      const message = error instanceof Error ? error.message : 'Failed to cancel listing';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { cancelListing, loading };
}
