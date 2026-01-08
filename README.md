# Tax Appeal Management System

![RRA Logo](frontend/public/Rralogo.png)

This is a full-stack web application designed to streamline the tax appeal process for the Rwanda Revenue Authority (RRA). It provides a comprehensive platform for managing tax appeal cases, scheduling meetings, conducting votes, and generating reports, with specific functionalities tailored to different user roles within the committee.

## Table of Contents

- [Features](#features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)

## Features

- **Case Management**: Submit, view, edit, and delete tax appeal cases.
- **Role-Based Access Control**: Different user roles (Committee Leader, Committee Member) have tailored permissions and views.
- **Meeting Scheduling**: Seamless integration with Google Calendar for creating and managing meeting schedules.
- **Voting System**: A secure and efficient voting mechanism for committee members to decide on appeal cases, with vote tracking for leaders.
- **Analytics Dashboard**: Committee Leaders have access to a dashboard with key metrics and visualizations of case data and member attendance.
- **Report Generation**: Automatically generate formatted PDF reports for meeting minutes and explanatory notes.
- **Secure Authentication**: JWT-based authentication with refresh tokens ensures secure and persistent user sessions.
- **File Uploads**: Attach relevant documents to cases using Firebase Storage.

## User Roles

The application supports the following user roles:

- **COMMITTEE_MEMBER**:
  - Can view assigned meeting agendas and case details.
  - Can participate in voting on appeal points.
  - Has a personalized profile page to manage availability.
- **COMMITTEE_LEADER**:
  - Has all the permissions of a `COMMITTEE_MEMBER`.
  - Access to an exclusive `/admin` dashboard with analytics on cases and member attendance.
  - Can manage and override the availability status of committee members.
  - Can initiate video meetings through Google Meet.
  - Can edit meeting invitation templates.

## Tech Stack

### Backend

- **Java 21**
- **Spring Boot 3**: Framework for building the REST APIs.
- **Spring Security**: For authentication and role-based authorization.
- **JPA (Hibernate)**: For object-relational mapping and database interaction.
- **PostgreSQL**: Relational database for data storage.
- **Maven**: Dependency management.
- **JWT**: For secure token-based authentication.
- **Swagger/OpenAPI**: For API documentation.
- **Google Calendar API**: For scheduling and meeting integration.
- **Docker**: For containerization.

### Frontend

- **Next.js 15**: React framework for building the user interface.
- **TypeScript**: For type-safe JavaScript development.
- **Tailwind CSS**: For styling the application.
- **shadcn/ui**: Re-usable UI components.
- **React Hook Form**: For managing form state.
- **Zod**: For schema validation.
- **Axios**: For making HTTP requests to the backend.
- **Firebase Storage**: For file uploads and attachments.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- **Java JDK 21** or later
- **Maven 3.8** or later
- **Node.js 20.x** or later
- **PostgreSQL** database
- **Docker** and **Docker Compose** (Optional, for running PostgreSQL)
- A registered **Google Cloud Platform** project with the Calendar API enabled and OAuth 2.0 credentials.

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-folder>/backend/Tax_appeal_system
    ```

2.  **Configure the Database:**
    - If using Docker, you can start a PostgreSQL container from the `Tax_appeal_system` directory:
      ```bash
      docker-compose up -d db
      ```
    - Create a database named `tax_claim_system`.

3.  **Configure Application Properties:**
    - Navigate to `src/main/resources/` and open the `application.properties` file.
    - Update the `spring.datasource.*` properties to match your PostgreSQL setup.
    - Configure your `spring.mail.*` properties for email notifications.
    - Add your Google OAuth2 client ID and secret.
    - Set a `JWT_SECRET`.

4.  **Install Dependencies and Build:**
    ```bash
    mvn clean install
    ```

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../../frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    - Create a `.env.local` file in the `frontend` directory.
    - Add the following variables, pointing to your backend API and Firebase configuration:
      ```env
      NEXT_PUBLIC_API_URL=http://localhost:8084
      
      # Firebase Configuration
      NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
      NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
      ```

## Running the Application

1.  **Start the Backend:**
    - From the `backend/Tax_appeal_system` directory, run:
      ```bash
      mvn spring-boot:run
      ```
    - The backend will start on `http://localhost:8084`.

2.  **Start the Frontend:**
    - From the `frontend` directory, run:
      ```bash
      npm run dev
      ```
    - The frontend will be accessible at `http://localhost:3000`.

3.  **Access the Application:**
    - Open your browser and navigate to `http://localhost:3000`. You will be redirected to the staff login page.

## API Documentation

Once the backend is running, the API documentation, powered by Swagger UI, is available at:
[http://localhost:8084/swagger-ui/index.html](http://localhost:8084/swagger-ui/index.html)