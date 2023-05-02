import { config } from "dotenv";

config();

const {
  PUBLIC_GLOBAL_ANONYMOUS_FEED_ADDRESS = "",
  PUBLIC_PROVIDER = "",
  PRIVATE_KEY = "",
} = process.env;

export { PUBLIC_GLOBAL_ANONYMOUS_FEED_ADDRESS, PUBLIC_PROVIDER, PRIVATE_KEY };
