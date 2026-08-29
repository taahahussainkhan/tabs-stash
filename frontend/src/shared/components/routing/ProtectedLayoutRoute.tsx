import { type ComponentType, type ReactElement } from 'react'
import { ProtectedRoute } from '../../../features/auth/components/ProtectedRoute'
import { MainLayout } from '../layout/MainLayout'

interface ProtectedLayoutRouteProps {
    component: ComponentType
}

export const ProtectedLayoutRoute = ({ component: Component }: ProtectedLayoutRouteProps): ReactElement => (
    <ProtectedRoute>
        <MainLayout>
            <Component />
        </MainLayout>
    </ProtectedRoute>
)
