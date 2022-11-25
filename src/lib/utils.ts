export function formatAddress(address: string) {
	return `${address.substring(0, 6)}…${address.substring(address.length - 5)}`
}

export function formatDateFromNow(timestamp: number) {
	const delta = Math.round((Date.now() - timestamp) / 1000)

	const minute = 60
	const hour = minute * 60
	const day = hour * 24
	const week = day * 7
	const month = day * 30
	const year = day * 365

	if (delta < minute) return `${Math.round(delta)}s`
	else if (delta < hour) return `${Math.round(delta / minute)}m`
	else if (delta < day) return `${Math.round(delta / hour)}h`
	else if (delta < week) return `${Math.round(delta / day)}d`
	else if (delta < month) return `${Math.round(delta / week)}w`
	else if (delta < year) return `${Math.round(delta / month)}m`
	return `${Math.round(delta / year)}y`
}
