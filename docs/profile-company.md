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
  "profile": {
    "id": 12,
    "user_id": 7,
    "company_name": "TechNova",
    "company_type": "IT",
    "contact_info": ["info@technova.com", "+380991234567"],
    "team_size": "11-50",
    "clients": "Google, Microsoft",
    "description": "New company description"
  }
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

- `company_name` (string) — назва компанії
- `company_type` (string) — тип компанії (наприклад: IT, будівництво тощо)
- `company_location` (string) — розташування компанії
- `description` (string) — опис компанії
- `contact_info` (array of string) — список контактних даних (email, телефон тощо)
- `team_size` (string) — розмір команди (наприклад: "1-10", "11-50")
- `clients` (string) — ключові клієнти

#### Відповідь (200 OK):

```json
{ "message": "Профіль оновлено успішно" }
```

### 3. Отримання вакансій компанії

**GET /api/auth/profile-company/get-jobs/:id**

#### Опис

Повертає список вакансій, розміщених компанією.

#### Вхідні параметри:

- `id` (string) – ID компанії

#### Відповідь (200 OK):

```json
{
  "jobs": [
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

}
```

### 4. Створення нової вакансії

**POST /api/auth/profile-company/newJob**

#### Опис

Створює нову вакансію.

#### Тіло запиту:

- `user_id` (string)
- `job_title` (string)
- `location` (string)
- `full_description` (string)
- `employment_type` (string)
- `min_salary` (number)
- `max_salary` (number)
- `short_summary` (string)
- `application_deadline` (string) - 'via platform inbox', 'external link', 'by email'
- `visibility` (string) - 'public', 'private', 'internal'
- `status` (string) - 'active', 'closed', 'draft'

#### Відповідь (201 Created):

```json
{ "message": "Вакансія створена успішно", "job_id": 12 }
```

---

### 5. Оновлення вакансії

**PUT /api/auth/profile-company/update-job/:id**

#### Опис

Оновлює вакансію за ID.

#### Вхідні параметри:

- `id` (string) – ID вакансії

#### Тіло запиту:

`job_title` (string)

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
{ "message": "Вакансію оновлено успішно" }
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
{
  "jobs": [
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
}
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
{ "message": "Вакансію видалено успішно" }
```

---

### 8. Оновлення статусу вакансії

**PUT /api/auth/profile-company/job/:id/status**

#### Опис

Оновлює статус вакансії (наприклад, `active`, `inactive`, `closed`).

#### Вхідні параметри:

- `id` (string) – ID вакансії

#### Тіло запиту:

- `status` (string) – новий статус

#### Відповідь (200 OK):

```json
{ "message": "Статус вакансії оновлено" }
```
