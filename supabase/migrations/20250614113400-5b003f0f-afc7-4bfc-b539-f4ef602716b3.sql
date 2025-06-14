
-- Add card_number column to users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS card_number text;

-- You might want to add an index for card_number for quick lookup
CREATE INDEX IF NOT EXISTS users_card_number_idx ON public.users(card_number);
