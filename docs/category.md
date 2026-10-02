# Category API Spec

## List Categories

Endpoint : `GET /api/categories`

Request Headers :
- `Accept: application/json`

Response Body (200 OK) :

```json
{
  "data": [
    {
      "id": "elektronik",
      "name": "Elektronik & Gadget",
      "parent_id": null,
      "children": [
        {
          "id": "elektronik-smartphone",
          "name": "Smartphone & HP",
          "parent_id": "elektronik"
        },
        {
          "id": "elektronik-laptop",
          "name": "Laptop & Ultrabook",
          "parent_id": "elektronik"
        }
      ]
    },
    {
      "id": "makanan",
      "name": "Makanan & Camilan",
      "parent_id": null,
      "children": [
        {
          "id": "makanan-snack",
          "name": "Makanan Ringan & Snack Keripik",
          "parent_id": "makanan"
        }
      ]
    }
  ],
  "message": "Success get category"
}
```

Response Body (200 OK - Empty Data) :

```json
{
  "data": [],
  "message": "Success get category"
}
```

---

## Database Seeding (Direct to PostgreSQL)

Endpoint kategori membaca data langsung dari database PostgreSQL. Untuk menambahkan atau mengelola data kategori:

### Query SQL (psql / pgAdmin) :

```sql
-- 1. Insert Parent Category (parent_id = NULL)
INSERT INTO categories (id, name, parent_id) VALUES 
('elektronik', 'Elektronik & Gadget', NULL),
('makanan', 'Makanan & Camilan', NULL);

-- 2. Insert Child Categories (parent_id merujuk ke id parent)
INSERT INTO categories (id, name, parent_id) VALUES 
('elektronik-smartphone', 'Smartphone & HP', 'elektronik'),
('elektronik-laptop', 'Laptop & Ultrabook', 'elektronik'),
('makanan-snack', 'Makanan Ringan & Snack Keripik', 'makanan');
```
