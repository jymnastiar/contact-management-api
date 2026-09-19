# User API Spec

## Register User

Endpoint : `POST /api/users`

Request Headers :
- `Content-Type: application/json`

Request Body :

```json
{
  "username": "khannedy",
  "password": "secretpassword",
  "name": "Eko Khannedy"
}
```

Response Headers :
- `Set-Cookie: refresh_token=<jwt_refresh_token>; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`

Response Body (201 Created) :

```json
{
  "message": " register new account",
  "data": {
    "username": "khannedy",
    "name": "Eko Khannedy"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response Body (400 Bad Request) :

```json
{
  "errors": "Username already exists"
}
```

---

## Login User

Endpoint : `POST /api/users/login`

Request Headers :
- `Content-Type: application/json`

Request Body :

```json
{
  "username": "khannedy",
  "password": "secretpassword"
}
```

Response Headers :
- `Set-Cookie: refresh_token=<jwt_refresh_token>; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`

Response Body (200 OK) :

```json
{
  "message": "Success login to account",
  "data": {
    "username": "khannedy",
    "name": "Eko Khannedy"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response Body (400 Bad Request) :

```json
{
  "errors": "Username and password not match"
}
```

---

## Get Current User

Endpoint : `GET /api/users/current`

Request Headers :
- `Authorization: Bearer <access_token>`

Response Body (200 OK) :

```json
{
  "message": "Success get current user profile",
  "data": {
    "username": "khannedy",
    "name": "Eko Khannedy"
  }
}
```

Response Body (401 Unauthorized) :

```json
{
  "errors": "Access token needed"
}
```
*atau:*
```json
{
  "errors": "Invalid or expired token"
}
```

Response Body (404 Not Found) :

```json
{
  "errors": "User not found"
}
```

---

## Update Current User

Endpoint : `PATCH /api/users/current`

Request Headers :
- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

Request Body :

```json
{
  "name": "Eko Kurniawan Khannedy",
  "password": "newsecretpassword"
}
```
*(Catatan: Semua field bersifat opsional)*

Response Body (200 OK) :

```json
{
  "message": "Successfully update user data",
  "data": {
    "username": "khannedy",
    "name": "Eko Kurniawan Khannedy"
  }
}
```

Response Body (400 / 401 / 404) :

```json
{
  "errors": "Validation error: ..."
}
```

---

## Refresh Access Token

Endpoint : `GET /api/users/current/token`

Request Cookies :
- `Cookie: refresh_token=<jwt_refresh_token>`

Response Body (200 OK) :

```json
{
  "message": "New access token",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response Body (400 / 401) :

```json
{
  "errors": "Unauthorized"
}
```

---

## Logout User

Endpoint : `DELETE /api/users/current`

Request Cookies :
- `Cookie: refresh_token=<jwt_refresh_token>`

Response Headers :
- `Set-Cookie: refresh_token=; Max-Age=0; ...` *(clears cookie)*

Response Body (200 OK) :

```json
{
  "message": "OK"
}
```

Response Body (400 / 401) :

```json
{
  "errors": "User not found for already logged out"
}
```
