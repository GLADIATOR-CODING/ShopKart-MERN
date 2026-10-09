# 🛒 ShopKart — Full-Stack E-Commerce Application

> A feature-rich e-commerce platform built with the **MERN stack** — MongoDB, Express.js, React (Vite), and Node.js — featuring secure JWT authentication, cart & wishlist management, and Razorpay payment integration.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Frontend Pages](#-frontend-pages)
- [Security](#-security)
- [Submission Checklist](#-submission-checklist)

---

## 🌟 Overview

ShopKart is a full-stack e-commerce web application that allows customers to browse products, manage a shopping cart and wishlist, place orders, and pay securely via Razorpay. It features a RESTful backend API with JWT-based authentication and a responsive React frontend powered by Vite.

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework & REST API |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **bcrypt** | Password hashing |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **cookie-parser** | HTTP cookie handling |
| **Razorpay SDK** | Payment gateway integration |
| **dotenv** | Environment variable management |
| **cors** | Cross-Origin Resource Sharing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI component framework |
| **Vite** | Build tool & dev server |
| **React Router DOM v7** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **Context API** | Global state management (Cart) |

---

## ✨ Features

### 👤 Customer / Authentication
- [x] User **Registration** with email uniqueness check
- [x] Secure **Login** with bcrypt password comparison
- [x] **JWT authentication** stored in HTTP-only cookies
- [x] **Logout** with cookie clearing
- [x] **Change Password** (authenticated)
- [x] View **profile** (authenticated)

### 🛍 Products
- [x] Browse all products
- [x] View single product details
- [x] Create new products (admin-style endpoint)

### 🛒 Cart
- [x] Add product to cart
- [x] View cart with product details (populated)
- [x] Update item quantity
- [x] Remove item from cart

### ❤️ Wishlist
- [x] Add product to wishlist
- [x] View wishlist
- [x] Remove product from wishlist
- [x] Toggle wishlist status

### 📦 Orders & Payments
- [x] Create **Razorpay** payment order
- [x] Verify payment signature (HMAC SHA-256)
- [x] View all orders
- [x] View single order details
- [x] Order statuses: `PENDING_PAYMENT → PLACED → CONFIRMED → SHIPPED → DELIVERED`
- [x] Payment statuses: `PENDING / PAID / FAILED`

---

## 📁 Project Structure

```
ShopKart/
├── backend/
│   ├── controllers/
│   │   ├── customer.controller.js   # Auth: register, login, logout, profile, change-password
│   │   ├── product.controller.js    # CRUD for products
│   │   ├── cart.controller.js       # Cart management
│   │   ├── wishlist.controller.js   # Wishlist management
│   │   └── order.controller.js      # Orders & Razorpay payment verification
│   ├── models/
│   │   ├── customer.model.js        # Customer schema (with embedded cart & wishlist refs)
│   │   ├── product.model.js         # Product schema
│   │   └── order.model.js           # Order schema (with shipping address & payment fields)
│   ├── routes/
│   │   ├── customer.route.js
│   │   ├── product.route.js
│   │   ├── cart.route.js
│   │   ├── wishlist.route.js
│   │   └── order.route.js
│   ├── middlewares/
│   │   └── auth.middleware.js       # JWT verification middleware
│   ├── utils/
│   │   └── generateToken.js         # JWT generation & cookie setter
│   ├── config/                      # DB / Razorpay config
│   ├── seed.js                      # Database seeder script
│   ├── index.js                     # Express app entry point
│   └── .env.example                 # Environment variable template
│
└── frontend/
    ├── pages/
    │   ├── Home.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── Products.jsx
    │   ├── ProductDetails.jsx
    │   ├── Cart.jsx
    │   ├── Wishlist.jsx
    │   ├── Checkout.jsx
    │   ├── Orders.jsx
    │   └── OrderDetails.jsx
    ├── Components/
    │   ├── Navbar.jsx
    │   ├── ProductCard.jsx
    │   ├── CartItem.jsx
    │   ├── WishlistCard.jsx
    │   ├── SearchBar.jsx
    │   └── ProfileModal.jsx
    ├── context/
    │   └── CartContext.jsx           # Global cart state
    ├── services/
    │   └── api.js                    # Axios instance & API calls
    ├── App.jsx                       # Route definitions
    ├── main.jsx                      # React entry point
    └── index.html
```

---

## 🔌 API Reference

### Base URL: `http://localhost:8000`

#### 👤 Customers `/customers`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/customers/register` | ❌ | Register a new user |
| `POST` | `/customers/login` | ❌ | Login & receive JWT cookie |
| `POST` | `/customers/logout` | ✅ | Logout & clear cookie |
| `GET` | `/customers/me` | ✅ | Get current user profile |
| `PATCH` | `/customers/change-password` | ✅ | Change password |

#### 🛍 Products `/products`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | ❌ | Get all products |
| `GET` | `/products/:id` | ❌ | Get a single product |
| `POST` | `/products` | ❌ | Create a product |

#### 🛒 Cart `/cart`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/cart/:id` | ✅ | Add product to cart |
| `GET` | `/cart` | ✅ | Get cart items |
| `PATCH` | `/cart/:id` | ✅ | Update item quantity |
| `DELETE` | `/cart/:id` | ✅ | Remove item from cart |

#### ❤️ Wishlist `/wishlist`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/wishlist/:productId` | ✅ | Add product to wishlist |
| `GET` | `/wishlist` | ✅ | Get wishlist |
| `DELETE` | `/wishlist/:productId` | ✅ | Remove product from wishlist |
| `PATCH` | `/wishlist/:productId/toggle` | ✅ | Toggle wishlist item |

#### 📦 Orders `/orders`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/orders/create-payment-order` | ✅ | Create Razorpay order |
| `POST` | `/orders/verify-payment` | ✅ | Verify payment & place order |
| `GET` | `/orders` | ✅ | Get all orders for user |
| `GET` | `/orders/:id` | ✅ | Get a single order |

> **✅ Auth** = Requires a valid JWT cookie (set at login)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas cluster)
- [Git](https://git-scm.com/)
- A [Razorpay](https://razorpay.com/) test account (for payment features)

---

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/ShopKart.git
cd ShopKart
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm start
# or for development with auto-reload:
npx nodemon index.js
```

The backend will start on **http://localhost:8000**

---

### 3. (Optional) Seed the Database

To populate the database with sample products:
```bash
node seed.js
```

---

### 4. Frontend Setup

Open a **new terminal** and navigate to the frontend:
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory. Use `.env.example` as a template:

```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/shopkart"
MONGODB_USERNAME=""
MONGODB_PASSWORD=""
PORT=8000
JWTsecret="your_super_secret_jwt_key"
NODE_ENV="development"
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

> ⚠️ **Never commit your `.env` file!** Make sure `.env` is listed in `.gitignore`.

---

## 🗄 Database Schema

### Customer
| Field | Type | Notes |
|---|---|---|
| `fullName` | String | Required |
| `email` | String | Required, unique |
| `password` | String | Hashed with bcrypt (10 rounds) |
| `phone` | String | Required |
| `cart` | Array | Embedded `{ product: ObjectId, quantity: Number }` |
| `wishlist` | Array | Array of `Product` ObjectIds |

### Product
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `description` | String | Required |
| `price` | Number | Required, min 0.01 |
| `category` | String | Required |
| `image` | String | URL string |
| `stock` | Number | Required, min 0 |

### Order
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId | Ref to Customer |
| `items` | Array | `{ product, name, price, quantity, image }` |
| `shippingAddress` | Object | `{ fullName, phone, addressLine1, city, state, pincode }` |
| `totalAmount` | Number | Required |
| `paymentStatus` | String | `PENDING / PAID / FAILED` |
| `status` | String | `PENDING_PAYMENT / PLACED / CONFIRMED / SHIPPED / DELIVERED` |
| `razorpayOrderId` | String | From Razorpay |
| `razorpayPaymentId` | String | After successful payment |

---

## 🖥 Frontend Pages

| Route | Page | Auth Required |
|---|---|---|
| `/login` | Login page | ❌ |
| `/register` | Registration page | ❌ |
| `/home` | Home / landing page | ✅ |
| `/products` | All products listing | ✅ |
| `/products/:id` | Product detail view | ✅ |
| `/wishlist` | Saved wishlist items | ✅ |
| `/cart` | Shopping cart | ✅ |
| `/checkout` | Checkout with Razorpay | ✅ |
| `/orders` | Order history | ✅ |
| `/orders/:id` | Single order detail | ✅ |

---

## 🔒 Security

- Passwords are hashed using **bcrypt** (10 salt rounds) — plain-text passwords are never stored.
- Authentication uses **JWT** stored in **HTTP-only cookies** to prevent XSS access.
- Cookie `sameSite` and `secure` flags are set based on `NODE_ENV` (strict in production).
- Razorpay payment signatures are verified server-side using **HMAC SHA-256** before any order is recorded.
- `.env` files are excluded from version control via `.gitignore`.

---

## ✅ Submission Checklist

- [ ] GitHub repository is public with the latest code pushed
- [ ] Frontend is complete (all pages functional)
- [ ] Backend is complete (all routes working)
- [ ] MongoDB integration is working (models connected & seeded)
- [ ] `README.md` is present with setup instructions
- [ ] `.env` file is **NOT** committed — only `.env.example` is present
- [ ] No API keys or secrets in the codebase
- [ ] Project runs locally without major issues
- [ ] (Bonus) Live deployment link included in submission

---

## 👤 Author

**KshitIZ Loharuka**
- GitHub: [GLADIATOR-CODING](https://github.com/GLADIATOR-CODING)

---

