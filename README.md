# StepUp Pre School

Full-stack dynamic and responsive website for **StepUp Pre School**, built with React on the frontend and Node.js/Express on the backend. It can run with local JSON persistence during development and switch to Mongoose/MongoDB Atlas when `MONGODB_URI` is configured.

## Features

- Responsive preschool website with hero, programs, admissions, gallery, events, testimonials, and contact sections.
- Express API serving school content dynamically to the React app.
- Enquiry form that posts to the backend and stores submissions in JSON or MongoDB through the same model API.
- Vite development server with API proxy for local development.
- Production path where Express can serve the built React app from `client/dist`.

## Run Locally

Install dependencies:

```bash
npm install
```

By default, the backend can run from the JSON files in `server/data`. To use MongoDB Atlas, create `server/.env` and add your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=stepup_pre_school
```

For local MongoDB, use a local URI instead:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=stepup_pre_school
```

If `MONGODB_URI` is not set, the backend uses JSON persistence. When you add `MONGODB_URI`, it switches to Mongoose/MongoDB and seeds existing JSON data only if the matching MongoDB collection is empty.

In Atlas, make sure your database user has read/write access and your current IP address is allowed under **Network Access**. Do not commit `server/.env`.

Existing JSON files in `server/data` are used only as first-run seed data when the matching MongoDB collection is empty.

Start both backend and frontend:

```bash
npm run dev
```

Open the frontend at `http://localhost:5173`.

The backend API runs at `http://localhost:5000`.

## Build

```bash
npm run build
npm start
```

After building, Express serves the production frontend from `http://localhost:5000`.

## API Endpoints

- `GET /api/health`
- `GET /api/site`
- `GET /api/programs`
- `GET /api/events`
- `GET /api/gallery`
- `GET /api/testimonials`
- `GET /api/visits` - view website visitor count
- `POST /api/visits` - record a website visit
- `POST /api/enquiries`
- `GET /api/admin/enquiries` - protected admin enquiry list

## Backend MVC Structure

The Node.js backend follows an MVC-style structure:

- `server/routes` maps API URLs to controller functions
- `server/controllers` handles request and response logic
- `server/models` reads and writes MongoDB collections through Mongoose schemas/models
- `server/middleware` contains auth and error handling middleware
- `server/config` contains environment, path, and upload configuration
- `server/services` contains external integrations like WhatsApp
- `server/utils` contains shared helper functions
- `server/app.js` wires the Express application together
- `server/index.js` starts the HTTP server

Visitor count data is stored through the configured persistence layer. The public frontend records one visit per browser session and shows the total in the homepage stats band.

## Scalable ERP-Ready Structure

The project is prepared for School ERP features by keeping shared infrastructure separate from feature code.

Frontend conventions:

- `client/src/services/apiClient.js` is the shared API client for all features
- `client/src/config/routes.js` is the central route map
- `client/src/config/storageKeys.js` is the central browser storage key map
- new ERP pages should be added as separate components or feature folders instead of growing `App.jsx`

Backend conventions:

- each ERP module should get its own route, controller, and model files
- keep all ERP APIs under `/api/erp/...`
- use existing middleware for auth and error handling
- use services only for external systems such as WhatsApp, payment gateways, or SMS

ERP readiness endpoints:

- `GET /api/erp/modules`
- `GET /api/erp/modules?role=parent`
- `GET /api/erp/modules?role=teacher`
- `GET /api/erp/modules?role=admin`
- `GET /api/erp/dashboard/:role`

ERP readiness page:

```text
http://localhost:5173/erp
```

## Role Based Portals

Open the role portal page at:

```text
http://localhost:5173/portal
```

Demo logins:

```text
Parent:  parent / parent123
Teacher: teacher / teacher123
Admin:   admin / stepup123
```

The parent portal shows child updates, attendance, notices, and activity timeline. The teacher portal shows class overview, tasks, notices, and daily classroom workflow. The admin role opens the protected admin panel.

Role portals also show role-based ERP access:

- Parent: Student Management, Attendance, Fees, Homework, Exams and Results, Transport, Parent Communication
- Teacher: Student Management, Attendance, Homework, Exams and Results, Parent Communication
- Admin: all ERP modules including Staff

Backend endpoints:

- `GET /api/portal/demo-credentials`
- `POST /api/portal/login`

## Admin Panel

Open the admin panel at:

```text
http://localhost:5173/admin
```

Default local login:

```text
Username: admin
Password: stepup123
```

From the admin panel you can:

- Edit public website content and contact details
- Add or update Google Business, Facebook, Instagram, and YouTube links
- Upload one or multiple photos and videos for the public website
- Delete uploaded media
- View latest enquiry form submissions
- Reset the admin password

Uploaded files are stored in `server/uploads`. Website content, media metadata, enquiries, visitor stats, and admin credentials are stored in JSON by default or MongoDB when `MONGODB_URI` is configured.

For production, set a strong `ADMIN_PASSWORD` in `server/.env` before deployment.

To change the admin password, open the **Password** tab in the admin panel, enter the current password, then enter and confirm the new password. New passwords must be at least 8 characters.

## View Form Submissions

When someone submits the enquiry form, the backend stores it through the configured persistence layer.

To see submitted form data, open the protected admin panel:

```text
http://localhost:5173/admin
```

## Send Enquiries to WhatsApp

New enquiry submissions can also be sent to your WhatsApp using the official WhatsApp Business Cloud API.

Create a `server/.env` file from `server/.env.example`:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
# Optional. Leave empty to use JSON files, or add MongoDB Atlas URI.
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=stepup_pre_school
MONGODB_SERVER_SELECTION_TIMEOUT_MS=2500
ADMIN_USERNAME=admin
ADMIN_PASSWORD=stepup123
WHATSAPP_TO_NUMBER=918887867016
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_GRAPH_VERSION=v20.0
```

Use your own WhatsApp number in `WHATSAPP_TO_NUMBER` with country code and without `+`. For example, an Indian number should look like `919876543210`.

After adding the values, restart the backend:

```bash
npm run dev
```

When a parent submits the website form, the backend saves the enquiry and sends a WhatsApp message containing the parent name, phone number, child details, selected program, and message.

You can get `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` from Meta for Developers under your WhatsApp Business Cloud API app. Do not commit your real `.env` file.
