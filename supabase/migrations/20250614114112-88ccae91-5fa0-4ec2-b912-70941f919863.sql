
-- Make card_number NOT NULL for users
ALTER TABLE public.users
    ALTER COLUMN card_number SET NOT NULL;

-- Enforce uniqueness of card_number across enabled users only (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS unique_card_number_enabled_users
    ON public.users (card_number)
    WHERE disabled IS FALSE;
