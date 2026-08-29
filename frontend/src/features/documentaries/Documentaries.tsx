import { PlaceholderPage } from '../../shared/components/common/PlaceholderPage'
import { FileText } from 'lucide-react'

export function DocumentariesPage() {
  return (
    <PlaceholderPage
      title="Documentaries"
      description="Keep track of documentaries you've watched and want to watch."
      icon={<FileText className="w-16 h-16 text-info" />}
    />
  )
}
