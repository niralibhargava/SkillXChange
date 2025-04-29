# SkillXchange

SkillXchange is a full-stack MERN (MongoDB, Express.js, React, Node.js) web application that allows users to exchange and learn skills within a collaborative community. This project uses **Vite** as the frontend bundler for faster development and performance.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Folder Structure](#folder-structure)
- [Dependencies](#dependencies)
- [License](#license)

---

## Features

- User authentication (JWT-based)
- Profile creation and skill listing
- Browse and search users by skill
- Chat or request collaboration
- Responsive UI with modern UX principles
- RESTful API backend

---

## Tech Stack

**Frontend:**

- React (via Vite)
- Tailwind CSS or CSS Modules (depending on your choice)
- Axios

**Backend:**

- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT (for authentication)  
- bcryptjs (for password hashing)  
- dotenv  

---

## Installation

### Prerequisites

Ensure you have the following installed:

- Node.js >= 16.x
- npm or yarn
- MongoDB (local)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/skillxchange.git
cd skillxchange
```

---

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

---

### 3. Setup Frontend

```bash
cd ../client
npm install
```

Start the frontend:

```bash
npm run dev
```

---

## Environment Variables

### Backend (`server/.env`):

```env
PORT=
MONGO_URI=
JWT_SECRET=
```

### Frontend (`client/.env` if needed):

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Available Scripts

### Backend (inside `/server`):

- `npm run dev` — runs backend with nodemon
- `npm start` — runs backend normally

### Frontend (inside `/client`):

- `npm run dev` — starts the Vite development server
- `npm run build` — builds the app for production
- `npm run preview` — preview production build

---

## Folder Structure

```
skillxchange/
│
├── FRONTEND/                # React frontend (Vite)
│   ├── src/
│   └── index.html
│
├── BACKEND/                # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
```

---

## Dependencies

### Backend

```json
"dependencies": {
  "bcryptjs": "^2.x",
  "cors": "^2.x",
  "dotenv": "^16.x",
  "express": "^4.x",
  "jsonwebtoken": "^9.x",
  "mongoose": "^7.x"
},
"devDependencies": {
  "nodemon": "^3.x"
}
```

### Frontend

```json
"dependencies": {
  "axios": "^1.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x"
},
"devDependencies": {
  "vite": "^4.x"
}
```

---

## License

This project is licensed under the MIT License.
