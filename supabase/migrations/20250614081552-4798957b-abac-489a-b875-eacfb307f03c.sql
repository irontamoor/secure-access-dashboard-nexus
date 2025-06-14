
-- 1. Door Groups: for grouping doors together
CREATE TABLE public.door_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Membership table: which doors belong to which groups
CREATE TABLE public.door_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.door_groups(id) ON DELETE CASCADE,
  door_id UUID NOT NULL REFERENCES public.doors(id) ON DELETE CASCADE,
  UNIQUE(group_id, door_id)
);

-- 3. Update door_permissions to support group and all doors.
ALTER TABLE public.door_permissions
  ADD COLUMN IF NOT EXISTS door_group_id UUID REFERENCES public.door_groups(id),
  ADD COLUMN IF NOT EXISTS all_doors BOOLEAN NOT NULL DEFAULT false;

-- Make sure at least one of (door_id, door_group_id, all_doors) is set per row and mutually exclusive
CREATE OR REPLACE FUNCTION public.validate_door_permission_target()
RETURNS trigger AS $$
BEGIN
  IF (NEW.all_doors)::int + (NEW.door_id IS NOT NULL)::int + (NEW.door_group_id IS NOT NULL)::int != 1 THEN
    RAISE EXCEPTION 'Permission must specify exactly one of all_doors, door_id, or door_group_id.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_door_permission_target ON public.door_permissions;

CREATE TRIGGER trg_validate_door_permission_target
  BEFORE INSERT OR UPDATE ON public.door_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_door_permission_target();

-- Add index for group permission checks
CREATE INDEX IF NOT EXISTS idx_door_permissions_door_group_id ON public.door_permissions(door_group_id);

-- Add index for all_doors query
CREATE INDEX IF NOT EXISTS idx_door_permissions_all_doors ON public.door_permissions(all_doors);

