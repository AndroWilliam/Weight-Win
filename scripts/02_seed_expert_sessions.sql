-- Seed expert sessions with upcoming dates
-- This creates scheduled nutrition expert sessions for the next 3 months

INSERT INTO expert_sessions (session_date, max_participants, current_participants) VALUES
  -- January 2025 sessions
  ('2025-01-15', 20, 0),
  ('2025-01-22', 20, 0),
  ('2025-01-29', 20, 0),
  
  -- February 2025 sessions
  ('2025-02-05', 20, 0),
  ('2025-02-12', 20, 0),
  ('2025-02-19', 20, 0),
  ('2025-02-26', 20, 0),
  
  -- March 2025 sessions
  ('2025-03-05', 20, 0),
  ('2025-03-12', 20, 0),
  ('2025-03-19', 20, 0),
  ('2025-03-26', 20, 0),
  
  -- April 2025 sessions
  ('2025-04-02', 20, 0),
  ('2025-04-09', 20, 0),
  ('2025-04-16', 20, 0),
  ('2025-04-23', 20, 0),
  ('2025-04-30', 20, 0)
ON CONFLICT (session_date) DO NOTHING;
