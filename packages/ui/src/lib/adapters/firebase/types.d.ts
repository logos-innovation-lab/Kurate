interface DBPersona {
	cover: string
	description: string
	minReputation: ReputationOptions
	name: string
	participants: string[]
	postsCount: number
	picture: string
	pitch: string
	postsCount: string
	timestamp: number
}

interface DBPost {
	images: string[]
	text: string
	timestamp: number
	address: string
}

interface DBPostPending extends DBPost {
	demote: string[]
	promote: string[]
}

interface DBChatMessage {
	address: string
	text: string
	timestamp: number
}

interface DBChat {
	messages: DBChatMessage[]
	personaId: string
	post: DBPost & { postId: string }
	users: string[]
}

type DBTransaction = TransactionRecord
