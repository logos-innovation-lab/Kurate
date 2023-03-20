import { task, types } from "hardhat/config"

task("deploy", "Deploy a GlobalAnonymousFeed contract")
  .addOptionalParam("unirep", "unirep contract address", undefined, types.string)
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs, unirep: unirepAddress }, { ethers, run }) => {

    const globalAnonymousFeedFactory = await ethers.getContractFactory("GlobalAnonymousFeed");
    const globalAnonymousFeedContract = await globalAnonymousFeedFactory.deploy('0x5e5384c3EA26185BADF41d6980397eB4D36b850e', 120);

    await globalAnonymousFeedContract.deployed();

    if (logs) {
      console.info(`GlobalAnonymousFeedContract contract has been deployed to: ${globalAnonymousFeedContract.address}`);
    }

    return globalAnonymousFeedContract;
  })
