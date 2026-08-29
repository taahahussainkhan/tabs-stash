import { useProfilePageController } from './hooks/useProfilePageController'
import { ProfileView } from './ProfileView'

export function ProfilePage() {
  const controller = useProfilePageController()
  return <ProfileView {...controller} />
}
