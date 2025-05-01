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
  }
```

---

### 3. Оновити профіль шукача роботи

**PUT /api/auth/profile-job-seeker/:id**

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
}
```
