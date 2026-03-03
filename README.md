<div align="center">
  <h1>🐳 WhaleSight</h1>
  <p><strong>A powerful Solana wallet tracking & analysis bot and Telegram Mini App</strong></p>
</div>

<br />

## 📖 Overview

WhaleSight is a comprehensive toolset for the Solana ecosystem, designed to track wallet activities, analyze PnL (Profit and Loss), and provide real-time transaction alerts directly inside Telegram. It consists of a robust Express-based backend serving as a Telegram Bot and API, alongside a sleek React+Vite Telegram Mini App for an integrated user experience.

This monorepo is managed using [Turborepo](https://turbo.build/repo), organizing the suite into two main applications:

- **`api`**: The backend server, Telegram Bot, and Webhook handler.
- **`web`**: The Telegram Mini App frontend interface.

---

## ✨ Features

### 🤖 Telegram Bot (`api`)

- **Real-time Alerts**: Powered by Helius webhooks, get instant notifications on swaps and transactions for tracked wallets.
- **Wallet Managing**: Add or remove wallets from your tracking list using intuitive commands (`/track`, `/remove`, `/list`).
- **Deep Scanning**: Scan any Solana wallet for PnL breakdowns and activity insights (`/scan`).
- **Rug Checks**: Integrated risk analysis via the `/rugcheck` endpoint.

### 📱 Telegram Mini App (`web`)

- **Seamless Integration**: Runs natively inside Telegram via `@twa-dev/sdk`.
- **Dashboard Interface**: Beautiful UI built with Tailwind CSS, Framer Motion, and Lucide Icons.
- **Quick Actions**: Manually scan wallets or add them to your tracking list via sleek sliding drawers and modals (`WalletScanModal`, `AddWalletDrawer`).

---

## 🏗 Architecture & Tech Stack

This project is structured as a **Turborepo** monorepo:

### `apps/api` (Backend & Bot)

- **Node.js & Express**: Core server framework.
- **Telegram Bot API**: Using `node-telegram-bot-api` for polling/webhooks.
- **Database**: PostgreSQL via `@neondatabase/serverless`.
- **Solana Web3**: Powered by `@solana/web3.js` and custom webhooks via Helius.
- **Caching**: Redis implementation for performance optimizations.

### `apps/web` (Frontend Mini App)

- **React 19 & Vite**: Ultra-fast frontend development.
- **Tailwind CSS & Framer Motion**: Styling and animations.
- **TWA SDK**: Telegram Web App integration for native feel.
- **Sonner**: Toast notifications.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (v10.18+ as specified in package.json)
- A Telegram Bot Token from [BotFather](https://t.me/BotFather)
- A [Helius](https://helius.dev/) API Key for Solana webhooks
- A Neon Serverless Postgres connection string

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/whalesight.git
   cd whalesight
   ```

2. **Install dependencies (at the monorepo root):**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   - Navigate to `apps/api` and create a `.env` file referencing `.env.example`.
   - Include vital keys:
     ```env
     TELEGRAM_BOT_TOKEN="your_token_here"
     PORT=5000
     SERVER_URL="your_ngrok_or_deployment_url"
     DATABASE_URL="your_neon_db_url"
     HELIUS_API_KEY="your_helius_key"
     ```
   - For `apps/web`, ensure `VITE_API_URL` is set if running outside local dev.

### Running the App Locally

You can run both apps simultaneously using Turborepo from the root directory:

```bash
# Start both the API and Web apps in development mode
pnpm run dev
```

Alternatively, you can run them individually:

- **API**: `cd apps/api && pnpm run dev`
- **Web**: `cd apps/web && pnpm run dev`

---

## 📚 Bot Commands Reference

Once the bot is running and the webhook is set up (via `/setup`), you can use the following commands in Telegram:

- `/help` - View all available commands.
- `/track <address>` - Monitor a wallet and receive alerts when new transactions occur.
- `/scan <address>` - Analyze a wallet and get a full breakdown of its activity, token holdings, and risk insights.
- `/list` - View all wallets you are currently tracking.
- `/remove <address>` - Remove a wallet from your tracked list.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the ISC License.
