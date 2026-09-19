# Contact API Spec

## Create Contact

Endpoint : `POST /api/contacts`

Request Headers :
- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

Request Body :

```json
{
  "first_name": "Eko Kurniawan",
  "last_name": "Khannedy",
  "email": "eko@example.com",
  "phone": "089999999"
}
```
*(Catatan: `first_name` wajib diisi. `last_name`, `email`, dan `phone` opsional)*

Response Body (200 OK) :

```json
{
  "data": {
    "id": 1,
    "first_name": "Eko Kurniawan",
    "last_name": "Khannedy",
    "email": "eko@example.com",
    "phone": "089999999"
  },
  "message": "Success to create new contact"
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

---

## Get Contact

Endpoint : `GET /api/contacts/:contactId`

Request Headers :
- `Authorization: Bearer <access_token>`

Response Body (200 OK) :

```json
{
  "data": {
    "id": 1,
    "first_name": "Eko Kurniawan",
    "last_name": "Khannedy",
    "email": "eko@example.com",
    "phone": "089999999"
  },
  "message": "Successful get data"
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

## Update Contact

Endpoint : `PUT /api/contacts/:contactId`

Request Headers :
- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

Request Body :

```json
{
  "first_name": "Eko Kurniawan",
  "last_name": "Khannedy",
  "email": "eko@example.com",
  "phone": "089999999"
}
```
*(Catatan: `first_name` wajib diisi. `last_name`, `email`, dan `phone` opsional)*

Response Body (200 OK) :

```json
{
  "data": {
    "id": 1,
    "first_name": "Eko Kurniawan",
    "last_name": "Khannedy",
    "email": "eko@example.com",
    "phone": "089999999"
  },
  "message": "Successful get contact"
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

## Remove Contact

Endpoint : `DELETE /api/contacts/:contactId`

Request Headers :
- `Authorization: Bearer <access_token>`

Response Body (200 OK) :

```json
{
  "data": "OK",
  "message": "Successful remove contact"
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

## Search Contact

Endpoint : `GET /api/contacts`

Query Parameters :
- `name` : string, first name atau last name, opsional
- `phone` : string, phone, opsional
- `email` : string, email, opsional
- `page` : number, default 1, opsional
- `size` : number, default 10, opsional

Request Headers :
- `Authorization: Bearer <access_token>`

Response Body (200 OK) :

```json
{
  "data": [
    {
      "id": 1,
      "first_name": "Eko Kurniawan",
      "last_name": "Khannedy",
      "email": "eko@example.com",
      "phone": "089999999"
    }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 1,
    "size": 10,
    "total_item": 1
  }
}
```

Response Body (401 Unauthorized) :

```json
{
  "errors": "Access token needed"
}
```
