# Authentication System Documentation

## Architecture Overview

This authentication system follows **MVVM (Model-View-ViewModel)** architecture with clean separation of concerns:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Components │◄──►│   AuthViewModel  │◄──►│  AuthService    │
│   (React)       │    │   (State Mgmt)   │    │  (Supabase)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ RouteGuardService│
                       │  (Route Logic)   │
                       └──────────────────┘
```

## Core Components

### 1. AuthService (`src/services/AuthService.ts`)
**Responsibility**: Direct communication with Supabase Auth API
- `signIn()` - Email/password authentication
- `signUp()` - User registration
- `signOut()` - User logout
- `getCurrentSession()` - Session management
- `onAuthStateChange()` - Auth state monitoring

### 2. AuthViewModel (`src/viewmodels/AuthViewModel.ts`)
**Responsibility**: Business logic and state management
- Manages authentication state
- Handles loading states and errors
- Coordinates between service and UI
- Implements observer pattern for state updates

### 3. RouteGuardService (`src/services/RouteGuardService.ts`)
**Responsibility**: Route protection logic
- `canAccessProtectedRoute()` - Check route permissions
- `canAccessOwnerRoute()` - Owner-only route validation
- `shouldRedirectFromAuthPages()` - Auth page redirects

### 4. AuthContext (`src/contexts/AuthContext.tsx`)
**Responsibility**: React integration layer
- Provides auth state to components
- Exposes ViewModel methods to UI
- Manages ViewModel lifecycle

## Route Flow Implementation

### Login Flow (`/login`)
```typescript
1. User submits form
2. LoginPage calls authViewModel.signIn()
3. AuthViewModel calls authService.signIn()
4. Success: Navigate to /dashboard
5. Failure: Display error message
```

### Signup Flow (`/signup`)
```typescript
1. User submits form
2. SignupPage calls authViewModel.signUp()
3. AuthViewModel calls authService.signUp()
4. Success: Navigate to /login with success message
5. Failure: Display error message
```

### Route Protection
```typescript
1. ProtectedRoute checks canAccessRoute()
2. RouteGuardService evaluates permissions
3. Allowed: Render component
4. Denied: Redirect to appropriate page
```

## Complete Route Map

| Route | Access | Redirect Logic |
|-------|--------|----------------|
| `/login` | Public | → `/dashboard` if authenticated |
| `/signup` | Public | → `/dashboard` if authenticated |
| `/dashboard` | Protected | → `/login` if unauthenticated |
| `/quiz/new` | Protected | → `/login` if unauthenticated |
| `/quiz/:id/edit` | Owner Only | → `/login` if unauthenticated, → `/dashboard` if not owner |
| `/quiz/:id/results` | Owner Only | → `/login` if unauthenticated, → `/dashboard` if not owner |
| `/play/:slug` | Public | No redirect |
| `/play/demo` | Public | No redirect |
| `/settings` | Protected | → `/login` if unauthenticated |

## State Management

### AuthState Interface
```typescript
interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}
```

### State Flow
```
1. App starts → loading: true, initialized: false
2. Auth initializes → Check session
3. Session found → Load user profile → initialized: true, loading: false
4. No session → initialized: true, loading: false, user: null
```

## Error Handling

### Error Types
- **Authentication Errors**: Invalid credentials, email not confirmed
- **Network Errors**: Connection issues, timeouts
- **Validation Errors**: Invalid email format, weak password
- **Authorization Errors**: Access denied, insufficient permissions

### Error Flow
```typescript
1. Service catches Supabase error
2. Maps to user-friendly message
3. ViewModel updates error state
4. UI displays error to user
5. User can retry or navigate away
```

## Usage Examples

### Using in Components
```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { state, signIn, signOut } = useAuth();
  
  if (state.loading) return <Loading />;
  if (state.error) return <Error message={state.error} />;
  
  return state.user ? <Dashboard /> : <Login />;
};
```

### Route Protection
```typescript
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### Custom Hooks
```typescript
import { useAuthGuard, useProtectedRoute } from '../hooks/useAuthGuard';

// Automatic route protection
const { isAuthenticated, isLoading } = useAuthGuard();

// Manual route protection
const { user } = useProtectedRoute();
```

## Security Considerations

### Row Level Security (RLS)
- All database operations respect RLS policies
- User profiles are automatically created via triggers
- Policies ensure users can only access their own data

### Session Management
- Sessions persist across browser refreshes
- Automatic session cleanup on logout
- Secure token storage via Supabase client

### Route Protection
- Server-side validation for all protected routes
- Client-side guards for better UX
- Owner-only access for sensitive resources

## Testing Strategy

### Unit Tests
- AuthService methods with mocked Supabase
- AuthViewModel state transitions
- RouteGuardService permission logic

### Integration Tests
- Complete auth flows (login/signup/logout)
- Route protection scenarios
- Error handling paths

### E2E Tests
- User registration and login flows
- Protected route access
- Session persistence across page reloads

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase RLS policies deployed
- [ ] Database triggers created
- [ ] Error tracking service integrated
- [ ] Route redirects tested in production
- [ ] Session persistence verified
- [ ] Error messages localized
- [ ] Performance monitoring enabled

## Troubleshooting

### Common Issues

**Stuck on loading screen**
- Check if AuthViewModel is properly initialized
- Verify Supabase client configuration
- Ensure auth state change listener is working

**Infinite redirect loops**
- Check route guard logic
- Verify authentication state is properly set
- Ensure protected routes are correctly configured

**User profile not created**
- Check database triggers
- Verify RLS policies
- Ensure user metadata is properly passed

### Debug Tools

```typescript
// Enable debug logging
localStorage.setItem('debug', 'auth:*');

// Check auth state
console.log('Auth State:', authViewModel.getState());

// Verify session
const { session } = await authService.getCurrentSession();
console.log('Current Session:', session);
```

This authentication system provides a robust, production-ready foundation with proper separation of concerns, comprehensive error handling, and secure route protection.