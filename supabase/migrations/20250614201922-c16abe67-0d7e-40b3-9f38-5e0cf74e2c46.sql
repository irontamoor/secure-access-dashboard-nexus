
-- Insert a test staff user with known credentials. 
INSERT INTO public.users (username, email, name, role, pin, card_number)
VALUES (
  'teststaff',
  'teststaff@example.com',
  'Test Staff User',
  'staff',
  '1234',
  '0000111122223333'
)
ON CONFLICT (username) DO NOTHING; -- Ensures if it already exists, it will not error
