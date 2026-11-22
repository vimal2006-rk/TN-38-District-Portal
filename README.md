# Tamil Nadu – 38 District Organization Portal
### தமிழ்நாடு 38 மாவட்ட அமைப்பு மேலாண்மை போர்டல்

A centralized full-stack web application designed to unite all 38 districts of Tamil Nadu through a single digital platform. Built with a **Modular Monolithic Architecture** supporting bilingual (Tamil + English) operations, state & district level administration, online membership, dynamic WhatsApp group directory, and mobile business network.

---

## 🌟 Key Features

- **All 38 Tamil Nadu Districts**: Dynamic database-driven directory with bilingual names (Tamil + English), leadership, and office details.
- **District-Wise WhatsApp Community Groups**: Direct invitation links for all 38 districts with 1-click joining.
- **Online Membership Registration**: Multi-category public registration workflow with admin review and approval.
- **Mobile Phone Business Network**: Dedicated state-wide trade platform connecting showroom owners, retailers, wholesale distributors, and service centers.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Public Visitors, Members, District Admins, and Super Admins.
- **Bilingual Interface**: Seamless instant language switching between Tamil (தமிழ்) and English via `i18next`.
- **100% Fluid Responsive Design**: Tailored for screens from 320px mobile up to 4K displays with touch-friendly tap targets.
- **News, Events & Media Gallery**: Centralized announcements, upcoming conclaves, and photo gallery.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), React Router v7, Tailwind CSS, Lucide Icons, Axios, i18next
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs, Zod Validation, Multer + Cloudinary, Compression
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Deployment Ready**:
  - Frontend: **Vercel** (`vercel.json` included with SPA rewrite rules)
  - Backend: **Render** (`render.yaml` infrastructure-as-code included)
  - Database: **Neon / Supabase** (PostgreSQL)

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/vimal2006-rk/tn-38-district-portal.git
cd tn-38-district-portal
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update DATABASE_URL with your PostgreSQL connection string
npx prisma generate
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🗄️ Database & Prisma Studio

### Run Database Migrations & Seed:
```bash
cd backend
# Push schema to PostgreSQL database
npx prisma db push

# Seed all 38 Tamil Nadu districts & default Super Admin
npm run db:seed
```

### Launch Prisma Studio:
```bash
cd backend
npx prisma studio
```
Prisma Studio opens visually in your browser at `http://localhost:5555` to view and edit all tables.

---

## 🌐 Production Deployment

### 1. Frontend on Vercel
1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.
5. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api`
6. Click **Deploy**.

### 2. Backend on Render
1. Go to [Render Dashboard](https://dashboard.render.com) and click **New Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `node server.js`
4. Add Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string (from Neon/Supabase)
   - `JWT_SECRET`: A secure 32+ character random secret
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your Vercel frontend URL
5. Click **Create Web Service**.

---

## 🔑 Default Admin Credentials
- **Email:** `admin@tn38portal.com`
- **Password:** `Admin@123`

---

## 📄 License
MIT License
