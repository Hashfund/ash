import { clusterApiUrl, Connection } from "@solana/web3.js";
import { onLogs } from "../src/worker";
async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const transaction = await connection.getParsedTransaction(
    "4pZC7kheP4zEQZh8sdQSWmo2Q6G1izUQ88aufih9t3GQPKBf1yumCEjC9yDt4EPKuQKnsfj6e2yXPTaz7KRyUwrW"
  );
  const logs = transaction!.meta!.logMessages!;
  const events = onLogs({
    err: null,
    logs,
    signature:
      "4pZC7kheP4zEQZh8sdQSWmo2Q6G1izUQ88aufih9t3GQPKBf1yumCEjC9yDt4EPKuQKnsfj6e2yXPTaz7KRyUwrW",
  });

  
}

main();
