import { getEstablishmentPublic, getEstablishmentReviews } from '@/lib/actions'
import { notFound } from 'next/navigation'
import EstablishmentClient from './EstablishmentClient'
import { getSession } from '@/lib/auth'

export default async function EstablishmentPublicPage({
    params
}: {
    params: { id: string }
}) {
    const est = await getEstablishmentPublic(params.id)
    const reviews = await getEstablishmentReviews(params.id)
    const session = await getSession()
    if (!est) notFound()

    return <EstablishmentClient est={est} reviews={reviews} session={session} />
}
