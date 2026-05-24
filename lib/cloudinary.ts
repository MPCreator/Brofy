import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary if environment variables are provided
const isCloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
)

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
}

/**
 * Uploads an image to Cloudinary or emulates it locally using base64.
 * @param fileData Base64 string or buffer/file data.
 * @param folder Cloudinary folder name.
 */
export async function uploadImage(fileData: string, folder: string = 'brofy'): Promise<string> {
    if (!fileData) {
        throw new Error('No se proporcionó información de archivo.')
    }

    // Dual-mode logic
    if (isCloudinaryConfigured) {
        try {
            // Upload to actual Cloudinary
            const result = await cloudinary.uploader.upload(fileData, {
                folder: `brofy/${folder}`,
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto' },
                ]
            })
            return result.secure_url
        } catch (error) {
            console.error('Error al subir a Cloudinary:', error)
            throw new Error('Fallo al subir imagen al servidor de Cloudinary.')
        }
    } else {
        // Fallback local emulation: We return the base64 data URL directly so the browser renders it perfectly!
        console.warn(
            '⚠️ CLOUDINARY NO CONFIGURADO en .env. Usando emulador local (Base64 URL).'
        )
        // Ensure it's a valid data URL
        if (fileData.startsWith('data:image/')) {
            return fileData
        }
        // If it's already a URL, return it
        if (fileData.startsWith('http://') || fileData.startsWith('https://')) {
            return fileData
        }
        return `data:image/jpeg;base64,${fileData}`
    }
}
