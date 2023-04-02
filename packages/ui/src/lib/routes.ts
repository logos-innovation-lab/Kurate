export const ROUTES = {
	HOME: '/',
	PROFILE: '/profile',
	PERSONA: (slug: string) => `/persona/${slug}`,
	PERSONA_PENDING: (slug: string) => `/persona/${slug}/pending`,
	PERSONA_NEW: '/persona/new',
	PERSONA_POST: (id: string, postId: string) => `/persona/${id}/post/${postId}`,
	PERSONA_PENDING_POST: (id: string, postId: string) => `/persona/${id}/pending/${postId}`,
	PERSONA_DRAFT: (id: string | number) => `/persona/draft/${id}`,
	POST_NEW: (slug: string) => `/persona/${slug}/post/new`,
	CHATS: '/chat',
	CHAT: (id: string | number) => `/chat/${id}`,
	CHAT_NEW: '/chat/new',
}
