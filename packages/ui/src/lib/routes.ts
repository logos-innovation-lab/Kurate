export const ROUTES = {
	HOME: '/',
	PROFILE: '/profile',
	PERSONA: (slug: string) => `/persona/${slug}`,
	PERSONA_DRAFT: (id: string | number) => `/persona/draft/${id}`,
	POST_NEW: (slug: string) => `/persona/${slug}/post/new`,
}
