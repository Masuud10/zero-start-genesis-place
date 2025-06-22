Edufam – Comprehensive School Management System
Overview
Edufam is a modern, full-stack, multi-tenant School Management Platform designed to simplify, automate, and enhance school operations in Kenya and beyond. The platform serves various user roles including Edufam Admins, Principals, Teachers, Parents, Finance Officers, and Students, offering tailored dashboards and workflows for each role.

🚀 Key Features
🎓 School Management
School registration & profile management

Academic calendar setup

Class & subject management

Teacher, student & parent onboarding

📝 Grading Module (CBC & IGCSE)
Grade entry, editing & approval workflows

Term & yearly report cards

Automated performance analytics

📅 Timetable Generator (AI-Powered)
Automated class scheduling

Clash detection & conflict resolution

Teacher & room assignment

💰 Finance Management
Fee assignment to classes & students

MPESA integration via Safaricom Daraja API

MPESA transactions & reconciliation

Financial overview, reports & analytics

Fee balance visibility for parents

📊 Advanced Analytics
Real-time grade, attendance & finance summaries

Customizable data visualizations (charts, graphs)

Individual school & multi-school analytics for Edufam Admins

🎟️ Support Tickets
Role-based support system

All users can raise tickets; Edufam Admins view all

🎓 Certificate & Report Generation
Auto-generated academic & completion certificates

Dynamic PDF report generation for schools & Edufam Company

⚙️ System Settings
Maintenance mode toggle

User account deactivation & management

🏗️ Tech Stack
Frontend: React.js + TypeScript + Tailwind CSS

Backend: Supabase (PostgreSQL)

State Management: React Query / Zustand

Authentication: Supabase Auth

Payments: MPESA Daraja API

Deployment: Vercel

🗄️ Database Structure (Supabase)
Schools

Classes

Subjects

Users (Multi-role support)

Grades

Attendance

Finance (Fees, MPESA Transactions, Expenses)

Certificates

Reports

System Settings

🔧 Setup Instructions
Clone the repository:

bash
Copy
Edit
git clone https://github.com/your-username/edufam.git
cd edufam
Install dependencies:

bash
Copy
Edit
npm install
Create a .env file with your Supabase keys and MPESA credentials:

bash
Copy
Edit
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_MPESA_CONSUMER_KEY=your_consumer_key
VITE_MPESA_CONSUMER_SECRET=your_consumer_secret
VITE_MPESA_PAYBILL=your_paybill_number
Run the application:

bash
Copy
Edit
npm run dev
✅ To-Do / Roadmap
Multi-tenant school support

MPESA payment integration

AI-powered Timetable Generator (in progress)

Dynamic Notification system

Mobile App (Flutter)

🛡️ License
This project is licensed under the MIT License.

📞 Contact
Edufam Team
Email: info@edufam.org
Website: https://edufam.org
