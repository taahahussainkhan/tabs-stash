export interface Store {
  id: number
  name: string
  type: string
  created_at: string
}

export interface StoreCreate {
  name: string
  type: string
}
