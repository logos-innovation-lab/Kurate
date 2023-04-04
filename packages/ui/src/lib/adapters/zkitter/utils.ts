import { Strategy, ZkIdentity as UnirepIdentity } from '@unirep/utils'
import type { Signer } from 'ethers'
import type { Circuit, Prover } from '@unirep/circuits'
import type { SnarkProof, SnarkPublicSignals } from '@unirep/utils'
import type { ZkIdentity } from '@zk-kit/identity'
import { generateMerkleTree } from '@zk-kit/protocols'
import type { Proof, ProofType } from 'zkitter-js'
import { getFromLocalStorage, saveToLocalStorage } from '../../utils'
import { GroupAdapter } from './group-adapter'
import {RELAYER_URL} from "../../constants";

export const prover: Prover = {
	verifyProof: async (
		circuitName: string | Circuit,
		publicSignals: SnarkPublicSignals,
		proof: SnarkProof,
	) => {
		const snarkjs = await import('snarkjs')
		const url = new URL(`/circuits/${circuitName}.vkey.json`, RELAYER_URL)
		const vkey = await fetch(url.toString()).then((r) => r.json())
		return snarkjs.groth16.verify(vkey, publicSignals, proof)
	},
	genProofAndPublicSignals: async (circuitName: string | Circuit, inputs: unknown) => {
		const snarkjs = await import('snarkjs')
		const wasmUrl = new URL(`/circuits/${circuitName}.wasm`, RELAYER_URL)
		const wasm = await fetch(wasmUrl.toString()).then((r) => r.arrayBuffer())
		const zkeyUrl = new URL(`/circuits/${circuitName}.zkey`, RELAYER_URL)
		const zkey = await fetch(zkeyUrl.toString()).then((r) => r.arrayBuffer())
		const { proof, publicSignals } = await snarkjs.groth16.fullProve(
			inputs,
			new Uint8Array(wasm),
			new Uint8Array(zkey),
		)
		return { proof, publicSignals }
	},
	getVKey: async (name: string | Circuit): Promise<string> => {
		return new URL(`/circuits/${name}.vkey.json`, RELAYER_URL).toString()
	},
}

export async function createIdentity(
	signer: Signer,
	nonce = 0,
): Promise<{
	ecdsa: { pub: string; priv: string }
	zkIdentity: ZkIdentity
	unirepIdentity: UnirepIdentity
}> {
	const { generateP256FromSeed, generateZKIdentityWithP256 } = await import('zkitter-js')

	const seed = await signer.signMessage(
		`Sign this message to generate a ECDSA with key nonce: ${nonce}`,
	)
	const keyPair = await generateP256FromSeed(seed)

	const zkIdentity = await generateZKIdentityWithP256(keyPair.priv, nonce)
	const nullifier = zkIdentity.getNullifier().toString(16)
	const trapdoor = zkIdentity.getTrapdoor().toString(16)
	const unirepIdentity = new UnirepIdentity(
		Strategy.SERIALIZED,
		`{"identityNullifier":"${nullifier}","identityTrapdoor":"${trapdoor}","secret":["${nullifier}","${trapdoor}"]}`,
	)

	return {
		zkIdentity: zkIdentity,
		unirepIdentity: unirepIdentity,
		ecdsa: keyPair,
	}
}

export async function generateRLNProofForNewPersona(
	hash: string,
	zkIdentity: ZkIdentity,
	newPersonaId: number | string,
): Promise<Proof> {
	const { createRLNProof, generateECDHKeyPairFromZKIdentity } = await import('zkitter-js')
	const idcommit = zkIdentity.genIdentityCommitment()
	const tree = generateMerkleTree(15, BigInt(0), [idcommit])
	const path = tree.createProof(tree.indexOf(idcommit))
	const proof = await createRLNProof(hash, zkIdentity, path)
	const ecdh = await generateECDHKeyPairFromZKIdentity(zkIdentity, hash)
	return {
		ecdh: ecdh.pub,
		groupId: GroupAdapter.createGroupId(newPersonaId),
		proof,
		type: 'rln' as ProofType.rln,
	}
}

export async function updateActivePosts(postHashes: string[]): Promise<{ [hash: string]: string }> {
	const actives = getFromLocalStorage<{ [hash: string]: string }>('kurate/actives', {})
	const newActives = {
		...actives,
		...postHashes.reduce((acc: { [hash: string]: string }, hash: string) => {
			acc[hash] = hash
			return acc
		}, {}),
	}
	saveToLocalStorage('kurate/actives', newActives)
	return newActives
}

export async function getActivePosts(postHashes: string[]): Promise<{ [hash: string]: string }> {
	return getFromLocalStorage<{ [hash: string]: string }>('kurate/actives', {})
}

export const rlnVkey = {
	protocol: 'groth16',
	curve: 'bn128',
	nPublic: 5,
	vk_alpha_1: [
		'20491192805390485299153009773594534940189261866228447918068658471970481763042',
		'9383485363053290200918347156157836566562967994039712273449902621266178545958',
		'1',
	],
	vk_beta_2: [
		[
			'6375614351688725206403948262868962793625744043794305715222011528459656738731',
			'4252822878758300859123897981450591353533073413197771768651442665752259397132',
		],
		[
			'10505242626370262277552901082094356697409835680220590971873171140371331206856',
			'21847035105528745403288232691147584728191162732299865338377159692350059136679',
		],
		['1', '0'],
	],
	vk_gamma_2: [
		[
			'10857046999023057135944570762232829481370756359578518086990519993285655852781',
			'11559732032986387107991004021392285783925812861821192530917403151452391805634',
		],
		[
			'8495653923123431417604973247489272438418190587263600148770280649306958101930',
			'4082367875863433681332203403145435568316851327593401208105741076214120093531',
		],
		['1', '0'],
	],
	vk_delta_2: [
		[
			'2744266969266381136179481411103692343137105620774096951013115056174039783232',
			'1945717132644603980967576559304930193291341702054608814791390463769446499650',
		],
		[
			'5888115567139462763962178586609367624590506116461392712666335848962861527356',
			'20882923628897502463216616682286458584209269738588566234207544213014722179406',
		],
		['1', '0'],
	],
	vk_alphabeta_12: [
		[
			[
				'2029413683389138792403550203267699914886160938906632433982220835551125967885',
				'21072700047562757817161031222997517981543347628379360635925549008442030252106',
			],
			[
				'5940354580057074848093997050200682056184807770593307860589430076672439820312',
				'12156638873931618554171829126792193045421052652279363021382169897324752428276',
			],
			[
				'7898200236362823042373859371574133993780991612861777490112507062703164551277',
				'7074218545237549455313236346927434013100842096812539264420499035217050630853',
			],
		],
		[
			[
				'7077479683546002997211712695946002074877511277312570035766170199895071832130',
				'10093483419865920389913245021038182291233451549023025229112148274109565435465',
			],
			[
				'4595479056700221319381530156280926371456704509942304414423590385166031118820',
				'19831328484489333784475432780421641293929726139240675179672856274388269393268',
			],
			[
				'11934129596455521040620786944827826205713621633706285934057045369193958244500',
				'8037395052364110730298837004334506829870972346962140206007064471173334027475',
			],
		],
	],
	IC: [
		[
			'20821834243336516786201889631689231999148039032373131028507075145623985779981',
			'7720254103489648730462481236507600354556681224094124027237333037971085100742',
			'1',
		],
		[
			'12758639482259263442927997463890459065270158692554537547447270833880367172680',
			'7096461889876156644167802101542218739766293507011380770047175807875141975658',
			'1',
		],
		[
			'20298208365379626713998755037843604381406858022412070531725408709394334094230',
			'19770080114846275377397430268981197529953457215843966838506666693071983035800',
			'1',
		],
		[
			'17871422382927118240018907392759156092564062995732853969727344592082381890529',
			'20674999536777718265848239797095071666730578378113654183274608843494488317581',
			'1',
		],
		[
			'19476039130229842945209704858321160609995970202048868544884159416633949301194',
			'20675218638367246790281784419932368473666354359390050003764632218719699226663',
			'1',
		],
		[
			'1294538885713138933262755102312561157452950398991573340812672187959629941214',
			'8492183996606971090959303326463362662809535372644723157470313529088417198501',
			'1',
		],
	],
}
