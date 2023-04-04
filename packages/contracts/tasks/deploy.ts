import { task, types } from "hardhat/config"

task("deploy", "Deploy a GlobalAnonymousFeed contract")
  .addOptionalParam("unirep", "unirep contract address", undefined, types.string)
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs, unirep: unirepAddress }, { ethers, run }) => {
    const globalAnonymousFeedFactory = await ethers.getContractFactory("GlobalAnonymousFeed");

    const [deployer] = await ethers.getSigners();

    console.log(
      "Deploying contracts with the account:",
      deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const gasPrice = await globalAnonymousFeedFactory.signer.getGasPrice();
    // const estimatedGas = await globalAnonymousFeedFactory.signer.estimateGas(globalAnonymousFeedFactory.getDeployTransaction('0xF309DDf2Cc1b2701fED5171C5150092bAc946f07', 28800));
    const estimatedGas = await globalAnonymousFeedFactory.signer.estimateGas(globalAnonymousFeedFactory.getDeployTransaction('0x5e5384c3EA26185BADF41d6980397eB4D36b850e', 60));
    console.log(`Estimated gas: ${estimatedGas}`);
    console.log(`Gas Price: ${gasPrice}`)
    const deploymentPrice = gasPrice.mul(estimatedGas);
    const deployerBalance = await globalAnonymousFeedFactory.signer.getBalance();
    console.log(`Deployer balance:  ${ethers.utils.formatEther(deployerBalance)}`);
    console.log(`Deployment price:  ${ethers.utils.formatEther(deploymentPrice)}`);
    // This is unirep@2.0.0-beta-1 contract address on Arbitrum Goerli
    // https://developer.unirep.io/docs/testnet-deployment
    // 28800 seconds = 8 hours per epoch
    // const globalAnonymousFeedContract = await globalAnonymousFeedFactory.deploy('0xF309DDf2Cc1b2701fED5171C5150092bAc946f07', 28800);

    // This was used for local dev
    // 60 seconds = 1 minute per epoch
    const globalAnonymousFeedContract = await globalAnonymousFeedFactory.deploy('0x5e5384c3EA26185BADF41d6980397eB4D36b850e', 60);

    await globalAnonymousFeedContract.deployed();

    if (logs) {
      console.info(`GlobalAnonymousFeedContract contract has been deployed to: ${globalAnonymousFeedContract.address}`);
    }

    return globalAnonymousFeedContract;
 })
