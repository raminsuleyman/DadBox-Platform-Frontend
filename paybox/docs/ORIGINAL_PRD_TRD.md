# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Food Waste Reduction & Surprise Box Marketplace

**Document Version:** 1.0  
**Project Type:** Full-Stack Web Application  
**Target Market:** Azerbaijan  
**Initial Launch Location:** Baku, Azerbaijan  
**Status:** Initial Product Specification  
**Project Name:** To Be Determined

---

# 1. Product Overview

## 1.1. Product Description

Food Waste Platform is a digital marketplace that connects customers with local food businesses such as bakeries, cafés, restaurants, and supermarkets.

Businesses can list their unsold but safe-to-consume food products as discounted Surprise Boxes. Customers can discover nearby offers, reserve available boxes, and collect their orders directly from the business.

The platform aims to reduce food waste while helping businesses generate additional revenue and allowing customers to purchase quality food at more affordable prices.

The product is positioned as an affordable food discovery and marketplace platform rather than an application for purchasing leftover food.

## 1.2. Problem Statement

Food businesses frequently have unsold products at the end of the day. These products may still be safe and suitable for consumption but are often wasted.

At the same time:

- Customers are looking for affordable food options.
- Small food businesses need additional sales channels.
- Businesses may not have an efficient way to manage end-of-day surplus.
- Customers may not know which nearby businesses have available discounted products.

There is an opportunity to connect these two sides through a centralized digital marketplace.

## 1.3. Product Vision

To build an accessible and reliable platform that makes affordable food discovery easier, helps businesses manage surplus products, and contributes to reducing food waste in Azerbaijan.

## 1.4. Product Goals

1. Connect local food businesses with customers.
2. Help businesses sell eligible unsold food products.
3. Provide customers with affordable Surprise Box offers.
4. Simplify the reservation and pickup process.
5. Reduce avoidable food waste.
6. Provide businesses with useful sales and inventory insights.

---

# 2. Target Users and User Roles

The platform will support three primary user roles.

## 2.1. Customer

Customers use the platform to discover and reserve Surprise Boxes.

Main responsibilities:

- Create an account and log in.
- Browse available Surprise Boxes.
- Search and filter offers.
- View business information and pickup details.
- Reserve available boxes.
- View and manage reservations.
- Confirm pickup.
- Submit ratings and reviews.

## 2.2. Business Owner

Business owners manage their businesses and publish available Surprise Boxes.

Main responsibilities:

- Register a business account.
- Submit business information for verification.
- Create and manage Surprise Box offers.
- Set prices and available quantities.
- Define pickup time windows.
- Manage customer reservations.
- Confirm completed pickups.
- View basic sales statistics.

## 2.3. Administrator

Administrators manage the platform and ensure that users and businesses follow platform requirements.

Main responsibilities:

- Manage customer accounts.
- Review and verify business applications.
- Monitor published Surprise Boxes.
- Manage complaints and reports.
- Suspend inappropriate accounts or offers.
- View platform statistics.

---

# 3. Functional Requirements

Requirements are classified by priority:

- **Must Have:** Required for the MVP.
- **Should Have:** Important but can be implemented after the initial MVP.
- **Could Have:** Optional future functionality.

## 3.1. Authentication and Authorization

**FR-01 — User Registration (Must Have)**

Users must be able to create an account using their email address and password.

**FR-02 — User Login (Must Have)**

Registered users must be able to authenticate securely.

**FR-03 — User Roles (Must Have)**

The system must support Customer, Business Owner, and Administrator roles.

**FR-04 — Role-Based Access Control (Must Have)**

Users must only access functionality permitted by their assigned roles.

**FR-05 — Profile Management (Should Have)**

Users must be able to view and update their personal information.

## 3.2. Surprise Box Management

**FR-06 — Create Surprise Box (Must Have)**

Verified businesses must be able to create Surprise Box offers.

Each offer must contain:

- Box title.
- Description.
- Food category.
- Original price.
- Discounted price.
- Available quantity.
- Pickup start and end time.
- Business location.
- Product image.
- Allergen and relevant food information.

**FR-07 — Edit Surprise Box (Must Have)**

Businesses must be able to update their active offers.

**FR-08 — Delete or Deactivate Offer (Must Have)**

Businesses must be able to deactivate offers that are no longer available.

**FR-09 — Offer Availability (Must Have)**

The system must display only active offers with available quantities.

**FR-10 — Offer Expiration (Must Have)**

Offers must automatically become unavailable after their pickup period ends.

## 3.3. Search and Discovery

**FR-11 — Browse Offers (Must Have)**

Customers must be able to browse available Surprise Boxes.

**FR-12 — Search (Should Have)**

Customers must be able to search by business name or offer title.

**FR-13 — Filtering (Must Have)**

Customers must be able to filter offers by:

- Food category.
- Price range.
- Distance.
- Pickup time.
- Availability.

**FR-14 — Sorting (Should Have)**

Customers must be able to sort offers by price, distance, and newest listings.

**FR-15 — Offer Details (Must Have)**

Customers must be able to view complete information about a selected Surprise Box.

## 3.4. Reservation and Order Management

**FR-16 — Reserve Surprise Box (Must Have)**

Customers must be able to reserve an available Surprise Box.

**FR-17 — Quantity Validation (Must Have)**

The system must verify that sufficient quantities are available before confirming a reservation.

**FR-18 — Reservation Confirmation (Must Have)**

After successful reservation, the system must generate a unique order identifier.

**FR-19 — Reservation Status (Must Have)**

Orders must support the following statuses:

- Pending
- Confirmed
- Picked Up
- Cancelled
- Expired

**FR-20 — Order History (Must Have)**

Customers must be able to view their previous and active reservations.

**FR-21 — Business Order Management (Must Have)**

Businesses must be able to view and manage reservations for their offers.

**FR-22 — Pickup Confirmation (Must Have)**

Businesses must be able to confirm that a customer has collected their order.

**FR-23 — QR Code Pickup (Should Have)**

The system should generate a unique QR code for each confirmed reservation. Businesses can scan it to verify and complete the pickup.

## 3.5. Business Management

**FR-24 — Business Registration (Must Have)**

Business owners must be able to submit their business information.

Required information:

- Business name.
- Business category.
- Contact information.
- Address.
- Location coordinates.
- Relevant business verification information.

**FR-25 — Business Verification (Must Have)**

New businesses must be reviewed and approved by an administrator before publishing offers.

**FR-26 — Business Dashboard (Must Have)**

Businesses must have a dashboard displaying:

- Active offers.
- Available quantities.
- Reservations.
- Completed pickups.
- Basic sales statistics.

## 3.6. Ratings and Reviews

**FR-27 — Submit Review (Should Have)**

Customers should be able to rate a business after completing a pickup.

**FR-28 — Review Management (Should Have)**

Administrators should be able to review reported or inappropriate feedback.

## 3.7. Administration

**FR-29 — Admin Dashboard (Must Have)**

Administrators must have access to an overview of platform activity.

**FR-30 — Business Approval (Must Have)**

Administrators must be able to approve or reject business applications.

**FR-31 — User Management (Must Have)**

Administrators must be able to suspend accounts that violate platform rules.

**FR-32 — Offer Moderation (Must Have)**

Administrators must be able to deactivate inappropriate or non-compliant offers.

**FR-33 — Complaint Management (Should Have)**

Administrators should be able to view and resolve customer complaints.

---

# 4. Core User Workflows

## 4.1. Customer Reservation Workflow

1. Customer opens the platform.
2. Customer registers or logs in.
3. Customer browses available Surprise Boxes.
4. Customer selects an offer.
5. Customer reviews price, pickup time, location, and food information.
6. Customer selects quantity.
7. System checks availability.
8. System creates a reservation.
9. Customer receives a confirmation and unique order identifier.
10. Customer visits the business during the pickup window.
11. Business verifies the reservation.
12. Business confirms pickup.
13. Order status changes to Picked Up.

## 4.2. Business Workflow

1. Business owner registers.
2. Business owner submits business information.
3. Administrator reviews the application.
4. Approved business receives access to its dashboard.
5. Business owner creates a Surprise Box offer.
6. Customers discover and reserve the offer.
7. Business manages reservations.
8. Business confirms completed pickups.
9. Business reviews basic performance statistics.

## 4.3. Administrator Workflow

1. Administrator logs into the admin panel.
2. Administrator reviews pending business applications.
3. Administrator approves or rejects applications.
4. Administrator monitors published offers.
5. Administrator reviews complaints and reports.
6. Administrator manages platform users and businesses.

---

# 5. Business Rules

The following rules define how the marketplace should operate.

**BR-01 — Business Verification**

Only approved businesses can publish Surprise Box offers.

**BR-02 — Price Validation**

The discounted price must be greater than zero and lower than the original price.

**BR-03 — Quantity Management**

An offer cannot be reserved if its available quantity is insufficient.

**BR-04 — Reservation Consistency**

When multiple customers attempt to reserve the final available box simultaneously, the system must prevent overselling.

**BR-05 — Pickup Window**

Each offer must have a clearly defined pickup period.

**BR-06 — Expiration**

Offers and reservations must follow their defined expiration rules.

**BR-07 — Food Safety**

Businesses are responsible for ensuring that listed products comply with applicable food safety requirements.

**BR-08 — Surprise Box Contents**

The exact contents may vary. However, the business must provide accurate general category, allergen, and relevant product information.

**BR-09 — Cancellation**

The platform must define cancellation rules and ensure that cancelled reservations release their reserved quantities when appropriate.

**BR-10 — No Online Payment in MVP**

The initial version will use reservation and in-person payment at pickup, subject to agreement with participating businesses.

---

# 6. Non-Functional Requirements

## 6.1. Performance

- Main pages should load efficiently under normal network conditions.
- API responses should generally complete within 500 ms for ordinary operations under expected MVP load, excluding external services.
- Search and filtering should remain responsive as the number of offers increases.
- Database queries should use appropriate indexing.

## 6.2. Security

- Passwords must never be stored in plain text.
- Authentication must use secure session or token handling.
- Role-based authorization must be enforced on the server.
- All user inputs must be validated.
- Sensitive endpoints must have rate limiting.
- Database access must follow least-privilege principles.
- Communication must use HTTPS in production.

## 6.3. Reliability and Data Integrity

- Reservations must not create negative inventory quantities.
- Concurrent reservations must be handled safely using database transactions or equivalent atomic operations.
- Important order status changes must be recorded.
- Failed operations must not leave partially updated order data.

## 6.4. Scalability

The system architecture should support adding more businesses, customers, and offers without requiring a complete redesign.

## 6.5. Usability

- The interface must be responsive on desktop and mobile.
- The interface language for the initial launch must be Azerbaijani.
- Important actions must have clear confirmation messages.
- Pickup instructions and reservation statuses must be easy to understand.

## 6.6. Maintainability

- The codebase must use a modular architecture.
- APIs must be documented.
- Critical business logic must have automated tests.
- The project must have clear setup and deployment documentation.

---

# 7. Proposed Technical Architecture

## 7.1. Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

Responsibilities:

- User interface.
- Customer, business, and admin dashboards.
- Form validation.
- API communication.
- Responsive layouts.

## 7.2. Backend

- Node.js
- Express.js
- TypeScript

Responsibilities:

- REST API development.
- Authentication and authorization.
- Business logic.
- Reservation processing.
- Inventory management.
- Validation and error handling.

## 7.3. Database

- PostgreSQL

Proposed main entities:

- Users
- Businesses
- BusinessApplications
- SurpriseBoxes
- Reservations
- Reviews
- Complaints
- PickupVerifications

## 7.4. Additional Technologies

- Git and GitHub — version control.
- Docker — containerization.
- GitHub Actions — CI/CD.
- Postman — API testing.
- Jest or Vitest — automated testing.
- Playwright — end-to-end testing.
- OpenStreetMap — location visualization.

The final implementation may use Supabase for managed PostgreSQL, authentication, and file storage, provided the backend architecture maintains proper authorization and business rules.

---

# 8. Database Requirements

The database must maintain relationships between users, businesses, offers, and reservations.

## 8.1. Main Relationships

- One user can own or manage a business account, subject to the selected account model.
- One business can publish multiple Surprise Boxes.
- One Surprise Box can have multiple reservations.
- One customer can create multiple reservations.
- One completed reservation can have one customer review.
- Administrators can review business applications and complaints.

## 8.2. Important Data Integrity Constraints

- Email addresses must be unique.
- Business identifiers must be unique where applicable.
- Prices must be positive.
- Available quantity cannot be negative.
- Each reservation must reference an existing offer and customer.
- A review can only be submitted for an eligible completed reservation.
- Reservation status changes must follow permitted transitions.

---

# 9. MVP Scope

The MVP will focus on proving that customers and businesses can successfully use the marketplace's core functionality.

## Included in MVP

- Customer registration and login.
- Business registration and verification.
- Role-based access control.
- Surprise Box creation and management.
- Browse and search offers.
- Basic filters.
- Offer details.
- Reservation management.
- Inventory availability validation.
- Pickup confirmation.
- Customer order history.
- Business dashboard.
- Admin dashboard.
- Basic responsive UI.

## Excluded from MVP

- Integrated online payments.
- AI-powered recommendations.
- Machine learning demand prediction.
- Advanced business analytics.
- Automated dynamic pricing.
- Loyalty and reward programs.
- Mobile applications for Android and iOS.
- Complex delivery infrastructure.
- Multi-language support.

These features may be considered after validating the MVP.

---

# 10. Success Metrics

The following metrics will be used to evaluate the pilot.

## Business Metrics

- Number of registered businesses.
- Number of verified businesses.
- Number of active Surprise Box offers.
- Number of reservations.
- Reservation-to-pickup conversion rate.
- Number of repeat customers.
- Revenue generated through completed reservations.

## Social Impact Metrics

- Number of successfully collected Surprise Boxes.
- Estimated quantity of food sold that might otherwise have remained unsold.
- Number of participating food businesses.

Food saved should initially be reported using a clearly defined estimation method, not as an exact measurement unless actual weight data is collected.

## Technical Metrics

- API response time.
- API error rate.
- Successful reservation rate.
- Failed or conflicting reservation attempts.
- Automated test coverage.
- Application availability.

---

# 11. Risks and Constraints

## 11.1. Business Risks

**Discount Cannibalization**

Customers may wait for discounted offers instead of purchasing at regular prices.

Mitigation: List eligible surplus close to pickup time and measure regular-price sales alongside discounted sales.

**Insufficient Surplus**

Businesses may not consistently have enough unsold products.

Mitigation: Start with a small pilot involving several independent businesses.

**Existing Competition**

Existing discount programs and similar platforms may reduce the product's market differentiation.

Mitigation: Focus on reservation convenience, discovery, business tools, and measurable additional value.

## 11.2. Operational Risks

**Pickup Difficulties**

Customers may be unable to collect their orders during the defined pickup window.

Mitigation: Display clear pickup times and instructions.

**Food Safety**

Improper storage or inaccurate product information may create safety risks.

Mitigation: Establish business verification, product information requirements, and complaint procedures.

## 11.3. Technical Risks

**Concurrent Reservations**

Multiple customers may attempt to reserve the same available quantity.

Mitigation: Use database transactions, atomic inventory updates, and concurrency testing.

**Unauthorized Access**

Users may attempt to access another user's orders or business data.

Mitigation: Enforce server-side authorization and test access-control rules.

---

# 12. Development Roadmap

## Phase 1 — Planning and Design

- Finalize product requirements.
- Create system architecture diagram.
- Design database schema and ERD.
- Create UI/UX designs.
- Define REST API specifications.

## Phase 2 — Backend Development

- Set up backend project.
- Implement authentication.
- Implement role-based authorization.
- Develop business and offer APIs.
- Develop reservation and inventory logic.
- Implement validation and error handling.

## Phase 3 — Frontend Development

- Build authentication pages.
- Build customer marketplace.
- Build Surprise Box details.
- Build business dashboard.
- Build admin dashboard.
- Integrate backend APIs.

## Phase 4 — Testing and Integration

- Unit testing.
- Integration testing.
- End-to-end testing.
- Reservation concurrency testing.
- Security and authorization testing.

## Phase 5 — Deployment and Pilot

- Docker configuration.
- CI/CD setup.
- Production deployment.
- Onboard a small number of businesses.
- Test real reservations and pickups.
- Collect feedback and measure results.

---

# 13. Acceptance Criteria

The MVP will be considered functionally complete when:

1. A customer can register and log in.
2. A business can submit an application.
3. An administrator can approve a business.
4. An approved business can publish a Surprise Box.
5. Customers can discover and filter available offers.
6. Customers can reserve available boxes.
7. The system prevents overselling.
8. Customers can view their reservation history.
9. Businesses can confirm pickups.
10. Administrators can manage users, businesses, and offers.
11. Unauthorized users cannot access restricted resources.
12. The application passes its critical automated tests.
13. The application is deployed and accessible through a public URL.

---

# 14. Future Development Opportunities

After validating the MVP, the following features can be explored:

- Online payment integration.
- QR-based pickup verification.
- Advanced business analytics.
- Demand forecasting.
- Dynamic pricing recommendations.
- AI-powered offer recommendations.
- Food donation partnerships.
- Multi-language support.
- Mobile applications.
- Business inventory integrations.

---

# 15. Final Product Definition

Food Waste Platform is a full-stack food marketplace that connects local food businesses with customers through discounted Surprise Boxes.

Its primary value is to create a convenient channel for discovering and reserving affordable food while helping businesses manage unsold products.

The MVP will validate the core marketplace model before investing in advanced automation, AI, payment integrations, and large-scale expansion.

**The main product success criterion is not simply the number of registered users. It is whether businesses can consistently publish eligible offers and customers can successfully reserve and collect them.**



# Technical Requirements Document (TRD)
## Food Waste Reduction & Surprise Box Marketplace

**Version:** 2.0  
**Status:** Draft  
**Database Provider:** Supabase  
**Architecture:** React + Node.js + Supabase

---

## 1. Project Overview

Food Waste Reduction & Surprise Box Marketplace is a web-based platform connecting food businesses with customers.

Businesses publish discounted Surprise Boxes containing unsold but safe-to-consume food. Customers discover available offers, reserve boxes, and collect them from businesses during specified pickup windows.

The platform aims to reduce food waste while providing customers with affordable food options.

## 2. Technology Stack

### 2.1 Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- React Hook Form
- Zod

### 2.2 Backend
- Node.js
- Express.js
- TypeScript
- REST API architecture
- Supabase JavaScript Client
- Zod for request validation

### 2.3 Database and Backend Services
- Supabase PostgreSQL
- Supabase Authentication
- Supabase Storage
- Supabase Row Level Security (RLS)
- Supabase SQL Editor
- Supabase Database Functions (PostgreSQL functions)

### 2.4 Development and Deployment
- Git
- GitHub
- Docker
- GitHub Actions
- Postman
- Vitest
- Supertest
- Playwright
- Vercel (Frontend)
- Render (Express Backend)
- Supabase (Database and managed services)

### 2.5 External Services
- OpenStreetMap
- Leaflet
- Email provider for notifications

---

## 3. System Architecture

The system will use a layered architecture.

### 3.1 Presentation Layer — React

Responsibilities:
- User interface
- Navigation
- Form handling
- Displaying Surprise Boxes
- Communicating with backend APIs
- Managing frontend state

### 3.2 Application Layer — Node.js and Express

Responsibilities:
- Business logic
- Reservation processing
- Inventory management
- User role verification
- Business verification workflows
- Input validation
- API request handling
- Database operations

### 3.3 Infrastructure Layer — Supabase

Supabase provides:

**PostgreSQL Database**
- Stores users, businesses, offers, reservations, and reviews.
- Maintains relationships and constraints.
- Executes database transactions and functions.

**Authentication**
- Handles user registration and login.
- Manages authentication sessions.
- Supports email verification and password recovery.

**Storage**
- Stores business images.
- Stores Surprise Box images.
- Provides controlled access to uploaded files.

**Row Level Security**
- Restricts direct database access based on authenticated user identity and permissions.

### 3.4 Request Flow

1. User interacts with the React application.
2. Frontend sends a request to the Express API.
3. Backend validates the request.
4. Backend verifies the user's Supabase access token.
5. Backend checks the user's role and resource permissions.
6. Backend executes business logic.
7. Backend communicates with Supabase.
8. Supabase PostgreSQL processes the database operation.
9. Backend returns a JSON response.
10. Frontend updates the interface.

### 3.5 Architecture Principle

The Express backend is the main entry point for business operations.

The frontend must not contain privileged Supabase credentials or directly perform sensitive operations such as reservation inventory updates.

Supabase RLS must also protect data if direct client-side database access is introduced for explicitly permitted use cases.

---

## 4. Supabase Configuration

### 4.1 Supabase Project

Create one Supabase project for the application.

Required services:
- PostgreSQL Database
- Authentication
- Storage
- Row Level Security
- SQL migrations

Development and production environments should use separate Supabase projects when practical.

### 4.2 Authentication Configuration

Supabase Auth will handle:
- User registration
- User login
- Logout
- Email verification
- Password recovery
- Session management

The application will use Supabase-issued access tokens.

The Express backend must verify tokens using a trusted Supabase authentication mechanism. It must not trust user IDs or roles supplied only in the request body.

### 4.3 Storage Configuration

Create the following storage buckets:

**business-images**
- Business profile images.
- Business-related photos.

**surprise-box-images**
- Surprise Box images.

Storage rules:
- Only authorized business owners can upload images for their own businesses.
- File type and size must be validated.
- Public access should be used only for content intended to be publicly visible.
- Private files should use authenticated access or signed URLs.

### 4.4 Row Level Security

Enable RLS on tables containing user or business data.

Example policies:

**Users**
- Users can read permitted profile information.
- Users can update their own profile.
- Users cannot change their own role.

**Businesses**
- Public users can view approved businesses.
- Owners can update their own business information.
- Only administrators can approve or reject businesses.

**SurpriseBoxes**
- Customers can view active and available offers.
- Business owners can manage their own offers.
- Only approved businesses can publish offers.

**Reservations**
- Customers can view their own reservations.
- Business owners can view reservations associated with their businesses.
- Customers cannot change reservation status to Picked Up.
- Only authorized business owners can verify pickups.

**Important:** RLS policies are an additional security layer. They do not replace backend authorization and business logic.

---

## 5. User Roles and Permissions

### 5.1 Customer
- Register and log in.
- Browse Surprise Boxes.
- Search and filter offers.
- View business information.
- Reserve available boxes.
- View reservation history.
- Cancel eligible reservations.
- Submit reviews after completed reservations.

### 5.2 Business Owner
- Register a business account.
- Submit business verification information.
- Manage business profile.
- Create and update Surprise Boxes.
- Set quantities and pickup windows.
- View reservations.
- Verify customer pickups.
- View basic statistics.

### 5.3 Administrator
- View users and businesses.
- Approve or reject business applications.
- Suspend accounts.
- Moderate offers.
- Review complaints.
- View basic platform statistics.

Roles must be checked by the backend. Frontend restrictions alone are insufficient.

---

## 6. Functional Requirements

### 6.1 Authentication

The system must support:
- Registration
- Login
- Logout
- Email verification
- Password recovery
- Authenticated API access

Implementation:
- Supabase Auth handles identity and authentication.
- A `profiles` table stores application-specific user information.
- The backend verifies Supabase access tokens.
- User roles are stored and managed separately from client-editable profile fields.

### 6.2 Business Management

Business owners must be able to:
- Register a business.
- Submit verification information.
- Edit business details.
- Upload business images.
- View verification status.

Business fields:
- ID
- Owner ID
- Name
- Description
- Address
- Latitude
- Longitude
- Category
- Contact information
- Verification status
- Created timestamp

Only approved businesses can publish Surprise Boxes.

### 6.3 Surprise Box Management

Business owners must be able to:
- Create offers.
- Edit their own offers.
- Deactivate offers.
- Set available quantities.
- Define pickup windows.
- Upload offer images.

Each offer must include:
- ID
- Business ID
- Title
- Description
- Original price
- Discounted price
- Available quantity
- Category
- Image URL
- Allergen information
- Pickup start time
- Pickup end time
- Expiration time
- Status

Validation:
- Discounted price must be greater than zero.
- Discounted price must be lower than the original price.
- Quantity cannot be negative.
- Pickup end time must be later than pickup start time.
- Expired offers cannot be reserved.
- Only approved businesses can publish offers.

### 6.4 Search and Discovery

Customers must be able to:
- Browse active offers.
- Search by offer or business name.
- Filter by category.
- Filter by price.
- Filter by location.
- Sort by price or publication date.

Initial location search can use latitude and longitude. PostGIS can be enabled later for advanced geographic queries.

### 6.5 Reservation Management

Reservation workflow:

1. Customer selects a Surprise Box.
2. Customer chooses quantity.
3. Frontend sends a reservation request.
4. Backend validates the request.
5. Backend calls a database function or executes a safe transactional operation.
6. Database checks and updates available quantity.
7. Reservation is created.
8. Backend returns confirmation.

Reservation statuses:
- PENDING
- CONFIRMED
- PICKED_UP
- CANCELLED
- EXPIRED

Technical requirements:
- Reservation creation must be atomic.
- Inventory must never become negative.
- Concurrent requests must not oversell available quantities.
- A reservation must have a unique identifier.
- Invalid status transitions must be rejected.
- Cancellation must restore inventory only when the business rules permit it.

**Implementation decision:** Use a PostgreSQL function, such as `create_reservation`, to validate availability, reserve stock, and insert the reservation in one database transaction. The function must be executable only through authorized backend operations.

### 6.6 Pickup Verification

Businesses must be able to verify customer reservations.

Initial implementation:
- Unique reservation code.
- Manual verification through the business dashboard.

Future implementation:
- QR-code generation and scanning.

Only valid reservations can be marked as PICKED_UP.

### 6.7 Reviews and Ratings

Customers can submit reviews after successful pickup.

Requirements:
- Rating from 1 to 5.
- Optional comment.
- One review per eligible reservation.
- Review linked to customer and business.
- Administrative moderation.

### 6.8 Notifications

The system should support:
- Reservation confirmation
- Cancellation
- Expiration
- Business verification result

Email notifications can use an external email provider.

---

## 7. Database Design

Database engine: PostgreSQL  
Provider: Supabase

### 7.1 Main Tables

**profiles**
- id (UUID, primary key, references auth.users)
- full_name
- role
- phone
- created_at
- updated_at

**businesses**
- id (UUID, primary key)
- owner_id (UUID, references profiles)
- name
- description
- address
- latitude
- longitude
- category
- contact_phone
- verification_status
- created_at
- updated_at

**business_applications**
- id
- business_id
- submitted_at
- reviewed_at
- status
- reviewed_by

**surprise_boxes**
- id
- business_id
- title
- description
- original_price
- discounted_price
- quantity_available
- category
- image_url
- allergens
- pickup_start
- pickup_end
- expires_at
- status
- created_at
- updated_at

**reservations**
- id
- customer_id
- surprise_box_id
- quantity
- total_price
- status
- reservation_code
- created_at
- updated_at

**reviews**
- id
- customer_id
- business_id
- reservation_id
- rating
- comment
- created_at

**complaints**
- id
- user_id
- target_type
- target_id
- description
- status
- created_at

**audit_logs**
- id
- admin_id
- action
- target_type
- target_id
- created_at

### 7.2 Relationships

- One Supabase Auth user has one application profile.
- One business owner can own multiple businesses, subject to product rules.
- One business can publish multiple Surprise Boxes.
- One Surprise Box can have multiple reservations.
- One customer can create multiple reservations.
- One completed reservation can have one review.
- One business can receive multiple reviews.

### 7.3 Database Constraints

The database must enforce:
- Primary keys.
- Foreign keys.
- Unique email identity through Supabase Auth.
- Valid price relationships.
- Non-negative quantities.
- Valid reservation statuses.
- Unique reservation codes.
- One review per eligible reservation.

### 7.4 Indexing

Add indexes to frequently queried columns:
- `profiles.id`
- `businesses.owner_id`
- `businesses.verification_status`
- `surprise_boxes.business_id`
- `surprise_boxes.status`
- `surprise_boxes.category`
- `surprise_boxes.pickup_start`
- `reservations.customer_id`
- `reservations.surprise_box_id`
- `reservations.status`

Indexes should be validated against actual query patterns.

---

## 8. REST API Requirements

Base URL:

`/api/v1`

All endpoints return JSON.

### 8.1 Authentication

Supabase Auth handles identity operations. The Express API provides application-specific session and profile operations.

| Method | Endpoint | Description |
|---|---|---|
| GET | /auth/me | Current authenticated profile |
| PATCH | /users/me | Update own profile |

Registration, login, logout, and password recovery use the Supabase Auth client from the frontend.

### 8.2 Businesses

| Method | Endpoint | Description |
|---|---|---|
| POST | /businesses | Create business |
| GET | /businesses | List approved businesses |
| GET | /businesses/:id | Business details |
| PATCH | /businesses/:id | Update own business |
| POST | /businesses/:id/apply | Submit verification application |

### 8.3 Surprise Boxes

| Method | Endpoint | Description |
|---|---|---|
| POST | /boxes | Create offer |
| GET | /boxes | List available offers |
| GET | /boxes/:id | Offer details |
| PATCH | /boxes/:id | Update own offer |
| DELETE | /boxes/:id | Deactivate own offer |

### 8.4 Reservations

| Method | Endpoint | Description |
|---|---|---|
| POST | /reservations | Create reservation |
| GET | /reservations/me | Customer reservations |
| GET | /reservations/:id | Reservation details |
| PATCH | /reservations/:id/cancel | Cancel reservation |
| PATCH | /reservations/:id/confirm | Confirm reservation |
| PATCH | /reservations/:id/pickup | Verify pickup |

### 8.5 Reviews

| Method | Endpoint | Description |
|---|---|---|
| POST | /reviews | Create review |
| GET | /businesses/:id/reviews | List business reviews |

### 8.6 Administration

| Method | Endpoint | Description |
|---|---|---|
| GET | /admin/users | List users |
| GET | /admin/businesses | List business applications |
| PATCH | /admin/businesses/:id/approve | Approve business |
| PATCH | /admin/businesses/:id/reject | Reject business |
| GET | /admin/complaints | List complaints |

All protected endpoints must verify identity, permissions, ownership, and input validity.

---

## 9. API Response Standards

Successful response:

```json
{
  "success": true,
  "data": {
    "id": "reservation-id",
    "status": "CONFIRMED"
  }
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_QUANTITY",
    "message": "Requested quantity is not available."
  }
}
```

HTTP status codes:
- 200 — Successful request
- 201 — Resource created
- 400 — Invalid request
- 401 — Unauthenticated
- 403 — Forbidden
- 404 — Resource not found
- 409 — Conflict
- 422 — Validation error
- 500 — Internal server error

---

## 10. Security Requirements

- Supabase Auth must handle user identity.
- Express must verify incoming access tokens.
- Role-based access control must be enforced on the backend.
- RLS must protect database records.
- Supabase service-role credentials must never be exposed to the frontend.
- Passwords must not be stored in application tables.
- All input must be validated.
- Sensitive endpoints must use rate limiting.
- CORS must be configured for trusted frontend origins.
- Storage upload permissions must be restricted.
- Resource ownership must be verified.
- Administrative actions must be logged.
- Secrets must be stored in environment variables.

The service-role key bypasses RLS and must be used only in trusted server-side code when necessary. Prefer user-scoped access for operations that should respect the user's RLS permissions.

---

## 11. Non-Functional Requirements

### Performance
- Common API requests should normally respond within 500 ms under expected MVP load, excluding external service delays.
- Pagination must be implemented.
- Database queries must use appropriate indexes.

### Reliability
- Reservation operations must be atomic.
- Failed transactions must roll back.
- Expired offers cannot be reserved.
- Inventory must remain consistent.

### Scalability
- Frontend and backend must be independently deployable.
- Supabase database and storage must be separate from application logic.
- Architecture should support future caching and background jobs.

### Maintainability
- TypeScript must be used in frontend and backend.
- Code must be organized into modules.
- Database changes must be version-controlled through SQL migrations.
- API endpoints must be documented.
- Git branches and pull requests should be used.

### Usability
- Responsive interface.
- Clear pickup information.
- Accessible forms.
- Clear error and success messages.

---

## 12. Testing Requirements

### Unit Testing
- Price validation
- Quantity validation
- Reservation status transitions
- Offer expiration
- Permission checks

### Integration Testing
- Supabase authentication integration
- Business creation
- Surprise Box creation
- Reservation processing
- Inventory updates
- Reservation cancellation
- RLS policy behavior

### End-to-End Testing
- Customer registration
- Login
- Offer discovery
- Reservation
- Business confirmation
- Pickup verification

### Concurrency Testing

Simulate multiple customers trying to reserve the last available Surprise Box.

Expected result:
- No overselling.
- No negative inventory.
- Only valid reservations are created.

---

## 13. Deployment Requirements

### Frontend
- Build with Vite.
- Deploy to Vercel.
- Configure API and Supabase public configuration through environment variables.

### Backend
- Build TypeScript into JavaScript.
- Deploy to Render.
- Configure Supabase URL and server-side credentials.
- Run database migrations through a controlled deployment process.

### Database
- Hosted on Supabase.
- Use separate development and production environments where practical.
- Enable backups according to the selected Supabase plan.
- Apply schema changes through version-controlled migrations.

### CI/CD

GitHub Actions must:
1. Install dependencies.
2. Run linting.
3. Run unit and integration tests.
4. Build frontend and backend.
5. Report failures before deployment.

---

## 14. Environment Variables

### Frontend

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The Supabase publishable key (or legacy anon key) may be used in the frontend only when RLS and permissions are correctly configured.

### Backend

```env
NODE_ENV=development
PORT=5000
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
FRONTEND_URL=
```

Use the appropriate Supabase server-side key for the selected client and authorization model. Never expose secret or service-role keys in frontend code or GitHub.

---

## 15. MVP Technical Scope

The first release must include:

- Supabase authentication
- User profiles and roles
- Business registration and approval
- Surprise Box management
- Image uploads through Supabase Storage
- Offer browsing and filtering
- Reservation management
- Transaction-safe inventory updates
- Manual pickup verification
- Basic administrator dashboard
- RLS policies
- Responsive frontend
- Automated tests
- Deployment

Postponed features:
- Online payments
- AI recommendations
- Delivery management
- Native mobile applications
- Advanced analytics
- Dynamic pricing
- Real-time chat
- Complex loyalty systems

---

## 16. Future Technical Improvements

- Redis caching
- Background job processing
- QR-code pickup verification
- PostGIS geographic search
- Recommendation algorithms
- Analytics dashboards
- Payment gateway integration
- Mobile application
- Real-time notifications

These features should be introduced only when justified by MVP usage.

---

## 17. Technical Acceptance Criteria

The MVP is technically acceptable when:

1. Users can register and authenticate through Supabase.
2. User profiles and roles are managed securely.
3. Backend APIs verify Supabase access tokens.
4. RLS policies protect database records.
5. Approved businesses can publish Surprise Boxes.
6. Customers can browse and filter available offers.
7. Customers can reserve available quantities.
8. Concurrent reservations cannot oversell inventory.
9. Expired offers cannot be reserved.
10. Businesses can verify valid pickups.
11. Administrators can approve businesses.
12. Images can be uploaded securely.
13. Core workflows pass automated tests.
14. Frontend and backend are deployed.
15. No privileged credentials are exposed publicly.

---

**Document End**