import {
	PUBLIC_PROVIDER,
	PUBLIC_GLOBAL_ANONYMOUS_FEED_ADDRESS,
	PUBLIC_ADAPTER,
} from '$env/static/public'

export const GLOBAL_ANONYMOUS_FEED_ADDRESS = PUBLIC_GLOBAL_ANONYMOUS_FEED_ADDRESS
export const PROVIDER = PUBLIC_PROVIDER
export const ADAPTER = PUBLIC_ADAPTER

export const CREATE_PERSONA_GO_PRICE = 10
export const NEW_POST_REP_PRICE = 5
export const NEW_POST_GO_PRICE = 5

export const MAX_DIMENSIONS = {
	PICTURE: {
		width: 500,
		height: 500,
	},
	COVER: {
		width: 1440,
		height: 810,
	},
	POST_IMAGE: {
		width: 500,
		height: 500,
	},
}
