import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Brofy Mascotas',
        short_name: 'Brofy',
        description: 'Todo lo que tu mascota necesita, en un solo lugar.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#078EAD',
        icons: [
            {
                src: '/brofy1.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/brofy1.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            }
        ]
    }
}
