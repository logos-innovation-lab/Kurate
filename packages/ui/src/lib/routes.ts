export const ROUTES = {
	HOME: '/',
	PROFILE: '/profile',
	PERSONA: (slug: string) => `/persona/${slug}`,
	POST_NEW: (slug: string) => `/persona/${slug}/post/new`,
}
