# USRA Membership Campaign 2026

**United Service for Relational Amalgamation** — Full-stack MERN application for membership registration, photo upload, payment processing, and campaign poster generation.

---

## 🚀 Features

- **Landing Page** — Beautiful campaign intro with Malayalam text, animations, stats
- **Step 1 — Member Registration** — Full form with validation (name, DOB, parents, place, blood group, phone, email)
- **Step 2 — Photo Upload** — Drag & drop, crop (4:5 ratio), rotate, zoom with preview
- **Step 3 — Confirm & Pay** — Review all details, Razorpay payment (₹100)
- **Step 4 — Success & Poster** — Confetti animation, auto-generated campaign poster, download & share (Web Share API)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS v3 |
| Forms | React Hook Form + Zod validation |
| Photo Crop | react-cropper (CropperJS) |
| Animations | Framer Motion, CSS animations |
| Toasts | react-hot-toast |
| Payment | Razorpay |
| Poster | HTML5 Canvas API |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| File Upload | Multer |
| Validation | express-validator |

---

## 📋 Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Razorpay account (test or live)

---

## ⚡ Quick Setup

### 1. Clone & Install

```bash
git clone <your-repo>
cd usra-membership

# Install all dependencies at once
npm run install:all
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/usra_membership
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
```

### 4. Run Development Servers

```bash
# From root directory — runs both frontend & backend
npm run dev

# OR run separately:
npm run dev:backend   # Backend on :5000
npm run dev:frontend  # Frontend on :3000
```

---

## 🔑 Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy `Key ID` and `Key Secret` to your `.env` files
4. For production, generate **Live Keys** and update accordingly

**Test Cards:**
- Card: `4111 1111 1111 1111` | Expiry: Any future date | CVV: Any 3 digits
- UPI: `success@razorpay`

---

## 📁 Project Structure

```
usra-membership/
├── backend/
│   ├── models/
│   │   └── Member.js          # Mongoose schema
│   ├── routes/
│   │   ├── members.js         # CRUD + photo upload
│   │   └── payment.js         # Razorpay order + verify
│   ├── uploads/               # User photos (auto-created)
│   ├── server.js              # Express app entry
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   ├── usra-logo.png
│   │   │   └── poster-template.png
│   │   ├── components/
│   │   │   └── StepIndicator.js
│   │   ├── context/
│   │   │   └── MembershipContext.js
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── PhotoPage.js
│   │   │   ├── ConfirmPage.js
│   │   │   ├── SuccessPage.js
│   │   │   └── NotFoundPage.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   └── .env.example
│
└── package.json               # Root with concurrently
```

---

## 🌐 API Endpoints

### Members
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/members` | Create member |
| GET | `/api/members/:id` | Get member by MongoDB ID |
| POST | `/api/members/:id/photo` | Upload/update photo |

### Payment
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payment/create-order` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify payment signature |
| POST | `/api/payment/failed` | Mark payment as failed |

---

## 🚢 Production Deployment

### Backend (e.g., Railway, Render, EC2)
```bash
cd backend
NODE_ENV=production npm start
```

### Frontend (e.g., Vercel, Netlify)
```bash
cd frontend
npm run build
# Deploy the `build/` folder
```

Update `REACT_APP_API_URL` to your production backend URL.

### MongoDB
Use **MongoDB Atlas** for production. Update `MONGODB_URI` with your Atlas connection string.

---

## 🎨 Customization

### Colors
Edit `frontend/tailwind.config.js` → `theme.extend.colors.usra`

### Campaign Dates
Search for `April 15` in the codebase and update to your dates.

### Membership Amount
- Backend: `backend/routes/payment.js` → `amount: 10000` (paise, so ₹100)
- Frontend: `frontend/src/pages/ConfirmPage.js`

### Poster Layout
Edit `frontend/src/pages/SuccessPage.js` → `generatePoster()` function — adjust `photoX`, `photoY`, font sizes, text positions to match your template exactly.

---

## 📞 Support

For issues related to payment integration, refer to [Razorpay Documentation](https://razorpay.com/docs/).

---

*USRA Membership Campaign 2026 — ഞാനും പങ്കാളിയായി...*
