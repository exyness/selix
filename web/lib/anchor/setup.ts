import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { Selix } from './types/selix';
import IDL from './idl/selix.json';

export const PROGRAM_ID = new PublicKey(IDL.address);

export const SELIX_PROGRAM_ID = PROGRAM_ID;

// RPC endpoints
export const RPC_ENDPOINTS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  localnet: 'http://localhost:8899',
};

// Get program instance
export function getProgram(provider: AnchorProvider): Program<Selix> {
  return new Program(IDL as Selix, provider);
}

// PDA seeds
export const SEEDS = {
  PLATFORM: Buffer.from('platform'),
  USER_PROFILE: Buffer.from('user_profile'),
  LISTING: Buffer.from('listing'),
  WHITELIST: Buffer.from('whitelist'),
};

// Derive PDAs
export function getPlatformPDA(authority?: PublicKey): [PublicKey, number] {
  // If no authority provided, fetch from all accounts
  // For now, we'll use a placeholder that will be replaced when fetching
  if (!authority) {
    // Return a dummy PDA - caller should use program.account.platform.all() instead
    return PublicKey.findProgramAddressSync(
      [SEEDS.PLATFORM],
      PROGRAM_ID
    );
  }
  
  return PublicKey.findProgramAddressSync(
    [SEEDS.PLATFORM, authority.toBuffer()],
    PROGRAM_ID
  );
}

export function getUserProfilePDA(user: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.USER_PROFILE, user.toBuffer()],
    PROGRAM_ID
  );
}

export function getListingPDA(maker: PublicKey, listingId: number): [PublicKey, number] {
  // Create buffer and write u64 in little-endian format (browser-compatible)
  const idBuffer = Buffer.alloc(8);
  const view = new DataView(idBuffer.buffer, idBuffer.byteOffset, idBuffer.byteLength);
  view.setBigUint64(0, BigInt(listingId), true); // true = little-endian
  
  return PublicKey.findProgramAddressSync(
    [SEEDS.LISTING, maker.toBuffer(), idBuffer],
    PROGRAM_ID
  );
}

// Note: Vault is an ATA, not a PDA. Use getAssociatedTokenAddressSync instead.
// This function is deprecated - kept for backwards compatibility
export function getVaultPDA(listing: PublicKey): [PublicKey, number] {
  throw new Error('getVaultPDA is deprecated. Use getAssociatedTokenAddressSync(mint, listing, true, tokenProgram) instead');
}

export function getWhitelistPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.WHITELIST, mint.toBuffer()],
    PROGRAM_ID
  );
}
