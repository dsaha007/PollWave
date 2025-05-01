
![PollWave Logo](./src/assets/logo.png)

# PollWave

## 🌐 [Visit PollWave Live](https://pollwave-f25ca.web.app/)

## Project Description

PollWave is a dynamic web application built with Angular that allows users to create, share, and participate in polls. It provides a platform for individuals and groups to gather opinions, make decisions, and engage in interactive discussions. With a clean and intuitive interface, PollWave makes it easy to manage and analyze poll results, fostering community engagement and collaboration.

## Features

- **User Authentication:** Secure login and registration system to manage user accounts.  
- **Poll Creation:** Users can create polls with multiple options and customize their settings.  
- **Voting:** Registered users can vote on polls and see real-time results.  
- **Poll Management:** Users can view, edit, and delete their own polls.  
- **User Profiles:** Each user has a profile page to track their activity and manage their information.  
- **Responsive Design:** The application is designed to work seamlessly across various devices and screen sizes.  
- **Real-time Updates:** Results are updated in real-time as users cast their votes.  
- **Secure:** Uses Guard for secure routes.  
- **Shared Components:** Header, footer, and back-to-top button are implemented as shared components.  
- **Services:** The application is built using multiple services, including auth, poll, and vote services.  
- **Models:** Poll, user, and vote data are represented by models.

## Installation Guide

1. **Prerequisites:**
    - Node.js (v16.0 or later)
    - npm (v7.0 or later)
    - Angular CLI (v16.0 or later)

2. **Clone the Repository:**
```bash
git clone https://github.com/dsaha007/angular-poll-application
```

3. **Navigate to the Project Directory:**
```bash
cd PollWave
```

4. **Install Dependencies:**
```bash
npm install
```

5. **Firebase Setup:**
    - Create a Firebase project in the Firebase console.
    - Enable Authentication (e.g., Email/Password).
    - Create a Firestore Database.
    - Go to project settings in Firebase and add a new web app.
    - Add the Firebase configuration object to the environment file: `/src/environments/environment.ts`

6. **Environment Configuration:**
    - Create or update environment variables with necessary settings.
    - Ensure the project is connected to the Firebase project.

## How to Use

1. **Start the Development Server:**
```bash
ng serve
```

2. **Open the Application:**
    - Open your web browser and navigate to `http://localhost:4200/`.

3. **Register/Login:**
    - Create a new account or log in with existing credentials.

4. **Create a Poll:**
    - Click on the "Create Poll" button.
    - Enter the poll question and options.
    - Submit the poll to make it available.

5. **Vote in Polls:**
    - Browse available polls.
    - Select your preferred option and submit your vote.
    - View the real-time results.

6. **Manage Polls:**
    - View, edit, and delete your polls.

7. **View User Profile:**
    - Users can view their profile page and activity.

## Contribution Guidelines

We welcome contributions from the community! To contribute to PollWave, please follow these guidelines:

1. **Fork the Repository:**
    - Fork the PollWave repository to your own GitHub account.

2. **Create a Branch:**
```bash
git checkout -b feature/your-feature-name
```

3. **Make Changes:**
    - Implement your changes or bug fixes.
    - Ensure your code follows the project's coding style.

4. **Test Your Changes:**
    - Test your changes thoroughly.
    - Add or update relevant tests if applicable.

5. **Commit Your Changes:**
```bash
git commit -m "Add: Your descriptive message here"
```

6. **Push to Your Fork:**
```bash
git push origin feature/your-feature-name
```

7. **Submit a Pull Request:**
    - Open a pull request from your branch to the main repository's `main` branch.
    - Provide a detailed description of your changes.

8. **Code Review:**
    - Your pull request will be reviewed by the project maintainers.
    - Address any feedback or requested changes.

9. **Merge:**
    - Once approved, your pull request will be merged into the `main` branch.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
