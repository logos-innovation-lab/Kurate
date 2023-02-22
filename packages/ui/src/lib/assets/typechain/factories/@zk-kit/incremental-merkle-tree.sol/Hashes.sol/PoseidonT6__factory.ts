/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  PoseidonT6,
  PoseidonT6Interface,
} from "../../../../@zk-kit/incremental-merkle-tree.sol/Hashes.sol/PoseidonT6";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256[5]",
        name: "",
        type: "uint256[5]",
      },
    ],
    name: "poseidon",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x610276610053600b82828239805160001a607314610046577f4e487b7100000000000000000000000000000000000000000000000000000000600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100355760003560e01c80634937a2581461003a575b600080fd5b610054600480360381019061004f9190610110565b61006a565b6040516100619190610148565b60405180910390f35b6000919050565b600061008461007f84610188565b610163565b9050808285602086028201111561009a57600080fd5b60005b858110156100ca57816100b088826100fb565b84526020840193506020830192505060018101905061009d565b5050509392505050565b600082601f8301126100e557600080fd5b60056100f2848285610071565b91505092915050565b60008135905061010a81610229565b92915050565b600060a0828403121561012257600080fd5b6000610130848285016100d4565b91505092915050565b610142816101ae565b82525050565b600060208201905061015d6000830184610139565b92915050565b600061016d61017e565b905061017982826101b8565b919050565b6000604051905090565b600067ffffffffffffffff8211156101a3576101a26101e9565b5b602082029050919050565b6000819050919050565b6101c182610218565b810181811067ffffffffffffffff821117156101e0576101df6101e9565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b610232816101ae565b811461023d57600080fd5b5056fea26469706673582212208ba9be6167b72a1e2216af5a98d880b8d392dc69a515c5bde07fb821d4391af064736f6c63430008040033";

type PoseidonT6ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PoseidonT6ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PoseidonT6__factory extends ContractFactory {
  constructor(...args: PoseidonT6ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<PoseidonT6> {
    return super.deploy(overrides || {}) as Promise<PoseidonT6>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): PoseidonT6 {
    return super.attach(address) as PoseidonT6;
  }
  override connect(signer: Signer): PoseidonT6__factory {
    return super.connect(signer) as PoseidonT6__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PoseidonT6Interface {
    return new utils.Interface(_abi) as PoseidonT6Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PoseidonT6 {
    return new Contract(address, _abi, signerOrProvider) as PoseidonT6;
  }
}
