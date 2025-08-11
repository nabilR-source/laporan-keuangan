# Web Laporan Keuangan — Complete Starter (Frontend + Backend)

Project ready to run. Frontend is static (uses CDN resources), Backend is Node.js + Express + MySQL.

## Struktur
- frontend/ (static site)
- backend/ (Express API)

## Cara cepat menjalankan (development)
1. Siapkan MySQL, buat database dan tabel:
   - import file: backend/db.sql
2. Backend:
   - cd backend
   - copy .env.example -> .env dan isi konfigurasi DB
   - npm install
   - npm run start
3. Frontend:
   - cd frontend
   - buka index.html di browser atau jalankan `npx serve -s . -l 3000` untuk serving lokal

API backend default: http://localhost:4000
Frontend (static): open frontend/index.html

Enjoy! Jika mau saya push langsung ke GitHub, beri akses repo atau username.
