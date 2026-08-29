import { useStoresPageController } from './hooks/useStoresPageController'
import { StoresView } from './StoresView'

export function StoresPage() {
  const controller = useStoresPageController()
  return <StoresView {...controller} />
}
