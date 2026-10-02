# 📂 Category API Specification

Dokumentasi ini menjelaskan spesifikasi endpoint **Category** dan panduan pengelolaan data kategori secara langsung di database PostgreSQL.

---

## 📌 Karakteristik Endpoint
* **Akses Publik (Public API):** Endpoint Category tidak memerlukan autentikasi (`Authorization: Bearer <token>`).
* **Hierarki Bersarang (Tree/Nested Hierarchy):** Mengembalikan data *Parent Category* beserta seluruh *Child Category* (sub-kategori) di bawahnya.
* **Performa & Caching:** Endpoint ini digunakan sebagai basis pengujian performa query bertingkat (*N+1 Query*) dan implementasi *Redis Cache*.

---

## 1. Get All Categories

Mengambil seluruh daftar kategori berserta sub-kategorinya.

* **Endpoint** : `GET /api/categories`
* **Request Headers** :
  * `Accept: application/json`

* **Response Body (200 OK)** :
```json
{
  "data": [
    {
      "name": "Elektronik & Gadget",
      "id": "elektronik",
      "parent_id": null,
      "children": [
        {
          "name": "Smartphone & HP",
          "id": "elektronik-smartphone",
          "parent_id": "elektronik"
        },
        {
          "name": "Laptop & Ultrabook",
          "id": "elektronik-laptop",
          "parent_id": "elektronik"
        }
      ]
    },
    {
      "name": "Makanan & Camilan",
      "id": "makanan",
      "parent_id": null,
      "children": [
        {
          "name": "Makanan Ringan & Snack Keripik",
          "id": "makanan-snack",
          "parent_id": "makanan"
        }
      ]
    }
  ],
  "message": "Success get category"
}
```

* **Response Body (200 OK - Jika Database Kosong)** :
```json
{
  "data": [],
  "message": "Success get category"
}
```

---

## 🛠️ Panduan Menambahkan Data Kategori ke Database

Fitur Category saat ini dirancang untuk membaca data hierarki dari database. Anda dapat menambahkan, mengubah, atau menghapus kategori secara langsung ke PostgreSQL melalui beberapa cara di bawah ini:

---

### Cara 1: Menggunakan Terminal Docker (`psql`) — *Paling Cepat*

Jalankan perintah SQL berikut langsung dari terminal Anda:

```bash
docker exec -it database-contact-management psql -U admin -d categories -c "
-- 1. Insert Parent Category (parent_id = NULL)
INSERT INTO categories (id, name, parent_id) VALUES 
('otomotif', 'Otomotif & Aksesoris', NULL)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Child Categories (parent_id menunjuk ke parent di atas)
INSERT INTO categories (id, name, parent_id) VALUES 
('oto-helm', 'Helm Motor & Kaca Visor', 'otomotif'),
('oto-oli', 'Oli Mesin & Pelumas', 'otomotif'),
('oto-ban', 'Ban Motor & Mobil', 'otomotif')
ON CONFLICT (id) DO NOTHING;
"
```

---

### Cara 2: Menggunakan pgAdmin 4 (GUI Web)

1. Buka browser dan akses **pgAdmin 4** di `http://localhost:8080`.
2. Login dengan akun:
   * **Email:** `admin@admin.com`
   * **Password:** `admin`
3. Hubungkan ke server PostgreSQL (Host: `db`, Port: `5432`, Database: `categories`, User: `admin`, Password: `admin`).
4. Buka **Tools $\rightarrow$ Query Tool**, lalu jalankan query SQL:

```sql
-- Tambah Parent
INSERT INTO categories (id, name, parent_id) 
VALUES ('fashion-anak', 'Pakaian & Perlengkapan Anak', NULL);

-- Tambah Anak Sub-Kategori
INSERT INTO categories (id, name, parent_id) 
VALUES ('anak-sepatu', 'Sepatu Sekolah Anak', 'fashion-anak');
```

---

### 📋 Aturan Struktur Data (`schema.prisma`):

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `VARCHAR(100)` | Primary Key unik (contoh: `elektronik`, `makanan-snack`). |
| `name` | `VARCHAR(255)` | Nama kategori tampilan. |
| `parent_id` | `VARCHAR(100)` | Foreign Key ke `categories.id`. Beri `NULL` jika kategori tingkat teratas (Root Parent). |
