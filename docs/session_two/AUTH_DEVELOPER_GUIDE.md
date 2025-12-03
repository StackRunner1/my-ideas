# Authentication Developer Guide

**Version**: 1.1  
**Last Updated**: December 3, 2025  
**Implementation**: Session 2, Units 1-16

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Usage](#backend-usage)
3. [Frontend Usage](#frontend-usage)
4. [Token Lifecycle](#token-lifecycle)
5. [Common Patterns](#common-patterns)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Authentication Flow Summary

```
User Action → Frontend (Redux) → Backend API → Supabase Auth → Response
                ↓                      ↓
         Update UI State      Set httpOnly Cookies + Return accessToken
```

**Key Components:**

- **Backend**: FastAPI with Supabase Admin/User clients
- **Frontend**: React + Redux + Axios with auto-refresh
- **API Client**: Single `lib/apiClient.ts` with dual auth strategy (cookies + Authorization header)
- **State**: Redux auth slice (`isAuthenticated`, `expiresAt`)
- **Tokens**: httpOnly cookies (primary) + in-memory accessToken (fallback)
- **Session**: Restored on page load via `/auth/me`
- **Refresh**: Automatic (5 min before expiry + tab visibility)

### Critical File Structure

**⚠️ IMPORTANT**: Only ONE apiClient.ts file exists in the project:

- ✅ `frontend/src/lib/apiClient.ts` - The configured axios instance with auth
- ❌ DO NOT create `frontend/src/api/apiClient.ts` or any duplicate
- ✅ All imports use @ alias: `import apiClient from "@/lib/apiClient"`

**Why this matters**: Multiple apiClient files cause 401 errors because service files may import the wrong (unconfigured) instance.

### Dual Auth Strategy

**Implementation**: The frontend uses BOTH httpOnly cookies AND Authorization headers:

1. **httpOnly Cookies (Primary)**

   - Set by backend after login/signup/refresh
   - Automatically sent with every request (`withCredentials: true`)
   - Cannot be accessed by JavaScript (secure against XSS)
   - Backend reads from cookies first

2. **Authorization Header (Fallback)**
   - `accessToken` stored in memory via `setAuthToken()`
   - Added to request headers by axios interceptor
   - Provides backup authentication if cookies fail
   - Cleared on logout

**Why both?** Defense in depth - if cookies are blocked or fail, the Authorization header ensures requests still authenticate. Backend accepts either method.

**Implementation in authService:**

```typescript
// After successful login/signup
setAuthToken(response.accessToken); // Store in memory
// Cookies are automatically set by backend
```

### Agent-User Pattern

Every signup creates **two Supabase auth accounts**:

1. **User account**: Real user email/password (for app login)
2. **Agent account**: Generated credentials (for AI operations)

**Why?** Enables AI agents to perform actions on behalf of users with proper RLS enforcement.

---

## Backend Usage

### When to Use Admin vs User Client

**Use `get_admin_client()` when:**

- Creating new users (signup)
- Authenticating users (login)
- System-level operations that bypass RLS
- Reading/writing data that users shouldn't access directly

**Use `get_user_client(jwt)` when:**

- Fetching user-specific data
- Creating/updating records owned by the user
- Enforcing Row Level Security (RLS)
- Any operation that should respect user permissions

### Adding Protected Endpoints

**Example: Get user's ideas**

```python
from fastapi import APIRouter, Depends
from app.api.auth_utils import get_current_user
from app.db.supabase_client import get_user_client

router = APIRouter(prefix="/ideas", tags=["ideas"])

@router.get("/")
async def get_user_ideas(current_user: dict = Depends(get_current_user)):
    """
    Get ideas for the authenticated user.
    RLS enforced - user can only see their own ideas.
    """
    # Get user-scoped client (RLS enforced)
    user_client = get_user_client(current_user["token"])

    # Query with RLS - automatically filters by user
    response = user_client.table("ideas") \
        .select("*") \
        .order("created_at", desc=True) \
        .execute()

    return {"ideas": response.data}

@router.post("/")
async def create_idea(
    title: str,
    description: str = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new idea for the authenticated user.
    """
    user_client = get_user_client(current_user["token"])

    # Insert with RLS - automatically sets user_id
    response = user_client.table("ideas").insert({
        "title": title,
        "description": description,
        # user_id set automatically via RLS policy
    }).execute()

    return {"idea": response.data[0]}
```

**Key points:**

- Use `Depends(get_current_user)` to require authentication
- `get_current_user` automatically refreshes expired tokens
- Returns user dict with `id`, `email`, `token`
- Use `get_user_client(token)` for RLS-enforced operations

### Understanding Auto-Refresh

The `get_current_user()` dependency handles token refresh automatically:

```python
# In auth_utils.py
async def get_current_user(
    request: Request,
    response: Response
) -> dict:
    """
    Extract user from access_token cookie.
    Auto-refreshes if token expired (with 5-second cooldown).
    """
    # 1. Get token from cookie
    # 2. Verify with Supabase
    # 3. If expired, call refresh endpoint
    # 4. Set new cookies
    # 5. Return user data
```

**What this means:**

- Your endpoints don't need to handle refresh logic
- Users experience seamless API calls even with expired tokens
- 5-second cooldown prevents refresh spam

---

## Frontend Usage

### Protecting Routes

**Option 1: ProtectedRoute Component (Recommended)**

```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MyProtectedPage from "@/pages/MyProtectedPage";

// In routes/AppRoutes.tsx
<Route
  path="/my-page"
  element={
    <ProtectedRoute>
      <MyProtectedPage />
    </ProtectedRoute>
  }
/>;
```

**Option 2: useRequireAuth Hook**

```tsx
import { useRequireAuth } from "@/hooks/useRequireAuth";

function MyProtectedPage() {
  useRequireAuth(); // Redirects if not authenticated

  return <div>Protected content</div>;
}
```

### Accessing Current User

**Reading auth state:**

```tsx
import { useAppSelector } from "@/store/hooks";

function MyComponent() {
  const { isAuthenticated, expiresAt } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, authenticated user!</div>;
}
```

**Fetching user profile:**

```tsx
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserProfile } from "@/store/authSlice";

function ProfilePage() {
  const dispatch = useAppDispatch();
  const { betaAccess, siteBeta, loadingProfile } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (loadingProfile) return <div>Loading...</div>;

  return (
    <div>
      <p>Beta Access: {betaAccess ? "Yes" : "No"}</p>
      <p>Site Beta: {siteBeta ? "Yes" : "No"}</p>
    </div>
  );
}
```

### Making Authenticated API Calls

**The API client handles auth automatically:**

```tsx
import apiClient from "@/lib/apiClient";

async function getMyIdeas() {
  try {
    // Dual auth strategy:
    // 1. httpOnly cookies sent automatically (withCredentials: true)
    // 2. Authorization header added from in-memory token (if available)
    // Auto-refreshes if token expired
    const response = await apiClient.get("/ideas");
    return response.data.ideas;
  } catch (error) {
    console.error("Failed to fetch ideas:", error);
    throw error;
  }
}

async function createIdea(title: string, description: string) {
  try {
    const response = await apiClient.post("/ideas", {
      title,
      description,
    });
    return response.data.idea;
  } catch (error) {
    console.error("Failed to create idea:", error);
    throw error;
  }
}
```

**Key points:**

- ✅ Always import from `@/lib/apiClient` (never create duplicates)
- No need to manually attach tokens (dual strategy handles it)
- Auto-refresh handled by interceptors
- 401 errors trigger refresh → retry
- Use `authService` functions for auth-specific operations (login/logout/etc)
- After login/signup: `setAuthToken(response.accessToken)` is called automatically by authService

### Conditional UI Based on Auth

**Navigation example:**

```tsx
import { useAppSelector } from "@/store/hooks";
import { Link } from "react-router-dom";

function Navigation() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>

      {isAuthenticated ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/ideas">Ideas</Link>
          <Link to="/profile">Profile</Link>
        </>
      ) : (
        <button onClick={openSignInModal}>Sign In</button>
      )}
    </nav>
  );
}
```

---

## Token Lifecycle

### Timeline

```
1. Login/Signup
   ├─ Backend creates Supabase session
   ├─ Sets httpOnly cookies: access_token, refresh_token
   ├─ Returns { expiresAt } to frontend
   └─ Frontend: dispatch(setSession({ expiresAt }))

2. Session Active (0-55 min)
   ├─ useTokenRefresh monitors expiresAt
   ├─ Scheduled refresh 5 min before expiry
   └─ All API calls use cookies automatically

3. Proactive Refresh (55 min mark)
   ├─ useTokenRefresh calls /auth/refresh
   ├─ Backend uses refresh_token cookie
   ├─ New cookies set, new expiresAt returned
   └─ Frontend: dispatch(setSession({ expiresAt }))

4. Reactive Refresh (if user returns after expiry)
   ├─ User action triggers API call
   ├─ Backend detects expired token
   ├─ Auto-refreshes in get_current_user()
   ├─ Sets new cookies, returns user data
   └─ API call succeeds transparently

5. Tab Visibility Refresh
   ├─ User switches back to tab
   ├─ useTokenRefresh checks expiresAt
   ├─ If expired/close to expiry → immediate refresh
   └─ User experiences no interruption

6. Page Refresh
   ├─ App loads, useInitAuth runs
   ├─ Calls /auth/me (cookies sent automatically)
   ├─ If valid → session restored
   ├─ If expired → auto-refresh attempted
   └─ If refresh fails → guest state

7. Logout
   ├─ User clicks logout
   ├─ Frontend calls authService.logout()
   ├─ Backend revokes tokens with Supabase
   ├─ Clears cookies
   └─ Frontend: dispatch(clearSession())
```

### Key Timings

- **Token lifespan**: 60 minutes (Supabase default)
- **Proactive refresh**: 5 minutes before expiry (55 min mark)
- **Refresh cooldown**: 5 seconds (prevents spam)
- **Frontend cooldown**: 1 minute (prevents duplicate scheduled refreshes)

---

## Common Patterns

### Pattern 1: Conditional Feature by Auth State

```tsx
function FeatureButton() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = () => {
    if (isAuthenticated) {
      // Perform action
      createIdea();
    } else {
      // Prompt login
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <button onClick={handleClick}>
        {isAuthenticated ? "Create Idea" : "Sign In to Create"}
      </button>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
```

### Pattern 2: Beta Feature Gating

```tsx
function BetaFeature() {
  const { betaAccess } = useAppSelector((state) => state.auth);

  if (!betaAccess) {
    return <div>This feature requires beta access</div>;
  }

  return <div>Beta feature content</div>;
}
```

### Pattern 3: Optimistic UI Updates

```tsx
async function handleVote(ideaId: number) {
  // Optimistically update UI
  setIdeas(
    ideas.map((i) => (i.id === ideaId ? { ...i, votes: i.votes + 1 } : i))
  );

  try {
    // Make API call
    await apiClient.post(`/ideas/${ideaId}/vote`);
  } catch (error) {
    // Revert on failure
    setIdeas(
      ideas.map((i) => (i.id === ideaId ? { ...i, votes: i.votes - 1 } : i))
    );
    toast.error("Failed to vote");
  }
}
```

### Pattern 4: Loading States During Auth Check

```tsx
function App() {
  const { isInitialized } = useInitAuth();

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return <AppRoutes />;
}
```

---

## Troubleshooting

### "401 Unauthorized" Errors

**Symptom**: API calls return 401 even though user is logged in

**Possible Causes:**

1. **Wrong apiClient being imported**

   - ⚠️ Most common issue: Multiple apiClient.ts files exist
   - Run: `find frontend/src -name "apiClient.ts"` (should find only lib/apiClient.ts)
   - Check all service imports use `@/lib/apiClient` (not relative paths)

2. **Cookies not being sent**

   - Check `lib/apiClient.ts` has `withCredentials: true`
   - Verify backend CORS allows credentials
   - Check browser cookies in DevTools → Application → Cookies

3. **Backend not receiving cookies**

   - Check CORS `supports_credentials=True` in FastAPI
   - Verify `allow_origins` includes frontend URL exactly
   - Cookie config: Do NOT set `domain` in development

4. **Token actually expired**

   - Check Redux state `expiresAt` value
   - Look for `[Token Refresh]` logs in console
   - Verify `useTokenRefresh` is running in AppRoutes

5. **setAuthToken not called after login**
   - authService.login() should call `setAuthToken(response.accessToken)`
   - authService.signup() should call `setAuthToken(response.accessToken)`
   - Check debug logs: `[API Client] setAuthToken called with: ...`

**Solution:**

```bash
# Check cookies in browser DevTools
# Should see: access_token, refresh_token

# Check backend logs
# Should see: "INFO: Auto-refreshed token for user..."

# Check frontend console
# Should see: "[Token Refresh] Scheduled in Xs"
```

### "Session Restored But UI Not Updating"

**Symptom**: Page refresh shows logged-in user, but Navigation still shows "Sign In"

**Root Cause**: Component not reading Redux state

**Solution:**

```tsx
// Make sure Navigation uses Redux selector
import { useAppSelector } from "@/store/hooks";

function Navigation() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  // NOT: const [isAuthenticated, setIsAuthenticated] = useState(false);

  return isAuthenticated ? <AuthNav /> : <PublicNav />;
}
```

### "Token Refreshing Too Often"

**Symptom**: Multiple `[Token Refresh]` logs in quick succession

**Possible Causes:**

1. **Multiple components calling refresh**

   - Only `useTokenRefresh` should handle scheduled refreshes
   - Individual API calls should NOT manually refresh

2. **Cooldown not working**
   - Check `lastRefreshRef` in `useTokenRefresh.ts`
   - Verify `MIN_REFRESH_INTERVAL_MS` is set

**Solution:**

- Remove manual refresh calls from components
- Let `useTokenRefresh` + `apiClient` interceptors handle it

### "Agent User Not Created on Signup"

**Symptom**: Signup succeeds but no agent credentials stored

**Check:**

1. Backend logs for agent creation
2. `agent_credentials.py` has credentials stored
3. Signup endpoint calls `create_agent_for_user()`

**Fix:**

```python
# In routes/auth.py signup endpoint
# After user creation:
agent_email, agent_password = await create_agent_for_user(
    user_id=str(user_data.user.id),
    user_email=credentials.email
)
```

### "CORS Errors on Login/Signup"

**Symptom**: Browser console shows CORS policy errors

**Fix backend CORS settings:**

```python
# In main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Exact match
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### "Cookie Not Persisting Across Page Refresh"

**Symptom**: User logs in, refreshes page, cookies gone

**Check:**

1. **Cookie settings in response**

   ```python
   response.set_cookie(
       key="access_token",
       value=session.access_token,
       httponly=True,
       secure=False,  # True in production
       samesite="lax",  # "none" if cross-origin
       max_age=3600,
       path="/"
       # NOTE: Do NOT set domain in development
   )
   ```

2. **Browser blocking third-party cookies**

   - Check browser privacy settings
   - Use same-origin setup for dev (both on localhost)

3. **Cookie domain configuration**
   - ✅ Development: Do NOT set `domain` key (allows both localhost and 127.0.0.1)
   - ✅ Production: Set `domain` explicitly if needed
   - Frontend: `localhost:5173`
   - Backend: `localhost:8000`

---

## Quick Reference

### File Locations

**Backend:**

- Auth routes: `backend/app/api/routes/auth.py`
- Auth utils: `backend/app/api/auth_utils.py`
- Supabase client: `backend/app/db/supabase_client.py`
- Agent service: `backend/app/services/agent_service.py`

**Frontend:**

- **API client**: `frontend/src/lib/apiClient.ts` ⚠️ THE ONLY apiClient.ts!
- Auth service: `frontend/src/services/authService.ts`
- Auth slice: `frontend/src/store/authSlice.ts`
- Init auth hook: `frontend/src/hooks/useInitAuth.ts`
- Token refresh hook: `frontend/src/hooks/useTokenRefresh.ts`
- Auth modal: `frontend/src/components/AuthModal.tsx`
- Navigation: `frontend/src/components/Navigation.tsx`

### Environment Setup

**Backend `.env`:**

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...
ENV=local
```

**Frontend `.env`:**

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Development Workflow

1. **Start backend**: `python -m uvicorn app.main:app --reload --log-level info`
2. **Start frontend**: `npm run dev`
3. **Check auth state**: Redux DevTools → auth slice
4. **Check cookies**: Browser DevTools → Application → Cookies
5. **Check tokens**: Console logs `[Token Refresh]`
6. **Test refresh**: Wait 55+ minutes or manually expire token

### Common Commands

```bash
# Backend
cd backend
conda activate ideas
python -m uvicorn app.main:app --reload --log-level info

# Frontend
cd frontend
npm run dev

# Check Python environment
conda env list

# Install new backend dependency
pip install package-name
pip freeze > requirements.txt

# Install new frontend dependency
npm install package-name
```

---

## Additional Resources

- **PRD**: `/SupabaseAuth_Implementation_PRD_v1.0.md`
- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Redux Toolkit**: https://redux-toolkit.js.org/
- **FastAPI Security**: https://fastapi.tiangolo.com/tutorial/security/
- **httpOnly Cookies**: https://owasp.org/www-community/HttpOnly

---

**Questions or issues?** Check the Troubleshooting section or review the PRD for implementation details.
