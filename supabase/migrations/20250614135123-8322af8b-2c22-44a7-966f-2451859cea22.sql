
-- 1. Create smtp_logs table to track SMTP connection/activity/errors
CREATE TABLE public.smtp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL, -- e.g., "connect", "send", "error"
  status TEXT,              -- e.g., "success", "failed", error message
  details JSONB,            -- for extra info such as SMTP server/trace
  user_id UUID REFERENCES public.users(id), -- if relevant
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create sent_emails table to record outbound emails
CREATE TABLE public.sent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL,             -- "sent", "bounced", "failed"
  error_message TEXT,               -- capture error if failed
  smtp_log_id UUID REFERENCES public.smtp_logs(id), -- link to smtp_logs entry
  user_id UUID REFERENCES public.users(id),         -- who sent/generated
  meta JSONB                        -- misc extra info
);

-- 3. Add (if missing) a swipe_type column to access_logs for generic future expansion (not destructive)
ALTER TABLE public.access_logs
  ADD COLUMN IF NOT EXISTS swipe_type TEXT; -- e.g., "card", "pin", "manual", "unknown"

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_smtp_logs_timestamp ON public.smtp_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_sent_emails_sent_at ON public.sent_emails(sent_at);

-- 5. Enable RLS (to be safe, only admins should see SMTP and sent emails logs)
ALTER TABLE public.smtp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

-- 6. RLS: Only admins may view/to interact
CREATE POLICY "Admin can view smtp logs" ON public.smtp_logs
  FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admin can view sent emails" ON public.sent_emails
  FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
