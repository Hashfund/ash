import { BN } from "bn.js";
import { HASHFUND_PROGRAM_ID } from "@hashfund/program";
import { Connection, Logs } from "@solana/web3.js";

import { parseLogs } from "utils/log";
import { createMint } from "modules/mint/mint.controller";
import { createBoundingCurve, createSwap } from "modules/swap/swap.controller";
import { HTTP_RPC_ENDPOINT, WSS_RPC_ENDPOINT } from "config";

const onLogs = async ({ logs, signature }: Logs) => {
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
      signature,
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
      signature,
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
      signature,
    });
  }
};

async function run() {
  const connection = new Connection(HTTP_RPC_ENDPOINT, {
    wsEndpoint: WSS_RPC_ENDPOINT,
  });

  connection.onLogs(
    HASHFUND_PROGRAM_ID,
    async (logs) => {
      console.log("signature=", logs.signature);

      onLogs(logs).catch(console.log);
    },
    "confirmed"
  );
}

run()
  .catch(() => {
    process.exit(1);
  })
  .then(() => console.log("Running worker in background..."));
