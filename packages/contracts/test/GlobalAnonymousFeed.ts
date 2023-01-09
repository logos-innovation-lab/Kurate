import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof, packToSolidityProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { solidityKeccak256 } from "ethers/lib/utils"
import { run, ethers } from "hardhat"
import { GlobalAnonymousFeed } from "../build/typechain"
import { config } from "../package.json"
import type { Signer } from "ethers/lib/ethers"

describe("Global Anonymous Feed Contract", () => {
    let postContract: GlobalAnonymousFeed

    let identities: Identity[] = []
    const groupId = 42
    const group = new Group(groupId)
    const identitySeed = 'identity'
    let accounts: Signer[]

    before(async () => {
        postContract = await run("deploy", { logs: false, group: groupId })
        accounts = await ethers.getSigners()

        for (let i = 0; i < 2; i++) {
            identities.push(new Identity(await accounts[i].signMessage(identitySeed)))
        }
        identities.forEach(i => group.addMember(i.getCommitment()))
    })

    describe("joinGroup", () => {
        it("Should allow users to join the group", async () => {
            for (let i = 0; i < group.members.length; i += 1) {
                const transaction = postContract.joinGroup(group.members[i])

                await expect(transaction)
                    .to.emit(postContract, "NewIdentity")
                    .withArgs(group.members[i])
            }
        })

        it("Should not allow users to join the group with the same identity", async () => {
            const transaction = postContract.joinGroup(group.members[0])

            await expect(transaction).to.be.revertedWithCustomError(postContract, "IdentityAlreadyExists")
        })
    })

    describe("sendMessage", () => {
        const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
        const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

        it("Should allow users to send message anonymously", async () => {
            const feedback = "Hello World"
            const feedbackHash = solidityKeccak256(["string"], [feedback])

            const fullProof = await generateProof(identities[1], group, BigInt(groupId), feedbackHash, {
                wasmFilePath,
                zkeyFilePath
            })
            const solidityProof = packToSolidityProof(fullProof.proof)

            const transaction = postContract.sendMessage(
                feedback,
                fullProof.publicSignals.merkleTreeRoot,
                fullProof.publicSignals.nullifierHash,
                solidityProof
            )

            await expect(transaction).to.emit(postContract, "NewMessage").withArgs(feedback)
        })
    })
})
