import {
	PUBLIC_PROVIDER,
	PUBLIC_GROUP_ID,
	PUBLIC_GLOBAL_ANONYMOUS_FEED_ADDRESS,
} from '$env/static/public'

export const GLOBAL_ANONYMOUS_FEED_ADDRESS = PUBLIC_GLOBAL_ANONYMOUS_FEED_ADDRESS
export const GROUP_ID = PUBLIC_GROUP_ID
export const PROVIDER = PUBLIC_PROVIDER

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
