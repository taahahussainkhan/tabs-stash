
import { usePublishersPageController } from './hooks/usePublishersPageController'
import { PublishersView } from './PublishersView'

export function PublishersPage() {
    const controller = usePublishersPageController()
    return <PublishersView {...controller} />
}
