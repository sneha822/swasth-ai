# Swasth AI

A modern chat application with a beautiful black and white UI inspired by SayHalo design.

## Features

- 🎨 Clean, modern UI with minimalist design
- ✨ Smooth typing animation for AI responses
- 💬 Markdown support with syntax highlighting for 15+ programming languages
- 📱 Fully responsive across all devices
- 🌙 Dark mode by default
- 🔐 User authentication with Firebase (Email/Password and Google Sign-in)

## Tech Stack

- React + TypeScript
- Tailwind CSS for styling
- React Markdown for rendering markdown content
- Syntax highlighting with react-syntax-highlighter
- Firebase Authentication and Firestore for user management

## Getting Started

### Prerequisites

- Node.js 14.0 or later
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Itskrish01/swasth-ai.git
   cd swasth-ai
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure Firebase:

   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Firestore in your Firebase project
   - Enable Authentication in your Firebase project
   - Configure Authentication providers:
     - Enable Email/Password authentication
     - Enable Google authentication (configure OAuth client)
   - Copy your Firebase configuration from Project Settings
   - Create a `.env.local` file based on `.env.example` and add your Firebase credentials

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and visit `http://localhost:5173`

## Firebase Setup Details

1. Create a Firebase project:

   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard

2. Enable Authentication:

   - In your Firebase project, go to "Authentication" in the left menu
   - Click "Get started"
   - Enable "Email/Password" provider
   - Enable "Google" provider and configure OAuth consent screen

3. Set up Firestore Database:

   - Go to "Firestore Database" in the left menu
   - Click "Create database"
   - Start in production mode or test mode (you can change security rules later)
   - Choose a database location close to your users

4. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - If you haven't added a web app yet, click the web icon (</>) to add one
   - Register your app with a nickname
   - Copy the firebaseConfig object values to your .env.local file

## Screenshots

(Screenshots will be added here)

## License

MIT

## Acknowledgments

- Inspired by SayHalo design
- ChatGPT-style typing animation
