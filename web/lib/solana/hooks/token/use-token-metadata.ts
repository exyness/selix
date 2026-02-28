'use client';

import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';

export interface TokenMetadata {
  name: string;
  symbol: string;
  image?: string;
  decimals: number;
}

export function useTokenMetadata(mintAddress?: PublicKey) {
  const { connection } = useConnection();

  const { data: metadata, isLoading: loading, refetch } = useQuery({
    queryKey: ['tokenMetadata', mintAddress?.toString()],
    queryFn: async () => {
      if (!mintAddress) return null;

      try {
        const metadataPDA = await getMetadataPDA(mintAddress);
        const accountInfo = await connection.getAccountInfo(metadataPDA);
        
        if (accountInfo) {
          const onChainMetadata = parseMetadata(accountInfo.data);
          
          if (onChainMetadata.uri) {
            try {
              const response = await fetch(onChainMetadata.uri);
              if (response.ok) {
                const offChainData = await response.json();
                const imageUrl = offChainData.image || offChainData.logo;
                
                return {
                  name: offChainData.name || onChainMetadata.name,
                  symbol: offChainData.symbol || onChainMetadata.symbol,
                  image: imageUrl ? imageUrl : undefined,
                  decimals: onChainMetadata.decimals,
                };
              }
            } catch {
              // Failed to fetch off-chain metadata, use on-chain data
            }
          }
          
          return onChainMetadata;
        } else {
          const tokenInfo = await connection.getParsedAccountInfo(mintAddress);
          if (tokenInfo.value?.data && 'parsed' in tokenInfo.value.data) {
            const parsed = tokenInfo.value.data.parsed;
            return {
              name: mintAddress.toString().slice(0, 8),
              symbol: mintAddress.toString().slice(0, 4).toUpperCase(),
              decimals: parsed.info?.decimals || 9,
            };
          }
          throw new Error('No token info found');
        }
      } catch {
        return {
          name: mintAddress.toString().slice(0, 8),
          symbol: mintAddress.toString().slice(0, 4).toUpperCase(),
          decimals: 9,
        };
      }
    },
    enabled: !!mintAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return { metadata: metadata ?? null, loading, refetch };
}

// Helper to get Metaplex metadata PDA
async function getMetadataPDA(mint: PublicKey): Promise<PublicKey> {
  const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );
  return pda;
}

// Basic metadata parser
function parseMetadata(data: Buffer): TokenMetadata & { uri?: string } {
  try {
    // This is a simplified parser
    const nameLength = data.readUInt32LE(65);
    const name = data.subarray(69, 69 + nameLength).toString('utf8').replace(/\0/g, '').trim();
    
    const symbolStart = 69 + nameLength + 4;
    const symbolLength = data.readUInt32LE(69 + nameLength);
    const symbol = data.subarray(symbolStart, symbolStart + symbolLength).toString('utf8').replace(/\0/g, '').trim();
    
    const uriStart = symbolStart + symbolLength + 4;
    const uriLength = data.readUInt32LE(symbolStart + symbolLength);
    const uri = data.subarray(uriStart, uriStart + uriLength).toString('utf8').replace(/\0/g, '').trim();

    return {
      name: name || 'Unknown Token',
      symbol: symbol || 'UNKNOWN',
      uri: uri || undefined,
      decimals: 9,
    };
  } catch {
    return {
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      decimals: 9,
    };
  }
}
