import { BN } from "bn.js";
import { HASHFUND_PROGRAM_ID } from "@hashfund/program";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

import { parseLogs } from "./utils/log";
import { createMint } from "./modules/mint/mint.controller";
import {
  createBoundingCurve,
  createSwap,
} from "./modules/swap/swap.controller";

function main() {
  const connection = new Connection(clusterApiUrl("devnet"), {
    wsEndpoint: "wss://api.devnet.solana.com/",
  });

  connection.onLogs(
    new PublicKey(HASHFUND_PROGRAM_ID),
    async ({ logs, signature }) => {
      console.log("signature=", signature);
      const event = parseLogs(logs);

      if (event.Mint && event.MintTo) {
        let mintData = event.Mint;
        let mintToData = event.MintTo;

        await createMint({
          id: mintData.mint.toBase58(),
          name: mintData.name,
          creator: mintData.creator.toBase58(),
          uri: mintData.uri,
          ticker: mintData.ticker,
          timestamp: new Date(mintData.timestamp.mul(new BN(1000)).toNumber()),
          reserve: mintToData.reserve.toBase58(),
          totalSupply: mintToData.amount.toString("hex"),
        });
      }

      if (event.InitializeCurve) {
        const data = event.InitializeCurve;

        await createBoundingCurve({
          id: data.bounding_curve.toBase58(),
          mint: data.mint.toBase58(),
          initialPrice: data.initial_price.toString("hex"),
          maximumMarketCap: data.maximum_market_cap.toString("hex"),
          timestamp: new Date(data.timestamp.mul(new BN(1000)).toNumber()),
        });
      }

      if (event.Swap) {
        const data = event.Swap;

        await createSwap({
          mint: data.mint.toBase58(),
          tradeDirection: data.trade_direction,
          amountIn: data.amount_in.toString("hex"),
          amountOut: data.amount_out.toString("hex"),
          marketCap: data.market_cap.toString("hex"),
          timestamp: new Date(data.timestamp.mul(new BN(1000)).toNumber()),
          payer: data.payer.toBase58(),
        });
      }
    }
  );
}

main();
