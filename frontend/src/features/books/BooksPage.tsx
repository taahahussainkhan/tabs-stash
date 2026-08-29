import { useBooksPageController } from './hooks/useBooksPageController'
import { BooksView } from './BooksView'

export function BooksPage() {
  const controller = useBooksPageController()
  return <BooksView {...controller} />
}
