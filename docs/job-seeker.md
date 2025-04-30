# Документація до маршруту /api/auth/profile-job-seeker

## Опис  

Цей маршрут відповідає за керування профілем шукача роботи, включаючи перегляд, оновлення та видалення профілю, отримання списку вакансій, фільтрацію, додавання/перегляд відгуків, а також завантаження, отримання та видалення аватара.

## Ендпоїнти

### 1. Отримати профіль всіх шукачі роботи

**GET /api/auth/profile-job-seeker/**

## Опис  
Повертає усі профілі користувачів з розширеною інформацією.

Відповідь (200 OK):

```
[
    {
        "id": 1,
        "first_name": "Mykhailo",
        "last_name": "Loniak",
        "role": "job_seeker",
        "email": "ketoro6525@npo2.com",
        "job_category": "Backend Development",
        "work_experience": "years",
        "portfolio": "none",
        "section_title": null,
        "description": null,
        "position": null,
        "avatar": null
    }
]

{
"id": 1,
"first_name": "Іван",
"last_name": "Петров",
"email": "ivan@example.com",
"role": "job-seeker",
"job_category": "Frontend",
"work_experience": "3 роки",
"portfolio": "https://myportfolio.com",
"section_title": "Senior Software Developer",
"description": "A passionate and ...",
"position": "Lead Developer",
"avatar": "https://example.com/path/to/avatar.jpg"

"country": "Україна",
"city": "Київ",
"phone_number": "+380501234567",
"location": "Kyiv, Ukraine",
}
```

---
### 1. Отримати профіль шукача роботи

**GET /api/auth/profile-job-seeker/:id**

## Опис  
Повертає профіль користувача з розширеною інформацією.

Відповідь (200 OK):

```
{
"id": 1,
"first_name": "Іван",
"last_name": "Петров",
"email": "ivan@example.com",
"country": "Україна",
"city": "Київ",
"phone_number": "+380501234567",
"job_category": "Frontend",
"work_experience": "3 роки",
"portfolio": "https://myportfolio.com",
"avatar": "https://example.com/uploads/avatar.jpg",
"role": "job-seeker",
"location": "Kyiv, Ukraine",
"section_title": "Senior Software Developer",
"description": "A passionate and ...",
"position": "Lead Developer",
"avatar": "https://example.com/path/to/avatar.jpg"
}
```

---

### 2. Оновити профіль шукача роботи

**PUT /api/auth/profile-job-seeker/:id**

Опис  
Оновлює поля профілю користувача.

Вхідні параметри (JSON):

```
{
"first_name": "Іван",
"last_name": "Петров",
"city": "Львів",
"phone_number": "+380509999999",
"email": "john.doe@example.com",
"position": "Software Engineer",
"company": "Tech Innovators Inc.",
"location": "San Francisco, USA",
"section_title": "Software Development Team",
"description": "A dynamic ..."
}
```

Відповідь (200 OK):

```
{
id,
first_name,
last_name,
role,
email,
country,
location,
city,
phone_number,
job_category,
work_experience,
portfolio,
section_title,
description,
position,
}
```

---

### 3. Видалити профіль

**DELETE /api/auth/profile-job-seeker/:id**

Опис  
Видаляє профіль користувача.

Відповідь (204 OK):

{ "message": "Профіль видалено" }

---

### 4. Отримати доступні вакансії

**GET /api/auth/profile-job-seeker/job**

Опис  
Повертає список усіх доступних вакансій для пошукачів.

Відповідь (200 OK):

```
[
{
"job_id": 1,
"job_title": "Frontend Developer",
"company": "Tech Corp",
"location": "Київ",
"salary": "3000 USD",
"type": "Remote",
"description": "Робота з React",
employment_type: "Tech Corp",
"short_summary": "Шукаємо Frontend Developer для розробки веб-додатків.",
"full_description": "Ми шукаємо талановитого Frontend Developer.",
"application_deadline": "via platform inbox",
"visibility": "public",
"status": "active",
"posted_at": "2025-04-24T12:00:00Z",
}
]
```

---

### 5. Фільтрація вакансій

**GET /api/auth/profile-job-seeker/filter-jobs?category=Frontend&city=Київ**

Опис  
Повертає вакансії, які відповідають параметрам запиту.

Параметри запиту:

```
- "job_category",
- "work_experience",
- "position",
- "job_title",
- "employment_type",
- "min_salary",
- "max_salary",
- "status",
```

Відповідь (200 OK):

[
{
"job_id": 2,
"title": "React Developer",
"company": "DevX",
"location": "Київ",
"salary": "3500 USD",
"type": "Remote"
}
]

---

6. Додати новий відгук/коментар  
   **POST /api/profile/reviews**

Опис  
Додає коментар до компанії або вакансії.

Вхідні параметри:

{
"job_id": 1,
"comment": "Дуже приємна співбесіда",
"rating": 5
}

Відповідь (201 Created):

{ "message": "Коментар додано" }

---

7. Отримати коментарі  
   **GET /api/profile/reviews/:id**

Опис  
Повертає всі коментарі для певної вакансії.

Відповідь (200 OK):

[
{
"comment_id": 1,
"user": "Іван Петров",
"comment": "Дуже приємна співбесіда",
"rating": 5,
"created_at": "2025-04-24T12:00:00Z"
}
]

---

8. Завантажити аватар  
   **POST /api/profile/:id/avatar**

Опис  
Завантажує новий аватар користувача.  
**Формат**: `multipart/form-data`  
**Поле**: `avatar`

Відповідь (200 OK):

{ "message": "Аватар успішно завантажено", "url": "https://example.com/uploads/avatar.jpg" }

---

9. Отримати аватар  
   **GET /api/profile/:id/avatar**

Опис  
Повертає аватар користувача.

Відповідь (200 OK):

- Content-Type: `image/jpeg`

---

10. Видалити аватар  
    **DELETE /api/profile/:id/avatar**

Опис  
Видаляє аватар користувача.

Відповідь (200 OK):

{ "message": "Аватар видалено" }
