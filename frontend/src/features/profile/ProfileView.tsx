import { Input } from '../../shared/components/common/form/Input'
import { User, Shield, Save, Key, Mail, Calendar, Phone, Clock } from 'lucide-react'
import type { ProfilePageController } from './hooks/useProfilePageController'
import { formatDate } from '../../shared/utils/date'

export function ProfileView(props: ProfilePageController) {
  const {
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
  } = props

  if (loading) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2e323c] border-t-accent-vermillion rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-mono text-content-muted uppercase tracking-wider">Loading Profile Identity...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-20 bg-[#1e2026] border border-[#2e323c] rounded-[6px] max-w-md mx-auto p-6">
        <h2 className="text-base font-bold text-danger mb-2">Profile Unavailable</h2>
        <p className="text-xs text-content-secondary">Unable to retrieve account details.</p>
      </div>
    )
  }

  const initials = `${firstName?.[0] || profile.username?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 page-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-[#2e323c]">
        <div className="flex items-center gap-2 mb-1.5 font-mono">
          <span className="mono-badge mono-badge-cyan">ACCOUNT</span>
          <span className="text-[11px] text-content-muted uppercase tracking-wider">Personal Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">Account Identity</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#1e2026] p-5 rounded-[6px] border border-[#2e323c] flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-[6px] bg-[#121316] border-2 border-accent-vermillion flex items-center justify-center mb-3">
              <span className="text-2xl font-mono font-bold text-accent-vermillion">{initials}</span>
            </div>
            <h2 className="text-base font-bold text-content-primary mb-0.5">{firstName} {lastName}</h2>
            <p className="text-xs font-mono text-accent-ochre font-bold mb-4">@{profile.username}</p>
            
            <div className="w-full space-y-2.5 pt-4 border-t border-[#242730] text-xs font-mono text-content-secondary">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 opacity-60 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 opacity-60 shrink-0" />
                <span>Joined {formatDate(profile.created_at, { month: 'short', year: 'numeric' }, 'en-US')}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e2026] p-4 rounded-[6px] border border-[#2e323c] space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-content-primary pb-2 border-b border-[#242730]">
              <Shield className="w-3.5 h-3.5 text-accent-cyan" />
              <span>SECURITY & ACCESS</span>
            </div>
            
            <div className="p-3 bg-[#15161a] border border-[#2e323c] rounded-[4px] space-y-2">
              <p className="text-[10px] font-mono text-content-muted uppercase">Password Status</p>
              <p className="text-xs font-mono text-content-secondary">
                {profile.last_password_update
                  ? `Updated ${formatDate(profile.last_password_update, { month: 'short', day: 'numeric', year: 'numeric' }, 'en-US')}`
                  : 'Never updated'}
              </p>
              <button
                onClick={openPasswordChangeModal}
                className="btn-secondary w-full py-1.5 text-xs flex items-center justify-center gap-1.5 mt-2"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Information Form */}
        <div className="lg:col-span-8">
          <div className="bg-[#1e2026] p-6 rounded-[6px] border border-[#2e323c] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#242730]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-accent-vermillion" />
                <h3 className="text-sm font-bold text-content-primary">Personal Archive Information</h3>
              </div>
              {hasPersonalChanges && (
                <span className="mono-badge mono-badge-ochre text-[9px]">Unsaved Changes</span>
              )}
            </div>

            <form onSubmit={handleSavePersonalInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value)
                    handlePersonalInfoChange()
                  }}
                />
                <Input
                  label="Last Name"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value)
                    handlePersonalInfoChange()
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value)
                    handlePersonalInfoChange()
                  }}
                  leftIcon={<Calendar className="w-3.5 h-3.5" />}
                />
                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value)
                    handlePersonalInfoChange()
                  }}
                  leftIcon={<Phone className="w-3.5 h-3.5" />}
                />
              </div>

              <div className="pt-4 border-t border-[#242730] flex justify-end">
                <button
                  type="submit"
                  disabled={!hasPersonalChanges || saving}
                  className="btn-primary px-5 py-2 text-xs flex items-center gap-2 disabled:opacity-40"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
