import "@nomiclabs/hardhat-ethers"
import "@nomicfoundation/hardhat-chai-matchers"
import "@semaphore-protocol/hardhat"
import "@typechain/hardhat"
import { config as dotenvConfig } from "dotenv"
import "hardhat-gas-reporter"
import { HardhatUserConfig } from "hardhat/config"
import { NetworksUserConfig } from "hardhat/types"
import { resolve } from "path"
import "solidity-coverage"
import { config } from "./package.json"
import "./tasks/deploy"

dotenvConfig({ path: resolve(__dirname, "../../.env") })

function getNetworks(): NetworksUserConfig {
    const networks: NetworksUserConfig = {
        localhost: {
            url: 'http://127.0.0.1:8545',
            chainId: 31337
        }
    }

    if (process.env.ETHEREUM_URL && process.env.ETHEREUM_PRIVATE_KEY) {
        return {
            ...networks,
            // arbitrum goerli
            agor: {
                url: 'https://goerli-rollup.arbitrum.io/rpc',
                chainId: 421613,
                accounts: [process.env.ETHEREUM_PRIVATE_KEY],
            },
        }
    }
    return networks
}

const hardhatConfig: HardhatUserConfig = {
    solidity: config.solidity,
    paths: {
        sources: config.paths.contracts,
        tests: config.paths.tests,
        cache: config.paths.cache,
        artifacts: config.paths.build.contracts
    },
    networks: {
        ...getNetworks()
    },
    gasReporter: {
        currency: "USD",
        enabled: process.env.REPORT_GAS === "true",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY
    },
    typechain: {
        outDir: config.paths.build.typechain,
        target: "ethers-v5"
    },
    mocha: {
        timeout: 120000
    }
}

export default hardhatConfig
