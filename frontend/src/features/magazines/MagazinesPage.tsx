import { PlaceholderPage } from '../../shared/components/common/PlaceholderPage'
import { BookOpen } from 'lucide-react'

export function MagazinesPage() {
  return (
    <PlaceholderPage
      title="Magazines"
      description="Manage your magazine subscriptions and keep track of issues you've read."
      icon={<BookOpen className="w-16 h-16 text-warning" />}
    />
  )
}
