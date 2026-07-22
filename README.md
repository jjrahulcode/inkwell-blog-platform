# InkWell — Full Stack Blogging Platform

A modern, multi-user blogging platform built with the JavaScript stack (HTML5, CSS3, Bootstrap 5, Vanilla JS, Node.js, Express, MongoDB Atlas). Users can sign up, log in, write and manage their own blog posts, and readers can browse, search, and comment.

---

## 1. Folder Structure

```
project1-blog/
├── frontend/
│   ├── index.html          Public homepage + blog listing
│   ├── login.html          Login page
│   ├── signup.html         Signup page
│   ├── dashboard.html      User dashboard (create/edit/delete blogs)
│   ├── blog.html           Single blog view + comments
│   ├── profile.html        User profile page
│   ├── css/style.css       All custom styling
│   ├── js/
│   │   ├── config.js       API_URL configuration (edit after deployment)
│   │   ├── ui.js           Navbar, footer, toasts, confirm dialogs
│   │   ├── auth.js         Signup/login logic
│   │   ├── main.js         Homepage blog listing logic
│   │   ├── dashboard.js    Dashboard CRUD logic
│   │   ├── blog.js         Single blog + comments logic
│   │   └── profile.js      Profile view/update logic
│   ├── images/             (empty, for your own assets)
│   └── assets/             (empty, for your own assets)
│
├── backend/
│   ├── server.js            App entry point
│   ├── package.json
│   ├── .env                 Environment variables (edit before running)
│   ├── .gitignore
│   ├── config/db.js         MongoDB connection
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Blog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── blogRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── blogController.js
│   └── utils/generateToken.js
│
└── README.md
```

---

## 2. Running Locally in VS Code

### Backend

```bash
cd backend
npm install
```

Open `.env` and fill in:

```
PORT=5000
MONGO_URI=PASTE_YOUR_MONGODB_ATLAS_CONNECTION_STRING_HERE
JWT_SECRET=PASTE_YOUR_JWT_SECRET_HERE
CLIENT_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

Then start the server:

```bash
npm start
```

The API will run at `http://localhost:5000`.

### Frontend

Open the `frontend` folder in VS Code and run `index.html` with the **Live Server** extension (usually on `http://localhost:5500`). No build step is required — it's plain HTML/CSS/JS.

Before testing, open `frontend/js/config.js` and set it to your local backend while developing:

```js
const API_URL = "http://localhost:5000";
```

(Change this back to your Render URL before deploying — see below.)

---

## 3. Required NPM Packages (backend)

| Package | Purpose |
|---|---|
| express | Web server / REST API framework |
| mongoose | MongoDB object modeling |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| cors | Cross-origin requests from frontend |
| dotenv | Environment variable loading |
| nodemon (dev) | Auto-restart during development |

Install everything with `npm install` inside `/backend`.

---

## 4. MongoDB Collections

- **users** — name, email, hashed password, bio, avatar, timestamps
- **blogs** — title, content, category, coverImage, author (ref User), authorName, comments[] (embedded sub-documents), timestamps

---

## 5. API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive a JWT |
| GET | `/api/auth/profile` | Private | Get logged-in user's profile |
| PUT | `/api/auth/profile` | Private | Update name/bio/avatar |

### Blog Routes (`/api/blogs`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/blogs` | Public | Get all blogs (`?search=`, `?category=`) |
| GET | `/api/blogs/:id` | Public | Get a single blog |
| GET | `/api/blogs/user/myblogs` | Private | Get logged-in user's own blogs |
| POST | `/api/blogs` | Private | Create a new blog |
| PUT | `/api/blogs/:id` | Private (owner) | Update a blog |
| DELETE | `/api/blogs/:id` | Private (owner) | Delete a blog |
| POST | `/api/blogs/:id/comments` | Private | Add a comment to a blog |

For protected routes, send the JWT in the header:

```
Authorization: Bearer <token>
```

---

## 6. Testing with Thunder Client

1. Install the **Thunder Client** extension in VS Code.
2. Create a request `POST http://localhost:5000/api/auth/signup` with JSON body:
   ```json
   { "name": "Jane Doe", "email": "jane@example.com", "password": "123456" }
   ```
3. Copy the `token` from the response.
4. For protected routes (e.g. `POST /api/blogs`), go to the **Auth** tab in Thunder Client, choose **Bearer Token**, and paste the token.
5. Test each endpoint listed in the table above.

---

## 7. Deployment

### Step 1 — MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access from anywhere (`0.0.0.0/0`) for simplicity.
3. Copy your connection string and paste it into `backend/.env` as `MONGO_URI`.

### Step 2 — Backend on Render
1. Push the `backend` folder to a GitHub repository.
2. Go to [Render](https://render.com) → New → Web Service → connect your repo.
3. Set **Root Directory** to `backend` (if the repo contains both folders).
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables in Render's dashboard: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`.
7. Deploy. Copy the generated URL (e.g. `https://inkwell-backend.onrender.com`).

### Step 3 — Frontend on Netlify
1. Open `frontend/js/config.js` and replace:
   ```js
   const API_URL = "PASTE_YOUR_RENDER_BACKEND_URL_HERE";
   ```
   with your real Render URL, e.g.:
   ```js
   const API_URL = "https://inkwell-backend.onrender.com";
   ```
2. Push the `frontend` folder to GitHub (or drag-and-drop it into Netlify).
3. Go to [Netlify](https://app.netlify.com) → Add new site → deploy the `frontend` folder.
4. Once deployed, copy your Netlify URL and add it to `CLIENT_ORIGIN` in your Render backend's environment variables (comma-separated if you keep localhost too), then redeploy the backend.

### Step 4 — Final Check
- Visit your Netlify URL, sign up, log in, create a blog, and confirm everything works end-to-end.

---

## 8. Notes for Beginners

- All backend logic is split into **routes → controllers → models** for clarity.
- All passwords are hashed with `bcryptjs` before being saved — never stored in plain text.
- JWT tokens are stored in the browser's `localStorage` and sent in the `Authorization` header on every protected request.
- Each user can only edit/delete their own blogs — this is enforced both in the UI and on the backend (never trust the frontend alone).
