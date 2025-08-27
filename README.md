<img src="https://readme-typing-svg.herokuapp.com?font=Anaheim&size=32&duration=3000&pause=2000&color=1F51FF&width=1000&lines=PICTOIMS;Inventory+Management+System" alt="Typing SVG" />

**[Project Technical Documentation]([https://drive.google.com/file/d/1duZPLeUfBSGG8Lkq1pIkDqrryg4kzIKJ/view?usp=drive_link](https://docs.google.com/document/d/1j60WuItgkwUmXcgiRoS-absq1kiQMFmU/edit?usp=drivesdk&ouid=102460866361677377158&rtpof=true&sd=true))**



## Installation Guide

### 1. Prerequisites (Download & Install)

Ensure the following are installed on your system:

- **Node.js**: Version **20+**.
  - To check your version: `node -v`

- **Angular CLI**:
  - To check your version: `ng version`
  - If not installed globally, it will be installed later.

- **.NET 9 SDK**: Version **9+**.
  - To check your version: `dotnet --version`

- **PostgreSQL 17.5**:
  - Install from the [official PostgreSQL website](https://www.postgresql.org/download/windows/).
  - **During installation, set the default username to postgres and password to admin123#!**.

### 2. Get the Code

Open **CMD as Administrator** and choose your desired directory.

- **Clone the repository**:
  ```bash
  git clone https://github.com/chuckzxxmello/pictodev.git
  ```

- **Alternatively, Download ZIP**: Go to the [GitHub Online Repository](https://github.com/chuckzxxmello/pictodev), download the ZIP file, and extract it to your desired directory.

## Configuration

### 1. Identify Your IP Address

Open Command Prompt and type `ipconfig`. Look for your IPv4 Address. It will look something like this:

```
IPv4 Address. . . . . . . . . . . : 192.168.1.7 (This is your local IP address).
```

### 2. Update Configuration Files

You need to replace `192.168.1.7` (or your previous IP) with **your actual IPv4 Address** in the following files:

- **Frontend Folder**:
  - `pictodev/picto-ims-front-end/server.ts`
  - `pictodev/picto-ims-front-end/package.json`
  - `pictodev/picto-ims-front-end/serverconfig.ts`
  - `pictodev/picto-ims-front-end/src/app/services/auth.service.ts` (Specifically, replace the hardcoded IP in API_BASE_URL if present, ensuring it points to your backend server API, e.g., `private readonly API_BASE_URL = 'http://YOUR_IP_ADDRESS:5265/api/Requisition';`).

- **Backend Folder**:
  - `pictodev/PictoIMS.API/proxy-conf.json`
  - `pictodev/PictoIMS.API/appsettings.json`
  - `pictodev/PictoIMS.API/Properties/launchSettings.json`
  - `pictodev/PictoIMS.API/Program.cs` (Main configuration for the backend server).

### 3. Add Firewall Exception

Add an **Inbound Rule** in Windows Firewall for **port 5265**:

1. Search for "Windows Defender Firewall with Advanced Security" in the Windows search bar.
2. In the left pane, click **Inbound Rules**.
3. In the right pane, click **New Rule...**.
4. Select **Port** and click Next.
5. Select **TCP** and enter `5265` in "Specific local ports". Click Next.
6. Select **Allow the connection** and click Next.
7. Ensure all profiles (Domain, Private, Public) are checked, then click Next.
8. Give the rule a **Name** (e.g., "PictoIMS Backend") and click Finish.

### 4. Configure PostgreSQL to Listen on Your IP

Open **CMD as Administrator**.

1. Navigate to your PostgreSQL data directory:
   ```bash
   cd "C:\Program Files\PostgreSQL\17\data"
   ```

2. Open the `postgresql.conf` file (you can use `notepad postgresql.conf`).

3. Find the line `listen_addresses = 'localhost'` and change it to `listen_addresses = '*'`. Save and close the file.

4. Reload the PostgreSQL configuration. From the PostgreSQL bin directory (e.g., `C:\Program Files\PostgreSQL\17\bin`), open psql and execute:
   ```sql
   psql -U postgres
   -- Enter password: admin123#!
   ALTER SYSTEM SET listen_addresses = '*';
   SELECT pg_reload_conf();
   ```

## Installing the System

### 1. Prepare and Run Backend

Open **one CMD as Administrator**.

1. Navigate to the backend folder:
   ```bash
   cd C:\Users\<your_directory>\pictodev\PictoIMS.API
   ```

2. Build the backend:
   ```bash
   dotnet build
   ```

3. Run the backend server (do not close this CMD terminal):
   ```bash
   dotnet run --urls "http://0.0.0.0:5265"
   ```

### 2. Prepare and Run Frontend

Open a **second CMD as Administrator**.

1. Navigate to the frontend folder:
   ```bash
   cd C:\Users\<your_directory>\pictodev\picto-ims-front-end
   ```

2. Install Angular CLI globally (if not already installed):
   ```bash
   npm install -g @angular/cli
   ```

3. Install project dependencies:
   ```bash
   npm install
   ```

4. Run the Angular development server:
   ```bash
   ng serve --host 0.0.0.0 --port 4200 --proxy-config proxy.conf.json
   ```

### 3. PostgreSQL Database Setup

Open a **third CMD as Administrator**.

- Verify PostgreSQL Installation:
  ```bash
  psql --version
  ```
  (This should display your PostgreSQL version, e.g., `psql (PostgreSQL) 17.5`)

- **Add to PATH (if psql command doesn't work)**:
  1. Search for "Edit the system environment variables" in Windows search.
  2. Click **Environment Variables...**.
  3. Under **System variables**, find and select **Path**. Click **Edit...**.
  4. Click **New** and add the path to your PostgreSQL bin directory: `C:\Program Files\PostgreSQL\17\bin`
  5. Click **OK** on all windows and **restart your system (or sign out and back in)** for changes to take effect.

- **Log in to PSQL Terminal**:
  1. Open a **new CMD as Administrator**.
  2. Type: `psql -U postgres`
  3. Enter the password: `admin123#!` (based on your setup password).
  4. If `postgres=#` appears, you are successfully logged in.

- **Restore pictodb.sql Database (IMPORTANT)**:
  1. Ensure you are in the PostgreSQL bin directory (or specify full paths to createdb and psql commands):
     ```bash
     cd "C:\Program Files\PostgreSQL\17\bin"
     ```

  2. Create the database:
     ```bash
     createdb -U postgres pictodb
     ```

  3. Restore the database from the SQL file:
     ```bash
     psql -U postgres -d pictodb -f "C:\Users\<your_directory>\pictodev\pictodb.sql"
     ```

## Accessing the System

Once all services (Backend, Frontend, and PostgreSQL) are running, open your web browser and navigate to:

```
http://<YOUR_IP_ADDRESS>:4200/login
```

Replace `<YOUR_IP_ADDRESS>` with the IPv4 Address you identified earlier (e.g., `http://192.168.1.7:4200/login`).

## Project Overview

The Inventory Management System (IMS) is designed to digitize and centralize supply and asset tracking for government facility operations. It streamlines requisition processes, improves reporting, and ensures secure role-based access with audit trail logging.

### Core Objectives

- **Centralize Data**: Securely store all facility supply data in a PostgreSQL database.
- **Modernize Processes**: Replace manual, document- and spreadsheet-based operations with a modern digital system.
- **Comprehensive Tracking**: Track inventory, requisitions, usage, and procurement cycles.
- **Real-time Insights**: Provide real-time updates, search filters, and comprehensive reporting.
- **Access Control**: Implement role-based access (Admin & Users).
- **Accountability**: Maintain a complete audit trail of all user transactions and activities.

### Core Functions

1. **Dashboard**: Real-time inventory overview, stock alerts, low-threshold warnings, and recent requisition status.
2. **Supply Registry**: CRUD (Create, Read, Update, Delete) operations for supply items, categorized (e.g., Janitorial, Electrical, IT Equipment, Office Supplies).
3. **Stock Movements**: Detailed logging of all inventory transactions.
4. **Requisition System**: Staff request workflow with approval chains.
5. **Vendor Management**: Supplier/vendor information, including serial number tracking.
6. **Excel Integration**: Export functionality with validation and templates.
7. **Analytics & Reporting**: Usage reports, requisition history, and stock summaries.
8. **User Management**: Role-based access control (Admin/User), account security features (change password, authentication lock).
9. **Audit Trail**: Comprehensive logging of all activities.
10. **Forgot Password**: Password recovery mechanism.

## Tech Stack 

- **Programming Languages**: TypeScript, C#, SQL
- **Frontend**: Angular v20
- **Backend**: .NET 9
- **Database**: PostgreSQL 17.5
- **Authentication**: JWT + bcrypt hashing
- **API Testing**: Swagger
