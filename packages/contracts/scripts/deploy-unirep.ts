import {ethers} from 'ethers'
import { Unirep } from '@unirep/contracts'
import { deployUnirep } from '@unirep/contracts/deploy'

const privateKey = process.env.ETHEREUM_PRIVATE_KEY as string;
const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_URL);
const deployer = new ethers.Wallet(privateKey, provider);

(async () => {
  const unirepContract: Unirep = await deployUnirep(deployer)
  console.log(unirepContract);
})();
