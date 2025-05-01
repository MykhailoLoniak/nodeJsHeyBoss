# Документація до маршруту

**/api/auth/reviews/**

## Опис

маршрут відповідає за створення та отримання відгуків між роботодавцями та шукачами роботи.

## Ендпоїнти

### 1. Отримати відгуки для користувача

**GET /api/auth/reviews/:id**

## Опис

Повертає список усіх відгуків, пов’язаних із користувачем з вказаним ID. Якщо користувач — **шукач роботи**, повертає відгуки від роботодавців. Якщо користувач — **роботодавець**, повертає відгуки від шукачів роботи.**Параметри URL:**- `id` — ідентифікатор користувача (обов’язковий)

**Відповідь (200 OK):**

```json
[
  {
    "id": number,
    "rating": number,
    "comment": string,
    "job_id": number,
    "job_seeker_id": number,
    "employer_id": number,
    "createdAt": string,
    "updatedAt": string
  },
  ...
]
```

---

### 2. Створити відгук від шукача роботи

**POST /api/auth/reviews/from-job-seeker**

## Опис

Створює відгук, який шукач роботи залишає для роботодавця.

**Вхідні дані (JSON):**

```json
{
  "rating": number,  // Значення від 0 до 5
  "comment": string,
  "employer_id": number,
  "job_seeker_id": number,
  "job_id": number
}
```

**Відповідь (201 Created):**

```json
{
  "id": number,
  "rating": number,
  "comment": string,
  "employer_id": number,
  "job_seeker_id": number,
  "job_id": number,
  "updatedAt": string,
  "createdAt": string
}
```

---

### 3. Створити відгук від роботодавця

**POST /api/auth/reviews/from-employer**

## Опис

Створює відгук, який роботодавець залишає для шукача роботи.

**Вхідні дані (JSON):**

```json
{
  "rating": number,  // Значення від 0 до 5
  "comment": string,
  "employer_id": number,
  "job_seeker_id": number,
  "job_id": number
}
```

**Відповідь (201 Created):**

```json
{
  "id": number,
  "rating": number,
  "comment": string,
  "employer_id": number,
  "job_seeker_id": number,
  "job_id": number,
  "updatedAt": string,
  "createdAt": string
}
```

Цей маршрут відповідає за керування профілем шукача роботи.
