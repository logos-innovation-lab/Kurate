import { multiaddr } from '@multiformats/multiaddr'
import { Protocols, PageDirection } from 'js-waku'
import { createLightNode } from 'js-waku/lib/create_waku'
import { waitForRemotePeer } from 'js-waku/lib/wait_for_remote_peer'
import { EncoderV0 } from 'js-waku/lib/waku_message/version_0'

// Types
import type { Decoder, Message, WakuLight } from 'js-waku/lib/interfaces'
import type { QueryOptions } from 'js-waku/lib/waku_store'
import type { UnsubscribeFunction } from 'js-waku/lib/waku_filter'
import type { CreateOptions } from 'js-waku/lib/create_waku'

// Types
export type WithPayload<Msg extends Message> = Msg & {
	get payload(): Uint8Array
}

const defaultOptions: CreateOptions = {}

export async function getWaku(
	protocols?: Protocols[],
	options?: CreateOptions,
): Promise<WakuLight> {
	const waku = await createLightNode(options ?? defaultOptions)

	await waku.start()
	await waku.dial(
		multiaddr(
			'/dns4/ws.waku.apyos.dev/tcp/443/wss/p2p/16Uiu2HAm5wH4dPAV6zDfrBHkWt9Wu9iiXT4ehHdUArDUbEevzmBY',
		),
	)
	await waitForRemotePeer(waku, protocols)

	return waku
}

export const postWakuMessage = async (waku: WakuLight, topic: string, payload: Uint8Array) => {
	// Post the metadata on Waku
	const message = { payload }

	// Send the message
	await waku.lightPush.push(new EncoderV0(topic), { payload })

	// Return message
	return message
}

export const wrapFilterCallback = <Msg extends Message>(
	callback: (message: Promise<Msg | undefined>) => Promise<unknown>,
) => {
	return (message: Msg) => void callback(Promise.resolve(message))
}

export const subscribeToLatestTopicData = <Msg extends Message>(
	waku: WakuLight,
	decoders: Decoder<Msg>[],
	callback: (message: Promise<Msg | undefined>) => Promise<boolean>,
	onDone?: () => void,
	options?: QueryOptions | undefined,
	watch?: boolean,
) => {
	// eslint-disable-next-line @typescript-eslint/no-extra-semi
	;(async () => {
		const generator = waku.store.queryGenerator(decoders, {
			pageDirection: PageDirection.BACKWARD,
			pageSize: 1,
		})

		for await (const messages of generator) {
			for (const message of messages) {
				if (await callback(message)) {
					return
				}
			}
		}

		onDone?.()
	})()

	if (watch) {
		return {
			unsubscribe: waku.filter.subscribe(decoders, wrapFilterCallback(callback), options),
		}
	}
}

export type DecodeStoreCallback<Data, Msg extends Message> = { data: Data; message: Msg }

export const decodeStore = <Data, Msg extends Message>(
	decodeMessage: (message: WithPayload<Msg>) => Data | false | Promise<Data | false>,
	callback: (data: Data, message: Msg) => void,
	onlyGetLast = false,
) => {
	return async (msg: Promise<Msg | undefined>) => {
		const message = (await msg) as WithPayload<Msg>
		if (!message?.payload) {
			return false
		}

		const data = await decodeMessage(message)
		if (data) {
			callback(data, message)
			return onlyGetLast
		}

		return false
	}
}

export const subscribeToWakuTopic = async <Msg extends Message>(
	waku: WakuLight,
	decoders: Decoder<Msg>[],
	callback: (message: Promise<Msg | undefined>) => Promise<boolean>,
	onError?: (error: string) => void,
	onDone?: () => void,
	watch = true,
) => {
	let cancelled = false
	const storeCallback = async (msg: Promise<Msg | undefined>) => {
		return cancelled ? true : await callback(msg)
	}

	waku.store
		.queryCallbackOnPromise(decoders, storeCallback)
		.catch((error) => !cancelled && onError?.(error))
		.finally(() => !cancelled && onDone?.())

	let unsubscribe: UnsubscribeFunction | undefined
	if (watch) {
		unsubscribe = await waku.filter.subscribe(decoders, wrapFilterCallback(storeCallback))
	}

	return async () => {
		cancelled = true
		await unsubscribe?.()
	}
}

export const subscribeCombineCallback = <Data, Msg extends Message>(
	fn: (result?: DecodeStoreCallback<Data, Msg>) => void,
) => {
	return (data: Data, message: Msg) => fn({ data, message })
}
