'use client';

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { useProgram } from '../../use-program';
import { getUserProfilePDA, getPlatformPDA } from '@/lib/anchor/setup';
import { toast } from 'sonner';

export interface ExecuteSwapParams {
  listing: PublicKey;
  maker: PublicKey;
  offeredMint: PublicKey;
  requestedMint: PublicKey;
  fillAmount: number;
}

export function useExecuteSwap() {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  const executeSwap = async (params: ExecuteSwapParams) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const [takerProfile] = getUserProfilePDA(wallet.publicKey);
      const [makerProfile] = getUserProfilePDA(params.maker);
      const [platform] = getPlatformPDA();
      
      // Determine token program
      let tokenProgram = TOKEN_PROGRAM_ID;
      const testAta = getAssociatedTokenAddressSync(
        params.offeredMint,
        wallet.publicKey,
        false,
        TOKEN_PROGRAM_ID
      );
      const accountInfo = await program.provider.connection.getAccountInfo(testAta);
      if (!accountInfo) {
        tokenProgram = TOKEN_2022_PROGRAM_ID;
      }
      
      const vault = getAssociatedTokenAddressSync(
        params.offeredMint,
        params.listing,
        true, // allowOwnerOffCurve for PDA
        tokenProgram
      );
      
      const takerOfferedAta = getAssociatedTokenAddressSync(
        params.requestedMint,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const takerRequestedAta = getAssociatedTokenAddressSync(
        params.offeredMint,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const makerRequestedAta = getAssociatedTokenAddressSync(
        params.requestedMint,
        params.maker,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const tx = await program.methods
        .executeSwap({
          fillAmount: new BN(params.fillAmount),
        })
        .accounts({
          taker: wallet.publicKey,
          takerProfile,
          makerProfile,
          platform,
          listing: params.listing,
          vault,
          tokenMintSource: params.offeredMint,
          tokenMintDestination: params.requestedMint,
          takerTokenAccountSource: takerRequestedAta,
          takerTokenAccountDestination: takerOfferedAta,
          makerTokenAccountDestination: makerRequestedAta,
        })
        .rpc();

      toast.success('Swap executed successfully!');
      return { signature: tx };
    } catch (error: unknown) {
      console.error('Error executing swap:', error);
      const message = error instanceof Error ? error.message : 'Failed to execute swap';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { executeSwap, loading };
}
