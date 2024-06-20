import { clusterApiUrl, Connection } from "@solana/web3.js";
import { onLogs } from "../src/worker";
async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const transaction = await connection.getParsedTransaction(
    "9ex7Gm15ucskoPUgyjNbphZpBmA5myPUqaWgdjUkbG4Wiyj8UBVF9rKYV9Hc2xvtFaFHRZM5Pp3WFnBhRNVYzdh"
  );
  const logs = transaction!.meta!.logMessages!;
  const events = await onLogs({
    err: null,
    logs,
    signature:
      "9ex7Gm15ucskoPUgyjNbphZpBmA5myPUqaWgdjUkbG4Wiyj8UBVF9rKYV9Hc2xvtFaFHRZM5Pp3WFnBhRNVYzdh",
  });

  console.log("Fuck")
}

main();
