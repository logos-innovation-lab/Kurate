import { expect } from "chai"
import { solidityKeccak256 } from "ethers/lib/utils"
import { run, ethers } from "hardhat"
import { GlobalAnonymousFeed, GlobalAnonymousFeed__factory } from "../build/typechain"
import { config } from "../package.json"
import type { Signer } from "ethers/lib/ethers"

describe("Global Anonymous Feed Contract", () => {
    let postContract: GlobalAnonymousFeed

    const groupId = 42
    const identitySeed = 'identity'
    let accounts: Signer[]

    before(async () => {
        const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_URL)
        const signer = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as string, provider)
        postContract = new GlobalAnonymousFeed__factory(signer).attach(process.env.GLOBAL_ANONYMOUS_FEED_ADDRESS as string);
        console.log(await postContract.attesterCurrentEpoch());
        console.log(await postContract.attesterEpochRemainingTime());
    })

    describe("createPersona", () => {
        it("Should allow users to create persona", async () => {
            // TODO: need to add getting for posts
            // TODO: need to change certains types from bytes32 to string

            // await postContract.createPersona(
            //   42,
            //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   [
            //     '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //     '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //     '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //     '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //     '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   ],
            //   [],
            //   [1,2,3,4,5,6,7,8]
            // );
            const persona = await postContract.personas(42);
            console.log(persona);
        });

        it("Should not allow users to join the group with the same identity", async () => {

        })
    })
})
