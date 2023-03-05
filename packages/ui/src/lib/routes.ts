export const ROUTES = {
	HOME: '/',
	PROFILE: '/profile',
	PERSONA: (slug: string) => `/persona/${slug}`,
	PERSONA_NEW: '/persona/new',
	PERSONA_POST: (id: string | number, postId: string | number) => `/persona/${id}/post/${postId}`,
	PERSONA_DRAFT: (id: string | number) => `/persona/draft/${id}`,
	POST_NEW: (slug: string) => `/persona/${slug}/post/new`,
}
