export const ROUTES = {
	HOME: '/',
	PROFILE: '/profile',
	PERSONA: (slug: string, draft = false) => `/persona/${slug}${draft ? '?draft' : ''}`,
	PERSONA_NEW: '/persona/new',
	POST_NEW: (slug: string) => `/persona/${slug}/post/new`,
}
