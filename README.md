
# 🏡 Property Bazzar

### Discover. List. Connect. Find your place.

A full-stack real-estate marketplace that brings property discovery,
seller-buyer communication, document-led listing review, and property
management into one platform.


![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?logo=socketdotio)
![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5?logo=cloudinary&logoColor=white)
:::

------------------------------------------------------------------------

## 📌 Table of Contents

-   [Overview](#-overview)
-   [What Makes It Useful](#-what-makes-it-useful)
-   [Feature Highlights](#-feature-highlights)
-   [Application Architecture](#-application-architecture)
-   [Core Workflows](#-core-workflows)
-   [Technology Stack](#-technology-stack)
-   [Project Structure](#-project-structure)
-   [Data Models](#-data-models)
-   [Getting Started](#-getting-started)
-   [Environment Variables](#-environment-variables)
-   [Available Scripts](#-available-scripts)
-   [API Route Groups](#-api-route-groups)
-   [Deployment Notes](#-deployment-notes)
-   [Security Notes](#-security-notes)
-   [Roadmap](#-roadmap)

------------------------------------------------------------------------

## 🌟 Overview

**Property Bazzar** is a full-stack real-estate marketplace built to
simplify the way people discover and list properties. Buyers can explore
available listings, save favourites, review properties, view location
information, and contact sellers. Sellers can create and manage listings
with property details and supporting documents. Administrators can
review submissions, approve or reject listings, and monitor platform
activity.

The application uses a **React + Vite frontend**, a **Node.js + Express
REST API**, **MongoDB Atlas** for persistent data, **Cloudinary** for
property images, and **Socket.IO** for real-time messaging.

> The project includes a document-informed admin review workflow.
> Platform review should not be interpreted as a legal title guarantee
> or independent government verification.

## ✨ What Makes It Useful

-   A single place for property discovery and listing management.
-   Structured property information, including registration and
    land-record fields.
-   An admin approval workflow before listings become active.
-   Direct buyer--seller conversations with real-time updates.
-   Cloud-hosted property images.
-   English and Hindi interface translations.
-   Responsive interface with light/dark theme support.
-   AI-assisted support responses through the Groq API.

## 🚀 Feature Highlights

  -----------------------------------------------------------------------
  Area                                Capabilities
  ----------------------------------- -----------------------------------
  👤 Accounts                         Registration, email OTP
                                      verification, login, JWT-based
                                      protected routes, profile
                                      management

  🏘️ Listings                         Create, edit, view, and delete
                                      property listings; multiple images;
                                      property type, area, address,
                                      pricing and amenities

  📑 Property details                 Registration number, Khata, Khasra,
                                      survey number, RERA ID (optional),
                                      ownership type and seller
                                      information

  🔎 Discovery                        Browse listings, search/filter and
                                      view property details

  ☁️ Image handling                   Upload property photos to
                                      Cloudinary; manage uploaded images

  🛡️ Admin review                     Dashboard statistics, listing
                                      review, approval/rejection, status
                                      history and email updates

  📄 PDF reports                      Generate a property report during
                                      the approval workflow and attach it
                                      to the approval email when
                                      generation succeeds

  💬 Messaging                        Buyer--seller conversations,
                                      message history, online status,
                                      typing events and notifications
                                      using Socket.IO

  ❤️ Favourites                       Save/unsave properties and view
                                      saved listings

  ⭐ Reviews                          Submit ratings and comments;
                                      display property reviews

  🤖 Support chatbot                  Property Bazzar support assistant
                                      powered by Groq (Llama 3.1 8B
                                      Instant), with a fallback response

  🗺️ Maps                             Google Maps integration for
                                      property location display

  🌐 Internationalisation             English and Hindi translations
                                      using i18next

  🎨 Experience                       Responsive UI, dark/light theme,
                                      Framer Motion animations and
                                      reusable components

  📊 Admin analytics                  Property status/type summaries,
                                      monthly listings, city and price
                                      distribution metrics
  -----------------------------------------------------------------------

**Implementation note:** Razorpay checkout and Gemini-generated listing
descriptions are not present in the supplied codebase's active
dependencies/routes. They are therefore not described as implemented
features here.

## 🏗️ Application Architecture

The application follows a client--server architecture. The frontend
communicates with Express through HTTP requests for standard operations
and Socket.IO for live messaging events.

``` mermaid
flowchart TB
    U["👥 User / Admin"] --> FE["React Frontend<br/>Vite · React Router"]
    FE --> CTX["Context Providers<br/>Auth · Theme · Socket"]
    CTX --> HTTP["Axios API Requests"]
    CTX <--> WS["Socket.IO Client"]
    HTTP --> API["Express REST API"]
    WS <--> IO["Socket.IO Server"]
    API --> MW["Middleware<br/>JWT Auth · Upload"]
    MW --> CTRL["Controllers<br/>Users · Properties · Admin<br/>Chat · Reviews · Favourites"]
    CTRL --> DB[("MongoDB Atlas<br/>Mongoose Models")]
    CTRL --> CL["Cloudinary<br/>Property Images"]
    CTRL --> MAIL["Brevo Email API<br/>OTP · Status Updates"]
    CTRL --> PDF["PDFKit<br/>Property Report"]
    API --> GROQ["Groq API<br/>Support Chatbot"]
    IO <--> WS
    FE -. "Maps display" .-> MAP["Google Maps API"]
```

### Architectural responsibilities

  -----------------------------------------------------------------------
  Layer                               Responsibility
  ----------------------------------- -----------------------------------
  **React frontend**                  Renders pages and components,
                                      manages navigation and user
                                      interactions

  **Context providers**               Shares authentication, theme and
                                      socket connection state across the
                                      UI

  **Axios API utility**               Centralises frontend HTTP
                                      communication with the backend

  **Express API**                     Exposes REST endpoints and
                                      coordinates application operations

  **Middleware**                      Handles
                                      authentication/authorisation checks
                                      and file-upload processing

  **Controllers**                     Contains business logic for users,
                                      properties, admin actions, chat,
                                      reviews and favourites

  **Mongoose models**                 Defines MongoDB document structures
                                      and relationships

  **External services**               Cloudinary stores images, Brevo
                                      sends emails, Groq powers support
                                      responses, and Google Maps displays
                                      location information

  **Socket.IO**                       Handles live chat events, typing
                                      indicators and online/offline
                                      notifications
  -----------------------------------------------------------------------

## 🔄 Core Workflows

### 1. Account registration and verification

``` mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant API as Express API
    participant DB as MongoDB
    participant Email as Brevo Email API

    User->>UI: Submit registration details
    UI->>API: POST /api/users/register
    API->>DB: Create user and OTP details
    API->>Email: Send email OTP
    API-->>UI: Registration response
    User->>UI: Enter OTP
    UI->>API: Submit OTP
    API->>DB: Verify OTP and update account
    API-->>UI: Verification result
```

### 2. Property listing and media upload

``` mermaid
flowchart TD
    A["Seller opens Sell Property"] --> B["Enters property and ownership details"]
    B --> C["Selects property images"]
    C --> D["Frontend sends listing request"]
    D --> E["Express validates request"]
    E --> F["Upload middleware processes files"]
    F --> G["Images uploaded to Cloudinary"]
    G --> H["Property document saved in MongoDB"]
    H --> I["Listing receives Pending status"]
    I --> J["Seller can track listing status"]
```

### 3. Admin approval or rejection

``` mermaid
flowchart TD
    A["Admin opens dashboard"] --> B["Views pending listings"]
    B --> C["Inspects property information"]
    C --> D{"Decision"}
    D -->|Approve| E["Set status to Active"]
    E --> F["Record verifier and timestamp"]
    F --> G["Generate PDF report"]
    G --> H["Send approval email; attach report if available"]
    D -->|Reject| I["Set status to Rejected"]
    I --> J["Save rejection reason and history"]
    J --> K["Send rejection email"]
```

### 4. Real-time buyer--seller chat

``` mermaid
sequenceDiagram
    actor Buyer
    actor Seller
    participant Client as React + Socket.IO
    participant Server as Express + Socket.IO
    participant DB as MongoDB

    Buyer->>Server: Start or open conversation
    Server->>DB: Find/create conversation
    Server-->>Client: Conversation details
    Buyer->>Server: Send message event
    Server-->>Seller: new-message event
    Server-->>Seller: message-notification event
    Buyer->>Server: typing event
    Server-->>Seller: user-typing event
    Note over Client,DB: Message history is also handled through REST API endpoints.
```

### 5. Support chatbot

1.  User submits a support question in the frontend.
2.  Frontend sends the query to the chatbot API.
3.  Backend sends the question with the Property Bazzar support
    instructions to Groq.
4.  The Llama 3.1 8B Instant model generates a response.
5.  If the external API call fails, the backend returns a support
    fallback message.

## 🧰 Technology Stack

### Frontend

  Technology                Purpose
  ------------------------- -----------------------------------------
  React 19                  Component-based UI
  Vite 8                    Development server and production build
  React Router 7            Client-side routing
  Tailwind CSS 4            Styling and responsive layouts
  Axios                     HTTP requests
  Socket.IO Client          Real-time communication
  Framer Motion             UI animations
  Recharts                  Dashboard charts
  i18next / react-i18next   English and Hindi translations
  React Icons               Icon library
  Google Maps React API     Map integration

### Backend

  Technology             Purpose
  ---------------------- -------------------------------------
  Node.js                JavaScript runtime
  Express 4              REST API framework
  MongoDB + Mongoose 8   Database and ODM
  JSON Web Token         Authentication tokens
  bcryptjs               Password hashing
  Socket.IO              Real-time events
  Multer                 Multipart file handling
  Cloudinary SDK         Image storage
  Brevo API              Transactional email delivery
  PDFKit                 PDF report generation
  Groq SDK               Support chatbot integration
  Compromise             Natural-language processing utility
  Moment                 Date and time utilities

## 📂 Project Structure

``` text
Property-bazaar-main/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── email.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── chatController.js
│   │   ├── favoriteController.js
│   │   ├── propertyController.js
│   │   ├── reviewController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   ├── Property.js
│   │   ├── Review.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── chatbotRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── favoriteRoutes.js
│   │   ├── propertyRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── emailTemplates.js
│   │   ├── generatePropertyReport.js
│   │   ├── generateToken.js
│   │   └── otpEmail.js
│   ├── createAdmin.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── locales/
│   │       ├── en/translation.json
│   │       └── hi/translation.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── FavoriteButton.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PropertyMap.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StarRating.jsx
│   │   │   └── SupportChatbot.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SocketContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── AboutPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── BuyPropertyPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── PropertyDetailPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── SellPropertyPage.jsx
│   │   │   └── VerifyOtpPage.jsx
│   │   ├── utils/api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🗃️ Data Models

The application uses MongoDB collections defined with Mongoose.

  -----------------------------------------------------------------------
  Model                               Main data
  ----------------------------------- -----------------------------------
  **User**                            Name, email, phone, hashed
                                      password, role, verification state,
                                      OTP metadata and saved property
                                      references

  **Property**                        Owner, seller details, property
                                      category, registration/land-record
                                      details, title, description,
                                      dimensions, address, pricing,
                                      images, status, verification
                                      metadata, ratings and views

  **Review**                          Property reference, user reference,
                                      rating and comment; one review per
                                      user/property pair

  **Conversation**                    Property reference, participant
                                      references, last-message
                                      preview/time and unread-count map

  **Message**                         Property reference, sender,
                                      receiver, message content and read
                                      metadata
  -----------------------------------------------------------------------

### Property lifecycle

`Pending → Active` (approved) or `Pending → Rejected` (rejected). The
schema also supports `Draft`, `Sold` and `Expired` states.

## ⚙️ Getting Started

### Prerequisites

-   Node.js (use a current LTS release compatible with the project
    dependencies)
-   npm
-   MongoDB Atlas account or a reachable MongoDB instance
-   Cloudinary account
-   Brevo account/API key for email delivery
-   Groq API key for the support chatbot
-   Google Maps API key for map functionality

### 1. Clone the repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd Property-bazaar-main
```

### 2. Configure and start the backend

``` bash
cd backend
npm install
```

Create `backend/.env`:

``` env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Brevo email API
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_verified_sender_email

# Groq chatbot
GROQ_API_KEY=your_groq_api_key
```

Start the backend:

``` bash
npm run dev
```

The API runs at `http://localhost:5000` by default.

Health check:

``` text
GET http://localhost:5000/api/health
```

### 3. Configure and start the frontend

Open a second terminal:

``` bash
cd frontend
npm install
```

Create `frontend/.env`:

``` env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Start the frontend:

``` bash
npm run dev
```

Vite prints the local development URL (commonly
`http://localhost:5173`).

## 🔐 Environment Variables

  ----------------------------------------------------------------------------
  Variable                     Used by                 Required for
  ---------------------------- ----------------------- -----------------------
  `PORT`                       Backend                 API server port;
                                                       defaults to `5000`

  `MONGODB_URI`                Backend                 MongoDB connection

  `JWT_SECRET`                 Backend                 Signing/verifying
                                                       authentication tokens

  `CLOUDINARY_CLOUD_NAME`      Backend                 Cloudinary account

  `CLOUDINARY_API_KEY`         Backend                 Cloudinary
                                                       authentication

  `CLOUDINARY_API_SECRET`      Backend                 Cloudinary
                                                       authentication

  `BREVO_API_KEY`              Backend                 Sending transactional
                                                       emails

  `EMAIL_FROM`                 Backend                 Verified sender
                                                       identity, if configured
                                                       by the email service

  `GROQ_API_KEY`               Backend                 Support chatbot
                                                       responses

  `VITE_GOOGLE_MAPS_API_KEY`   Frontend                Google Maps
                                                       functionality
  ----------------------------------------------------------------------------

Keep real credentials in local environment files or your deployment
provider's secret manager. Never commit `.env` files.

## 📜 Available Scripts

### Backend (`backend/`)

  Command         Description
  --------------- ------------------------------
  `npm install`   Install backend dependencies
  `npm run dev`   Start the API using Nodemon
  `npm start`     Start the API with Node.js

### Frontend (`frontend/`)

  Command             Description
  ------------------- -------------------------------
  `npm install`       Install frontend dependencies
  `npm run dev`       Start Vite development server
  `npm run build`     Create production build
  `npm run preview`   Preview the production build
  `npm run lint`      Run ESLint

## 🔌 API Route Groups

The backend mounts these route groups:

  -----------------------------------------------------------------------
  Base path                           Responsibility
  ----------------------------------- -----------------------------------
  `/api/users`                        Registration, OTP verification,
                                      login and user profile operations

  `/api/users/favorites`              Favourite property operations

  `/api/properties`                   Property listing, details and
                                      seller property management

  `/api/admin`                        Admin dashboard, analytics and
                                      listing review

  `/api/chat`                         Conversations and message history

  `/api/chatbot`                      AI-assisted support chat
  -----------------------------------------------------------------------

Additional endpoints:

-   `GET /` --- API welcome/status response.
-   `GET /api/health` --- API and database health information.

Refer to the route files in `backend/routes/` for the exact HTTP
methods, endpoint paths and access requirements.

## ☁️ Deployment Notes

A typical deployment can use:

-   **Frontend:** Vercel or another static hosting platform.
-   **Backend:** Node.js hosting that supports persistent HTTP and
    WebSocket connections.
-   **Database:** MongoDB Atlas.
-   **Images:** Cloudinary.
-   **Email:** Brevo.
-   **Chatbot:** Groq API.

Before deploying:

1.  Set production environment variables in the hosting dashboard.
2.  Add the deployed frontend origin to the Express and Socket.IO CORS
    allowlists in `backend/server.js`.
3.  Configure the frontend API base URL for the deployed backend.
4.  Configure the Google Maps key and allowed referrers.
5.  Ensure the backend host supports Socket.IO/WebSocket connections.
6.  Use HTTPS and restrict database/network access.

## 🛡️ Security Notes

-   Passwords are hashed using `bcryptjs`.
-   JWT middleware protects authenticated routes.
-   Admin-only operations should remain restricted to admin-authorised
    users.
-   OTPs have an expiry window.
-   Validate and limit uploaded files and request payloads.
-   Keep API keys and database credentials out of source control.
-   Configure CORS with only trusted production origins.
-   Do not expose sensitive identity/document values in logs or public
    API responses.
-   Property review is an application workflow, not a substitute for
    legal due diligence.

## 🧭 Roadmap

Potential next improvements:

-   Automated backend and frontend test suites.
-   Stronger request validation and API documentation (OpenAPI/Swagger).
-   Rate limiting and security headers.
-   More granular property search filters and saved searches.
-   Improved message delivery/read receipts and robust socket
    authentication.
-   Production monitoring, structured logging and error tracking.
-   A complete payment/booking workflow if payments are added to the
    codebase.

------------------------------------------------------------------------

### Made with ❤️ for a better property discovery experience

**Property Bazzar**
:::
