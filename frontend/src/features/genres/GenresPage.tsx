import { useGenresPageController } from './hooks/useGenresPageController'
import { GenresView } from './GenresView'

export function GenresPage() {
    const controller = useGenresPageController()
    return <GenresView {...controller} />
}
