import { BN } from "bn.js";
import "dotenv/config";

export const DB_URL = process.env.DATABASE_URL!;
export const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY!;
export const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY!;
export const HTTP_RPC_ENDPOINT=process.env.HTTP_RPC_ENDPOINT!;
export const WSS_RPC_ENDPOINT = process.env.WSS_RPC_ENDPOINT!;


export const NATIVE_MINT_DECIMALS = new BN(10).pow(new BN(9));