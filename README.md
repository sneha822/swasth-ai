# Swasth AI - Health Assistant

A specialized health AI assistant with multilingual support, designed to provide health insights, emergency guidance, and wellness advice for Indian users.

## 🏥 Health Features

- **Symptoms Checker (लक्षण जांच)**: Preliminary symptom assessment and health insights
- **Health Tips (स्वास्थ्य टिप्स)**: Daily wellness advice and healthy lifestyle guidance
- **Myth or Fact (मिथक या तथ्य)**: Health myth verification with scientific evidence
- **Proactive Health Suggestions (सुझाव)**: Preventive care and personalized recommendations
- **Emergency Help (🚨 आपातकाल)**: Immediate guidance for health emergencies with 108 integration
- **Personal Health (व्यक्तिगत सलाह)**: Personalized advice based on user health profile

## 🌐 Multilingual Support

- **English**: Full feature support
- **Hindi**: Complete Hinglish mode (Hindi-English mix using Latin characters)
- Seamless language switching with culturally appropriate responses
- Indian context and terminology throughout

## ✨ Additional Features

- 🎨 Clean, modern UI with minimalist design
- ✨ Smooth typing animation for AI responses
- 📱 Fully responsive across all devices
- 🌙 Dark mode by default
- 🔐 User authentication with Firebase (Email/Password and Google Sign-in)
- 🛡️ Medical safety protocols and disclaimers
- 📊 Personal health profile management
- 🚨 Emergency detection and immediate response

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore for data, Auth for users)
- **AI**: Google Gemini API with custom health prompts
- **Database**: User profiles, health suggestions, emergency contacts
- **Authentication**: Firebase Auth (Email/Password and Google Sign-in)

## Getting Started

### Prerequisites

- Node.js 14.0 or later
- npm or yarn
- Firebase account
- Google Gemini API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sneha822/swasth-ai.git
   cd swasth-ai
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure Firebase and Gemini API:

   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Firestore in your Firebase project
   - Enable Authentication in your Firebase project
   - Configure Authentication providers:
     - Enable Email/Password authentication
     - Enable Google authentication (configure OAuth client)
   - Get your Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Copy your Firebase configuration from Project Settings
   - Create a `.env.local` file and add your credentials:
     ```
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_GEMINI_API_KEY=your_gemini_api_key
     ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and visit `http://localhost:5173`

## 🛡️ Safety & Medical Disclaimers

**Important**: Swasth AI is designed to be a health assistant and educational tool. It does not replace professional medical advice, diagnosis, or treatment. Always consult healthcare professionals for medical concerns.

### Safety Features:
- Clear "not medical advice" statements
- Always recommend professional consultation
- Emergency situations prioritized
- Responsible AI responses
- Automatic emergency detection with 108 (India emergency) recommendations

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

## 📱 Usage Examples

### Symptoms Checker:
```
User: "I have headache and feeling tired for 3 days"
AI: "Main aapke symptoms ke baare mein kuch questions puchta hoon..."
```

### Emergency:
```
User: "Chest pain and breathing problem"
AI: "🚨 TURANT 108 call karein! Ye emergency hai! Meanwhile..."
```

### Health Tips:
```
User: "Daily morning routine for better health"
AI: "Bilkul! Main aapko healthy morning routine suggest karta hoon..."
```

## 🔮 Future Enhancements

- Health data visualization
- Medication reminders
- Appointment scheduling integration
- Telemedicine connections
- Health goal tracking
- Family health profiles
- Wearable device data integration

## Screenshots

(Screenshots will be added here)

## License

MIT

## Acknowledgments

- Inspired by SayHalo design
- ChatGPT-style typing animation
- Google Gemini AI for health assistance
- Firebase for backend services
