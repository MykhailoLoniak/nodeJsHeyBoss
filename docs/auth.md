Документація API: Маршрути аутентифікації (authRoutes)
## Загальний опис
**authRoutes** обробляє всі запити, пов'язані з аутентифікацією та управлінням користувачами.
**Базовий URL:** `/api/auth`
## Список маршрутів
### Реєстрація користувача
**POST /register**
**Опис:** Реєструє нового користувача та відправляє email для активації.
**Тіло запиту (JSON):**
{  "firstName": "John",  "lastName": "Doe",  "email": "johndoe@example.com",  "password": "securepassword",  "role": "contractor",  "skills": "JavaScript, React",  "experience": "5 years",  "portfolio": "https://portfolio.example.com"}
**Відповідь (200 OK):**
{  "id": 1,  "firstName": "John",  "lastName": "Doe",  "email": "johndoe@example.com",  "role": "contractor"}
### Активація акаунта
**GET /activation/:token**
**Опис:** Активує акаунт користувача після реєстрації.
**Параметри URL:**token (string) – токен активації, отриманий через email.
**Відповідь (200 OK):**
{  "id": 1,  "firstName": "John",  "lastName": "Doe",  "email": "johndoe@example.com",  "role": "contractor"}
### Вхід у систему
**POST /login**
**Опис:** Авторизує користувача та повертає токени доступу.
**Тіло запиту (JSON):**
{  "email": "johndoe@example.com",  "password": "securepassword"}
**Відповідь (200 OK):**
{  "user": {    "id": 1,    "firstName": "John",    "lastName": "Doe",    "email": "johndoe@example.com",    "role": "contractor"  },  "accessToken": "jwt_access_token"}
### Вихід із системи
**DELETE /logout**
**Опис:** Видаляє refresh-токен із бази та виходить з акаунта.
**Відповідь (200 OK):**
(204 No Content)
### Оновлення токена
**GET /refresh**
**Опис:** Оновлює accessToken, використовуючи refreshToken.
**Відповідь (200 OK):**
{  "user": {    "id": 1,    "firstName": "John",    "lastName": "Doe",    "email": "johndoe@example.com"  },  "accessToken": "new_jwt_access_token"}
### Запит на скидання пароля
**POST /request-password-reset**
**Опис:** Надсилає користувачеві email із посиланням для скидання пароля.
**Тіло запиту (JSON):**
{  "email": "johndoe@example.com"}
**Відповідь (200 OK):**
{  "message": "Password reset link has been sent to your email"}
### Скидання пароля
**PUT /password-reset/:token**
**Опис:** Встановлює новий пароль користувача.
**Параметри URL:**token (string) – токен для скидання пароля, отриманий через email.
**Тіло запиту (JSON):**
{  "password": "newpassword123",  "confirmation": "newpassword123"}
**Відповідь (200 OK):**
{  "message": "Password has been reset successfully"}
## Примітки
**accessToken** потрібно передавати в заголовку `Authorization: Bearer {token}` для всіх захищених маршрутів.
**refreshToken** зберігається в HttpOnly cookie.
Для обмеження спроб входу використовується `express-rate-limit` (10 спроб за 15 хвилин).