# 🎓 AcademiX

An AI-powered mobile application designed to assist teachers and students by providing smart learning tools, course management, and accessible study resources.

---

## 🚀 Features

* 🔐 **User Authentication**
  Secure signup and login system using JWT authentication.

* 👩‍🏫 **Teacher Dashboard**

  * Create and manage courses
  * Upload study materials
  * View enrolled students

* 👨‍🎓 **Student Dashboard**

  * Join courses using verification key
  * Access study materials
  * View enrolled courses

* 🔊 **PDF to Audio Converter**
  Converts study materials into audio format to help students learn more efficiently.

* 🤖 **AI Assistance**
  Enhances learning experience through intelligent features and support.

---

## 🛠️ Tech Stack

**Frontend (Mobile App):**

* React Native
* Expo

**Backend:**

* Node.js
* Express.js

**Database:**

* MongoDB Atlas

**Other Tools:**

* JWT Authentication
* Axios

---

## 📂 Project Structure

```
AI Assistant for Teachers
│
├── client/        # React Native (Expo) mobile app
├── server/        # Node.js backend (API)
└── README.md
```

---

## ⚙️ Installation & Setup

### 🔹 1. Clone the repository

```
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

### 🔹 2. Setup Backend

```
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the server:

```
npm start
```

---

### 🔹 3. Setup Frontend

```
cd client
npm install
npx expo start
```

---

## 📱 Running the App

* Scan the QR code using **Expo Go** app
* OR run on Android emulator using `a`

---

## ⚠️ Notes

* Replace `localhost` with your system’s IP address in API calls when running on a physical device
* Ensure MongoDB Atlas IP access is enabled (`0.0.0.0/0`)

---

## 🎯 Future Improvements

* Enhanced AI-based recommendations
* Real-time chat between teachers and students
* Advanced analytics for performance tracking

---

## 📌 Disclaimer

This project was developed for learning and educational purposes.

---

## 👩‍💻 Author

Tanishqa Patil
