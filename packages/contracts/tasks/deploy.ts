import { task, types } from "hardhat/config"

task("deploy", "Deploy a GlobalAnonymousFeed contract")
    .addOptionalParam("semaphore", "Semaphore contract address", undefined, types.string)
    .addOptionalParam("group", "Group id", "42", types.string)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, semaphore: semaphoreAddress, group: groupId }, { ethers, run }) => {
        if (!semaphoreAddress) {
            const { semaphore } = await run("deploy:semaphore", {
                logs
            })

            semaphoreAddress = semaphore.address
        }

        const globalAnonymousFeedFactory = await ethers.getContractFactory("GlobalAnonymousFeed")

        const globalAnonymousFeedContract = await globalAnonymousFeedFactory.deploy(semaphoreAddress, groupId)

        await globalAnonymousFeedContract.deployed()

        if (logs) {
            console.info(`GlobalAnonymousFeedContract contract has been deployed to: ${globalAnonymousFeedContract.address}`)
        }

        return globalAnonymousFeedContract
    })
