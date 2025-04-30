# Документація до маршруту /api/auth

## Опис

Цей маршрут відповідає за аутентифікацію користувачів, включаючи реєстрацію, вхід, активацію акаунта, вихід, оновлення токена та скидання пароля.

## Ендпоїнти

### 1. Реєстрація користувача

**POST /api/auth/register**

#### Опис

Реєструє нового користувача в системі.

#### Обов'язкові поля:

- `first_name` (string) – ім'я користувача
- `last_name` (string) – прізвище користувача
- `email` (string) – електронна пошта
- `password` (string) – пароль користувача
- `role` (string) – роль користувача (`job_seeker` або `employer`)

#### Опціональні поля:

- `country` (string) – країна проживання
- `city` (string) – місто проживання
- `phone_number` (string) – номер телефону
- `job_category` (string) – категорія роботи (для `job_seeker`)
- `work_experience` (string) – досвід роботи (для `job_seeker`)
- `portfolio` (string) – портфоліо (для `job_seeker`)
- `company_name` (string) – назва компанії (для `employer`)
- `company_type` (string) – тип компанії (для `employer`)
- `company_location` (string) – локація компанії (для `employer`)

#### Відповідь (200 OK):

```json
{
  "id": 1,
  "first_name": "Іван",
  "last_name": "Петров",
  "email": "ivan@example.com",
  "role": "job_seeker"
}
```

### 2. Активація акаунта

**GET /api/auth/activation/:token**

#### Опис

Активація облікового запису за унікальним токеном.

#### Вхідні параметри:

- `token` (string) – токен активації, отриманий на email

#### Відповідь (200 OK):

```json
{
  "id": 1,
  "first_name": "Іван",
  "last_name": "Петров",
  "email": "ivan@example.com",
  "role": "job_seeker"
}
```

### 3. Вхід у систему

**POST /api/auth/login**

#### Опис

Авторизує користувача в системі.

#### Вхідні параметри:

- `email` (string) – електронна пошта
- `password` (string) – пароль

#### Відповідь (200 OK):

```json
{
  "user": {
    "id": 1,
    "first_name": "Іван",
    "last_name": "Петров",
    "email": "ivan@example.com",
    "role": "job_seeker"
  },
  "access_token": "jwt_token"
}
```

### 4. Вихід із системи

**DELETE /api/auth/logout**

#### Опис

Видаляє refresh-токен користувача та завершує сесію.

#### Відповідь (204 No Content)

### 5. Оновлення токена

**GET /api/auth/refresh**

#### Опис

Оновлює access-токен за допомогою refresh-токена.

#### Відповідь (200 OK):

```json
{
  "user": {
    "id": 1,
    "first_name": "Іван",
    "last_name": "Петров",
    "email": "ivan@example.com",
    "role": "job_seeker"
  },
  "access_token": "new_jwt_token"
}
```

### 6. Запит на скидання пароля

**POST /api/auth/request-password-reset**

#### Опис

Надсилає користувачеві email із посиланням для скидання пароля.

#### Вхідні параметри:

- `email` (string) – електронна пошта користувача

#### Відповідь (200 OK):

```json
{
  "message": "Password reset link has been sent to your email"
}
```

### 7. Скидання пароля

**PUT /api/auth/password-reset/:token**

#### Опис

Оновлює пароль користувача.

#### Вхідні параметри:

- `token` (string) – токен скидання пароля
- `password` (string) – новий пароль

#### Відповідь (200 OK):

```json
{
  "message": "Password has been reset successfully"
}
```

### 8. Видалити профіль

**DELETE /api/auth/:id**

Опис  
Видаляє профіль користувача.

Відповідь (200 OK):

```json
{
  "message": "Profile deleted"
}
```

---
