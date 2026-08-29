import { lazy, type ComponentType } from 'react'

// Lazy loaded components
const LoginPage = lazy(() => import('../features/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const SignUpPage = lazy(() => import('../features/auth/SignUpPage').then(m => ({ default: m.SignUpPage })))
const HomePage = lazy(() => import('../features/home/HomePage').then(m => ({ default: m.HomePage })))
const SettingsPage = lazy(() => import('../features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })))
const ProfilePage = lazy(() => import('../features/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))
const MoviesPage = lazy(() => import('../features/movies/MoviesPage').then(m => ({ default: m.MoviesPage })))
const MovieDetailPage = lazy(() => import('../features/movies/MovieDetailPage').then(m => ({ default: m.MovieDetailPage })))
const SeriesPage = lazy(() => import('../features/series/SeriesPage').then(m => ({ default: m.SeriesPage })))
const SeriesDetailPage = lazy(() => import('../features/series/SeriesDetailPage').then(m => ({ default: m.SeriesDetailPage })))
const DocumentariesPage = lazy(() => import('../features/documentaries/DocumentariesPage').then(m => ({ default: m.DocumentariesPage })))
const BooksPage = lazy(() => import('../features/books/BooksPage').then(m => ({ default: m.BooksPage })))
const BookDetailPage = lazy(() => import('../features/books/BookDetailPage').then(m => ({ default: m.BookDetailPage })))
const AuthorsPage = lazy(() => import('../features/authors/AuthorsPage').then(m => ({ default: m.AuthorsPage })))
const AuthorProfilePage = lazy(() => import('../features/authors/pages/AuthorProfilePage').then(m => ({ default: m.AuthorProfilePage })))
const GenresPage = lazy(() => import('../features/genres/GenresPage').then(m => ({ default: m.GenresPage })))
const PublishersPage = lazy(() => import('../features/publishers/PublishersPage').then(m => ({ default: m.PublishersPage })))
const MagazinesPage = lazy(() => import('../features/magazines/MagazinesPage').then(m => ({ default: m.MagazinesPage })))
const TabsPage = lazy(() => import('../features/tabs/TabsPage').then(m => ({ default: m.TabsPage })))

// Route configuration type
export interface RouteConfig {
    path: string
    component: ComponentType
    protected?: boolean
    layout?: boolean
}

// Define all routes in a clean, maintainable structure
export const routes: RouteConfig[] = [
    // Public routes
    { path: '/auth/login', component: LoginPage },
    { path: '/auth/signup', component: SignUpPage },

    // Protected routes with layout
    { path: '/', component: HomePage, protected: true, layout: true },
    { path: '/settings', component: SettingsPage, protected: true, layout: true },
    { path: '/profile', component: ProfilePage, protected: true, layout: true },

    // Tab Stash / Tab Vault
    { path: '/tabs', component: TabsPage, protected: true, layout: true },

    // Movies routes
    { path: '/movies', component: MoviesPage, protected: true, layout: true },
    { path: '/movies/:movieId', component: MovieDetailPage, protected: true, layout: true },
    { path: '/movies/recently-watched', component: MoviesPage, protected: true, layout: true },
    { path: '/movies/favorites', component: MoviesPage, protected: true, layout: true },
    { path: '/movies/watchlist', component: MoviesPage, protected: true, layout: true },

    // Series routes
    { path: '/series', component: SeriesPage, protected: true, layout: true },
    { path: '/series/:seriesId', component: SeriesDetailPage, protected: true, layout: true },
    { path: '/series/watching', component: SeriesPage, protected: true, layout: true },
    { path: '/series/completed', component: SeriesPage, protected: true, layout: true },
    { path: '/series/watchlist', component: SeriesPage, protected: true, layout: true },

    // Documentaries routes
    { path: '/documentaries', component: DocumentariesPage, protected: true, layout: true },
    { path: '/documentaries/watched', component: DocumentariesPage, protected: true, layout: true },
    { path: '/documentaries/watchlist', component: DocumentariesPage, protected: true, layout: true },

    // Books routes
    { path: '/books', component: BooksPage, protected: true, layout: true },
    { path: '/books/:bookId', component: BookDetailPage, protected: true, layout: true },
    { path: '/books/reading', component: BooksPage, protected: true, layout: true },
    { path: '/books/completed', component: BooksPage, protected: true, layout: true },
    { path: '/books/wishlist', component: BooksPage, protected: true, layout: true },
    { path: '/authors', component: AuthorsPage, protected: true, layout: true },
    { path: '/authors/:authorId', component: AuthorProfilePage, protected: true, layout: true },
    { path: '/genres', component: GenresPage, protected: true, layout: true },
    { path: '/publishers', component: PublishersPage, protected: true, layout: true },

    // Magazines routes
    { path: '/magazines', component: MagazinesPage, protected: true, layout: true },
    { path: '/magazines/subscriptions', component: MagazinesPage, protected: true, layout: true },
    { path: '/magazines/archive', component: MagazinesPage, protected: true, layout: true },
]
