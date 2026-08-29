-- NexolPay now contains only escrow and payment scheduling.
DROP TABLE IF EXISTS public.gift_card_redemptions CASCADE;
DROP TABLE IF EXISTS public.gift_card_submissions CASCADE;
DROP TABLE IF EXISTS public.vault_deposits CASCADE;
DROP TABLE IF EXISTS public.user_wallets CASCADE;
