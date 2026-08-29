import { Select } from '../../../shared/components/common/form/Select'
import { DateTimeInput } from '../../../shared/components/common/form/DateTimeInput'
import { watchStatusOptions } from '../../../shared/constants/watchStatus'

interface StatusSectionProps {
  status: 'watching' | 'completed' | 'paused' | 'rewatching'
  startDate: string
  endDate: string
  onChangeStatus: (value: StatusSectionProps['status']) => void
  onChangeStartDate: (value: string) => void
  onChangeEndDate: (value: string) => void
  errors?: {
    status?: string
    start_date?: string
    end_date?: string
  }
}

export function StatusSection({ status, startDate, endDate, onChangeStatus, onChangeStartDate, onChangeEndDate, errors }: StatusSectionProps) {
  const isCompleted = status === 'completed'

  return (
    <div className="space-y-4">
      {/* Status */}
      <Select
        label="Status"
        labelSize="sm"
        size="sm"
        error={errors?.status}
                options={watchStatusOptions}
        value={status}
        onChange={(e) => onChangeStatus(e.target.value as StatusSectionProps['status'])}
      />

      {/* Dates and times (single datetime-local inputs) */}
      <div className="space-y-4">
        {/* Start Date & Time */}
        <DateTimeInput
          label="Start Date & Time *"
          labelSize="sm"
          size="sm"
          error={errors?.start_date}
                    value={startDate}
          onChange={(e) => onChangeStartDate(e.target.value)}
        />

        {/* End Date & Time only when completed */}
        {isCompleted && (
          <DateTimeInput
            label="End Date & Time"
            labelSize="sm"
            size="sm"
            error={errors?.end_date}
                        value={endDate}
            onChange={(e) => onChangeEndDate(e.target.value)}
          />
        )}
      </div>
    </div>
  )
}
