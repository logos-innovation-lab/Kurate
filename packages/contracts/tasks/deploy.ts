import { task, types } from "hardhat/config"

task("deploy", "Deploy a GlobalAnonymousFeed contract")
  .addOptionalParam("unirep", "unirep contract address", undefined, types.string)
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs, unirep: unirepAddress }, { ethers, run }) => {

    const globalAnonymousFeedFactory = await ethers.getContractFactory("GlobalAnonymousFeed");
    const globalAnonymousFeedContract = await globalAnonymousFeedFactory.deploy(unirepAddress);

    await globalAnonymousFeedContract.deployed();

    if (logs) {
      console.info(`GlobalAnonymousFeedContract contract has been deployed to: ${globalAnonymousFeedContract.address}`);
    }

    return globalAnonymousFeedContract;
  })
