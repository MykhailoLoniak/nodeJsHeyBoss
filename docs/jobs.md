# Документація до маршруту /api/auth/jobs

## Опис

Цей маршрут відповідає за к отримання списку вакансій, фільтрацію, додавання/перегляд відгуків, а також завантаження.

## Ендпоїнти

### 1. Отримати профіль всіх шукачі роботи

**GET /api/auth/jobs/**

## Опис

Повертає усі ваканції.

Відповідь (200 OK):

```json
[
  {
    "id": string,
    "company_id": integer,
    "job_title": string,
    "location": string,
    "employment_type": string,
    "salary": integer,
    "short_summary": string,
    "full_description": string,
    "application_deadline": string ('via platform inbox', 'external link', 'by email'),
    "visibility": string ('public', 'private', 'internal'),
    "status": string ('active', 'closed', 'draft'),
    "createdAt": string,
    "updatedAt": string
  },
  ...
]
```

---

### 2. Отримати ваканції обраної компанії

**GET /api/auth/jobs/:id**

## Опис

Повертає вакансії обраної компанії.

Відповідь (200 OK):

```json
  {
    "id": string,
    "company_id": integer,
    "job_title": string,
    "location": string,
    "employment_type": string,
    "salary": integer,
    "short_summary": string,
    "full_description": string,
    "application_deadline": string ('via platform inbox', 'external link', 'by email'),
    "visibility": string ('public', 'private', 'internal'),
    "status": string ('active', 'closed', 'draft'),
    "createdAt": string,
    "updatedAt": string
  }
```

---

### 3. Оновити вакансію

**PUT /api/auth/jobs/:id**

Опис
Оновлює поля вакансії.

Вхідні параметри (JSON):

```json
{
  "company_id": integer,
  "job_title": string,
  "location": string,
  "employment_type": string,
  "salary": integer,
  "short_summary": string,
  "full_description": string,
  "application_deadline": string ('via platform inbox', 'external link', 'by email'),
  "visibility": string ('public', 'private', 'internal'),
  "status": string ('active', 'closed', 'draft'),
}
```

Відповідь (200 OK):

```json
{
  "message":"Updated successfully",
  "job":  {
    "id": string,
    "company_id": integer,
    "job_title": string,
    "location": string,
    "employment_type": string,
    "salary": integer,
    "short_summary": string,
    "full_description": string,
    "application_deadline": string ('via platform inbox', 'external link', 'by email'),
    "visibility": string ('public', 'private', 'internal'),
    "status": string ('active', 'closed', 'draft'),
    "createdAt": string,
    "updatedAt": string
  }
}
```

---

### 4. Фільтрація вакансій

**GET /api/auth/jobs/filter-jobs?category=Frontend&city=Київ**

Опис
Повертає вакансії, які відповідають параметрам запиту.

Параметри запиту:

```
 - "company_id",
 - "job_title",
 - "location",
 - "employment_type",
 - "salary",
 - "short_summary",
 - "full_description",
 - "application_deadline": ('via platform inbox', 'external link', 'by email'),
 - "visibility": ('public', 'private', 'internal'),
 - "status": ('active', 'closed', 'draft'),
 - "createdAt",
 - "updatedAt"
```

Відповідь (200 OK):

```json
[
  {
  "id": string,
  "company_id": integer,
  "job_title": string,
  "location": string,
  "employment_type": string,
  "salary": integer,
  "short_summary": string,
  "full_description": string,
  "application_deadline": string ('via platform inbox', 'external link', 'by email'),
  "visibility": string ('public', 'private', 'internal'),
  "status": string ('active', 'closed', 'draft'),
  "createdAt": string,
  "updatedAt": string
  },
  ...
]
```

---

### 5. Створити нову вакансію

**POST /api/auth/jobs/**

Опис
Створює нову ваканцію

Параметри запиту:

```
 - "company_id",
 - "job_title",
 - "location",
 - "employment_type",
 - "salary",
 - "short_summary",
 - "full_description",
 - "application_deadline": ('via platform inbox', 'external link', 'by email'),
 - "visibility": ('public', 'private', 'internal'),
 - "status": ('active', 'closed', 'draft'),
```

Відповідь (200 OK):

```json
[
  {
  "id": string,
  "company_id": integer,
  "job_title": string,
  "location": string,
  "employment_type": string,
  "salary": integer,
  "short_summary": string,
  "full_description": string,
  "application_deadline": string ('via platform inbox', 'external link', 'by email'),
  "visibility": string ('public', 'private', 'internal'),
  "status": string ('active', 'closed', 'draft'),
  "createdAt": string,
  "updatedAt": string
  },
   ...
]
```

---

### 6. Видалення обраної вакансії

**DELETE /api/auth/jobs/id**

Опис  
Видаляє профіль користувача.

Відповідь (200 OK):

```json
{
  "message": "Job deleted"
}
```

---
