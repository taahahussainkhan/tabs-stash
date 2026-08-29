import { Textarea } from '../../../shared/components/common/form/Textarea'

interface AdditionalInfoSectionProps {
  notes: string
  onChangeNotes: (value: string) => void
  error?: string
}

export function AdditionalInfoSection({ notes, onChangeNotes, error }: AdditionalInfoSectionProps) {
  return (
    <div className="space-y-4">
      {/* Notes */}
      <Textarea
        label="Notes"
        labelSize="sm"
        size="md"
        rounded="lg"
        placeholder="Your thoughts about the movie..."
        error={error}
                rows={4}
        value={notes}
        onChange={(e) => onChangeNotes(e.target.value)}
      />
    </div>
  )
}
