# Nexol escrow and payment scheduler

Next.js 15 application for non-custodial ERC-20 escrow and pre-funded recurring payouts on Base. The wallet layer uses wagmi + viem and supports browser wallets and Coinbase Wallet.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. Copy `.env.example` to `.env.local` and set the public Supabase variables and deployed contract addresses.

## Contracts

`hardhat/contracts/NexolEscrow.sol` supports atomic ERC-20 funding, work submission, payer release, payee refund, disputes, and administrator split resolution. `NexolScheduler.sol` holds the full schedule balance, releases due installments, refunds the unreleased balance on cancellation, and exposes Chainlink Automation-compatible `checkUpkeep` and `performUpkeep` functions.

```bash
cd hardhat
npm install
npm test
cp .env.example .env
npm run deploy:base-sepolia
```

Set `SUPPORTED_TOKEN_ADDRESSES` in `hardhat/.env`. After deployment, copy the printed addresses into the frontend environment variables and register each schedule as a Chainlink custom-logic upkeep using `abi.encode(scheduleId)` as `checkData`. Anyone can also call `executePayment(scheduleId)` when a payment is due.

## Production checklist

- Apply Supabase migrations and enable email verification/redirect URLs in Supabase Auth.
- Deploy and verify contracts on Base Sepolia, test end-to-end with test USDC, then obtain an independent audit before mainnet.
- Transfer contract ownership to a multisig; that address acts as the escrow dispute resolver and token-list administrator.
- Configure a reliable authenticated RPC provider and Chainlink Automation upkeeps.
- Add deployed contract addresses to Vercel and redeploy.

These contracts have automated tests but have not received an independent security audit. Do not represent them as audited or use them with production funds before review.
