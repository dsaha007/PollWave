![PollWave Header](./src/assets/github-header-image.png)

# PollWave

🌐 [Live Demo](https://pollwave-f25ca.web.app/)

---

## Overview

**PollWave** is a modern, feature-rich polling platform built with Angular and Firebase. It empowers users to create, share, and participate in interactive polls with real-time results and analytics. Designed for individuals, communities, and organizations, PollWave makes decision-making and opinion gathering seamless and engaging.

---

## Features

- **User Authentication:** Secure registration, login, and Google sign-in.
- **Poll Creation:** Create polls with multiple options, categories, and privacy settings.
- **Voting:** Registered users can vote once per poll; results update in real-time.
- **Poll Management:** Edit, close/reopen, or delete your polls.
- **User Profiles:** Track your polls, votes, and activity.
- **Admin Dashboard:** Manage users, polls, categories, and view analytics.
- **Reporting:** Users can report inappropriate polls.
- **Responsive Design:** Optimized for desktop, tablet, and mobile.
- **Real-Time Updates:** Powered by Firebase Firestore.
- **Accessibility:** Keyboard and screen-reader friendly.
- **Modern UI:** Clean, intuitive, and visually appealing interface.

---

## Screenshots

> _Add screenshots or GIFs here to showcase the UI and features._

---

## Table of Contents

- [Demo](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/) (v7+)
- [Angular CLI](https://angular.io/cli) (v16+)
- [Firebase Account](https://firebase.google.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/dsaha007/angular-poll-application
   cd PollWave
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Firebase Setup:**
   - Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password and Google).
   - Create a **Firestore Database**.
   - Add a new web app and copy your Firebase config.
   - Replace the config in [`src/environments/environment.ts`](src/environments/environment.ts).

4. **Start the development server:**
   ```sh
   ng serve
   ```
   Visit [http://localhost:4200](http://localhost:4200) in your browser.

---

## Usage Guide

1. **Register/Login:**  
   Create an account or sign in with Google.

2. **Create a Poll:**  
   Click "Create Poll", enter your question, options, category, and privacy settings.

3. **Browse & Vote:**  
   Explore polls, filter/search, and vote on active polls. See real-time results.

4. **Manage Your Polls:**  
   Edit, close/reopen, or delete your polls from your profile.

5. **Admin Panel:**  
   Admins can manage users, polls, categories, and view analytics.

6. **Report Polls:**  
   Report inappropriate polls for review by admins.

---

## Project Structure

```
src/
  app/
    components/
      admin/         # Admin dashboard & tools
      auth/          # Login, register, password reset
      home/          # Home/landing page
      poll/          # Poll creation, listing, details
      shared/        # Header, footer, back-to-top, etc.
      user/          # User profile
    guards/          # Route guards (auth, admin)
    models/          # TypeScript interfaces (User, Poll, Vote, etc.)
    services/        # Business logic & Firebase integration
  assets/            # Images and static assets
  environments/      # Environment configs
  global_styles.css  # Global styles
  index.html         # App entry point
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository** and create your branch:
   ```sh
   git checkout -b feature/your-feature
   ```
2. **Make your changes** and ensure code quality.
3. **Test thoroughly** before committing.
4. **Commit and push:**
   ```sh
   git commit -m "Add: Description of your feature"
   git push origin feature/your-feature
   ```
5. **Open a Pull Request** and describe your changes.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

> _Made with ❤️ by Debayan Saha and Team_