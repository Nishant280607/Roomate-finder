# 🏡 RoomieFinder — Full-Stack Peer Discovery & Matching Platform

[![React 19](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

RoomieFinder is a full-stack roommate matching platform designed to connect young professionals and students based on verified living habits, budget constraints, and personal rhythms.

## 🚀 Key Architectural Highlights

- **Supabase Authentication & RLS**: Secure session persistence with PostgreSQL Row-Level Security policies.
- **Compatibility Scoring Engine**: Multi-dimensional scoring evaluating sleep schedules, cleanliness ratings, and social habits.
- **Dynamic Search & Filtering**: Multi-parameter search by location, occupation, and budget thresholds.
- **Interactive Messaging**: Real-time conversation switcher with message threading and typing indicators.
- **Responsive UI**: Custom design tokens, glassmorphism cards, and mobile-responsive drawer navigation.

## 🛠 Tech Stack

- **Frontend**: React 19, React Router v6, CSS3 Custom Properties
- **Backend & Database**: Supabase, PostgreSQL, Supabase Auth
- **Deployment**: Vercel (CI/CD)

## 🏃 Local Setup

```bash
cd frontend
npm install
npm run dev
```