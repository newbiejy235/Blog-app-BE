# Knowledge Backend

Backend REST API untuk aplikasi **Knowledge**, sebuah Blog App yang menyediakan layanan autentikasi pengguna, pengelolaan artikel, kategori, komentar, serta fitur upload gambar menggunakan Cloudinary.

---

## Deskripsi

Repository ini merupakan bagian **Backend** dari aplikasi Knowledge. Backend bertanggung jawab menyediakan REST API untuk menangani autentikasi pengguna, pengelolaan data artikel, dan upload gambar melalui Cloudinary. Backend dibangun menggunakan Express + TypeScript dengan Drizzle ORM dan MySQL sebagai database.

---

## Tech Stack

Berdasarkan konfigurasi project, backend ini menggunakan:

- **Node.js** — runtime JavaScript
- **TypeScript** — bahasa pemrograman
- **Express** — framework HTTP server
- **Drizzle ORM** — ORM untuk database
- **MySQL** — database
- **Cloudinary** — layanan penyimpanan/upload gambar
- **JWT** — autentikasi (berdasarkan folder `server` bertema Auth)

> Catatan: versi dependency dapat dilihat pada `server/package.json`.

---

## Fitur Backend

- Autentikasi pengguna (Auth)
- Upload gambar melalui Cloudinary
- REST API berbasis Express
- Integrasi database MySQL dengan Drizzle ORM

---

## Requirements

Pastikan sudah terpasang:

- **Node.js** (disarankan versi LTS)
- **npm**
- **MySQL** (server database)
- **Git**
- Akun **Cloudinary** (cloud name, API key, API secret)

---

## Installation

```bash
git clone https://github.com/newbiejy235/Blog-app-BE.git
cd Blog-app-BE/server
npm install
```

> Install dependency dilakukan di dalam folder `server`.

---

## Environment Configuration

Buat file `.env` di dalam folder `server` dengan konfigurasi berikut (sesuaikan dengan `.env.example` jika tersedia):

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/knowledge

# Auth
JWT_SECRET=your_jwt_secret_here

# Server
PORT=5000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

| Variable | Fungsi |
| --- | --- |
| `DATABASE_URL` | Koneksi ke database MySQL |
| `JWT_SECRET` | Secret untuk menandatangani & memverifikasi JWT |
| `PORT` | Port server backend |
| `CLOUDINARY_CLOUD_NAME` | Nama cloud Cloudinary |
| `CLOUDINARY_API_KEY` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary |

> Nilai di atas adalah placeholder. Jangan commit file `.env` ke repository (folder `server/.env` memang sudah dihapus dari repo).

---

## Database Setup

Database yang digunakan adalah **MySQL** melalui **Drizzle ORM**.

Jalankan perintah berikut dari dalam folder `server` (sesuaikan dengan script yang tersedia di `package.json`):

```bash
npm run db:generate
npm run db:migrate
```

Jika tersedia script seed:

```bash
npm run db:seed
```

> Periksa `server/package.json` untuk memastikan nama script yang tersedia sebelum menjalankannya.

---

## Running Backend

Jalankan server development dari folder `server`:

```bash
npm run dev
```

Build & jalankan versi production (jika tersedia):

```bash
npm run build
npm start
```

Setelah berjalan, server akan tersedia di:

```text
http://localhost:5000
```

> Sesuaikan port dengan nilai `PORT` pada `.env`.

---

## API Base URL

```text
http://localhost:5000
```

Jika project menggunakan prefix API, gunakan:

```text
http://localhost:5000/api
```

---

## API Endpoints

> Endpoint detail perlu dikonfirmasi dari file routes di dalam `server/`. Berikut kelompok endpoint utama berdasarkan fitur:

### Authentication

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| POST | `/auth/register` | Registrasi pengguna baru | No |
| POST | `/auth/login` | Login pengguna | No |

### Upload

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| POST | `/upload` | Upload gambar ke Cloudinary | Yes |

> Tabel di atas merupakan gambaran umum. Silakan cek folder `server/` (routes/controllers) untuk daftar endpoint yang lengkap dan akurat.

---

## Authentication

Backend menggunakan **JWT** untuk autentikasi:

1. Pengguna melakukan register/login.
2. Server memvalidasi kredensial.
3. Server mengembalikan JWT.
4. Client menyertakan token pada request yang memerlukan autentikasi.
5. Server memvalidasi token melalui middleware.

Contoh header:

```http
Authorization: Bearer <token>
```

---

## Upload Image

- Library: **Cloudinary**
- Kirim file menggunakan `multipart/form-data`
- Field name menyesuaikan implementasi (mis. `file` atau `image`)

```text
Content-Type: multipart/form-data
```

Pastikan kredensial Cloudinary di `.env` sudah benar.

---

## Project Structure

```text
Blog-app-BE/
├── frontEnd/          # Bagian frontend (Next.js)
├── server/            # Backend (Express + TypeScript + Drizzle + MySQL)
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

Keterangan:

- `server/` — kode backend (Express, TypeScript, Drizzle, MySQL, Cloudinary)
- `frontEnd/` — bagian frontend (Next.js + shadcn) yang berada dalam satu repository

---

## Troubleshooting

### Database tidak dapat terhubung

- Pastikan MySQL berjalan
- Periksa nilai `DATABASE_URL` di `.env`
- Pastikan database sudah dibuat

### JWT error

- Periksa `JWT_SECRET`
- Pastikan format header `Authorization: Bearer <token>` benar
- Pastikan token belum kedaluwarsa

### Upload gambar gagal

- Periksa konfigurasi Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
- Pastikan request menggunakan `multipart/form-data`
- Periksa ukuran dan format file

### Port sudah digunakan

- Ubah nilai `PORT` pada `.env`, lalu jalankan ulang server

---

## Cara Menjalankan dari Awal

```text
1. Clone repository
   git clone https://github.com/newbiejy235/Blog-app-BE.git

2. Masuk ke folder backend
   cd Blog-app-BE/server

3. Install dependency
   npm install

4. Buat file .env
   (isi DATABASE_URL, JWT_SECRET, PORT, CLOUDINARY_*)

5. Setup / migrate database
   npm run db:generate
   npm run db:migrate

6. Jalankan backend
   npm run dev

7. Backend siap digunakan di http://localhost:5000
```

---

## Catatan untuk Frontend

Backend ini digunakan sebagai API untuk aplikasi **Knowledge**. Bagian frontend berada di dalam repository ini pada folder `frontEnd/` (Next.js + shadcn).

Jika terdapat repository frontend terpisah:

- https://github.com/newbiejy235/Mobile-blog

maka repository tersebut dapat digunakan sebagai client yang mengonsumsi API dari backend ini.

---
