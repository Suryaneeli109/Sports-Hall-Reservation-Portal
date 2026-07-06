# Sports Hall Booking System by Service Portal (ServiceNow)

A custom-built, premium ServiceNow solution mockup and configuration dashboard designed to automate, simplify, and audit sports facility reservations. 

This repository houses a high-fidelity **Service Portal Simulation** and a **Developer Hub/Configuration Explorer**. The application acts both as a responsive reservation portal widget for users and an administrative playground demonstrating ServiceNow backend configurations (table schemas, Flow Designer workflows, client/server scripts, security ACLs, scheduled jobs, Scripted REST APIs, and a downloadable XML Update Set).

---

## 🚀 Key Features

### 1. End-User Service Portal Widget
- **Sport Facility Selection**: View real-time metadata (hourly rates, player capacities, statuses) of courts (Badminton, Tennis, Basketball, Indoor Football).
- **Time Slots Calendar Grid**: Displays 2-hour slots with color-coded status badges: **Available**, **Booked** (Approved), **Pending Approval**, and **Maintenance**. Enforces a maximum 7-day advance booking limit.
- **Reservation Form**: Dynamic cost estimators (standard chargeback calculations), validation constraints, and assignee routing.
- **My Bookings Dashboard**: Tracks reservation ticket lifecycles (`Draft` -> `Requested` -> `Approved` / `Rejected` -> `Cancelled`). Allows cancelling requested slots.

### 2. ServiceNow Developer & Approver Hub
- **Team Lead Approval Console**: Allows mock approvers (John Doe, Sarah Connor) to approve/reject submissions with comments. Decisions immediately write back to the booking status and slots database.
- **Data Dictionary Schema (`sys_db_object`)**: Relational database structure diagram displaying scopes, types, keys, and foreign keys.
- **Flow Designer Simulator**: Visual step-by-step progress tracking of triggers and conditional branches ("IF Approved" / "IF Rejected").
- **Scheduled Jobs Runner**: Force-run scripts such as daily maintenance slot blocks (`x_shbs_slot`) and unapproved reservation expirer routines (48-hour SLA).
- **REST API Explorer**: Interactive sandbox containing `GET` availability, `GET` bookings, and `POST` create reservations. Returns mock responses with standard HTTP headers and JSON bodies.
- **Update Set Downloader**: Click to generate and download the actual ServiceNow Update Set XML (`sys_remote_update_set.xml`) for direct deployment.

---

## 🛠️ Tech Stack & Architecture

- **Core**: Vanilla HTML5, Modern ECMAScript JavaScript.
- **Styling**: CSS3 custom variables, CSS Grid, Flexbox, glassmorphic layout overlays, keyframe pulse animations, and responsive breakpoints.
- **Iconography & Typography**: FontAwesome v6 & Google Fonts (Outfit, Plus Jakarta Sans).
- **ServiceNow Configurations Generated**: 
  - **Tables**: `x_shbs_sports_hall`, `x_shbs_booking`, `x_shbs_slot`.
  - **Widget ID**: `widget-shbs-booking` (includes client controller, CSS, server script, and template HTML).
  - **Access Control Rule**: `sys_security_acl` record locking read rights to record owner, approver, or admin role.

---

## 📂 File Structure

```
c:/Users/HP/OneDrive/Desktop/Servicenow/
│
├── index.html               # Main UI shell (Header, user profile, portal search, main grid layout)
├── styles.css               # Styling definitions (light/dark variables, grids, glassmorphism, notifications)
├── portal_widget.js         # AngularJS Service Portal widget controller & database simulation
├── backend_visualizer.js    # Developer hub operations (approvals console, Flow, jobs, API explorer)
├── update_set_generator.js  # Compilation engine for ServiceNow Update Set XML payload download
└── README.md                # Project documentation (this file)
```

---

## 💻 How to Run Locally

Since this is built with lightweight vanilla files, it requires **no installations or bundlers**. 
1. Clone or download the directory.
2. Locate the file `index.html` in your directory explorer.
3. Double-click `index.html` or drag it into any modern browser (Chrome, Firefox, Edge, Safari).
4. *(Optional)* Toggle light/dark theme in the navbar header, and click the bell icon to slide open the email/SMS notification dispatch drawer.

---

## 📥 How to Import into a real ServiceNow PDI

This project includes a download module for a real ServiceNow XML remote update set:
1. In the **Developer Hub**, navigate to the **Update Set** tab.
2. Click the **Generate & Download Update Set XML** button. A file named `sports_hall_booking_system_update_set.xml` will download.
3. Log into your ServiceNow Personal Developer Instance (PDI) with administrator credentials.
4. Search for **System Update Sets** in the Application Navigator and click **Retrieved Update Sets**.
5. Click the link **Import Update Set from XML** at the bottom of the list.
6. Upload the downloaded `sports_hall_booking_system_update_set.xml` file.
7. Open the retrieved record ("Sports Hall Booking System - Portals & Configurations"), click **Preview Update Set**, resolve any collisions, and then click **Commit Update Set**.
