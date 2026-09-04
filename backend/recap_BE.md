# Backend Architecture & API Recap - HMP TI UNESA

## 1. Overview & Technology Stack
The backend of **HMP TI UNESA** is a RESTful API built on **Node.js** and **Express.js**, using **MongoDB** (via **Mongoose**) for persistence. It provides secure authentication, role-based access control (RBAC), multi-format file upload handling, email verification, and full CRUD endpoints for the student association's digital operations.

### Tech Stack
* **Runtime**: Node.js (v16+)
* **Framework**: Express.js (v4.18.2)
* **Database**: MongoDB with Mongoose ODM (v8.0.0)
* **Authentication**: JSON Web Tokens (`jsonwebtoken`), password hashing with `bcrypt` / `bcryptjs`
* **File Uploads**: `multer` (saving to disk storage under `/uploads`)
* **Email Service**: `nodemailer` + `mailtrap`
* **Security & Limiting**: `express-rate-limit`, `cors`, `dotenv`, `validator`
* **Dev Tools**: `nodemon`

---

## 2. Directory Structure Breakdown

```
backend/
├── config/
│   └── database.js               # MongoDB connection setup
├── controllers/                  # Business logic and database operations
│   ├── eventController.js        # Event CRUD, registration, categorization
│   ├── functionaryController.js  # Cabinet board member profiles & periods
│   ├── functionaryDepartController.js # Cabinet department classifications
│   ├── galleryController.js      # Photos/videos highlights & albums
│   ├── lecturerController.js     # Faculty profile & search management
│   ├── lecturerExpertiseController.js # Lecturer research areas
│   ├── memberController.js       # Student member directory
│   ├── newsController.js         # Articles, categories, view counters
│   ├── organizationController.js # Vision, mission, departments, history
│   ├── projectController.js      # Student project showcase CRUD
│   └── userController.js         # Auth (register, login, verify, OTP, role)
├── middleware/                   # Request interceptors & security
│   ├── authMiddleware.js         # JWT verification & role authorization (admin/pengurus)
│   ├── rateLimitMiddleware.js    # Rate limiting for general & write APIs
│   └── uploadMiddleware.js       # Multer file storage & upload error handling
├── models/                       # Mongoose schemas
│   ├── Event.js                  # Event entity
│   ├── Functionary.js            # Fungsionaris entity
│   ├── FunctionaryDepart.js      # Department taxonomy
│   ├── Gallery.js                # Media entity
│   ├── Lecturer.js               # Faculty entity
│   ├── LecturerExpertise.js      # Expertise taxonomy
│   ├── Member.js                 # Member entity
│   ├── News.js                   # News entity
│   ├── Organization.js           # Organization entity
│   ├── Project.js                # Student project entity
│   └── User.js                   # User & auth credentials entity
├── routes/                       # Express router endpoints
│   ├── eventRoutes.js
│   ├── functionaryDepartRoutes.js
│   ├── functionaryRoutes.js
│   ├── galleryRoutes.js
│   ├── lecturerExpertiseRoutes.js
│   ├── lecturerRoutes.js
│   ├── memberRoutes.js
│   ├── newsRoutes.js
│   ├── organizationRoutes.js
│   ├── projectRoutes.js
│   └── userRoutes.js
├── seeders/                      # Initial database seeding scripts
│   ├── eventSeeder.js
│   └── index.js
├── uploads/                      # Uploaded images & asset storage
├── utils/                        # Utilities & helpers
│   └── sendEmail.js              # Mailer utility for OTP / verification
├── .env                          # Local environment variables
├── package.json                  # Dependencies & scripts
└── server.js                     # Main application entry point
```

---

## 3. Core Features & Technical Highlights

1. **Authentication & RBAC**:
   - Supports 3 roles: `user` (general student), `pengurus` (association officer), and `admin` (super administrator).
   - OTP email verification workflow for new registrations.
   - Protected routes check `Authorization: Bearer <token>` and validate roles via `authorize('admin', 'pengurus')` or `adminMiddleware`.

2. **File Upload Pipeline**:
   - Uses `multer` with custom filename sanitization and MIME-type filtering.
   - Handled via `uploadSingle('field')` and `uploadMultiple('images', maxCount)` middlewares.
   - Statically exposed at `/uploads` route on Express.

3. **Rate Limiting Protection**:
   - `apiLimiter`: 100 requests per 15 minutes for standard read routes.
   - `modifyLimiter`: Stricter limits for resource creation/updates to mitigate spam and DoS.

---

## 4. Complete REST API Route Reference

### 🔐 4.1 Authentication & Users (`/api/users`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | Public | Register new user and trigger OTP email |
| `POST` | `/api/users/login` | Public | Authenticate user and return JWT |
| `POST` | `/api/users/verify-email` | Public | Verify user account with OTP code |
| `POST` | `/api/users/resend-otp` | Public | Resend verification OTP code |
| `GET` | `/api/users/me` | Protected (`User`) | Get currently logged-in user profile |
| `PUT` | `/api/users/me` | Protected (`User`) | Update user profile details |
| `PUT` | `/api/users/change-password`| Protected (`User`) | Update user password |
| `GET` | `/api/users` | Protected (`Admin`) | Retrieve list of all registered users |
| `PUT` | `/api/users/:id/role` | Protected (`Admin`) | Change user role (`user`, `pengurus`, `admin`) |

### 🏢 4.2 Organization Profile (`/api/organization`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/organization` | Public | Fetch organization profile, vision, mission, contacts |
| `PUT` | `/api/organization` | Protected (`Admin`) | Update organization profile |
| `POST` | `/api/organization/departments` | Protected (`Admin`) | Add a department |
| `PUT` | `/api/organization/departments/:id` | Protected (`Admin`) | Update department details |
| `DELETE`| `/api/organization/departments/:id` | Protected (`Admin`) | Remove a department |

### 📅 4.3 Events & Activities (`/api/events`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | List all events (supports query filtering) |
| `GET` | `/api/events/categories` | Public | Get all event category listings |
| `GET` | `/api/events/stats` | Public | Get aggregated event statistics |
| `GET` | `/api/events/:id` | Public | Get event detail by ID |
| `POST` | `/api/events` | Protected (`Admin`/`Pengurus`) | Create new event |
| `PUT` | `/api/events/:id` | Protected (`Admin`/`Pengurus`) | Update existing event |
| `DELETE`| `/api/events/:id` | Protected (`Admin`/`Pengurus`) | Delete event |

### 📰 4.4 News & Articles (`/api/news`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/news` | Public | List published articles with pagination & search |
| `GET` | `/api/news/:id` | Public | Get single news article & increment view counter |
| `GET` | `/api/news/category/:category` | Public | Filter news articles by category |
| `POST` | `/api/news` | Protected (`Admin`/`Pengurus`) | Create new article |
| `PUT` | `/api/news/:id` | Protected (`Admin`/`Pengurus`) | Update article content/status |
| `DELETE`| `/api/news/:id` | Protected (`Admin`/`Pengurus`) | Delete article |

### 🖼️ 4.5 Media Gallery (`/api/gallery`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/gallery` | Public | Get all gallery items (photos/videos) |
| `GET` | `/api/gallery/featured` | Public | Get highlighted gallery media |
| `GET` | `/api/gallery/:id` | Public | Get gallery item by ID |
| `POST` | `/api/gallery` | Protected (`Admin`/`Pengurus`) | Upload new gallery media |
| `PUT` | `/api/gallery/:id` | Protected (`Admin`/`Pengurus`) | Update gallery metadata |
| `DELETE`| `/api/gallery/:id` | Protected (`Admin`/`Pengurus`) | Delete gallery item |
| `PUT` | `/api/gallery/:id/featured` | Protected (`Admin`) | Toggle featured highlight status |

### 👨‍🏫 4.6 Lecturers & Expertise (`/api/lecturers` & `/api/lecturers-expertise`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/lecturers` | Public | List all lecturers |
| `GET` | `/api/lecturers/search` | Public | Search lecturers by name/NIP |
| `GET` | `/api/lecturers/specialization/:specialization` | Public | Filter lecturers by specialization |
| `GET` | `/api/lecturers/:id` | Public | Get lecturer profile by ID |
| `POST` | `/api/lecturers` | Public/Admin (Upload) | Add lecturer profile with photo upload |
| `PUT` | `/api/lecturers/:id` | Public/Admin (Upload) | Update lecturer profile & photo |
| `DELETE`| `/api/lecturers/:id` | Public/Admin | Delete lecturer profile |
| `GET` | `/api/lecturers-expertise` | Public | Get all lecturer expertise tags |
| `POST` | `/api/lecturers-expertise` | Public/Admin | Add new expertise tag |

### 👥 4.7 Functionaries (`/api/functionaries` & `/api/functionaries-departs`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/functionaries` | Public | List all cabinet functionaries |
| `GET` | `/api/functionaries/active` | Public | List active cabinet members |
| `GET` | `/api/functionaries/period/:period` | Public | Filter functionaries by period year |
| `GET` | `/api/functionaries/department/:department` | Public | Filter functionaries by department |
| `GET` | `/api/functionaries/:id` | Public | Get single functionary profile |
| `POST` | `/api/functionaries` | Public/Admin (Upload) | Create functionary with photo |
| `PUT` | `/api/functionaries/:id` | Public/Admin (Upload) | Update functionary details & photo |
| `DELETE`| `/api/functionaries/:id` | Public/Admin | Delete functionary |
| `GET` | `/api/functionaries-departs` | Public | List all functionary departments |
| `POST` | `/api/functionaries-departs` | Public/Admin | Create functionary department |

### 🎓 4.8 Members (`/api/members`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/members` | Public | List student members |
| `GET` | `/api/members/search` | Public | Search members by NIM/Name |
| `GET` | `/api/members/active` | Public | List active members |
| `GET` | `/api/members/batch/:batch` | Public | Filter members by batch/angkatan |
| `GET` | `/api/members/department/:department` | Public | Filter members by department |
| `GET` | `/api/members/:id` | Public | Get member by ID |
| `POST` | `/api/members` | Public/Admin (Upload) | Add member with photo |
| `PUT` | `/api/members/:id` | Public/Admin (Upload) | Update member data & photo |
| `DELETE`| `/api/members/:id` | Public/Admin | Delete member |

### 🚀 4.9 Student Projects (`/api/projects`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Public (Rate Limited) | List showcase projects |
| `GET` | `/api/projects/search` | Public | Search projects by name/keyword |
| `GET` | `/api/projects/category/:category` | Public | Filter projects by category |
| `GET` | `/api/projects/status/:status` | Public | Filter projects by status |
| `GET` | `/api/projects/:id` | Public | Get project details by ID |
| `POST` | `/api/projects` | Protected (`Admin`, `Pengurus`) | Create project with thumbnail upload |
| `POST` | `/api/projects/multiple-images/:id` | Protected (`Admin`, `Pengurus`) | Upload up to 10 screenshots for project |
| `PUT` | `/api/projects/:id` | Protected (`Admin`, `Pengurus`) | Update project data & thumbnail |
| `DELETE`| `/api/projects/:id` | Protected (`Admin`) | Delete project |

---

## 5. Environment Variables & Run Commands

### Required `.env` Keys
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hmptiunesa
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Mailtrap / SMTP Config
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_mailtrap_user
SMTP_PASSWORD=your_mailtrap_password
FROM_EMAIL=noreply@hmptiunesa.com
FROM_NAME=HMP TI UNESA
```

### NPM Scripts
* `npm run dev`: Starts the server with `nodemon` auto-reloading.
* `npm start`: Runs the server with standard `node server.js`.
* `npm run seed`: Executes database seeder scripts.
