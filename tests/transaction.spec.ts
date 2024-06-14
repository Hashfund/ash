import {clusterApiUrl, Connection} from "@solana/web3.js";
import {parseLogs} from "../src/utils/log";
async function main(){
    const connection = new Connection(clusterApiUrl("devnet"));
    const transaction = await connection.getParsedTransaction("2u3pNMicK7agA8c9URrQSPhW8ykeewgEFVjYDLDK7TGijDAxL4i1o5QXWaguu99S1uke26YQaEocbvHumwC4tFVi");
    const logs = transaction!.meta!.logMessages!;
    const events = parseLogs(logs);
    console.log(events.InitializeCurve?.bounding_curve.toBase58())
    console.log(events.InitializeCurve?.initial_price.toNumber())
}

main()