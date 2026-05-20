export const dynamic = 'force-dynamic'
import { getEstablishmentPublic, getEstablishmentReviews } from '@/lib/actions'
import { notFound } from 'next/navigation'
import EstablishmentClient from './EstablishmentClient'

export default async function EstablishmentPublicPage({
    params
}: {
    params: { id: string }
}) {
    const [est, reviews] = await Promise.all([
        getEstablishmentPublic(params.id),
        getEstablishmentReviews(params.id),
    ])
    if (!est) notFound()

    return <EstablishmentClient est={est} reviews={reviews} />
}
