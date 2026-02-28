'use client';

import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProgram } from '../../use-program';
import { getUserProfilePDA } from '@/lib/anchor/setup';
import { toast } from 'sonner';

export function useCancelListing() {
  const { program, wallet } = useProgram();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ listing, offeredMint }: { listing: PublicKey; offeredMint: PublicKey }) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [makerProfile] = getUserProfilePDA(wallet.publicKey);
      
      // Determine token program and calculate vault ATA
      let tokenProgram = TOKEN_PROGRAM_ID;
      const makerAta = getAssociatedTokenAddressSync(
        offeredMint,
        wallet.publicKey,
        false,
        TOKEN_PROGRAM_ID
      );
      
      // Check if using Token-2022
      const accountInfo = await program.provider.connection.getAccountInfo(makerAta);
      if (!accountInfo) {
        tokenProgram = TOKEN_2022_PROGRAM_ID;
      }
      
      const vault = getAssociatedTokenAddressSync(
        offeredMint,
        listing,
        true, // allowOwnerOffCurve for PDA
        tokenProgram
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

      return { signature: tx };
    },
    onSuccess: () => {
      // Invalidate and refetch listings
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Listing cancelled successfully!');
    },
    onError: (error: unknown) => {
      console.error('Error cancelling listing:', error);
      const message = error instanceof Error ? error.message : 'Failed to cancel listing';
      toast.error(message);
    },
  });

  return {
    cancelListing: (listing: PublicKey, offeredMint: PublicKey) => 
      mutation.mutateAsync({ listing, offeredMint }),
    loading: mutation.isPending,
  };
}
