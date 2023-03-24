import { ec } from 'elliptic'
import { Strategy, ZkIdentity } from '@zk-kit/identity'
import { generateIdentity } from 'zkitter-js'
import type { Signer } from 'ethers'

// FIXME: help! Would be nice to have this exposed
import { sha256, signWithP256 } from 'zkitter-js/utils/crypto'

export const generateECDHKeyPairFromhex = async (
	hashHex: string,
): Promise<{ pub: string; priv: string }> => {
	const elc = new ec('curve25519')
	const key = elc.keyFromPrivate(hashHex)
	const pubhex = key.getPublic().encodeCompressed('hex')
	const privhex = key.getPrivate().toString('hex')

	return {
		priv: privhex,
		pub: pubhex,
	}
}

export async function createIdentity(signer: Signer, groupId: string) {
	const identity = await generateIdentity(
		Number.parseInt(groupId.substring(groupId.length - 9), 16),
		signer.signMessage.bind(signer),
	)

	const ecdhseed = signWithP256(identity.priv, 'signing for ecdh - 0')
	const ecdhHex = await sha256(ecdhseed)
	const keyPair = await generateECDHKeyPairFromhex(ecdhHex)

	const zkseed = signWithP256(identity.priv, 'signing for zk identity - 0')
	const zkHex = await sha256(zkseed)
	const zkIdentity = new ZkIdentity(Strategy.MESSAGE, zkHex)

	return {
		zkIdentity,
		ecdh: keyPair,
	}
}
