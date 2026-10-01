# 👤 User API Specification

Dokumentasi ini menjelaskan spesifikasi lengkap endpoint manajemen user dan sistem autentikasi berbasis **Hybrid JWT (Access Token) & HttpOnly Cookie (Refresh Token)**.

---

## 🔐 Mekanisme Autentikasi

1. **Access Token (Short-lived)**:
   * Dikembalikan di Response Body JSON (`access_token`).
   * Digunakan untuk mengakses endpoint yang diproteksi melalui header:
     `Authorization: Bearer <access_token>`
2. **Refresh Token (Long-lived & Secure)**:
   * Disimpan di dalam **HttpOnly Cookie** bernama `refresh_token` (`SameSite=Lax`, `Path=/`).
   * Token disimpan dalam bentuk hash (Bcrypt) di database.
   * Dikirim otomatis oleh browser/klien via cookie untuk memperbarui access token (`GET /api/users/current/token`) dan logout (`DELETE /api/users/current`).

---

## 1. Register User

Mendaftarkan akun user baru ke dalam sistem.

* **Endpoint** : `POST /api/users`
* **Request Headers** :
  * `Content-Type: application/json`
  * `Accept: application/json`

* **Request Body** :
```json
{
  "username": "jymnastiar",
  "password": "secretpassword",
  "name": "Fadhli Gymnastiar"
}
```

> **Aturan Validasi (Zod):**
> * `username`: String, min 4, max 100 karakter, hanya boleh huruf kecil, angka, dan underscore (`/^[a-z0-9_]+$/`).
> * `password`: String, min 6, max 100 karakter.
> * `name`: String, min 4, max 100 karakter.

* **Response Headers** :
  * `Set-Cookie: refresh_token=<jwt_refresh_token>; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax`

* **Response Body (201 Created)** :
```json
{
  "message": " register new account",
  "data": {
    "username": "jymnastiar",
    "name": "Fadhli Gymnastiar"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

* **Response Body (400 Bad Request - Username Duplikat)** :
```json
{
  "errors": "Username already exists"
}
```

* **Response Body (400 Bad Request - Validasi Gagal)** :
```json
{
  "errors": "Validation error: [ ... ]"
}
```

---

## 2. Login User

Masuk ke akun yang sudah terdaftar untuk mendapatkan token akses dan cookie refresh token.

* **Endpoint** : `POST /api/users/login`
* **Request Headers** :
  * `Content-Type: application/json`
  * `Accept: application/json`

* **Request Body** :
```json
{
  "username": "jymnastiar",
  "password": "secretpassword"
}
```

* **Response Headers** :
  * `Set-Cookie: refresh_token=<jwt_refresh_token>; Max-Age=3600; Path=/; HttpOnly; SameSite=Lax`

* **Response Body (200 OK)** :
```json
{
  "message": "Success login to account",
  "data": {
    "username": "jymnastiar",
    "name": "Fadhli Gymnastiar"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

* **Response Body (400 Bad Request - Akun Tidak Ditemukan)** :
```json
{
  "errors": "Username not register yet"
}
```

* **Response Body (400 Bad Request - Password Salah)** :
```json
{
  "errors": "Username and password not match"
}
```

---

## 3. Get Current User Profile

Mengambil informasi profil user yang sedang login saat ini.

* **Endpoint** : `GET /api/users/current`
* **Request Headers** :
  * `Authorization: Bearer <access_token>`
  * `Accept: application/json`

* **Response Body (200 OK)** :
```json
{
  "message": "Success get current user profile",
  "data": {
    "username": "jymnastiar",
    "name": "Fadhli Gymnastiar"
  }
}
```

* **Response Body (401 Unauthorized - Token Tidak Ada)** :
```json
{
  "errors": "Access token needed"
}
```

* **Response Body (401 Unauthorized - Token Expired / Invalid)** :
```json
{
  "errors": "jwt expired"
}
```

* **Response Body (404 Not Found)** :
```json
{
  "errors": "User not found"
}
```

---

## 4. Update Current User Profile

Memperbarui data nama atau password user yang sedang login.

* **Endpoint** : `PATCH /api/users/current`
* **Request Headers** :
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
  * `Accept: application/json`

* **Request Body** :
```json
{
  "name": "Fadhli Gymnastiar",
  "password": "newsecretpassword"
}
```
*(Catatan: Semua field bersifat opsional)*

* **Response Body (200 OK)** :
```json
{
  "message": "Successfully update user data",
  "data": {
    "username": "jymnastiar",
    "name": "Fadhli Gymnastiar"
  }
}
```

* **Response Body (400 Bad Request - Validasi Gagal)** :
```json
{
  "errors": "Validation error: [ ... ]"
}
```

* **Response Body (401 Unauthorized)** :
```json
{
  "errors": "Access token needed"
}
```

---

## 5. Refresh Access Token

Membuat `access_token` baru ketika token lama sudah kedaluwarsa, menggunakan `refresh_token` yang tersimpan di HttpOnly Cookie.

* **Endpoint** : `GET /api/users/current/token`
* **Request Headers / Cookies** :
  * `Cookie: refresh_token=<jwt_refresh_token>`
  * `Accept: application/json`

* **Response Body (200 OK)** :
```json
{
  "message": "New access token",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

* **Response Body (400 Bad Request - Cookie Tidak Dikirimkan)** :
```json
{
  "errors": "Validation error: [ { \"message\": \"Refresh token is required\" } ]"
}
```

* **Response Body (401 Unauthorized - Token Tidak Valid / Sudah Logout)** :
```json
{
  "errors": "Unauthorized"
}
```

---

## 6. Logout User

Menghapus `refresh_token` dari database dan membersihkan HttpOnly Cookie pada browser.

* **Endpoint** : `DELETE /api/users/current`
* **Request Headers / Cookies** :
  * `Cookie: refresh_token=<jwt_refresh_token>`

* **Response Headers** :
  * `Set-Cookie: refresh_token=; Max-Age=0; Path=/; Expires=...; HttpOnly; SameSite=Lax`

* **Response Body (200 OK)** :
```json
{
  "message": "OK"
}
```

* **Response Body (401 Unauthorized - Sudah Pernah Logout / Token Tidak Ada)** :
```json
{
  "errors": "User not found for already logged out"
}
```
