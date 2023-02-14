interface Dimensions {
	width: number
	height: number
}

/**
 * Get the dimensions of the image after resize
 *
 * @param imgWidth  Current image width
 * @param imgHeight Current image height
 * @param maxWidth  Desired max width
 * @param maxHeight Desired max height
 *
 * @returns Downscaled dimensions of the image to fit in the bounding box
 */
export function getResizeDimensions(
	imgWidth: number,
	imgHeight: number,
	maxWidth?: number,
	maxHeight?: number,
): Dimensions {
	const ratioWidth = maxWidth ? imgWidth / maxWidth : 1
	const ratioHeight = maxHeight ? imgHeight / maxHeight : 1

	const ratio = Math.max(ratioWidth, ratioHeight)

	// No need to resize
	if (ratio <= 1) return { width: imgWidth, height: imgHeight }

	return { width: imgWidth / ratio, height: imgHeight / ratio }
}

const allowedTypes = [
	'image/bmp',
	'image/gif',
	'image/vnd.microsoft.icon',
	'image/jpeg',
	'image/png',
	'image/svg+xml',
	'image/tiff',
	'image/webp',
]

export function assertIsSupported(file: File) {
	if (!file.size || !file.type || !allowedTypes.includes(file.type))
		throw new Error('File not supported!')
}

/**
 * Resize image passed to fit in the bounding box defined with maxWidth and maxHeight.
 * Note that one or both of the bounding box dimensions may be omitted
 *
 * @param file      Image file to be resized
 * @param maxWidth  Maximal image width
 * @param maxHeight Maximal image height
 *
 * @returns Promise that resolves into the resized image as base64 string
 */
export function resize(file: File, maxWidth?: number, maxHeight?: number): Promise<string> {
	return new Promise((resolve, reject) => {
		assertIsSupported(file)

		try {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = (event) => {
				const src = event?.target?.result

				if (!src || typeof src !== 'string') throw new Error('Failed to load the image source')

				const img = new Image()
				img.src = src
				img.onload = () => {
					const dimensions = getResizeDimensions(img.width, img.height, maxWidth, maxHeight)
					const elem = document.createElement('canvas')
					elem.width = dimensions.width
					elem.height = dimensions.height
					const ctx = elem.getContext('2d')

					if (!ctx) throw new Error('Failed to create canvas context')

					ctx.drawImage(img, 0, 0, elem.width, elem.height)
					resolve(ctx.canvas.toDataURL())
				}
			}
			reader.onerror = (error) => reject(error)
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Resize image passed to fit in the bounding box defined with maxWidth and maxHeight.
 * Note that one or both of the bounding box dimensions may be omitted
 *
 * @param file   Image file to be resized
 * @param width  Desired image width
 * @param height Desired image height
 *
 * @returns Promise that resolves into the clipped and resized image as base64 string
 */
export function clipAndResize(file: File, width?: number, height?: number): Promise<string> {
	return new Promise((resolve, reject) => {
		assertIsSupported(file)

		try {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = (event) => {
				const src = event?.target?.result

				if (!src || typeof src !== 'string') throw new Error('Failed to load the image source')

				const img = new Image()
				img.src = src
				img.onload = () => {
					const dimensions = getResizeDimensions(img.width, img.height, width, height)
					const elem = document.createElement('canvas')
					elem.width = dimensions.width
					elem.height = dimensions.height
					const ctx = elem.getContext('2d')

					if (!ctx) throw new Error('Failed to create canvas context')

					ctx.drawImage(img, 0, 0, elem.width, elem.height)
					resolve(ctx.canvas.toDataURL())
				}
			}
			reader.onerror = (error) => reject(error)
		} catch (error) {
			reject(error)
		}
	})
}
