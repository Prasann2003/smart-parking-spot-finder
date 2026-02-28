# Smart Parking Spot Finder - Working Model & Architecture

Welcome to the **Smart Parking Spot Finder** project! This document explains the high-level architecture, the working model, and how the different components of this application interact. It is designed to help new team members understand the system and start contributing quickly.

---

## 1. High-Level Architecture
This project uses a standard modern client-server architecture:
- **Frontend:** React.js (Vite), styled with Tailwind CSS. It communicates with the backend via RESTful APIs.
- **Backend:** Java + Spring Boot, providing a robust REST API, handling business logic, security, and database transactions.
- **Database:** Relational Database (accessed via Spring Data JPA) to store users, parking spots, bookings, and reviews. 

The two parts communicate exclusively via JSON over HTTP.

---

## 2. User Roles & The 3-Sided Marketplace
The application functions as a marketplace connecting three distinct types of users:

1. **Driver (Standard User)**
   - **Goal:** Find and book parking spots.
   - **Key Flow:** Sign Up/Log In -> `User Dashboard` -> Search for Spots (by city/radius) -> `Spot Details` -> Book Dates/Times -> `Payment` -> `My Bookings`.
   - **Extra Features:** Can leave reviews, save favorite spots (`Saved Spots`), and manage their profile.

2. **Provider (Host/Spot Owner)**
   - **Goal:** Rent out driveways or dedicated parking spaces for money.
   - **Key Flow:** A Standard User applies to become a provider (`Become Provider`). Once approved by an Admin, they access the `Provider Dashboard`.
   - **Features:** 
     - **Dashboard (`ProviderDashboard.jsx`):** A summary view of their performance, showing total revenue, active listings, and upcoming bookings.
     - **Manage Listings (`AddParking.jsx`, `EditParking.jsx`):** Providers can create new parking listings, set precise locations, upload images, and define pricing (hourly/daily). They can also edit existing listings to update availability or pricing.
     - **Manage Bookings (`ProviderBookings.jsx`):** A dedicated view to see who has booked their spots, including dates, times, and customer details, allowing them to track occupancy.
     - **Application Status (`ProviderApplications.jsx`, `ProviderStatus.jsx`):** Standard users can track the status of their request to become a provider.

3. **Administrator**
   - **Goal:** Manage the platform, ensure safety, and monitor financials.
   - **Key Flow:** Logs in via the unified auth system and is routed to the `Admin Dashboard`.
   - **Features:** 
     - **Dashboard (`AdminDashboard.jsx`):** A high-level overview of platform health, featuring charts and metrics on total users, total bookings, platform revenue, and monthly trends.
     - **User Management (`AdminUsers.jsx`):** Complete control over the user base. Admins can view all users, search for specific accounts, and ban or unban users to maintain platform safety.
     - **Platform Control (`AdminPanel.jsx`):** A centralized panel for system-wide settings or actions (if implemented).
     - **Provider Approvals:** Reviewing and approving or rejecting applications from users wanting to become providers, ensuring only legitimate users can list parking spots.

---

## 3. Core Workflows & Business Logic

### A. Authentication & Authorization
- **Unified Login (`AuthPage.jsx`):** All users log in through the same page. The backend returns a JWT (JSON Web Token) or session token along with the user's role.
- **Role-Based Routing:** Depending on the role returned upon login, the frontend routes the user to the appropriate dashboard (`Dashboard.jsx`, `ProviderDashboard.jsx`, or `AdminDashboard.jsx`).
- **Security:** The backend secures endpoints so that, for example, only an Admin can approve a provider, and only the spot owner can edit a spot.

### B. Searching & Location (Spatial Queries)
- **Geocoding & Nearby Search:** When a user searches for "nearby" spots, the frontend asks for location permissions.
- **Backend Calculation:** The backend uses the **Haversine formula** to calculate the distance between the user's coordinates and the coordinates of all active parking spots in the database, returning only those within a defined radius.

### C. Booking & Validation Engine
The booking process (`BookingDetails.jsx` -> `Payment.jsx`) is one of the most complex parts of the system.
- **Validations:** The backend enforces strict rules:
  - Users cannot book in the past.
  - Users cannot book more than 45 days in advance.
  - A spot cannot be double-booked for the same time slot.
- **Concurrency:** If two people try to book the exact same spot at the exact same time, the backend handles transaction safety to ensure only one booking succeeds.
- **Cancellations:** If a provider deletes their account or listing, their active bookings are elegantly cancelled and users are refunded/notified.

### D. Payments
- A simulated payment flow is integrated. While checking out, the frontend calculates total costs (including platform fees). Once the payment succeeds, the frontend finalizes the booking with the backend.

---

## 4. Codebase Organization

### Frontend (`/src`)
- `/pages`: Contains the full-page React components (e.g., `Home.jsx`, `Dashboard.jsx`, `Payment.jsx`).
- `/components`: (If applicable) Reusable UI elements like buttons, navbars, and modal dialogs.
- `App.jsx` / Main Router: Handles the client-side routing and protected routes.

### Backend (`/backend/src/main/java/com/smartparking`)
- `/controller`: REST API endpoints (e.g., `BookingController`, `SpotController`). Maps HTTP requests to service methods.
- `/service`: Core business logic (e.g., `BookingService`, `SavedSpotService`). Where validations and calculations live.
- `/repository`: Spring Data JPA interfaces for database access (e.g., `SavedSpotRepository`).
- `/model` & `/dto`: Entities that map to database tables and Data Transfer Objects for JSON serialization.
- `/config`: Security and application configurations (e.g., `StartupDebugLogger`).

---

## 5. How to Contribute
1. **Pick an Issue:** Identify a feature or bug you want to work on.
2. **Understand the Flow:** Consult this document to understand which layer (frontend, controller, service, database) your change will affect.
3. **Frontend Changes:** Run `npm run dev` to start the Vite server. Look for the corresponding file in `/src/pages`.
4. **Backend Changes:** Run the Spring Boot application. Make sure you update the corresponding `Service` if business logic changes, and the `Controller` if the API payload changes.
5. **Test Your Flow:** Always test your changes from end-to-end (e.g., if you change booking logic, log in as a user and try to book a spot).

Thank you for contributing to making urban mobility simpler!
