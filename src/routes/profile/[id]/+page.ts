import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = ({ params }) => {
	if (/0x[a-z0-9]{40}/i.test(params.id))
		return {
			id: params.id,
		}

	throw error(404, `Incorrect user id format ${params.id}`)
}
