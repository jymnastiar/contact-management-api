# Address API Spec

## Create Address

Endpoint : `POST /api/contacts/:contactId/addresses`

Request Headers :
- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

Request Body :

```json
{
  "street": "Jalan Mawar No. 12",
  "city": "Bandung",
  "province": "Jawa Barat",
  "country": "Indonesia",
  "postal_code": "40115"
}
```
*(Catatan: `street`, `city`, dan `province` bersifat opsional. `country` dan `postal_code` wajib diisi)*

Response Body (200 OK) :

```json
{
  "data": {
    "id": 1,
    "street": "Jalan Mawar No. 12",
    "city": "Bandung",
    "province": "Jawa Barat",
    "country": "Indonesia",
    "postal_code": "40115"
  },
  "message": "Success to create address"
}
```

Response Body (400 Bad Request) :

```json
{
  "errors": "Validation error: ..."
}
```

Response Body (401 Unauthorized) :

```json
{
  "errors": "Access token needed"
}
```

Response Body (404 Not Found) :

```json
{
  "errors": "Contact not found"
}
```

---

## Get Address

Endpoint : `GET /api/contacts/:contactId/addresses/:addressId`

Request Headers :
- `Authorization: Bearer <access_token>`

Response Body (200 OK) :

```json
{
  "data": {
    "id": 1,
    "street": "Jalan Mawar No. 12",
    "city": "Bandung",
    "province": "Jawa Barat",
    "country": "Indonesia",
    "postal_code": "40115"
  },
  "message": "Success get address"
}
```

Response Body (401 Unauthorized) :

```json
{
  "errors": "Access token needed"
}
```

Response Body (404 Not Found) :

```json
{
  "errors": "Address not found"
}
```

---

## Update Address

Endpoint : `PUT /api/contacts/:contactId/addresses/:addressId`

Request Headers :
- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

Request Body :

```json
{
  "street": "Jalan Perubahan No. 99",
  "city": "Surabaya",
  "province": "Jawa Timur",
  "country": "Indonesia",
  "postal_code": "60111"
}
```
*(Catatan: `country` dan `postal_code` wajib diisi. `street`, `city`, `province` opsional)*

Response Body (200 OK) :

```json
{
  "data": {
    "id": 1,
    "street": "Jalan Perubahan No. 99",
    "city": "Surabaya",
    "province": "Jawa Timur",
    "country": "Indonesia",
    "postal_code": "60111"
  },
  "message": "Success update address"
}
```

Response Body (400 Bad Request) :

```json
{
  "errors": "Validation error: ..."
}
```

Response Body (401 Unauthorized) :

```json
{
  "errors": "Access token needed"
}
```

Response Body (404 Not Found) :

```json
{
  "errors": "Address not found"
}
```

---

## Remove Address

Endpoint : `DELETE /api/contacts/:contactId/addresses/:addressId`

Request Headers :
- `Authorization: Bearer <access_token>`

Response Body (200 OK) :

```json
{
  "data": "OK",
  "message": "Success delete address"
}
```

Response Body (401 Unauthorized) :

```json
{
  "errors": "Access token needed"
}
```

Response Body (404 Not Found) :

```json
{
  "errors": "Address not found"
}
```

---

## List Address

Endpoint : `GET /api/contacts/:contactId/addresses`

Request Headers :
- `Authorization: Bearer <access_token>`

Response Body (200 OK) :

```json
{
  "data": [
    {
      "id": 1,
      "street": "Jalan Mawar No. 12",
      "city": "Bandung",
      "province": "Jawa Barat",
      "country": "Indonesia",
      "postal_code": "40115"
    },
    {
      "id": 2,
      "street": "Jalan Kenanga No. 5",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "country": "Indonesia",
      "postal_code": "12345"
    }
  ],
  "message": "Success get addresses"
}
```

Response Body (401 Unauthorized) :

```json
{
  "errors": "Access token needed"
}
```

Response Body (404 Not Found) :

```json
{
  "errors": "Contact not found"
}
```
