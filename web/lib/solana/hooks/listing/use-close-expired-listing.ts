'use client';

import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProgram } from '../../use-program';
import { toast } from 'sonner';

export function useCloseExpiredListing() {
  const { program, wallet } = useProgram();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ listing, maker, offeredMint }: { listing: PublicKey; maker: PublicKey; offeredMint: PublicKey }) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      // Get platform PDA - need to fetch platform account to get authority
      const connection = program.provider.connection;
      const platformAccounts = await program.account.platform.all();

      if (platformAccounts.length === 0) {
        throw new Error('Platform not initialized');
      }

      const platform = platformAccounts[0].publicKey;
      
      // Determine token program and calculate vault ATA
      let tokenProgram = TOKEN_PROGRAM_ID;
      const makerAta = getAssociatedTokenAddressSync(
        offeredMint,
        maker,
        false,
        TOKEN_PROGRAM_ID
      );
      
      // Check if using Token-2022
      const accountInfo = await connection.getAccountInfo(makerAta);
      if (!accountInfo) {
        tokenProgram = TOKEN_2022_PROGRAM_ID;
      }
      
      const vault = getAssociatedTokenAddressSync(
        offeredMint,
        listing,
        true, // allowOwnerOffCurve for PDA
        tokenProgram
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accounts: any = {
        closer: wallet.publicKey,
        maker,
        platform,
        listing,
        vault,
        makerTokenAccountSource: makerAta,
        tokenMintSource: offeredMint,
        tokenProgram,
      };

      const tx = await program.methods
        .closeExpiredListing()
        .accounts(accounts)
        .rpc();

      return { signature: tx };
    },
    onSuccess: () => {
      // Invalidate and refetch listings
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Expired listing closed successfully!');
    },
    onError: (error: unknown) => {
      console.error('Error closing expired listing:', error);
      const message = error instanceof Error ? error.message : 'Failed to close expired listing';
      toast.error(message);
    },
  });

  return {
    closeExpiredListing: (listing: PublicKey, maker: PublicKey, offeredMint: PublicKey) => 
      mutation.mutateAsync({ listing, maker, offeredMint }),
    loading: mutation.isPending,
  };
}
