# Chattr 💬

Chattr is a real-time messaging application built using the **MERN stack** and **WebSockets**. It focuses on fast, reliable communication, secure authentication, and a clean, responsive user experience.

[Live Demo](https://Chattr.azurewebsites.net/)

## Features

- Real-time messaging with Socket.io
- Authentication using JWT + HTTP-only cookies
- Image uploads via Cloudinary
- GIF search and sharing using the Klipy GIF API
- Global state management with Zustand
- Responsive UI built with TailwindCSS and daisyUI
- RESTful APIs with Express
- MongoDB with Mongoose for data modeling and querying

## Tech Stack

### Frontend
- React
- TailwindCSS
- daisyUI
- Axios
- Zustand
- Socket.io-client

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- Socket.io
- JSON Web Tokens (JWT)
- Cloudinary

## Architecture Overview
Chattr is deployed on Microsoft Azure.
The backend server hosts both the API and the production frontend build, serving static assets and handling WebSocket connections.

- **REST APIs** handle authentication and initial data fetching
- **WebSockets (Socket.io)** provide real-time messaging and events
- **JWT tokens stored in HTTP-only cookies** are used for secure authentication
- **Zustand** manages frontend authentication and UI state (UX only, not security)

## Learning Outcomes

Building Chattr helped me develop a much deeper understanding of how a real-time, production-style full-stack application actually works under the hood.

On the backend, I learned how to properly structure an Express API, why middleware order matters, and how to safely manage environment variables across the application. I gained a solid understanding of JWT-based authentication, including how tokens are signed and verified, why HTTP-only cookies are more secure than localStorage, and how authentication state should be validated on the server rather than trusted on the client.

Working with MongoDB and Mongoose taught me how schemas and models are used to structure data and how querying is performed through models instead of direct database access. I also learned the importance of idempotent operations to prevent data corruption when actions are retried.

On the frontend, I gained clarity on the difference between client-side routing and backend routes, and how React applications are structured from the true entry point (main.jsx) to the root component (App.jsx). Using Zustand helped me understand when global state is useful for UI and UX, while keeping security concerns strictly on the backend.

I developed a stronger mental model of React hooks, especially useEffect and its dependency array, learning how improper dependencies can cause infinite loops. I also learned how useRef can be used to persist values and interact with the DOM without triggering re-renders, such as automatically scrolling to the latest message.

Implementing Socket.io gave me hands-on experience with real-time, event-driven communication and helped me understand why WebSockets are more efficient than polling for live updates.

Beyond specific technologies, this project reinforced the value of modularizing code, following DRY principles, writing meaningful error messages, and creating clean code with SOLID design principles. Slowing down the development process and writing notes alongside the code helped me retain concepts more deeply and make more intentional engineering decisions.

## Installation & Running the Project
### Prerequisites
- [Node.js](https://nodejs.org/en) (v24)
- [MongoDB](https://www.mongodb.com/) (Atlas)
- A [Cloudinary](https://cloudinary.com/) account
- A [Klipy](https://klipy.com/en-US) account

### Clone the Repository
1. Visit the [repository](https://github.com/TommyJu/Chattr)
2. Ensure that you are cloning from the "main" branch
3. Use the "git clone" command to create a copy in your local working directory

### Install Dependencies
1. Navigate to the "backend" directory in your terminal and run "npm install"

2. Navigate to the "frontend" directory in your terminal and run "npm install"

### Environment Variables
1. Create a ".env" file in the "/backend" directory
2. Copy and paste the following environment variables template into the ".env" file
```
MONGODB_URI=
PORT=
JWT_SECRET=
NODE_ENV=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL_PROD=
FRONTEND_URL_DEV=
KLIPY=
KLIPY_CUSTOMER_ID=
```
3. Add your environment variables to the project

The project requires the following environment variables:

- `MONGODB_URI` – Connection string to your MongoDB database (local or Atlas)
- `PORT` – Port number for the backend server (e.g., `5001`)
- `JWT_SECRET` – Secret key for signing JWT tokens (used for authentication)
- `NODE_ENV` – Environment mode, either `development` or `production`
- `CLOUDINARY_CLOUD_NAME` – Your Cloudinary account cloud name (for image uploads)
- `CLOUDINARY_API_KEY` – API key for Cloudinary
- `CLOUDINARY_API_SECRET` – API secret for Cloudinary
- `FRONTEND_URL_PROD` – URL of your deployed frontend (used for CORS and redirects)
- `FRONTEND_URL_DEV` – URL of your local frontend (usually `http://localhost:5173`)
- `KLIPY` – API key for the Klipy GIF API
- `KLIPY_CUSTOMER_ID` – Your Klipy customer ID

### Running the Application
1. Navigate to the "/backend" directory in your terminal and run the command "npm run dev"
2. Navigate to the "/frontend" directory in a separate terminal window and run the command "npm run dev"
3. In the terminal window that is running the frontend, you should see a local host link such as: "http://localhost:5173/". Open the local host link in your browser


## Showcase
![Screenshot](/readme-assets/sample1.png)
![Screenshot](/readme-assets/sample2.png)
![Screenshot](/readme-assets/sample3.png)
![Screenshot](/readme-assets/sample4.png)
![Screenshot](/readme-assets/sample5.png)
![Screenshot](/readme-assets/sample6.png)

## Project Structure
```
.
├── backend
│   ├── eslint.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── src
│       ├── config
│       │   ├── paths.config.js
│       │   ├── server.config.js
│       │   └── url.config.js
│       ├── controllers
│       │   ├── auth.controller.js
│       │   └── message.controller.js
│       ├── index.js
│       ├── lib
│       │   ├── authToken.js
│       │   ├── cloudinary.js
│       │   ├── db.js
│       │   ├── env.js
│       │   └── socket.js
│       ├── middleware
│       │   └── auth.middleware.js
│       ├── models
│       │   ├── conversation.model.js
│       │   ├── message.model.js
│       │   └── user.model.js
│       ├── routes
│       │   ├── auth.route.js
│       │   └── message.route.js
│       ├── services
│       │   ├── auth.service.js
│       │   └── message.service.js
│       └── utils
│           ├── errorHandling.js
│           └── jsonFormatting.js
├── frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── jsconfig.json
│   ├── package.json
│   ├── package-lock.json
│   ├── public
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-512x512.png
│   │   ├── apple-touch-icon.png
│   │   ├── avatar.png
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   ├── favicon.ico
│   │   ├── icon.png
│   │   ├── klipy_watermark.png
│   │   ├── powered_by_klipy.png
│   │   ├── chattr_animation.webm
│   │   └── site.webmanifest
│   ├── README.md
│   ├── src
│   │   ├── App.jsx
│   │   ├── components
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── GifModalButton.jsx
│   │   │   ├── GifModal.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NoChatSelected.jsx
│   │   │   ├── NoMessages.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── SidebarUser.jsx
│   │   ├── config
│   │   │   ├── api.js
│   │   │   └── url.js
│   │   ├── constants
│   │   │   └── themes.js
│   │   ├── index.css
│   │   ├── lib
│   │   │   ├── axios.js
│   │   │   ├── socket.js
│   │   │   └── utils.js
│   │   ├── main.jsx
│   │   ├── pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── SignUpPage.jsx
│   │   ├── services
│   │   │   ├── authService.js
│   │   │   └── chatService.js
│   │   └── store
│   │       ├── auth
│   │       │   ├── slices
│   │       │   │   ├── auth.slice.js
│   │       │   │   └── socket.slice.js
│   │       │   └── useAuthStore.js
│   │       ├── chat
│   │       │   ├── slices
│   │       │   │   ├── gifs.slice.js
│   │       │   │   ├── messages.slice.js
│   │       │   │   ├── sidebar.slice.js
│   │       │   │   ├── typing.slice.js
│   │       │   │   └── unreadUsers.slice.js
│   │       │   └── useChatStore.js
│   │       └── useThemeStore.js
│   └── vite.config.js
├── package.json
├── README.md
└── shared
    ├── auth.constants.js
    ├── auth.utils.js
    └── message.constants.js

```

## Attributions
- <a href="https://www.vecteezy.com/free-png/message">Message PNGs by Vecteezy</a>