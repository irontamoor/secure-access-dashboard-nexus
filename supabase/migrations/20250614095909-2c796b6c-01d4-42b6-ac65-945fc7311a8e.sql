
-- Add disabled column to users.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false;

-- Add disabled column to doors.
ALTER TABLE public.doors ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false;

-- Add pin_disabled column to users.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pin_disabled boolean NOT NULL DEFAULT false;
