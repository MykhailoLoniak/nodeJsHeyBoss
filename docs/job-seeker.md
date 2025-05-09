# Документація до маршруту /api/auth/profile-job-seeker

## Опис

Цей маршрут відповідає за керування профілем шукача роботи.

## Ендпоїнти

### 1. Отримати профіль всіх шукачі роботи

**GET /api/auth/profile-job-seeker/**

## Опис

Повертає усі профілі користувачів з розширеною інформацією.

Відповідь (200 OK):

```json
[
  {
    "user_id": string,
    "first_name": string,
    "last_name": string,
    "role": string,
    "email": string,
    "job_category": string,
    "work_experience": string,
    "portfolio": string,
    "section_title": string,
    "description": string,
    "country": string,
    "location": string,
    "company": string,
    "city": string,
    "phone_number": string,
    "avatar": string,
    "contact_info": array,
  },
  ...
]
```

---

### 2. Отримати профіль шукача роботи

**GET /api/auth/profile-job-seeker/:id**

## Опис

Повертає профіль користувача з розширеною інформацією.

Відповідь (200 OK):

```json
  {
    "user_id": string,
    "first_name": string,
    "last_name": string,
    "role": string,
    "email": string,
    "job_category": string,
    "work_experience": string,
    "portfolio": string,
    "section_title": string,
    "description": string,
    "country": string,
    "location": string,
    "city": string,
    "phone_number": string,
    "avatar": string,
    "contact_info": array,
    "company": string,
  }
```

---

### 3. Оновити профіль шукача роботи

**PATCH /api/auth/profile-job-seeker/:id**

Опис  
Оновлює поля профілю користувача.

Вхідні параметри (JSON):

```json
{
  "first_name": STRING,
  "last_name": STRING,
  "email": STRING,
  "job_category": STRING,
  "work_experience": STRING,
  "portfolio": STRING,
  "section_title": STRING,
  "description": STRING,
  "country": STRING,
  "location": STRING,
  "city": STRING,
  "phone_number": STRING,
  "contact_info": array,
  "company": string,
}
```

Відповідь (200 OK):

```json
{
  "user_id": string,
  "first_name": string,
  "last_name": string,
  "role": string,
  "email": string,
  "job_category": string,
  "work_experience": string,
  "portfolio": string,
  "section_title": string,
  "description": string,
  "country": string,
  "location": string,
  "city": string,
  "phone_number": string,
  "avatar": string,
  "company": string,
}
```

### 4. Отримати список проєктів користувача

**GET /api/auth/profile-job-seeker/project/:id**

#### Опис

Повертає всі проєкти, що належать користувачу з вказаним `id`.

#### Вхідні параметри:

- `id` (integer) – ID користувача (job_seeker)

#### Відповідь (200 OK):

```json
[
  {
    "id": 1,
    "contractor_id": 5,
    "title": "Проєкт 1",
    "description": "Опис проєкту",
    "media": ["https://example.com/image1.jpg"]
  },
  {
    "id": 2,
    "contractor_id": 5,
    "title": "Проєкт 2",
    "description": "Ще один опис",
    "media": []
  }
]
```

### 5. Створити новий проєкт

**POST /api/auth/profile-job-seeker/project/:id**

#### Опис

Додає новий проєкт до профілю job_seeker користувача з вказаним `id`.

#### Обов’язкові поля:

- `title` (string) – назва проєкту

#### Опціональні поля:

- `description` (string) – опис проєкту
- `media` (array of strings) – список URL до зображень або медіа-файлів

#### Відповідь (201 Created):

```json
{
  "id": 3,
  "contractor_id": 5,
  "title": "Новий проєкт",
  "description": "Деталі проєкту",
  "media": []
}
```

### 6. Оновити існуючий проєкт

**PATCH /api/auth/profile-job-seeker/project/:id/:projectId**

#### Опис

Оновлює існуючий проєкт із `projectId` у користувача з `id`.

#### Вхідні параметри:

- `id` (integer) – ID користувача
- `projectId` (integer) – ID проєкту

#### Опціональні поля:

- `title` (string) – нова назва проєкту
- `description` (string) – новий опис
- `media` (array of strings) – оновлений список медіа

#### Відповідь (200 OK):

```json
{
  "title": string,
  "description": string,
  "media": array,
}
```
