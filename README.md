<div align="center">

# ✉️ Sphixmail

**Layanan Email Sementara (Disposable Email) dengan Ekstraksi OTP Otomatis**

Dibangun di atas Cloudflare Workers — tanpa biaya server, tanpa perawatan rumit, dan cepat diakses dari mana saja.

[![Live Demo](https://img.shields.io/badge/Live-sphixray.com-blue?style=for-the-badge)](https://sphixray.com)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=flat-square)
![License](https://img.shields.io/badge/status-private%20project-lightgrey?style=flat-square)

</div>

---

## 📖 Apa itu Sphixmail?

Sphixmail adalah layanan **email sementara** — alamat email "sekali pakai" yang bisa dibuat dalam hitungan detik. Cocok dipakai saat kamu perlu mendaftar ke sebuah layanan online tapi tidak ingin memakai email pribadi, misalnya untuk mencoba aplikasi baru, menghindari spam, atau keperluan testing.

Keunggulan utamanya: Sphixmail bisa **otomatis mendeteksi dan mengambil kode OTP** (kode verifikasi 4–8 digit) dari email yang masuk. Jadi kamu — atau program/bot yang kamu buat — tidak perlu membuka email dan menyalin kode secara manual.

> 🔗 **Coba sekarang:** [sphixray.com](https://sphixray.com)

---

## 📋 Daftar Isi

1. [Fitur Utama](#-fitur-utama)
2. [Cara Kerja Singkat](#-cara-kerja-singkat)
3. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
4. [Panduan Instalasi](#-panduan-instalasi)
5. [Dokumentasi API](#-dokumentasi-api)
6. [Contoh Penggunaan untuk Bot/Otomatisasi](#-contoh-penggunaan-untuk-botomatisasi)
7. [Panel Admin](#-panel-admin)
8. [Batasan Layanan (Free Tier)](#-batasan-layanan-free-tier)
9. [Keamanan](#-keamanan)
10. [Struktur Proyek](#-struktur-proyek-untuk-developer)
11. [Pemeliharaan](#-pemeliharaan)

---

## ✨ Fitur Utama

| Fitur | Penjelasan |
|---|---|
| 🔑 **Ekstraksi OTP Otomatis** | Kode verifikasi 4–8 digit terdeteksi otomatis dari isi email |
| 🌐 **REST API** | Bisa diintegrasikan ke aplikasi atau bot lain dengan API key |
| 🏠 **Multi-domain** | Mendukung lebih dari satu nama domain email |
| ⚡ **Inbox Real-time** | Email masuk baru muncul otomatis tiap 2 detik, tanpa refresh manual |
| 🖼️ **Tampilan Email Aman** | Email HTML ditampilkan di ruang terisolasi (sandbox) agar aman dari skrip berbahaya |
| 🛠️ **Panel Admin** | Kelola statistik, domain, API key, dan pengaturan lain dari satu tempat |
| 🌗 **Mode Gelap/Terang** | Tampilan bisa disesuaikan sesuai preferensi |
| 🧹 **Pembersihan Otomatis** | Email lama dihapus otomatis secara berkala |
| 🚦 **Pembatasan Kecepatan (Rate Limit)** | Mencegah penyalahgunaan API secara berlebihan |

---

## 🔄 Cara Kerja Singkat

1. **Buat alamat email** — sistem akan membuatkan alamat acak, atau kamu bisa memilih sendiri.
2. **Gunakan alamat itu** untuk mendaftar di layanan mana pun yang kamu tuju.
3. **Email masuk otomatis muncul** di inbox Sphixmail, biasanya dalam hitungan detik.
4. **Kode OTP langsung terdeteksi** dan bisa diambil lewat tampilan web maupun API.

---

## 🧰 Teknologi yang Digunakan

- **Cloudflare Workers** – Menjalankan server tanpa perlu mengelola infrastruktur sendiri (serverless)
- **Cloudflare D1** – Database berbasis SQLite
- **Cloudflare Email Routing** – Penerima semua email masuk (catch-all)
- **Hono** – Framework backend yang ringan
- **TypeScript** – Bahasa pemrograman backend yang lebih aman dari kesalahan tipe data
- **Vanilla JavaScript** – Untuk tampilan antarmuka (frontend), tanpa framework tambahan

---

## 🚀 Panduan Instalasi

Bagian ini ditujukan untuk developer yang ingin menjalankan Sphixmail sendiri.

### 1. Unduh dan Siapkan Proyek

```bash
git clone <this-repo>
cd sphixmail
npm install
```

### 2. Buat Database

```bash
npm run db:create
```

Salin `database_id` yang muncul di output, lalu buka file `wrangler.toml` dan isi bagian berikut:

```toml
[[d1_databases]]
database_id = "ID-DATABASE-ANDA-DI-SINI"

[vars]
MAIL_DOMAIN = "sphixray.com"
WEB_HOST = "sphixray.com"
ADMIN_PASSWORD_HASH = "hash-password-anda"
```

Untuk membuat hash password (kode acak dari password, agar tidak disimpan dalam bentuk asli), jalankan:

```bash
node -e "const p='passwordAnda';crypto.subtle.digest('SHA-256',new TextEncoder().encode(p)).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))"
```

### 3. Deploy ke Cloudflare

```bash
npm run db:migrate
npm run deploy
```

### 4. Aktifkan Email Routing

Di Cloudflare Dashboard:
1. Buka domain Anda → **Email Routing** → aktifkan.
2. Atur **catch-all address** agar diteruskan ke Worker bernama `sphixmail`.

---

## 🔌 Dokumentasi API

**URL dasar:** `https://sphixray.com/pub/`

> Semua endpoint di bawah ini memerlukan API key, yang bisa dibuat lewat Panel Admin.

| Fungsi | Method | Endpoint |
|---|---|---|
| Lihat daftar domain | `GET` | `/pub/domains/:apikey` |
| Cek validitas email | `GET` | `/pub/email/:email/:apikey` |
| Ambil daftar pesan | `GET` | `/pub/messages/:email/:apikey?limit=10` |
| Hapus satu pesan | `DELETE` | `/pub/message/:id/:apikey` |
| Lihat statistik | `GET` | `/pub/stats/:apikey` |
| Tunggu OTP masuk (long-polling) | `GET` | `/pub/inbox/:email/wait-otp/:apikey?timeout=60&subject_contains=verify` |

**Contoh respons saat menunggu OTP:**

```json
{
  "found": true,
  "otp": "123456",
  "message": {
    "id": "msg_abc",
    "from": "noreply@service.com",
    "subject": "Your OTP",
    "body_text": "Your code is: 123456",
    "received_at": "2026-09-18T10:00:00Z"
  }
}
```

📄 Dokumentasi API lengkap tersedia di: [sphixray.com/api-doc.html](https://sphixray.com/api-doc.html)

---

## 🤖 Contoh Penggunaan untuk Bot/Otomatisasi

Contoh berikut menunjukkan bagaimana sebuah program Python bisa menunggu dan mengambil kode OTP secara otomatis:

```python
import requests

API_KEY = "rm_your_api_key"
BASE = "https://sphixray.com"
email = "bot123@sphixray.com"

# 1. Daftar ke layanan tujuan menggunakan alamat email di atas
# ...

# 2. Tunggu kode OTP masuk (maksimal 60 detik)
r = requests.get(
    f"{BASE}/pub/inbox/{email}/wait-otp/{API_KEY}",
    params={"timeout": 60, "subject_contains": "verify"}
)

# 3. Ambil kode OTP jika ditemukan
if r.json()["found"]:
    otp = r.json()["otp"]
    print(f"Kode OTP: {otp}")
    # Gunakan kode ini untuk melanjutkan proses pendaftaran/login...
```

---

## 🛡️ Panel Admin

**URL:** `https://sphixray.com/admin.html`
**Username default:** `admin`
**Password:** sesuai yang diatur di `wrangler.toml`

Yang bisa dilakukan lewat panel admin:

- 📊 Dashboard dengan grafik statistik (7 hari / 6 minggu / 12 bulan / 7 tahun)
- 🌐 Kelola domain
- 🔑 Kelola API key (buat, cabut, atur batas kecepatan)
- ⚙️ Ubah pengaturan sistem
- 🎨 Sesuaikan tampilan (latar belakang, maskot)

### Pengaturan yang Tersedia

| Pengaturan | Kegunaan |
|---|---|
| `forbidden_usernames` | Daftar nama pengguna yang diblokir |
| `username_min` / `username_max` | Batas panjang nama pengguna |
| `daily_inbox_limit` | Batas jumlah inbox baru per hari |
| `auto_delete_enabled` | Aktif/nonaktifkan pembersihan otomatis |
| `delete_value` / `delete_unit` | Seberapa lama email disimpan sebelum dihapus |
| `max_messages_per_inbox` | Batas jumlah pesan per inbox |

### Jenis Domain

- **open** — bisa digunakan siapa saja
- **admin** — hanya terlihat saat login sebagai admin

---

## 📊 Batasan Layanan (Free Tier)

| Layanan | Batas |
|---|---|
| Worker requests | 100.000 permintaan/hari |
| Database (D1) | 5 GB penyimpanan, 5 juta baris data |
| Email masuk | 200 email/hari |
| Jaringan edge | Tersebar di 275+ lokasi dunia |
| Waktu respons | Rata-rata di bawah 50 milidetik |

---

## 🔒 Keamanan

- Semua endpoint API wajib menggunakan API key yang valid
- Login admin memakai cookie **HttpOnly**, sesi berlaku 24 jam, dan akun terkunci sementara (15 menit) setelah 5 kali gagal login
- Password disimpan dalam bentuk **hash SHA-256** *(disarankan upgrade ke PBKDF2 untuk kebutuhan produksi yang lebih aman)*
- Email berformat HTML ditampilkan dalam ruang sandbox agar tidak bisa menjalankan skrip berbahaya
- Tidak ada skrip eksternal yang dimuat ke halaman
- Rate limiting diterapkan per API key untuk mencegah penyalahgunaan

---

## 🗂️ Struktur Proyek (untuk Developer)

```
sphixmail/
├── wrangler.toml              # Konfigurasi Cloudflare
├── src/
│   ├── index.ts               # Entry point utama
│   ├── email-handler.ts       # Pemrosesan email masuk (parser MIME, gambar inline)
│   ├── cron.ts                # Pembersihan otomatis tiap jam
│   ├── api/
│   │   ├── routes.ts          # API berbasis sesi
│   │   └── public.ts          # API publik (pakai API key)
│   ├── admin/
│   │   ├── routes.ts          # Endpoint admin
│   │   └── middleware.ts      # Middleware autentikasi
│   ├── db/
│   │   ├── schema.sql         # Skema database
│   │   └── queries.ts         # Query database
│   ├── utils/
│   │   ├── random-address.ts  # Generator nama alamat acak (gaya Indonesia)
│   │   ├── otp-extractor.ts   # Regex untuk ekstraksi OTP
│   │   ├── hash.ts            # Hashing password SHA-256
│   │   └── settings.ts        # Helper pengaturan
│   └── web/
│       ├── index.html         # UI utama
│       ├── admin.html         # Panel admin
│       ├── api-doc.html       # Dokumentasi API
│       ├── docs.html          # Panduan pengguna
│       ├── app.js             # Logika UI utama
│       ├── admin.js           # Logika panel admin
│       ├── api-doc.js         # Logika dokumentasi API
│       ├── docs.js            # Logika panduan
│       └── styles.css         # Gaya tampilan global
```

---

## 🔧 Pemeliharaan

**Deploy ulang setelah ada perubahan kode:**
```bash
npm run deploy
```

**Migrasi database (setelah mengubah skema):**
```bash
npm run db:migrate
```

**Cron job otomatis (berjalan tiap jam):**
- Menghapus pesan lama (jika auto-delete aktif)
- Membersihkan sesi login yang kedaluwarsa
- Membersihkan log lama

---

<div align="center">

### 📌 Catatan

Proyek ini bersifat **privat**, dibuat untuk penggunaan pribadi.

**Dibuat oleh:** Devano Naufal
**Domain:** [sphixray.com](https://sphixray.com)
**Stack:** Cloudflare Workers · D1 · Hono

</div>