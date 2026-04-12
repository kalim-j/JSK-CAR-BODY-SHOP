# JSK Motors — Premium Car Restoration Website
## Complete Setup & Deployment Guide

A full-stack Next.js 15 + Firebase website for JSK CAR BODY SHOP, Krishnagiri, Tamil Nadu.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd d:\PROJECT
npm install
```

### 2. Configure Environment Variables

Your `.env.local` is already populated with the Firebase config. Verify these values match your Firebase Console:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDp4NVKjZzocPxSceZPA9hADauih7yNQjY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=jsk-car-body-shop.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=jsk-car-body-shop
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=jsk-car-body-shop.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=742443376198
NEXT_PUBLIC_FIREBASE_APP_ID=1:742443376198:web:a3d9b519a00a6b75c87447
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🔥 Firebase Setup

### Step 1: Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **jsk-car-body-shop**
3. Go to **Authentication → Sign-in method**
4. Enable:
   - ✅ **Email/Password**
   - ✅ **Google** (add `localhost` and your domain as authorized domains)

### Step 2: Set Up Firestore

1. Go to **Firestore Database → Create database**
2. Start in **production mode**
3. Copy the contents of `firestore.rules` file
4. Go to **Rules tab** and paste the rules
5. Click **Publish**

### Step 3: Set Up Storage

1. Go to **Storage → Get started**
2. Copy the contents of `storage.rules` file
3. Go to **Rules tab** and paste the rules
4. Click **Publish**

### Step 4: Authorize Domains (for Google Auth)

1. Go to **Authentication → Settings → Authorized domains**
2. Add:
   - `localhost`
   - `your-app.vercel.app` (after deployment)
   - Your custom domain (if any)

---

## 📦 Project Structure

```
d:\PROJECT\
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout (fonts, auth, navbar)
│   │   ├── globals.css           # Global luxury CSS styles
│   │   ├── buy/
│   │   │   ├── page.tsx          # Buy cars listing
│   │   │   └── [id]/page.tsx     # Car detail page
│   │   ├── sell/page.tsx         # Sell car form
│   │   ├── services/page.tsx     # Services page
│   │   ├── contact/page.tsx      # Contact + booking
│   │   ├── auth/
│   │   │   ├── login/page.tsx    # Login (email + Google)
│   │   │   └── register/page.tsx # Registration
│   │   └── admin/
│   │       ├── layout.tsx        # RBAC guard (admin only)
│   │       ├── page.tsx          # Admin dashboard
│   │       ├── cars/
│   │       │   ├── page.tsx      # Car management table
│   │       │   └── add/page.tsx  # Add car form
│   │       ├── dealers/page.tsx  # Dealer database + AI suggest
│   │       └── submissions/page.tsx # Approve/reject submissions
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx        # Responsive navbar with auth
│   │   │   └── Footer.tsx        # Footer with CTA
│   │   ├── home/
│   │   │   ├── HeroSection.tsx   # Parallax hero with particles
│   │   │   ├── ServicesSection.tsx
│   │   │   ├── BeforeAfterSection.tsx # Comparison slider
│   │   │   └── FeaturedCars.tsx  # Car cards grid
│   │   └── ui/
│   │       ├── WhatsAppButton.tsx # Floating WhatsApp
│   │       └── Skeleton.tsx      # Loading skeletons
│   ├── context/
│   │   └── AuthContext.tsx       # Firebase auth state
│   └── lib/
│       ├── firebase.ts           # Firebase initialization
│       ├── firestore.ts          # Firestore CRUD operations
│       ├── storage.ts            # Image upload utilities
│       ├── utils.ts              # Helpers, formatters
│       └── sampleData.ts         # Seed data for demo
├── firestore.rules               # Firestore security rules
├── storage.rules                 # Storage security rules
├── .env.local                    # Environment variables
├── tailwind.config.ts            # Gold/silver/black theme
└── next.config.ts                # Image domains, optimizations
```

---

## 👤 Admin Access

Only these emails have admin privileges:

| Email | Password |
|-------|----------|
| jskjageer@gmail.com | Jsk@786 |
| kalimdon07@gmail.com | Kalim@786 |

> First, create Firebase accounts with these emails via the Login page,
> then they'll automatically have admin access.

**Admin Panel URL:** http://localhost:3000/admin

---

## 📊 Adding Sample Data to Firestore

### Method 1: Via Admin Panel
1. Login with an admin email
2. Go to `/admin/cars/add`
3. Fill the form and add cars manually

### Method 2: Via Firebase Console
1. Go to Firestore → `cars` collection
2. Add document with these fields:
```json
{
  "title": "2020 Hyundai Creta Restored",
  "brand": "Hyundai",
  "model": "Creta",
  "year": 2020,
  "price": 750000,
  "condition": "Excellent",
  "mileage": 45000,
  "fuelType": "Petrol",
  "transmission": "Automatic",
  "city": "Krishnagiri",
  "state": "Tamil Nadu",
  "featured": true,
  "status": "available",
  "images": ["https://..."],
  "description": "..."
}
```

---

## 🌐 GitHub Setup

```bash
# Initialize git
git init
git add .
git commit -m "feat: initial JSK Motors platform release"

# Create GitHub repo (via GitHub CLI)
gh repo create jsk-motors --public --source=. --push

# OR manually:
# 1. Create repo at https://github.com/new
# 2. Then:
git remote add origin https://github.com/YOUR_USERNAME/jsk-motors.git
git branch -M main
git push -u origin main
```

---

## 🚀 Vercel Deployment

### Option 1: Via Vercel CLI (Recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 2: Via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository: `jsk-motors`
3. Add Environment Variables (from `.env.local`):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_ADMIN_EMAILS=jskjageer@gmail.com,kalimdon07@gmail.com`
4. Click **Deploy**
5. After deployment, add the Vercel URL to Firebase Authorized domains

---

## 📱 Pages Overview

| Page | URL | Access |
|------|-----|--------|
| Home | / | Public |
| Buy Cars | /buy | Public |
| Car Details | /buy/[id] | Public |
| Sell Car | /sell | Requires Login |
| Services | /services | Public |
| Contact | /contact | Public |
| Login | /auth/login | Guest only |
| Register | /auth/register | Guest only |
| Admin Dashboard | /admin | Admin only |
| Admin - Cars | /admin/cars | Admin only |
| Admin - Add Car | /admin/cars/add | Admin only |
| Admin - Submissions | /admin/submissions | Admin only |
| Admin - Dealers | /admin/dealers | Admin only |

---

## 🎨 Design System

- **Primary Color**: Black `#000000`  
- **Accent**: Gold `#D4AF37` (luxury automotive gold)  
- **Secondary**: Silver `#C0C0C0`  
- **Font**: Inter (body) + Playfair Display (headings)
- **Effects**: Glassmorphism, parallax, Framer Motion animations

---

## 🔧 Common Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Install new package
npm install package-name
```

---

## 📞 Business Info

- **Business**: JSK CAR BODY SHOP  
- **Address**: A-7, Athiyaman Auto Nagar, Krishnagiri Main Road, Gundalapatti, Tamil Nadu 636701  
- **Phone 1**: 7010587940  
- **Phone 2**: 9092704777  
- **WhatsApp**: +91-7010587940  
- **Email**: jskjageer@gmail.com  
- **Google Maps**: https://maps.app.goo.gl/wwEvkkBtf745wfbt8
