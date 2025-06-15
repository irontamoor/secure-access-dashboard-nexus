
-- 1. Table for controller API keys
CREATE TABLE public.controller_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL UNIQUE,
  controller_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for controller_api_keys (admin only can select/insert/delete)
ALTER TABLE public.controller_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view keys"
  ON public.controller_api_keys
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Admins can manage keys"
  ON public.controller_api_keys
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

-- 2. Update access_logs table
-- Ensure all logs have card_number and door_id set by controller API logs (card_number = controller input)
ALTER TABLE public.access_logs
  ADD COLUMN IF NOT EXISTS card_number TEXT;

-- If not already covered: index for log lookups
CREATE INDEX IF NOT EXISTS idx_access_logs_card_number ON public.access_logs(card_number);

-- 3. (Optional but useful) Add reference in access_logs to controller_api_keys for traceability
ALTER TABLE public.access_logs
  ADD COLUMN IF NOT EXISTS controller_id UUID REFERENCES public.controller_api_keys(id);

CREATE INDEX IF NOT EXISTS idx_access_logs_controller_id ON public.access_logs(controller_id);

