import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

import { users } from '$lib/stores/user'

export const load: PageLoad = async ({ params }) => {
	if (!/0x[a-z0-9]{40}/i.test(params.address)) {
		throw error(404, `Incorrect user address format ${params.address}`)
	}
	const user = await users.find(params.address)

	if (!user) throw error(404, `Could not find user with address ${params.address}`)

	return user
}
