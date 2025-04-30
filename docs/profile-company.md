# Документація до маршруту `/api/auth/profile-company`

## Опис

Цей маршрут використовується для керування профілем компанії, створенням та редагуванням вакансій, а також отриманням інформації про робочі оголошення.

## Ендпоїнти

---

### 1. Отримання профілю компанії

**GET /api/auth/profile-company/:id**

#### Опис

Повертає профіль компанії за ID користувача.

#### Вхідні параметри:

- `id` (string) – ідентифікатор користувача (компанії)

#### Відповідь (200 OK):

```json
{
  "user_id": string,
  "email": string,
  "first_name": string,
  "last_name": string,
  "role": string,
  "company_name": string,
  "company_type": string,
  "section_title": string,
  "description": string,
  "avatar": string,
  "country": string,
  "city": string,
}
```

---

### 2. Оновлення профілю компанії

**PUT /api/auth/profile-company/:id**

#### Опис

Оновлює дані профілю компанії.

#### Вхідні параметри:

- `id` (string) – ID користувача

#### Тіло запиту (тільки змінювані поля):

```json
{
  "user_id": string,
  "email": string,
  "first_name": string,
  "last_name": string,
  "role": string,
  "company_name": string,
  "company_type": string,
  "section_title": string,
  "description": string,
  "avatar": string,
  "country": string,
  "city": string,
}
```

#### Відповідь (200 OK):

```json
{
  "message": "Profile updated",
  "data": {
    user_id,
    email,
    first_name,
    last_name,
    role,
    company_name,
    company_type,
    company_location,
    contact_info,
    team_size,
    clients,
    description,
  }
}
```

### 3. Отримання вакансій компанії

**GET /api/auth/profile-company/get-jobs/:id**

#### Опис

Повертає список вакансій, розміщених компанією.

#### Вхідні параметри:

- `id` (string) – ID компанії

#### Відповідь (200 OK):

```json
[
    {
        "id": 1,
        "user_id": 2,
        "job_title": "Backend Developer",
        "location": "New York, USA",
        "employment_type": "Part-time",
        "salary": null,
        "short_summary": "We are looking for an experienced Backend Developer to work with our API team.",
        "full_description": "The Backend Developer will be responsible for designing and maintaining the server-side logic of our applications. Knowledge of Node.js, Express, and SQL databases is required.",
        "application_deadline": "by email",
        "visibility": "private",
        "status": "draft",
        "createdAt": "2025-04-28T12:00:03.228Z",
        "updatedAt": "2025-04-28T12:00:03.228Z"
    },
    {
      ...
    }
]
```

### 4. Створення нової вакансії

**POST /api/auth/profile-company/newJob**

#### Опис

Створює нову вакансію.

#### Тіло запиту:

```json
 {
    "user_id": 2,
    "job_title": "Backend Developer",
    "location": "New York, USA",
    "employment_type": "Part-time",
    "salary": 45000,
    "short_summary": "We are looking for an experienced Backend Developer to work with our API team.",
    "full_description": "The Backend Developer will be responsible for designing and maintaining the server-side logic of our applications. Knowledge of Node.js, Express, and SQL databases is required.",
    "application_deadline": "by email",
    "visibility": "private",
    "status": "draft",
  },
```

#### Відповідь (201 Created):

```json
{
  "id": 1,
  "user_id": 2,
  "job_title": "Backend Developer",
  "location": "New York, USA",
  "employment_type": "Part-time",
  "short_summary": "We are looking for an experienced Backend Developer to work with our API team.",
  "full_description": "The Backend Developer will be responsible for designing and maintaining the server-side logic of our applications. Knowledge of Node.js, Express, and SQL databases is required.",
  "application_deadline": "by email",
  "visibility": "private",
  "status": "draft",
  "updatedAt": "2025-04-28T12:00:03.228Z",
  "createdAt": "2025-04-28T12:00:03.228Z",
  "salary": null
}
```

---

### 5. Оновлення вакансії

**PUT /api/auth/profile-company/update-job/:id**

#### Опис

Оновлює вакансію за ID.

#### Вхідні параметри:

- `id` (string) – ID вакансії

#### Тіло запиту:

- `job_title` (string)
- `location` (string)
- `full_description` (string)
- `employment_type` (string)
- `min_salary` (number)
- `max_salary` (number)
- `short_summary` (string)
- `application_deadline` (string)
- `visibility` (string)
- `status` (string)

#### Відповідь (200 OK):

```json
{
  "message": "Job updated"
}
```

---

### 6. Фільтрація вакансій

**GET /api/auth/profile-company/filter-jobs**

#### Опис

Повертає список вакансій згідно з фільтрами.

#### Параметри запиту (query params):

- `location` (string)
- `title` (string)
- `status` (string)
- `min_salary`(string),
- `max_salary`(string),
- `location`(string),
- `employment_type`(string),
- `status`(string),
- `visibility`(string),

#### Відповідь (200 OK):

```json
[
    {
      "id": 1,
      "job_title": "Frontend Developer",
      "location": "Madrid",
      "employment_type": "full-time",
      "min_salary": 3000,
      "max_salary": 4000,
      "status": "active",
      "company_name": "TechCo",
      "company_type": "Software",
      "contact_info": ["email@example.com", "+123456789"],
      "team_size": "11-50",
      "clients": "Google, Amazon"
    },
    ...
  ]
```

---

### 7. Видалення вакансії

**DELETE /api/auth/profile-company/delete-job/:id**

#### Опис

Видаляє вакансію за ID.

#### Вхідні параметри:

- `id` (string) – ID вакансії

#### Відповідь (200 OK):

```json
{
  "message": "Job deleted"
}
```

---

### 8. Оновлення статусу вакансії

**PUT /api/auth/profile-company/status-job/:id**

#### Опис

Оновлює статус вакансії (наприклад, `active`, `inactive`, `closed`).

#### Вхідні параметри:

- `id` (string) – ID вакансії

#### Тіло запиту:

- `status` (string) – новий статус 'active', 'closed', 'draft'

#### Відповідь (200 OK):

```json
{
  "message": "Job status updated"
}
```
