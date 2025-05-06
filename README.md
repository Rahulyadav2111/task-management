# Task Management System
A Task Management System designed for a small team to efficiently create, assign, track, and manage tasks.

📚 Assignment Overview
This project fulfills the following key requirements:

User Authentication:
Secure registration and login.
Passwords stored using industry best practices.
Secure session/token management.

Task Management:
Create tasks with title, description, due date, priority, and status.
Full CRUD operations for tasks.

Team Collaboration:
Assign tasks to other registered users.
Notify users when a task is assigned to them.

Dashboard:
View tasks assigned to the user.
View tasks created by the user.
See overdue tasks highlighted.

Search and Filter:
Search tasks by title or description.
Filter tasks by status, priority, and due date.

🛠️ Tech Stack
Frontend: Next.js
Backend: Node.js with Express
Database: MongoDB
Version Control: Git & GitHub (Public Repository)

🚀 Getting Started
Prerequisites
Node.js installed
MongoDB database access

Installation
Clone the repository:

bash
git clone https://github.com/Rahulyadav2111/task-management.git
cd task-management
Navigate to frontend and backend folders separately and install dependencies:

bash

# For Frontend
cd front
npm install

# For Backend
cd ../backend
npm install

Set up environment variables:
backend (backend/.env):

MONGO_URI=your_database_connection_string
JWT_SECRET=your_secret_key

Run development servers:

bash
# Backend
cd backend
npm start

# Frontend (in a new terminal)
cd front
npm run dev

# Features Implemented
Authentication: User signup and login secured with hashed passwords.

Task CRUD: Create, edit, delete, and view tasks.

Assignment: Assign tasks to team members with notification.

Dashboard: Separate views for assigned, created, and overdue tasks.

Search and Filter: Dynamic search by title/description; filter by priority, status, and due date.

# Code and Project Quality
Clear and meaningful Git commit history.

Follows secure coding practices for authentication and input validation.

Organized and modular codebase for easy scalability.

Responsive UI/UX design.

⚙# Deployment
Frontend deployed on Vercel.

Backend deployed on Vercel Render.

# License
This project is licensed under the MIT License.

# Note
This project was built individually to cover all requirements.
Special attention was given to security, user experience, and handling edge cases.

# Author
Rahul Yadav — GitHub Profile
