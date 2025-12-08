# PrintForge - Premium 3D Printing E-Commerce Platform

<div align="center">
  <h1>🔧 PrintForge</h1>
  <h3>The Future of Custom 3D Printing</h3>
  <p>A production-ready, futuristic e-commerce platform for 3D printing services</p>
  <br />
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#installation">Installation</a> •
    <a href="#deployment">Deployment</a>
  </p>
</div>

---

## ✨ Features

### Customer Features
- **Instant Quote System** - Upload STL, OBJ, 3MF, or STEP files and get real-time pricing
- **3D Model Preview** - Interactive 3D viewer with orbit controls
- **Material Selection** - Choose from 6+ materials with real-time price updates
- **Customization Options** - Adjust infill, layer height, color, and scale
- **Smart Cart** - Persistent cart with quantity controls and pricing
- **Wishlist** - Save favorite products for later
- **User Dashboard** - Track orders, manage addresses, view upload history
- **Secure Checkout** - Multi-step checkout with Stripe integration

### Admin Features
- **Revenue Dashboard** - Visual analytics and key metrics
- **Order Management** - Track and update order statuses
- **Product CRUD** - Full product management system
- **Customer Overview** - View customer accounts and history

### Technical Features
- **PWA Ready** - Installable progressive web app
- **Dark/Light Mode** - System-synced theme switching
- **Responsive Design** - Mobile-first, works on all devices
- **Performance Optimized** - Code splitting, lazy loading, optimized assets
- **Type Safe** - Full TypeScript coverage
- **Real-time Updates** - Optimistic UI with TanStack Query

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 + Vite |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Animation** | Framer Motion |
| **Routing** | React Router v6 |
| **State** | Zustand + TanStack Query |
| **Forms** | React Hook Form + Zod |
| **3D Graphics** | Three.js + React Three Fiber + Drei |
| **Backend** | Supabase (Auth, DB, Storage, Edge Functions) |
| **Payments** | Stripe (Checkout + Webhooks) |
| **Icons** | Lucide React |
| **SEO** | React Helmet Async |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account (for backend)
- Stripe account (for payments)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/printforge.git
cd printforge

# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.example .env

# Fill in your environment variables
# Edit .env with your Supabase and Stripe keys

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Optional: Google Analytics
VITE_GA_ID=G-XXXXXXXXXX
```

---

## 🗄️ Database Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned

### 2. Run the Schema

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL to create tables and RLS policies

### 3. Seed Sample Data

1. In the SQL Editor, copy the contents of `supabase/seed.sql`
2. Run the SQL to populate sample products, materials, and test data

### 4. Configure Storage

1. Go to Storage in your Supabase dashboard
2. Create a bucket called `models` for 3D model files
3. Create a bucket called `products` for product images
4. Set the buckets to public or configure appropriate RLS policies

### 5. Enable Authentication

1. Go to Authentication → Providers
2. Enable Email/Password authentication
3. (Optional) Enable Google OAuth
4. (Optional) Enable GitHub OAuth

---

## 📁 Project Structure

```
printforge/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── home/          # Homepage sections (Hero, Featured, etc.)
│   │   ├── layout/        # Header, Footer, CartPanel, RootLayout
│   │   └── ui/            # shadcn/ui components
│   ├── lib/
│   │   ├── supabase.ts    # Supabase client & helpers
│   │   └── utils.ts       # Utility functions
│   ├── pages/             # Route pages
│   │   ├── HomePage.tsx
│   │   ├── ShopPage.tsx
│   │   ├── ProductPage.tsx
│   │   ├── UploadPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── WishlistPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── AccountPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   └── AdminPage.tsx
│   ├── stores/            # Zustand stores
│   │   ├── authStore.ts
│   │   ├── cartStore.ts
│   │   ├── wishlistStore.ts
│   │   └── themeStore.ts
│   ├── types/             # TypeScript definitions
│   │   └── index.ts
│   ├── App.tsx            # Main app with routing
│   ├── index.css          # Global styles + Tailwind
│   └── main.tsx           # Entry point
├── supabase/
│   ├── schema.sql         # Database schema + RLS policies
│   ├── seed.sql           # Sample data
│   └── functions/         # Edge Functions
│       ├── stripe-webhook/
│       ├── create-checkout/
│       └── generate-invoice/
├── .env.example           # Environment variables template
├── tailwind.config.js     # Tailwind configuration
├── vite.config.ts         # Vite configuration
└── package.json
```

---

## 📱 Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Homepage with hero, featured products | No |
| `/shop` | Product catalog with filters | No |
| `/shop/:category` | Category filtered products | No |
| `/product/:slug` | Product detail with 3D viewer | No |
| `/upload` | File upload and instant quote | No |
| `/cart` | Shopping cart | No |
| `/wishlist` | Saved products | Yes |
| `/login` | Sign in page | No |
| `/register` | Create account | No |
| `/account` | User dashboard | Yes |
| `/checkout` | Multi-step checkout | No (Guest allowed) |
| `/admin` | Admin dashboard | Yes (Admin only) |

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or deploy via CLI
npm i -g vercel
vercel
```

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables
6. Deploy!

### Deploy Supabase Edge Functions

```bash
# Install Supabase CLI
npm i -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout
supabase functions deploy generate-invoice
```

---

## 💳 Stripe Integration

### Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. Add the public key to your `.env` file
4. Add the secret key to Supabase Edge Function secrets

### Configure Webhooks

1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret to Supabase secrets

### Test Payments

Use Stripe test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Auth: `4000 0025 0000 3155`

---

## 🔒 Security

- **Row Level Security (RLS)** on all Supabase tables
- **Protected routes** for authenticated users
- **Admin-only routes** with role checking
- **Secure session handling** with Supabase Auth
- **Input validation** with Zod schemas
- **CSRF protection** via Supabase
- **XSS prevention** via React's built-in escaping

---

## 🧪 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

---

## 🎨 Customization

### Theme Colors

Edit the CSS variables in `src/index.css`:

```css
:root {
  --primary: 199 89% 48%;       /* Main brand color */
  --background: 0 0% 100%;      /* Light mode background */
  --foreground: 222.2 84% 4.9%; /* Light mode text */
}

.dark {
  --background: 20 14.3% 4.1%;  /* Dark mode background */
  --foreground: 0 0% 95%;       /* Dark mode text */
}
```

### Adding New Materials

1. Add to `supabase/seed.sql`
2. Run the SQL in Supabase dashboard

### Adding New Products

1. Use the Admin Dashboard
2. Or insert directly via SQL/API

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - feel free to use this for your own projects!

---

## 📞 Support

- **Documentation**: Check this README
- **Issues**: Open a GitHub issue
- **Email**: support@printforge.dev

---

<div align="center">
  <br />
  <p>Built with ❤️ for makers, engineers, and creators</p>
  <p><strong>PrintForge</strong> - Where Ideas Become Reality</p>
  <br />
  <p>⭐ Star this repo if you find it useful!</p>
</div>
