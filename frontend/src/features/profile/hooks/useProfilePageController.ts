import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../../app/api'
import { usePasswordChangeModal } from './usePasswordChangeModal'

interface UserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_of_birth?: string
  phone_number?: string
  profile_image?: string
  created_at: string
  updated_at: string
  last_password_update?: string
}

export function useProfilePageController() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { openPasswordChangeModal } = usePasswordChangeModal()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const [hasPersonalChanges, setHasPersonalChanges] = useState(false)

  const loadProfile = useCallback(async () => {
    try {
      const response = await api.get<UserProfile>('/users/profile')
      const data = response.data

      setProfile(data)
      setFirstName(data.first_name || '')
      setLastName(data.last_name || '')
      setDateOfBirth(data.date_of_birth || '')
      setPhoneNumber(data.phone_number || '')

    } catch (error: any) {
      console.error('Profile load error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error'
      toast.error(`Failed to load profile: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const handlePersonalInfoChange = useCallback(() => {
    setHasPersonalChanges(true)
  }, [])

  const handleSavePersonalInfo = useCallback(async () => {
    if (!hasPersonalChanges) return

    try {
      setSaving(true)

      await api.put('/users/profile', {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth || null,
        phone_number: phoneNumber || null
      })

      await loadProfile()
      setHasPersonalChanges(false)
      toast.success('Personal information updated successfully!')

    } catch (error: any) {
      console.error('Save personal info error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error'
      toast.error(`Failed to save personal information: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }, [dateOfBirth, firstName, hasPersonalChanges, lastName, loadProfile, phoneNumber])

  return {
    profile,
    loading,
    saving,
    firstName,
    lastName,
    dateOfBirth,
    phoneNumber,
    hasPersonalChanges,
    setFirstName,
    setLastName,
    setDateOfBirth,
    setPhoneNumber,
    handlePersonalInfoChange,
    openPasswordChangeModal,
    handleSavePersonalInfo,
  }
}

export type ProfilePageController = ReturnType<typeof useProfilePageController>
