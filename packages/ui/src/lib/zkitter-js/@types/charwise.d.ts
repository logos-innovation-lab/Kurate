declare module 'charwise' {
	type stringWithHex = string & {
		toString: (encoding?: 'hex') => string
	}
	export function encode(data: string | number): stringWithHex
}
