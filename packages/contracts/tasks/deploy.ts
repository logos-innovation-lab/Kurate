import { Unirep } from "@unirep/contracts";
import { deployUnirep } from "@unirep/contracts/deploy";
import { task, types } from "hardhat/config"

// 28800 seconds = 8 hours per epoch
const DEFAULT_EPOCH_LENGTH = 28800;

task("deploy", "Deploy a GlobalAnonymousFeed contract")
  .addOptionalParam("unirep", "unirep contract address", undefined, types.string)
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .addOptionalParam("epoch", `Epoch length (defaults to ${DEFAULT_EPOCH_LENGTH}`, DEFAULT_EPOCH_LENGTH, types.int)
  .setAction(async ({ logs, unirep: unirepAddress, epoch: epochLength }, { ethers }) => {
    const globalAnonymousFeedFactory = await ethers.getContractFactory("GlobalAnonymousFeed");

    const [deployer] = await ethers.getSigners();

    logs && console.log(`Deploying contracts with the account: ${deployer.address}`);
    logs && console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

    if (!unirepAddress) {
        logs && console.log("Unirep contract address not provided, deploying Unirep first\n")
        const unirepContract: Unirep = await deployUnirep(deployer)
        unirepAddress = unirepContract.address;
    }

    logs && console.log(`\nUnirep contract address: ${unirepAddress}`);

    const gasPrice = await globalAnonymousFeedFactory.signer.getGasPrice();
    const estimatedGas = await globalAnonymousFeedFactory.signer.estimateGas(globalAnonymousFeedFactory.getDeployTransaction(unirepAddress, epochLength));
    logs && console.log(`Estimated gas: ${estimatedGas}`);
    logs && console.log(`Gas price: ${gasPrice}`)

    const deploymentPrice = gasPrice.mul(estimatedGas);
    const deployerBalance = await globalAnonymousFeedFactory.signer.getBalance();

    logs && console.log(`Deployer balance:  ${ethers.utils.formatEther(deployerBalance)}`);
    logs && console.log(`Deployment price:  ${ethers.utils.formatEther(deploymentPrice)}`);

    const globalAnonymousFeedContract = await globalAnonymousFeedFactory.deploy(unirepAddress, epochLength);

    await globalAnonymousFeedContract.deployed();

    logs && console.info("\n-----------------------------------------------------------------");
    logs && console.info('GlobalAnonymousFeedContract contract has been deployed');
    logs && console.log("Don't forget to set the variables for both the UI and relayer\n");

    logs && console.log(`PUBLIC_GLOBAL_ANONYMOUS_FEED_ADDRESS=${globalAnonymousFeedContract.address}`);
    logs && console.log(`PUBLIC_PROVIDER=${ethers.provider.connection.url}`);

    logs && console.log("\nRelayer only");
    logs && console.log(`PRIVATE_KEY=...`);

    logs && console.log("\nUI only");
    logs && console.log(`PUBLIC_RELAYER_URL=...`);

    return globalAnonymousFeedContract;
 })
