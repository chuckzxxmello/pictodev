<img src="https://readme-typing-svg.herokuapp.com?font=Anaheim&size=32&duration=3000&pause=2000&color=1F51FF&width=1000&lines=PICTOIMS;Inventory+Management+System" alt="Typing SVG" />

PICTOIMS aims to digitize and centralize all supply and asset tracking for government facility operations.

## Setup

.NET 9 Backend

1. cd C:\Users\User\Downloads\pictodev\PictoIMS.API
2. dotnet restore
3. dotnet clean
4. dotnet run


ps.
- dotnet ef migrations add pictodb
- psql -U postgres -c "CREATE DATABASE pictodb;"
- psql -U postgres -d pictodb -f "C:\Users\User\Downloads\pictodb\pictodb.sql" - actual location of the sql file

Angular Frontend

1. cd C:\Users\User\Downloads\pictodev\picto-ims-frontend
2. npm install
3. ng serve

ps.
- npm install --legacy-peer-deps

## Core Objectives
- Centralize all facility supply data in a secure PostgreSQL.
- Modernize document and spreadsheet-based records and manual counting processes.
- Track supply inventory, requisitions, usage, and procurement cycles.
- Allow real-time updates, searching, and comprehensive reporting.
- Enable role-based access (Admin & Users).
- Comprehensive audit trail logging for all transactions and user interactions.

## Core Functions
- **Dashboard** – Real-time inventory overview, stock alerts, recent requisitions.
- **Supply Registry** – Complete CRUD operations for all supply items with categories.
- **Stock Movements** – Detailed logging of all inventory transactions.
- **Requisition System** – Staff request workflow with approval chains.
- **Vendor Management** – Supplier information (Serial Number).
- **Excel Integration** – Seamless import/export with validation and templates.
- **Analytics Report Generator** – Analytics reports for stock, usage, and requisition.
- **User Management** – Role-based access control and user administration. Change password and auth lock.
- **Audit Trail** – Comprehensive logging of all system activities.

## Tech Stack
- **Frontend:** Razor Pages
- **Backend:** ASP.NET 9 Core Web Application
- **Database:** PostgreSQL
- **Authentication:** ASP.NET Core Identity

## Development Plan

### Phase 1: Requirements Analysis & Planning
- Stakeholder interviews with Facility Manager.
- Current process documentation (Excel workflows, approval chains).
- Define inventory categories: Janitorial, Electrical, IT Equipment, Office Supplies.
- Establish user roles: Admin, Users.
- Identify pain points in current manual system.
- Setup development environment and version control (Git).

### Phase 2: System Design & Architecture
- Database ERD design.
- Data Flow Diagram / System Flowchart.
- API specification for all CRUD operations and business logic.
- Security architecture planning with role-based access. (localhost – closed private network)

### Phase 3: Backend Development
- Server database implementation with proper indexing and constraints.
- ASP.NET Core MVC application structure with clean architecture.
- Authentication & authorization system using ASP.NET Identity.
- Excel import/export functionality with template validation.

- Responsive dashboard with real-time inventory status.
- Supply management interfaces (add/edit/delete with modal forms).
- Advanced search and filtering by category, serial no. and brand.
- Final design and layout.

### Phase 4: Test & Deploy
- Security testing and vulnerability assessment.
- Performance testing under expected load conditions.
- Production server setup on government infrastructure.
- Database backup and recovery procedures implementation.
- Documentation delivery (user manual, admin guide, technical documentation).

## Features

### Admin
- User Management

### Dashboard
- Monthly RF/RS Usage Report
- Monthly Remaining Inventory Supplies Report
- Notifications (for updates on supplies/products or user changes) — real time

### RF & RS
- Requisition Forms – Items requisitioned for RF or inside office use
- Request Forms – Repair Requestor & IT Repairman and corresponding data
- RF/RS Log (Date, Item, Department, Quantity, Status)  
  *Status: Pending / Approved / Fulfilled*
- Transfer In / Transfer Out
- PC Repair Tracker

### Inventory
- Inventory Records [ADD/UPDATE/DELETE] with Remaining Stock (low stock warnings)
- Audit PICTO Inventory – items used in PICTO OFFICE (IT Supplies may be complex)

## Database Schema
- `users`
- `picto_inventory`
- `inventory_tracking_history`
- `requisition_forms`
- `request_forms`
- `transfer_in`
- `transfer_out`
- `pc_repair_tracker`
