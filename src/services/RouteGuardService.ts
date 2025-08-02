import { User, RouteGuardResult } from '../types/auth';

export class RouteGuardService {
  private static instance: RouteGuardService;

  private constructor() {}

  public static getInstance(): RouteGuardService {
    if (!RouteGuardService.instance) {
      RouteGuardService.instance = new RouteGuardService();
    }
    return RouteGuardService.instance;
  }

  /**
   * Check if user can access a protected route
   */
  canAccessProtectedRoute(user: User | null, path: string): RouteGuardResult {
    console.log('RouteGuardService: Checking access for path:', path, 'User:', user?.id || 'No user');

    // Define protected routes
    const protectedRoutes = [
      '/dashboard',
      '/quiz/new',
      '/quiz/:id/edit',
      '/quiz/:id/results',
      '/quiz/:id/customize',
      '/quiz/:id/preview',
      '/settings'
    ];

    // Check if route is protected
    const isProtected = protectedRoutes.some(route => {
      if (route.includes(':id')) {
        const pattern = route.replace(':id', '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(path);
      }
      return path === route || path.startsWith(route);
    });

    if (!isProtected) {
      console.log('RouteGuardService: Route is public, access allowed');
      return { allowed: true };
    }

    if (!user) {
      console.log('RouteGuardService: Protected route requires authentication');
      return {
        allowed: false,
        redirectTo: '/login',
        reason: 'Authentication required'
      };
    }

    console.log('RouteGuardService: User authenticated, access allowed');
    return { allowed: true };
  }

  /**
   * Check if user can access owner-only routes
   */
  canAccessOwnerRoute(user: User | null, resourceOwnerId: string): RouteGuardResult {
    if (!user) {
      return {
        allowed: false,
        redirectTo: '/login',
        reason: 'Authentication required'
      };
    }

    if (user.id !== resourceOwnerId) {
      return {
        allowed: false,
        redirectTo: '/dashboard',
        reason: 'Access denied - not resource owner'
      };
    }

    return { allowed: true };
  }

  /**
   * Check if authenticated user should be redirected from auth pages
   */
  shouldRedirectFromAuthPages(user: User | null, path: string): RouteGuardResult {
    const authPages = ['/login', '/signup'];
    
    if (authPages.includes(path) && user) {
      console.log('RouteGuardService: Authenticated user on auth page, redirecting to dashboard');
      return {
        allowed: false,
        redirectTo: '/dashboard',
        reason: 'Already authenticated'
      };
    }

    return { allowed: true };
  }

  /**
   * Get redirect path based on user state and intended destination
   */
  getRedirectPath(user: User | null, intendedPath: string): string {
    // If user is authenticated and trying to access auth pages
    if (user && ['/login', '/signup'].includes(intendedPath)) {
      return '/dashboard';
    }

    // If user is not authenticated and trying to access protected routes
    if (!user && this.canAccessProtectedRoute(user, intendedPath).redirectTo) {
      return '/login';
    }

    // Default to intended path
    return intendedPath;
  }
}