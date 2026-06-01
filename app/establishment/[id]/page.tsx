import { getEstablishmentPublic, getEstablishmentReviews } from '@/lib/actions'
import { notFound } from 'next/navigation'
import EstablishmentClient from './EstablishmentClient'
import { getSession } from '@/lib/auth'

export default async function EstablishmentPublicPage({
    params
}: {
    params: { id: string }
}) {
    const [est, reviews, session] = await Promise.all([
        getEstablishmentPublic(params.id),
        getEstablishmentReviews(params.id),
        getSession(),
    ])
    if (!est) notFound()

    return <EstablishmentClient est={est} reviews={reviews} session={session} />
}
