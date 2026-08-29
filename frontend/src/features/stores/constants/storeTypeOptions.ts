import type { SelectOption } from '../../../shared/types/selectOption'

export const storeTypeValues = ['OnlineOnly', 'PhysicalOnly', 'Hybrid'] as const
export type StoreType = (typeof storeTypeValues)[number]

export const storeTypeOptions: SelectOption[] = [
  { value: 'OnlineOnly', label: 'Online Only' },
  { value: 'PhysicalOnly', label: 'Physical Only' },
  { value: 'Hybrid', label: 'Hybrid (Both Online & Physical)' },
]
