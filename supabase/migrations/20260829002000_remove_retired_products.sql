-- NexolPay now contains only escrow and payment scheduling.
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_wallet();
DROP TABLE IF EXISTS public.gift_card_redemptions CASCADE;
DROP TABLE IF EXISTS public.gift_card_submissions CASCADE;
DROP TABLE IF EXISTS public.vault_deposits CASCADE;
DROP TABLE IF EXISTS public.user_wallets CASCADE;
