export const ROUTES = {
	HOME: '/',
	PROFILE: '/profile',
	PERSONA: (slug: string) => `/persona/${slug}`,
	PERSONA_NEW: '/persona/new',
	PERSONA_DRAFT: (id: string) => `/persona/draft/${id}`,
	POST_NEW: (slug: string) => `/persona/${slug}/post/new`,
}
