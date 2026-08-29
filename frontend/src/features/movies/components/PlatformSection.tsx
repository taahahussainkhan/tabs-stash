import { Select } from '../../../shared/components/common/form/Select'
import { platformOptions } from '../../../shared/constants/platformOptions'

interface PlatformSectionProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function PlatformSection({ value, onChange, error }: PlatformSectionProps) {
  return (
    <div className="space-y-4">
      <Select
        label="Watching Platform"
        labelSize="sm"
        size="md"
        rounded="lg"
        placeholder="Select a platform..."
        error={error}
                options={platformOptions}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
