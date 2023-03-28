import {ec} from 'elliptic'
import {Strategy, ZkIdentity as UnirepIdentity} from '@unirep/utils'
import type {Signer} from 'ethers'
import {ZkIdentity} from "@zk-kit/identity";

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

export async function createIdentity(signer: Signer, nonce = 0): Promise<{
	ecdh: { pub: string; priv: string };
	zkIdentity: UnirepIdentity;
}> {
	const {generateP256FromSeed,generateZKIdentityWithP256, generateECDHWithP256} = await import('zkitter-js');

	const seed = await signer.signMessage(`Sign this message to generate a ECDSA with key nonce: ${nonce}`);
	const keyPair = await generateP256FromSeed(seed)


	const ecdh = await generateECDHWithP256(keyPair.priv, nonce);
	const zkIdentity = await generateZKIdentityWithP256(keyPair.priv, nonce);
	const nullifier = zkIdentity.getNullifier();
	const trapdoor = zkIdentity.getTrapdoor();
	const unirepIdentity = new UnirepIdentity(
		Strategy.SERIALIZED,
		`{"identityNullifier":"${nullifier}","identityTrapdoor":"${trapdoor}","secret":["${nullifier}","${trapdoor}"]}`,
	)

	return {
		zkIdentity: unirepIdentity,
		ecdh,
	}
}
