# Документація до маршруту `/api/auth/profile-company`

## Опис

Цей маршрут використовується для керування профілем компанії.

## Ендпоїнти

---

### 1. Отримання всі профілі компаній

**GET /api/auth/profile-company/**

#### Опис

Повертає масив профілів компанії користувачів.

#### Відповідь (200 OK):

```json
[
  {
    "user_id": string,
    "first_name": string,
    "last_name": string,
    "role": string,
    "email": string,
    "company_name": string,
    "company_type": string,
    "company_location": string,
    "about": string,
    "country": string,
    "city": string,
    "phone_number": string,
    "team_size": string,
    "clients": array,
    "contact_info": array,
    "avatar": string
  }, ...
]
```

---

### 2. Отримання профілю компанії

**GET /api/auth/profile-company/:id**

#### Опис

Повертає профіль компанії за ID користувача.

#### Вхідні параметри:

- `id` (string) – ідентифікатор користувача (компанії)

#### Відповідь (200 OK):

```json
 {
    "user_id": string,
    "first_name": string,
    "last_name": string,
    "role": string,
    "email": string,
    "company_name": string,
    "company_type": string,
    "company_location": string,
    "about": string,
    "country": string,
    "city": string,
    "phone_number": string,
    "team_size": string,
    "clients": array,
    "contact_info": array,
    "rating": string,
    "avatar": string
  }
```

---

### 3. Оновлення профілю компанії

**PATCH /api/auth/profile-company/:id**

#### Опис

Оновлює дані профілю компанії.

#### Вхідні параметри:

- `id` (string) – ID користувача

#### Тіло запиту (тільки змінювані поля):

```json
 {
    "first_name": string,
    "last_name": string,
    "company_name": string,
    "company_type": string,
    "company_location": string,
    "about": string,
    "country": string,
    "city": string,
    "phone_number": string,
    "team_size": string,
    "clients": array,
    "contact_info": array,
    "rating": string,
  }
```

#### Відповідь (200 OK):

```json
{
  "user_id": string,
  "first_name": string,
  "last_name": string,
  "role": string,
  "email": string,
  "company_name": string,
  "company_type": string,
  "company_location": string,
  "about": string,
  "country": string,
  "city": string,
  "phone_number": string,
  "team_size": string,
  "clients": array,
  "contact_info": array,
  "rating": string,
  "avatar": string
}
```
