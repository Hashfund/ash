import { Connection, PublicKey } from "@solana/web3.js";
import { MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const isAddress = (value: string) => {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
};

export const getTotalMintHolders = async (
  connection: Connection,
  mint: PublicKey,
  tokenProgramId = TOKEN_PROGRAM_ID
) => {
  const tokenAccounts = await connection.getParsedProgramAccounts(
    tokenProgramId,
    {
      filters: [
        {
          dataSize: MINT_SIZE,
        },
        {
          memcmp: {
            offset: 0,
            bytes: mint.toBase58(),
          },
        },
      ],
    }
  );

  return tokenAccounts.length;
};
