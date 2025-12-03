-- Migration: Seed sample ideas for analytics testing
-- Created: 2025-12-03
-- Description: Insert 5 sample ideas with varied statuses, tags, and dates
--              to populate analytics dashboard charts for testing and validation
--
-- IMPORTANT: This is TEST DATA ONLY for validating the analytics dashboard.
--            Remove before production deployment.
--
-- Usage:
--   1. Ensure you have a test user account created and authenticated
--   2. Update the user_id value below with your test user's UUID
--   3. Run this migration via Supabase dashboard SQL Editor
--   4. Refresh /analytics page to see populated charts
--
-- Cleanup:
--   DELETE FROM ideas WHERE title LIKE 'Sample:%';

-- ============================================================================
-- CONFIGURATION
-- ============================================================================

-- REQUIRED: Replace this with your actual test user UUID
-- You can get this by running: SELECT id FROM auth.users WHERE email = 'your-test-email@example.com';
-- Or check Redux state in browser DevTools: state.auth.user.id

DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Attempt to get the first user from auth.users
  -- If you have a specific test user, replace this query with:
  -- test_user_id := 'your-user-uuid-here'::UUID;
  
  SELECT id INTO test_user_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Verify we found a user
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found in auth.users. Please create a test user first via signup.';
  END IF;
  
  -- Check if sample data already exists to prevent duplicates
  IF EXISTS (SELECT 1 FROM ideas WHERE title LIKE 'Sample:%') THEN
    RAISE NOTICE 'Sample data already exists. Skipping seed to prevent duplicates.';
    RAISE NOTICE 'To re-seed, first run: DELETE FROM ideas WHERE title LIKE ''Sample:%%'';';
  ELSE
    -- ============================================================================
    -- SEED SAMPLE IDEAS
    -- ============================================================================
    
    RAISE NOTICE 'Seeding 15 sample ideas for user: %', test_user_id;
    
    -- Day 1: 25 days ago - 1 idea
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: AI-Powered Code Review Assistant',
      'Build an AI tool that automatically reviews pull requests, suggests improvements, and checks for common bugs. Integrates with GitHub and provides inline comments.',
      'published',
      ARRAY['ai', 'devtools', 'productivity'],
      8,
      NOW() - INTERVAL '25 days',
      NOW() - INTERVAL '25 days'
    );
    
    -- Day 2: 22 days ago - 1 idea
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Smart Home Energy Optimizer',
      'IoT device + app that learns your energy usage patterns and automatically adjusts heating/cooling to minimize costs while maintaining comfort.',
      'draft',
      ARRAY['iot', 'greentech', 'mobile'],
      3,
      NOW() - INTERVAL '22 days',
      NOW() - INTERVAL '22 days'
    );
    
    -- Day 3: 18 days ago - 2 ideas (same day)
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Real-Time Collaboration Whiteboard',
      'A collaborative drawing canvas with real-time sync, perfect for remote team brainstorming. Features: shapes, sticky notes, freehand drawing, and voting on ideas.',
      'published',
      ARRAY['collaboration', 'saas', 'design'],
      12,
      NOW() - INTERVAL '18 days',
      NOW() - INTERVAL '18 days'
    );
    
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Recipe Recommendation Engine',
      'App that suggests recipes based on ingredients you have at home (detected via photo). Includes step-by-step video tutorials and shopping list generation.',
      'published',
      ARRAY['food', 'ai', 'mobile'],
      6,
      NOW() - INTERVAL '18 days' - INTERVAL '3 hours',
      NOW() - INTERVAL '18 days' - INTERVAL '3 hours'
    );
    
    -- Day 4: 14 days ago - 1 idea
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Automated Meeting Notes with Action Items',
      'AI transcription service that joins video calls, takes notes, and automatically extracts action items and assigns them to team members.',
      'published',
      ARRAY['ai', 'productivity', 'saas'],
      9,
      NOW() - INTERVAL '14 days',
      NOW() - INTERVAL '14 days'
    );
    
    -- Day 5: 10 days ago - 3 ideas (peak activity day)
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Personal Finance Dashboard',
      'Aggregate all bank accounts, investments, and crypto into one beautiful dashboard. Auto-categorize spending, track budgets, and get AI-powered savings recommendations.',
      'published',
      ARRAY['fintech', 'ai', 'mobile', 'saas'],
      15,
      NOW() - INTERVAL '10 days',
      NOW() - INTERVAL '10 days'
    );
    
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Fitness Gamification Platform',
      'Turn your daily workouts into an RPG game where you level up, unlock achievements, and compete with friends. Integrates with Apple Health and Strava.',
      'draft',
      ARRAY['health', 'gaming', 'mobile'],
      7,
      NOW() - INTERVAL '10 days' - INTERVAL '2 hours',
      NOW() - INTERVAL '10 days' - INTERVAL '2 hours'
    );
    
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Sustainable Shopping Assistant',
      'Browser extension that shows environmental impact scores for products while shopping online. Suggests eco-friendly alternatives.',
      'published',
      ARRAY['greentech', 'browser-extension', 'ecommerce'],
      11,
      NOW() - INTERVAL '10 days' - INTERVAL '5 hours',
      NOW() - INTERVAL '10 days' - INTERVAL '5 hours'
    );
    
    -- Day 6: 7 days ago - 2 ideas
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Freelancer Invoice Automation',
      'Automatically generate and send invoices based on time tracking data. Includes payment reminders, expense tracking, and tax calculation.',
      'published',
      ARRAY['fintech', 'productivity', 'saas'],
      10,
      NOW() - INTERVAL '7 days',
      NOW() - INTERVAL '7 days'
    );
    
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Language Learning with News Articles',
      'Read real news in your target language with inline translations, difficulty adjustments, and vocabulary flashcards generated from articles.',
      'draft',
      ARRAY['education', 'ai', 'mobile'],
      5,
      NOW() - INTERVAL '7 days' - INTERVAL '4 hours',
      NOW() - INTERVAL '7 days' - INTERVAL '4 hours'
    );
    
    -- Day 7: 5 days ago - 2 ideas
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Pet Health Tracker',
      'Track vet visits, medications, vaccinations, and weight for your pets. Get reminders for checkups and prescription refills.',
      'published',
      ARRAY['health', 'mobile', 'saas'],
      8,
      NOW() - INTERVAL '5 days',
      NOW() - INTERVAL '5 days'
    );
    
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Local Event Discovery Feed',
      'Personalized feed of concerts, meetups, and activities happening near you based on your interests. Community-driven recommendations.',
      'published',
      ARRAY['social', 'mobile', 'events'],
      13,
      NOW() - INTERVAL '5 days' - INTERVAL '6 hours',
      NOW() - INTERVAL '5 days' - INTERVAL '6 hours'
    );
    
    -- Day 8: 3 days ago - 1 idea
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Code Snippet Manager with AI Search',
      'Save and organize your code snippets with AI-powered search. "Find me that React hook for debouncing" and it finds the right snippet.',
      'archived',
      ARRAY['devtools', 'ai', 'productivity'],
      4,
      NOW() - INTERVAL '3 days',
      NOW() - INTERVAL '3 days'
    );
    
    -- Day 9: 2 days ago - 2 ideas
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Resume Builder with ATS Optimization',
      'Create resumes that pass Applicant Tracking Systems. Real-time feedback on keyword optimization and formatting.',
      'published',
      ARRAY['career', 'ai', 'saas'],
      14,
      NOW() - INTERVAL '2 days',
      NOW() - INTERVAL '2 days'
    );
    
    INSERT INTO ideas (user_id, title, description, status, tags, vote_count, created_at, updated_at)
    VALUES (
      test_user_id,
      'Sample: Plant Care Reminder App',
      'Get notifications when your plants need watering, fertilizing, or repotting. Includes plant disease diagnosis via photo.',
      'draft',
      ARRAY['lifestyle', 'mobile', 'ai'],
      6,
      NOW() - INTERVAL '2 days' - INTERVAL '3 hours',
      NOW() - INTERVAL '2 days' - INTERVAL '3 hours'
    );
    
    RAISE NOTICE 'Successfully seeded 15 sample ideas with varied daily counts!';
    RAISE NOTICE 'Daily distribution: Day 1 (1), Day 2 (1), Day 3 (2), Day 4 (1), Day 5 (3), Day 6 (2), Day 7 (2), Day 8 (1), Day 9 (2)';
    RAISE NOTICE 'Navigate to /analytics to see populated charts with trend line.';
    RAISE NOTICE 'To remove sample data, run: DELETE FROM ideas WHERE title LIKE ''Sample:%%'';';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - comment out if not needed)
-- ============================================================================

-- Verify sample data inserted
-- SELECT id, title, status, tags, vote_count, created_at
-- FROM ideas
-- WHERE title LIKE 'Sample:%'
-- ORDER BY created_at DESC;

-- Verify analytics views populated
-- SELECT * FROM items_by_date ORDER BY date DESC LIMIT 10;
-- SELECT * FROM items_by_status;
-- SELECT * FROM tags_usage ORDER BY usage_count DESC LIMIT 10;

-- Migration complete
