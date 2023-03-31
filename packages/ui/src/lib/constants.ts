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
export const NEW_POST_REP_WIN = 5
export const NEW_POST_REP_LOSS = 5
export const VOTE_GO_PRICE = 1
export const VOTE_REP_WIN = 1
export const DEFAULT_GO_AMOUNT = 30

export const MAX_DIMENSIONS = {
	PERSONA_PICTURE: {
		width: 500,
		height: 500,
	},
	PERSONA_COVER: {
		width: 1440,
		height: 810,
	},
	POST_PICTURE: {
		width: 900,
		height: 900,
	},
}
