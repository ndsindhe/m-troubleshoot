# 📱 Mobile KB — Mobile Knowledge Base

A dark-themed React + Firebase app for logging and browsing mobile device problems and solutions.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | Email & Password (Firebase Auth) |
| 🏢 Companies | Expandable company cards on home page |
| 📲 Models | Click company → see models list |
| 🔍 Problems | Click model → see all issues + solutions |
| ✏ Admin | Only admin users can add / edit / delete |
| 🌙 Theme | Full dark theme |

---

## 🚀 Setup Guide

### 1. Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Enable **Firestore Database** (start in production mode)
5. Enable **Hosting**

### 2. Get Firebase Config

1. Project Settings → Your Apps → Add Web App
2. Copy the config object
3. Paste into `src/firebase.js` (replace all `YOUR_*` values)

### 3. Install & Run

```bash
npm install
npm start
```

### 4. Create Your First Admin User

1. Firebase Console → Authentication → Add User (email + password)
2. Copy the user's **UID**
3. Firebase Console → Firestore → Create collection `admins`
4. Add a document with the **UID as the Document ID** (no fields needed)

That user is now an admin and can manage companies, models, and problems.

### 5. Seed Initial Companies & Models (optional)

To pre-populate 12 companies and 60+ models:

```bash
# 1. Go to Firebase Console → Project Settings → Service Accounts
# 2. Generate new private key → save as serviceAccountKey.json in project root
npm install firebase-admin
node seed.js
```

### 6. Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init   # select Hosting + Firestore, use 'build' as public dir
npm run build
firebase deploy
```

---

## 🗂 Firestore Structure

```
admins/
  {uid}               ← document ID = user UID (no fields needed)

companies/
  {id}
    name: "Samsung"
    emoji: "🟠"
    createdAt: Timestamp

models/
  {id}
    name: "Galaxy S24 Ultra"
    companyId: "..."
    companyName: "Samsung"
    createdAt: Timestamp

problems/
  {id}
    problem: "Screen flickering at low brightness"
    solution: "Go to Settings > Display > disable Adaptive Refresh Rate..."
    modelId: "..."
    modelName: "Galaxy S24 Ultra"
    companyId: "..."
    companyName: "Samsung"
    createdAt: Timestamp
    updatedAt: Timestamp
    createdBy: "uid"
```

---

## 🔒 Security Rules

Security rules are in `firestore.rules` and are deployed with `firebase deploy`.
- All authenticated users can **read** companies, models, and problems
- Only **admin** users (UIDs in `admins` collection) can **write**

---

## 📁 Project Structure

```
src/
  firebase.js              ← Firebase config (fill in your values)
  App.jsx                  ← Routes
  index.css                ← Dark theme styles
  context/
    AuthContext.jsx         ← Auth + admin state
  pages/
    LoginPage.jsx
    HomePage.jsx            ← Company grid + model accordion
    ModelDetailPage.jsx     ← Problems & solutions for a model
    ManagePage.jsx          ← Admin: add/edit companies & models
  components/
    Navbar.jsx
    Modal.jsx
    AddProblemModal.jsx
    AddCompanyModal.jsx
    AddModelModal.jsx
seed.js                    ← One-time data seed script
firestore.rules
firebase.json
```
