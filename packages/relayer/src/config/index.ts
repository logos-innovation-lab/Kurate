import { config } from "dotenv";

config();

const {
  GLOBAL_ANONYMOUS_FEED_ADDRESS = "",
  RPC_URL = "",
  PRIVATE_KEY = "",
} = process.env;

export { GLOBAL_ANONYMOUS_FEED_ADDRESS, RPC_URL, PRIVATE_KEY };
