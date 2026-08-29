import { useAuthorsPageController } from './hooks/useAuthorsPageController'
import { AuthorsView } from './AuthorsView'

export function AuthorsPage() {
    const controller = useAuthorsPageController()
    return <AuthorsView {...controller} />
}
