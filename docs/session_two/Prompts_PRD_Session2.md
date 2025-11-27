# Optimal Prompts for AI Assistant to Execute This PRD

## Initial Engagement Prompt

I need you to implement the Supabase Authentication PRD (SupabaseAuth_Implementation_PRD_v1.0.md) end-to-end.

EXECUTION REQUIREMENTS:
- Follow the unit sequence exactly as documented (Units 1-17)
- Mark deliverables as [x] in the PRD as you complete them
- Ask for my approval before proceeding to each new unit
- Run validation tests after each major phase (backend, frontend, integration)
- Flag any missing dependencies or unclear requirements immediately

TECHNICAL CONSTRAINTS:
- Backend: Python 3.12+, FastAPI, Supabase Python SDK
- Frontend: React 18.2, TypeScript, Vite, Redux Toolkit, shadcn/ui
- Auth: Standard Supabase Auth (no custom JWT logic)
- Cookies: httpOnly cookies for tokens (set by backend)
- State: Redux for UI auth state, cookies for backend auth

START WITH:
- Unit 1: Supabase Client Setup
- Confirm you understand the agent-user pattern before implementing Unit 8
- Verify Supabase email confirmation is disabled before testing signup

Begin with Unit 1.

---

## After Backend (Units 1-8): Backend Phase complete. Before moving to frontend:
(Phase Transition Prompts)

VALIDATION CHECKLIST:
- Start backend: python -m uvicorn app.main:app --reload
- Test signup: curl -X POST http://localhost:8000/api/v1/auth/signup -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"testpass123"}'
- Verify two users created in Supabase Studio (user + agent_user)
- Test login returns session with expiresAt
- Test /auth/me returns user data

Confirm all tests pass, then proceed to Unit 9 (Frontend Setup).

---

## After UI Components (Units 11.5-12):
(Auth components created. Before proceeding to routing:)

VALIDATION:
- Run npm run dev
- Verify AuthModal renders with sign-in/sign-up tabs
- Test form validation (password match, min length, terms checkbox)
- Verify shadcn/ui components render with proper styling
- Test modal keyboard navigation (ESC to close, Tab order)

Confirm components work, then proceed to Unit 13 (Protected Routes).


---

## After Navigation (Unit 14):
(Navigation and logout implemented. Critical end-to-end test:)

FULL AUTH FLOW TEST:
1. Clear cookies in browser DevTools
2. Visit http://localhost:5173
3. Verify PublicLayout with "Sign In" button
4. Sign up with new account
5. EXPECTED: Modal closes, navigation switches to show avatar + Dashboard/Ideas links
6. Click avatar → verify dropdown shows email and Logout
7. Click Logout → verify redirect to home + navigation switches back to "Sign In"
8. Sign in with same credentials → verify navigation switches back to auth state
9. Try accessing /dashboard while logged out → verify redirect to /
10. Log in → access /dashboard → verify page loads

If all steps pass, we have working auth. Proceed to Unit 15 (Session Restoration).

## Debugging Prompts

### If Auth State Not Updating:
Navigation not changing after login. Debug checklist:

1. Check Redux DevTools: Is isAuthenticated true after login?
2. Check Network tab: Does /auth/login return 200 with expiresAt?
3. Check Application tab: Are cookies set (access_token, refresh_token)?
4. Check AuthModal handlers: Are setSession() and fetchUserProfile() dispatched?
5. Check Navigation component: Is useAppSelector reading isAuthenticated?
6. Check console: Any errors in Redux state updates?

Report findings for each check.

### If Cookies Not Set:
Cookies not appearing after login. Verify:

1. Backend auth.py: Does /auth/login call _set_auth_cookies()?
2. Backend response: Are Set-Cookie headers present in response?
3. Frontend apiClient: Is withCredentials: true set?
4. CORS settings: Is credentials allowed in backend CORS config?
5. Domain mismatch: Are frontend (localhost:5173) and backend (localhost:8000) both localhost?

Show me the relevant code sections.