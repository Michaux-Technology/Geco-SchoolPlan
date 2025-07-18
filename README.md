# 📚 Geco-SchoolPlan

**Geco-SchoolPlan** is an open-source scheduling software designed for **schools**, **training organizations**, and **educational associations**.

It allows you to:
- Easily schedule classes, groups, teachers, and rooms  
- View timetables in real time with a single click  
- Simplify educational organization
  
---

## 👤 Who is it for?

- Schools, middle schools, high schools, and training centers  
- Educational coordinators looking for a simple and efficient solution  
- Developers seeking a modular foundation for a school-oriented application
---

## 💡 Why choose Geco-SchoolPlan?

✅ Clear and intuitive interface  
✅ Modular open-source architecture  
✅ Easy deployment locally or on a server  
✅ Full control over your data  
✅ Real-time visible modifications  
✅ Caching system for students not connected to the app  
✅ Drag-and-drop course rescheduling

It consists of:
- 🛠️ a **web frontend** for schedule management (modification, assignment, visualization),
- 📱 a **mobile application** for teachers and students, in read-only mode:  
  👉 [Geco-SchoolPlan-App](https://github.com/Michaux-Technology/Geco-SchoolPlan-App)

## 💡 My services ?

✅ Bug fixing  
✅ Installation

---

## 🚀 Key Features

- 🔐 User authentication (teachers and students)
- 📆 Course and timetable management
- 🧍‍♂️ Supervision scheduling
- 📲 Secure mobile API
- 🔒 JWT-based authentication
- 🛡️ Login attempt limitation
- 🧩 Role-based access control
- 🌐 Multilingual support: **French**, **English**, and **German**

---

## 🧰 Requirements

- [Node.js](https://nodejs.org)
- [MongoDB](https://www.mongodb.com)
- `npm` or `yarn`

---

## ⚙️ Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Michaux-Technology/Geco-SchoolPlan.git
   cd Geco-SchoolPlan
   ```

2. Install **backend** dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install **frontend** dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Create a `.env` file inside `backend` with the following variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/Geco-SchoolPlan
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

---

## ▶️ Start the Application

### Backend:
```bash
cd backend
npm start
```

### Frontend:
```bash
cd frontend
npm run dev
```

---

## 📡 REST API – Main Endpoints

| Method | Endpoint                    | Description                 |
|--------|-----------------------------|-----------------------------|
| POST   | `/api/mobile/login`         | User login                  |
| GET    | `/api/mobile/cours`         | Get courses                 |
| GET    | `/api/mobile/enseignants`   | List of teachers            |
| GET    | `/api/mobile/surveillances` | List of supervisions        |
| GET    | `/api/mobile/status`        | Server status               |

---

## 🛡️ Security

- 🔐 JWT-based authentication
- 🛡️ Brute-force login protection
- 🔒 Role-based access control

---

## 🤝 Contributing

Contributions are welcome!  
Feel free to **open an issue** or **submit a pull request** to suggest improvements or report bugs.

---

## 📄 License: Business Source License 1.1 (BSL 1.1)

This project is distributed under the **Business Source License 1.1**, which means:

- ✅ **Free** for development, testing, research, and personal use
- ❌ **Not allowed in production environments** without a commercial license

### 🔐 Commercial Use

To use **Geco-SchoolPlan** in a production environment (schools, companies, public servers, etc.), you must obtain a **commercial license**.

📩 License contact: **michaux@free.fr**

---

## ⏳ Future Open Source

Starting **July 4, 2030**, this project will automatically be relicensed under **GPL v3** (fully open source).
