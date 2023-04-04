import { join } from "path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyPluginAsync } from "fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { syncGroup } from "./services/rln";
import { GLOBAL_ANONYMOUS_FEED_ADDRESS, RPC_URL } from "./config";
import { getDefaultProvider } from "@ethersproject/providers";
import epochSealer from "./services/epoch";

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Plugins
  fastify.withTypeProvider<JsonSchemaToTsProvider>();

  // Services
  const provider = getDefaultProvider(RPC_URL);
  syncGroup(provider, GLOBAL_ANONYMOUS_FEED_ADDRESS);

  epochSealer.start();

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  /*
  fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });
  */

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });
};

export default app;
export { app, options };
