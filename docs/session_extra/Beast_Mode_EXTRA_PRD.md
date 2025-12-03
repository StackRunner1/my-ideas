# User Profile Feature - Extended Learning Challenge

> **📌 CHALLENGE MODULE**: This is an optional extended learning module for learners who want to practice building a complete feature end-to-end using best practices learned from Sessions 2 and 3.

> **⚠️ PREREQUISITE**: Session 2 (Supabase Authentication) must be fully completed before attempting this challenge. This module assumes you have a working authentication system with database integration.

## Overview

**Extended Learning Challenge**: User Profile Management - Build a complete feature from scratch, applying authentication, database design, API development, UI implementation, and testing patterns.

**Key Focus**: After establishing authentication (Session 2) and optionally exploring production patterns (Session 3), this challenge teaches learners to independently build a full-stack feature with proper planning, implementation, testing, and deployment practices.

## Learning Objectives

By completing this challenge, you will:

- **Plan Features**: Write mini-PRDs with user stories and technical requirements
- **Database Design**: Create schema changes with migrations and constraints
- **Backend Development**: Implement secure APIs with RLS enforcement
- **Frontend Development**: Build accessible, tested React components
- **Integration**: Connect frontend and backend with proper error handling
- **Quality Assurance**: Write comprehensive tests and perform accessibility audits
- **Deployment**: Prepare features for production with proper documentation

## Challenge Context

- **Problem**: Users need the ability to view and manage their profile information, set a username, and control their account lifecycle
- **Solution**: Build a complete user profile management feature with CRUD operations, avatar integration, and account deletion with safeguards
- **Value**: Demonstrates mastery of full-stack development patterns and readiness to build production features independently

## Feature Scope

This challenge involves building:

1. **Database Schema Extension**: Add username field to user_profiles table with validation constraints
2. **Backend API Endpoints**: GET/PATCH profile endpoints, DELETE account endpoint with proper RLS
3. **Avatar Integration**: Implement react-avatar with automatic initials fallback (no external API dependencies)
4. **Profile Page UI**: Build complete profile management interface with forms, validation, and confirmation modals
5. **Testing Suite**: Write backend tests (pytest), frontend tests (Vitest), and perform accessibility audits
6. **Documentation**: Complete API documentation, user guides, and deployment instructions

## AI Coding Agent (GitHub Copilot or similar) Instructions

**IMPORTANT**: In this PRD document, prompts aimed at the AI coding assistant to
start or continue the implementation of this PRD end-to-end (in conjunction with
the learner and via the GitHub Copilot Chat) will be marked with `## AI PROMPT`
headings.

- **The learner** pastes the prompt into the chat to initiate the start or the
  continuation of the code implementation led by the AI coding assistant.
- **AI Coding Assistant** reads and executes on the prompt. The AI Coding
  Assistant should execute the tasks specified under each unit and - upon
  completion - mark off each task with [x] = completed or [~] = in progress
  depending on status. Sections (---) marked with "PAUSE" are milestone points
  where the AI Coding Assistant should check in with the learner, ensure all
  checklists in this PRD reflect the latest progress, and await the next learner
  instructions OR - after approval - move to reading the next `## AI PROMPT` and
  start execution.

## Prerequisites & Readiness Check

**CRITICAL**: This challenge builds directly on Session 2's authentication foundation. You MUST verify Session 2 is fully complete before proceeding.

### Session 2 Completion Verification (MANDATORY)

Complete the following verification steps to ensure you're ready for this challenge:

**Backend Verification**:

- [ ] Supabase project created and configured
- [ ] Authentication endpoints working (signup, login, logout)
- [ ] `user_profiles` table exists with RLS policies
- [ ] Backend can query Supabase database successfully
- [ ] Environment variables configured (.env file with Supabase credentials)

**Frontend Verification**:

- [ ] Authentication UI working (login/signup modals)
- [ ] Protected routes redirect unauthenticated users
- [ ] Navigation shows user avatar and logout functionality
- [ ] Redux auth state management working
- [ ] API client configured with authentication support

**Database Schema Verification**:

- [ ] `user_profiles` table structure confirmed:
  ```sql
  - id (UUID, primary key)
  - email (TEXT, unique)
  - full_name (TEXT, nullable)
  - beta_access (BOOLEAN, default false)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  ```
- [ ] RLS policies enforce user data isolation

**Development Environment**:

- [ ] Backend running: `python -m uvicorn app.main:app --reload`
- [ ] Frontend running: `npm run dev`
- [ ] Both servers accessible (backend: localhost:8000, frontend: localhost:5173)
- [ ] Database migrations working
- [ ] Test user account created for testing

**Recommended Skills** (Optional but Helpful):

- [ ] Familiarity with Session 3 patterns (logging, error handling, testing) - if completed
- [ ] Understanding of React Hook Form and form validation
- [ ] Basic knowledge of SQL migrations
- [ ] Comfort with TypeScript

**If ALL verification steps pass**, you are ready to begin the User Profile Feature Challenge!

# USER PROFILE FEATURE - Full-Stack Challenge

**Goal**: Build a complete user profile management feature end-to-end, from user story planning through database design, backend API, frontend UI, testing, and deployment readiness.

**Feature Overview**: User Profile Management - A protected page where authenticated users can view and edit their profile information, including setting a username, viewing account details, managing their avatar (using react-avatar with initials), and deleting their account with proper safeguards.

---

## AI CHALLENGE PROMPT

**Challenge Introduction:**

I need you to implement the **User Profile Feature Challenge** - a complete full-stack feature demonstrating mastery of authentication, database design, API development, UI implementation, and testing.

**PREREQUISITE STATUS**: ✅ Session 2 (Supabase Authentication) must be complete with working auth system and database integration.

**EXECUTION APPROACH:**

- Build feature incrementally following the sub-unit sequence
- Apply best practices from Session 2 (authentication, RLS, database design)
- If Session 3 completed: Apply logging, error handling, and testing patterns learned
- If Session 3 not completed: Implement basic logging and error handling as part of learning
- Mark deliverables as [x] in the PRD as you complete them
- Validate at each sub-unit before proceeding
- Create production-ready, tested, accessible feature

**FEATURE SCOPE:**

- User profile page at `/profile` route (protected, authenticated users only)
- Display user data from `user_profiles` table (email, full_name, username, created_at, beta_access)
- CRUD operations: Create/update username and full_name, view profile, delete account
- react-avatar integration (automatic initials from full_name or email, no external API)
- Navigation from avatar dropdown menu in nav bar
- Warning modal for account deletion with confirmation safeguards
- Test coverage and accessibility compliance (WCAG 2.1 AA)

**TECHNICAL REQUIREMENTS:**

- **Database**: Extend Session 2's `user_profiles` table with `username` field (VARCHAR(20), UNIQUE, NULLABLE)
- **Backend**: FastAPI endpoints with Supabase integration and RLS enforcement
- **Frontend**: React + TypeScript with shadcn/ui components (from Session 2)
- **Security**: RLS policies ensure users can only access/modify their own profile
- **Error Handling**: Standardized error responses with clear user-facing messages
- **Testing**: Backend tests (pytest), frontend tests (Vitest), manual QA checklist
- **Accessibility**: Keyboard navigation, screen reader support, WCAG AA compliance

**CHALLENGE SUB-UNITS:**

- Sub-Unit 15.1: Mini-PRD (user stories, acceptance criteria, technical design)
- Sub-Unit 15.2: Database schema extension (add username column with migration)
- Sub-Unit 15.3: Backend API endpoints (GET /profile, PATCH /profile, DELETE /account)
- Sub-Unit 15.4: react-avatar integration (avatar component with automatic initials)
- Sub-Unit 15.5: Profile page UI (form, validation, delete confirmation modal)
- Sub-Unit 15.6: Testing suite (backend, frontend, integration, accessibility)
- Sub-Unit 15.7: Documentation & deployment preparation

**LEARNING PATH:**

- **With Session 3 Background**: Apply logging (request ID tracing), error handling (standardized responses), testing patterns (pytest/Vitest), and design system (shadcn/ui)
- **Without Session 3**: Learn these patterns as you implement the feature - this challenge introduces them in practical context

**START WITH SUB-UNIT 15.1 (Mini-PRD)** - Confirm you understand the requirements and are ready to plan the feature with user stories and technical design.

---

## Challenge Structure: User Profile Feature Implementation

### Unit 15: User Profile Feature - End-to-End Implementation

**Goal**: Demonstrate mastery of full-stack development by building a complete user profile management feature from ideation to deployment, incorporating authentication, database design, API development, UI implementation, and testing best practices.

**Prerequisites**:

- Session 2 completed (authentication system with Supabase integration)
- `user_profiles` table exists in Supabase database
- Frontend auth flow working (login, logout, protected routes)
- Understanding of full-stack feature development lifecycle
- Familiarity with React and FastAPI (from Session 2)

**Optional Prerequisites** (Enhances the Challenge):

- Session 3 completed (provides patterns for logging, error handling, testing, design system)
- If Session 3 not completed: Learn these patterns during this challenge

**Learning Objectives**:

By completing this challenge, learners will:

- Practice writing mini-PRDs for feature planning
- Design database schema changes with migrations and constraints
- Implement secure backend APIs with RLS enforcement
- Build accessible, tested frontend UIs with proper validation
- Apply error handling and logging throughout the stack
- Execute complete QA and deployment workflow
- Integrate third-party libraries (react-avatar) effectively

---

### Sub-Unit 15.1: Mini-PRD & Feature Planning

**Goal**: Write a concise product requirements document defining the user
profile feature scope, user stories, technical requirements, and success
criteria

**Deliverables**:

**User Stories**:

- [ ] Document primary user story: "As an authenticated user, I want to view and
      edit my profile so I can personalize my account"
- [ ] Document secondary user stories:
  - "As a user, I want to set a unique username so others can identify me"
  - "As a user, I want to see my account creation date so I know how long I've
    been active"
  - "As a user, I want to delete my account so I can remove my data permanently"
  - "As a user, I want to see my avatar so I have visual identity in the app"

**Functional Requirements**:

- [ ] Profile page displays: email (read-only), name (editable), username
      (editable, unique), created_at (read-only), beta_access flag (read-only)
- [ ] Username validation: 3-20 characters, alphanumeric + underscore/dash,
      unique across users
- [ ] Username field optional (can be null initially)
- [ ] react-avatar displays initials from full_name or email (no storage needed)
- [ ] Account deletion requires confirmation modal with warning text
- [ ] Account deletion removes user from auth.users and cascades to
      user_profiles
- [ ] Profile accessible via avatar dropdown menu in navigation

**Non-Functional Requirements**:

- [ ] Page loads in < 500ms p95
- [ ] Form validation provides instant feedback
- [ ] All operations logged with request IDs
- [ ] Errors return standardized error responses
- [ ] Page passes WCAG AA accessibility standards
- [ ] Test coverage > 80% for profile-related code

**Out of Scope**:

- [ ] Profile image upload (future enhancement - react-avatar supports src prop for custom images)
- [ ] Email change functionality (handled by Supabase Auth settings)
- [ ] Password change (handled by Supabase Auth)
- [ ] Multi-factor authentication setup

**Technical Design Decisions**:

- [ ] Document database schema change: add `username` column to `user_profiles`
      table (VARCHAR(20), UNIQUE, NULLABLE)
- [ ] Document API endpoints needed:
  - GET `/api/v1/users/me/profile` - fetch current user profile
  - PATCH `/api/v1/users/me/profile` - update name and username
  - DELETE `/api/v1/users/me` - delete user account
- [ ] Document frontend components needed: ProfilePage, ProfileForm,
      DeleteAccountModal, AvatarDisplay
- [ ] Choose avatar background color (uses design system colors)

**Success Criteria Defined**:

- [ ] User can view all profile information
- [ ] User can successfully set/update username with validation
- [ ] Username uniqueness enforced (error shown if taken)
- [ ] Account deletion works with proper warnings
- [ ] Avatar displays consistently across app
- [ ] Navigation from avatar menu works
- [ ] All CRUD operations logged
- [ ] Full test coverage

**Estimated Effort**: 1 hour (planning only)

---

### Sub-Unit 15.2: Database Schema & Migration

**Goal**: Extend `user_profiles` table with `username` column and create
Supabase migration

**Prerequisites**:

- Sub-Unit 15.1 completed (requirements defined)
- Understanding of Supabase migrations from Session 2

**Deliverables**:

**Schema Design**:

- [ ] Review existing `user_profiles` table structure from Session 2
- [ ] Design `username` column: `VARCHAR(20)`, `UNIQUE`, `NULLABLE`, with index
      for performance
- [ ] Consider constraints: check length >= 3, alphanumeric pattern
- [ ] Plan RLS policies: users can only read/update their own username

**Migration File**:

- [ ] Create new migration file:
      `supabase/migrations/YYYYMMDDHHMMSS_add_username_to_user_profiles.sql`
- [ ] Write SQL to add `username` column with constraints
- [ ] Add unique index on `username` for fast lookups:
      `CREATE UNIQUE INDEX idx_user_profiles_username ON user_profiles(username) WHERE username IS NOT NULL;`
- [ ] Add check constraint for username format:
      `CHECK (username ~ '^[a-zA-Z0-9_-]{3,20}$')`
- [ ] Update RLS policies if needed (ensure users can update their own username)
- [ ] Write rollback migration (DROP column) for safety

**Migration Testing**:

- [ ] Test migration on local Supabase instance: `supabase migration up`
- [ ] Verify column added with correct constraints
- [ ] Test inserting profile with valid username - should succeed
- [ ] Test inserting profile with invalid username (too short, special chars) -
      should fail
- [ ] Test inserting duplicate username - should fail with unique constraint
      error
- [ ] Verify RLS: user can update own username, cannot update others'
- [ ] Test rollback migration works correctly

**Documentation**:

- [ ] Document schema change in project documentation
- [ ] Note migration timestamp for deployment coordination
- [ ] Document any breaking changes or data migration needs (none expected)

**Success Criteria**:

- Migration runs successfully without errors
- `username` column exists with correct constraints and index
- RLS policies enforce user data isolation
- Rollback migration tested and working
- No breaking changes to existing functionality

**Estimated Effort**: 1-2 hours

---

### Sub-Unit 15.3: Backend Profile Endpoints

**Goal**: Implement backend API endpoints for profile read, update, and account
deletion with logging, error handling, and RLS enforcement

**Prerequisites**:

- Sub-Unit 15.2 completed (database schema ready)
- Understanding of FastAPI patterns from Sessions 2-3

**Deliverables**:

**Profile Service Layer**:

- [ ] Create `backend/app/services/profile_service.py` module
- [ ] Implement `get_user_profile(user_id: str, client)` function querying
      `user_profiles` table
- [ ] Implement
      `update_user_profile(user_id: str, name: str, username: str, client)`
      function with validation
- [ ] Username validation logic: check format (regex), check uniqueness (query
      existing usernames)
- [ ] Implement `delete_user_account(user_id: str, admin_client)` function
- [ ] Delete from `auth.users` using admin client (cascades to `user_profiles`
      via FK)
- [ ] Log all service operations with request ID and user ID
- [ ] Handle errors: username taken (409 Conflict), invalid format (422),
      database errors (500)

**Pydantic Models**:

- [ ] Create `backend/app/models/profile.py` module
- [ ] Define `UserProfileResponse` model with fields: id, email, name, username,
      beta_access, created_at
- [ ] Define `UpdateProfileRequest` model with fields: name (optional), username
      (optional)
- [ ] Add field validators for username: length 3-20, alphanumeric +
      underscore/dash only
- [ ] Use `camelCase` alias for JSON serialization (consistent with frontend)

**API Endpoints**:

- [ ] Create or extend `backend/app/api/routes/users.py` module
- [ ] Implement `GET /api/v1/users/me/profile` endpoint
  - Extract authenticated user from request (use `get_current_user` dependency)
  - Call `get_user_profile()` service function
  - Return `UserProfileResponse` model
  - Log request with user ID and request ID
- [ ] Implement `PATCH /api/v1/users/me/profile` endpoint
  - Extract authenticated user and request body
  - Validate request body with `UpdateProfileRequest` model
  - Call `update_user_profile()` service function
  - Handle username conflict error (return 409 with clear message)
  - Return updated `UserProfileResponse`
  - Log update with changed fields
- [ ] Implement `DELETE /api/v1/users/me` endpoint
  - Extract authenticated user
  - Show confirmation in API response documentation (frontend handles UI
    confirmation)
  - Call `delete_user_account()` service function
  - Return 204 No Content on success
  - Log deletion with user ID and timestamp
- [ ] Register routes in `main.py`

**Error Handling**:

- [ ] Handle username taken: return
      `{"error": {"code": "username_taken", "message": "Username already exists", "request_id": "..."}}`
- [ ] Handle invalid username format: return 422 with validation details
- [ ] Handle database errors: return 500 with generic message, log detailed
      error
- [ ] Include request ID in all error responses

**Testing**:

- [ ] Create `backend/tests/test_profile_endpoints.py`
- [ ] Test GET profile returns correct user data
- [ ] Test PATCH profile with valid username succeeds
- [ ] Test PATCH with duplicate username returns 409
- [ ] Test PATCH with invalid username format returns 422
- [ ] Test DELETE account succeeds (mock deletion, don't delete test user)
- [ ] Test RLS: user cannot access another user's profile
- [ ] Verify all operations logged with request IDs

**Success Criteria**:

- All endpoints implemented and registered
- Username validation works correctly (format and uniqueness)
- RLS prevents cross-user profile access
- Errors return standardized format with request IDs
- Test coverage > 80% for profile code
- All tests passing

**Estimated Effort**: 3-4 hours

---

### Sub-Unit 14.4: React Avatar Integration with Initials Fallback

**Goal**: Integrate react-avatar library for consistent user avatars with automatic initials fallback, no external API dependencies

**Prerequisites**:

- Profile endpoints working (Sub-Unit 14.3)
- Understanding of React component composition

**Deliverables**:

**Installation**:

- [ ] Install react-avatar library:
  ```bash
  npm install react-avatar
  ```

**Frontend Avatar Component Wrapper**:

- [ ] Create `frontend/src/components/UserAvatar.tsx` wrapping react-avatar with app-specific defaults:

  ```typescript
  import React from "react";
  import Avatar from "react-avatar";

  interface UserAvatarProps {
    name?: string;
    email?: string;
    src?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
  }

  const sizeMap = {
    sm: "32px",
    md: "48px",
    lg: "64px",
    xl: "96px",
  };

  export function UserAvatar({
    name,
    email,
    src,
    size = "md",
    className = "",
  }: UserAvatarProps) {
    return (
      <Avatar
        name={name || email}
        src={src}
        size={sizeMap[size]}
        round={true}
        className={className}
        alt={`Avatar for ${name || email}`}
        color="#6366f1" // Primary color from design system
        fgColor="#ffffff" // White text for initials
      />
    );
  }
  ```

- [ ] Component accepts props: `name`, `email`, `src` (optional image URL), `size`, `className`
- [ ] react-avatar automatically generates initials from `name` prop (e.g., "John Doe" → "JD")
- [ ] If no `name`, falls back to `email` (e.g., "john@example.com" → "JO")
- [ ] If `src` provided and loads successfully, displays image instead of initials
- [ ] Circular avatar with consistent sizing based on `size` prop
- [ ] Uses design system color for background (primary color)

**Avatar in Navigation**:

- [ ] Update `Navigation.tsx` component
- [ ] Replace existing avatar with `<UserAvatar>` component
- [ ] Pass current user's name and email from auth state:
  ```tsx
  <UserAvatar
    name={user.user_metadata?.full_name}
    email={user.email}
    size="sm"
  />
  ```
- [ ] Ensure avatar clickable to open dropdown menu
- [ ] Add loading state while user data fetching

**Avatar in Profile Page**:

- [ ] Display large avatar at top of profile page:
  ```tsx
  <UserAvatar
    name={profile.full_name}
    email={user.email}
    size="xl"
    className="mb-4"
  />
  ```
- [ ] Center avatar above profile information
- [ ] Consider adding hover effect or border using className

**Customization Options**:

- [ ] Use `color` and `fgColor` props to match design system colors
- [ ] Add className prop for additional styling (borders, shadows)
- [ ] Support both text initials (default) and image src (if user uploads avatar in future)

**Testing**:

- [ ] Create `frontend/src/components/__tests__/UserAvatar.test.tsx`
- [ ] Test UserAvatar renders with initials when only name provided
- [ ] Test initials generated correctly ("John Doe" → "JD")
- [ ] Test email fallback when no name provided
- [ ] Test different sizes render correctly (sm, md, lg, xl)
- [ ] Test alt text is present for accessibility
- [ ] Visual test: verify avatar looks good in navigation and profile page

**Success Criteria**:

- Avatar component reusable across app with consistent API
- Initials automatically generated from user name or email
- Avatar styles match design system colors
- No external API dependencies (works offline)
- Circular avatars with proper sizing
- Accessibility: alt text present
- Fast rendering (no network requests for initials)

**Estimated Effort**: 1 hour

---

### Sub-Unit 15.5: Profile Page UI Implementation

**Goal**: Build complete profile page UI with form for editing name/username,
account information display, and delete account functionality

**Prerequisites**:

- Sub-Units 15.3-15.4 completed (backend endpoints and avatar ready)
- shadcn/ui components available from Unit 6

**Deliverables**:

**Profile Page Component**:

- [ ] Create `frontend/src/pages/Profile.tsx` component
- [ ] Add route `/profile` in `AppRoutes.tsx` as protected route
- [ ] Fetch user profile on component mount using profile service
- [ ] Display loading skeleton while data fetching
- [ ] Handle error state if profile fetch fails

**Page Layout**:

- [ ] Create header section with large avatar (xl size) and user name/email
- [ ] Create main content section with profile form
- [ ] Create danger zone section at bottom for account deletion
- [ ] Use Card components from shadcn/ui for sections
- [ ] Apply consistent spacing using design system tokens
- [ ] Make layout responsive (stack on mobile, side-by-side on desktop)

**Profile Form**:

- [ ] Create form with fields: name (Input), username (Input)
- [ ] Display read-only fields: email, created_at, beta_access badge
- [ ] Use shadcn/ui Form components with react-hook-form for validation
- [ ] Add client-side validation matching backend rules:
  - Username: 3-20 chars, alphanumeric + underscore/dash
  - Name: max 100 chars
- [ ] Show validation errors inline below fields
- [ ] Display current values pre-populated in form
- [ ] Add "Save Changes" button (primary style)
- [ ] Disable save button if no changes made
- [ ] Show loading spinner on save button during submission

**Form Submission**:

- [ ] On submit, call `updateProfile()` service function
- [ ] Implement optimistic update: show new values immediately
- [ ] If API succeeds, show success toast: "Profile updated successfully"
- [ ] If API fails, revert to previous values and show error toast with request
      ID
- [ ] Handle specific errors:
  - Username taken: show error below username field "Username already taken"
  - Invalid format: show validation error below field
  - Network error: show generic error with retry option

**Profile Service**:

- [ ] Create `frontend/src/services/profileService.ts`
- [ ] Implement `getProfile()` function calling GET `/api/v1/users/me/profile`
- [ ] Implement `updateProfile(name, username)` function calling PATCH endpoint
- [ ] Implement `deleteAccount()` function calling DELETE endpoint
- [ ] Handle errors and return user-friendly messages

**Account Information Display**:

- [ ] Show email in read-only field or as text
- [ ] Show account created date formatted nicely (e.g., "Member since January
      2025")
- [ ] Show beta_access as badge if true (use shadcn/ui Badge component)
- [ ] Consider showing stats: total items created, tags used, etc. (optional
      enhancement)

**Account Deletion Section**:

- [ ] Create "Danger Zone" section with red border (using design system error
      color)
- [ ] Add heading "Delete Account" with warning icon
- [ ] Add description: "Permanently delete your account and all associated data.
      This action cannot be undone."
- [ ] Add "Delete Account" button (destructive variant, red)
- [ ] Button opens confirmation modal (don't delete directly)

**Delete Account Modal**:

- [ ] Create `DeleteAccountModal.tsx` component using shadcn/ui Dialog
- [ ] Modal title: "Delete Account"
- [ ] Modal content:
  - Warning message: "Are you sure you want to delete your account? This will
    permanently remove all your data including items, tags, and profile
    information."
  - Confirmation input: "Type DELETE to confirm" (user must type exact word)
  - Checkbox: "I understand this action cannot be undone"
- [ ] Disable "Delete Account" button until confirmation input matches and
      checkbox checked
- [ ] On delete confirmation:
  - Call `deleteAccount()` service
  - Show loading state
  - On success: log user out and redirect to home page with toast "Account
    deleted successfully"
  - On error: close modal, show error toast with request ID

**Navigation Integration**:

- [ ] Update `Navigation.tsx` avatar dropdown menu
- [ ] Add "Profile" menu item with user icon
- [ ] Menu items: Profile, Settings (if exists), Logout
- [ ] Link Profile to `/profile` route
- [ ] Ensure menu keyboard accessible (Tab, Enter, Escape)

**Success Criteria**:

- Profile page accessible at `/profile` for authenticated users
- Form displays current profile data correctly
- Form validation works client-side and server-side
- Profile updates saved successfully with optimistic UI
- Errors handled gracefully with clear messages
- Account deletion requires proper confirmation
- Avatar displays correctly
- Page responsive on all screen sizes
- Navigation integration seamless

**Estimated Effort**: 4-5 hours

---

### Sub-Unit 15.6: Profile Feature Testing

**Goal**: Write comprehensive tests for profile feature covering backend
endpoints, frontend components, and integration flows

**Prerequisites**:

- Sub-Units 15.2-15.5 completed (full feature implemented)
- Testing infrastructure from Units 8-9 in place

**Deliverables**:

**Backend Unit Tests**:

- [ ] Test `profile_service.py` functions:
  - `get_user_profile()` returns correct data
  - `update_user_profile()` updates successfully
  - `update_user_profile()` rejects duplicate username
  - `update_user_profile()` rejects invalid username format
  - `delete_user_account()` deletes user successfully
- [ ] Test RLS policies: user cannot access other user's profile
- [ ] Test error scenarios: database connection error, invalid user ID

**Backend Integration Tests**:

- [ ] Test GET `/api/v1/users/me/profile` endpoint
  - Returns 200 with correct profile data
  - Returns 401 when unauthenticated
- [ ] Test PATCH `/api/v1/users/me/profile` endpoint
  - Returns 200 and updates profile with valid data
  - Returns 409 when username already taken
  - Returns 422 when username invalid format
  - Returns 401 when unauthenticated
- [ ] Test DELETE `/api/v1/users/me` endpoint
  - Returns 204 and deletes user
  - Returns 401 when unauthenticated
- [ ] Verify all responses include request ID
- [ ] Verify all operations logged correctly

**Frontend Component Tests**:

- [ ] Test `Avatar.tsx` component:
  - Renders with initials from user name or email
  - Displays fallback when image fails
  - Renders correct size based on prop
  - Has proper alt text
- [ ] Test `Profile.tsx` page component:
  - Displays loading skeleton on mount
  - Renders profile data when loaded
  - Shows error message when fetch fails
- [ ] Test `ProfileForm` (if separate component):
  - Pre-populates with current values
  - Validates username format
  - Shows error for invalid username
  - Disables save when no changes
- [ ] Test `DeleteAccountModal.tsx`:
  - Requires typing "DELETE" to enable button
  - Requires checkbox confirmation
  - Calls deleteAccount service on confirm
  - Closes on cancel

**Frontend Integration Tests**:

- [ ] Test profile update flow:
  - User changes username
  - Clicks save
  - Success toast appears
  - Profile displays new username
- [ ] Test username conflict flow:
  - User enters taken username
  - Clicks save
  - Error message appears below username field
  - Form not cleared (values preserved)
- [ ] Test delete account flow:
  - User clicks delete button
  - Modal opens
  - User types "DELETE" and checks confirmation
  - Account deleted
  - User logged out and redirected

**Manual E2E Testing**:

- [ ] Complete profile journey:
  - Login
  - Click avatar → Profile
  - Update name and username
  - Verify changes saved
  - Refresh page, verify changes persisted
  - Delete account
  - Verify redirect to home and logged out
- [ ] Test edge cases:
  - Very long username (20 chars)
  - Special characters in username (should reject)
  - Empty username (should accept, field is nullable)
  - Rapid multiple saves (test debouncing/loading states)

**Accessibility Testing**:

- [ ] Run axe DevTools on profile page - zero critical/serious issues
- [ ] Keyboard navigate entire profile flow (Tab, Enter, Escape)
- [ ] Screen reader test: verify form labels announced correctly
- [ ] Verify focus management in delete modal (trapped, returns on close)
- [ ] Test color contrast on all text elements

**Test Coverage Verification**:

- [ ] Run `pytest --cov=app/services/profile_service` - aim for > 90%
- [ ] Run `pytest --cov=app/api/routes/users` - aim for > 90%
- [ ] Run `npm run test:coverage` for profile components - aim for > 80%
- [ ] Review coverage report and add tests for uncovered branches

**Success Criteria**:

- All backend tests passing with > 90% coverage
- All frontend tests passing with > 80% coverage
- Manual E2E flow works flawlessly
- Accessibility tests pass with zero critical issues
- No regressions in existing features
- Test suite runs in < 15 seconds

**Estimated Effort**: 3-4 hours

---

### Sub-Unit 15.7: Profile Feature Polish & Documentation

**Goal**: Final polish, logging verification, documentation, and prepare feature
for production deployment

**Prerequisites**:

- Sub-Units 15.1-15.6 completed (feature fully tested)

**Deliverables**:

**Logging Verification**:

- [ ] Verify all profile operations logged with structured format
- [ ] Check logs include:
  - Profile view:
    `{"action": "profile_viewed", "user_id": "...", "request_id": "..."}`
  - Profile update:
    `{"action": "profile_updated", "user_id": "...", "changes": {"username": "new_value"}, "request_id": "..."}`
  - Delete account:
    `{"action": "account_deleted", "user_id": "...", "request_id": "..."}`
- [ ] Verify errors logged with ERROR level and full context
- [ ] Verify request IDs flow through entire profile request lifecycle

**Error Handling Audit**:

- [ ] Verify all error scenarios return standardized error responses
- [ ] Test error messages user-friendly (no technical jargon or stack traces)
- [ ] Verify request ID included in all error responses
- [ ] Test error recovery: retry after failure works correctly

**Performance Optimization**:

- [ ] Run Lighthouse on `/profile` page - aim for > 90 in all categories
- [ ] Check profile load time: should be < 500ms p95
- [ ] Verify avatar renders instantly (no network request for initials)
- [ ] Check bundle size impact: profile code should add < 50KB gzipped
- [ ] Optimize any slow queries (check database query explain plans)

**UI/UX Polish**:

- [ ] Add smooth transitions when profile data updates
- [ ] Add subtle hover effects on form fields
- [ ] Ensure loading states professional (skeleton screens, not just spinners)
- [ ] Verify empty states helpful (e.g., "No username set yet")
- [ ] Add micro-interactions: success checkmark on save, smooth modal animations
- [ ] Verify design system consistency (colors, spacing, typography)

**Documentation**:

- [ ] Update README with profile feature description
- [ ] Document API endpoints in API documentation:
  - GET `/api/v1/users/me/profile` - Returns user profile
  - PATCH `/api/v1/users/me/profile` - Updates profile
  - DELETE `/api/v1/users/me` - Deletes account
- [ ] Document username validation rules for other developers
- [ ] Document react-avatar integration and how initials are generated
- [ ] Add profile feature to user guide or help documentation
- [ ] Document database migration and deployment notes

**Feature Flag / Gradual Rollout** (optional):

- [ ] Consider adding feature flag for profile feature (if deploying to
      production incrementally)
- [ ] Document rollback procedure if issues found in production

**Code Review Checklist**:

- [ ] Review all profile-related code for quality and consistency
- [ ] Ensure consistent naming conventions (camelCase in frontend, snake_case in
      backend)
- [ ] Remove console.logs and debug code
- [ ] Ensure no hardcoded values (use environment variables or constants)
- [ ] Verify code comments clear and helpful
- [ ] Check for potential security issues (SQL injection, XSS) - should be
      protected by frameworks

**Git & PR**:

- [ ] Create feature branch if not already:
      `git checkout -b feature/user-profile`
- [ ] Commit changes with clear messages:
      `feat(profile): add user profile management`
- [ ] Write comprehensive PR description:
  - **What**: User profile page with edit and delete capabilities
  - **Why**: Users need ability to manage their account information
  - **How to Test**: Step-by-step testing instructions
  - **Screenshots**: Include before/after of profile page
  - **Database Changes**: Note username column migration
- [ ] Self-review PR diff for any issues
- [ ] Tag PR with labels: feature, needs-review, backend, frontend

**Deployment Checklist**:

- [ ] Verify migration file ready:
      `YYYYMMDDHHMMSS_add_username_to_user_profiles.sql`
- [ ] Plan migration execution: run on staging first, then production
- [ ] Verify no breaking changes for existing users (username nullable)
- [ ] Prepare rollback migration in case of issues
- [ ] Document deployment steps:
  1. Run database migration
  2. Deploy backend code
  3. Deploy frontend code
  4. Verify profile page loads
  5. Monitor logs for errors

**Success Criteria**:

- Logs structured and informative
- Errors handled gracefully with clear messages
- Performance meets targets (< 500ms load, Lighthouse > 90)
- UI polished and professional
- Documentation complete and accurate
- Code quality high (passes review)
- PR ready for merge
- Deployment plan documented and tested

**Estimated Effort**: 2-3 hours

---

PAUSE

## AI PROMPT:

Validate Unit 15 (User Profile Feature) completion:

**COMPREHENSIVE FEATURE VALIDATION**:

**Database & Backend**:

- Verify migration applied: query `user_profiles` table, confirm `username`
  column exists
- Test GET `/api/v1/users/me/profile` - returns profile with all fields
- Test PATCH with valid username - updates successfully
- Test PATCH with duplicate username - returns 409 error
- Test DELETE `/api/v1/users/me` - deletes account (test on non-production user)
- Check backend logs: verify all operations logged with request IDs
- Run `pytest tests/test_profile_endpoints.py` - all tests pass

**Frontend**:

- Navigate to `http://localhost:5173/profile` while authenticated
- Verify avatar displays with initials or custom image
- Verify form pre-populated with current profile data
- Change username and save - verify success toast appears
- Try duplicate username - verify error message shows
- Click "Delete Account" - verify modal opens with confirmation
- Type "DELETE" and check confirmation - verify button enables
- Test keyboard navigation: Tab through all form fields and buttons
- Run `npm run test` for profile tests - all pass
- Run Lighthouse on profile page - verify > 90 in all categories

**Integration**:

- Click avatar in navigation - verify dropdown shows "Profile" option
- Click "Profile" - verify navigates to `/profile`
- Update profile - refresh page - verify changes persisted
- Test on mobile viewport (375px) - verify responsive layout
- Run axe DevTools - verify zero accessibility issues

**Documentation**:

- Read updated README - verify profile feature documented
- Check API docs - verify profile endpoints listed
- Review PR description - verify comprehensive

**Confirm feature complete, tested, and ready for production deployment.**

---

## Challenge Completion Summary

**What You've Built**:

Congratulations! By completing this challenge, you have built a production-ready user profile management feature that demonstrates:

**Planning & Design**:

- ✅ Feature planning with mini-PRD, user stories, and technical requirements
- ✅ Database schema design with proper constraints and indexing
- ✅ API endpoint design with security and error handling considerations

**Database Layer**:

- ✅ Supabase migration for username column with validation constraints
- ✅ Unique index implementation for performance
- ✅ RLS policies ensuring data isolation between users

**Backend Implementation**:

- ✅ RESTful API endpoints (GET, PATCH, DELETE)
- ✅ Profile service layer with business logic separation
- ✅ Username validation (format checking and uniqueness enforcement)
- ✅ Comprehensive error handling with user-friendly messages
- ✅ Logging throughout the feature (if Session 3 completed: structured JSON with request IDs)
- ✅ Test coverage demonstrating quality (pytest suite)

**Frontend Implementation**:

- ✅ react-avatar integration with automatic initials generation
- ✅ Responsive profile page with professional UI
- ✅ Form validation and optimistic updates
- ✅ Delete account modal with multiple safeguards
- ✅ Navigation integration (avatar dropdown)
- ✅ Component and integration tests (Vitest)
- ✅ Accessibility compliance (keyboard navigation, WCAG AA)

**Production Readiness**:

- ✅ Performance optimized (< 500ms load times)
- ✅ Error handling tested comprehensively
- ✅ Documentation complete (API docs, user guide, deployment checklist)
- ✅ Migration and deployment plan documented
- ✅ Code review ready (clean, consistent, well-commented)

**Skills Demonstrated**:

- Full-stack feature development from planning to deployment
- Database design and migration management
- Secure API development with authentication and authorization
- Professional UI development with accessibility in mind
- Comprehensive testing (unit, integration, manual QA)
- Production deployment preparation

**Next Steps**:

- Deploy this feature to a staging environment
- Collect user feedback on the profile management experience
- Consider enhancements: profile image upload, additional fields, profile visibility settings
- Apply these patterns to build other features independently
- Progress to Session 4 (Agent SDK Integration) with confidence

---

**END OF USER PROFILE FEATURE CHALLENGE**

---
