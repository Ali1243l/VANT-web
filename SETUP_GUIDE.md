# VANT Lookbook — Next.js 14 + Supabase Setup Guide

This guide details the exact terminal commands, dependency installation, and environment variables required to initialize the VANT mobile-first digital catalog on Next.js 14 (App Router) with Tailwind CSS, shadcn/ui, framer-motion, and Supabase.

---

### Step 1: Create Next.js 14 App with TypeScript & Tailwind CSS
Run the following command in your terminal:

```bash
npx create-next-app@latest vant-catalog \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm
```

Navigate into your project folder:
```bash
cd vant-catalog
```

---

### Step 2: Install Core Dependencies
Install Framer Motion (animations & swipe gestures), Supabase client, Lucide icons, and Fuse.js (weighted fuzzy search):

```bash
npm install framer-motion @supabase/supabase-js lucide-react fuse.js clsx tailwind-merge
```

---

### Step 3: Initialize shadcn/ui
Initialize shadcn/ui with the neutral slate base:

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Install essential shadcn components for bottom sheets, accordions, and dialogs:
```bash
npx shadcn@latest add dialog sheet accordion badge button
```

---

### Step 4: Configure Supabase Client
Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
NEXT_PUBLIC_VANT_INSTAGRAM_HANDLE=vant.streetwear
NEXT_PUBLIC_VANT_WHATSAPP_NUMBER=15550192834
```

Create your Supabase client helper at `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

### Step 5: Database Schema
Apply the SQL file in `supabase/schema.sql` inside your Supabase dashboard SQL Editor.
This provisions:
- `products` table with sizes and colors arrays, pricing, and category indexes
- `product_media` table with foreign key cascade and display ordering
- Row Level Security (RLS) policies granting public read permissions
- Initial seed records for the VANT streetwear drop
