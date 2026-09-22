export interface Store {
  id: number | string
  public_id?: string
  name: string
  type: string
  website?: string | null
  physical_address?: string | null
  country?: string | null
  notes?: string | null
  created_at: string
}

export interface StoreCreate {
  name: string
  type: string
  website?: string | null
  physical_address?: string | null
  country?: string | null
  notes?: string | null
}
