export const ROUTES = {
	HOME: '/',
	PROFILE: '/profile',
	PROFILE_ADDRESS: (address: string) => `/profile/${address}`,
	IDENTITY: '/identity',
	IDENTITY_NEW: '/identity/new',
	POST_NEW: '/post/new',
}
