
import { 
  Users, 
  BookOpen, 
  UserCheck, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  Shield,
  Globe,
  Clock,
  GraduationCap,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';

export const coreFeatures = [
  {
    icon: Users,
    title: "Student Management",
    description: "Complete student lifecycle management from enrollment to graduation with detailed profiles, academic history, and family connections.",
    benefits: ["Automated enrollment", "Digital records", "Parent portal access", "Medical records tracking"],
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: BookOpen,
    title: "Grade Management in IGCSE & CBC",
    description: "Advanced grading system supporting Kenya's CBC curriculum and IGCSE curriculum with competency-based assessments and automated report generation.",
    benefits: ["CBC compliance", "Automated calculations", "Progress tracking", "Competency mapping"],
    color: "from-green-500 to-green-600"
  },
  {
    icon: UserCheck,
    title: "Attendance Tracking",
    description: "Real-time attendance monitoring with biometric integration, SMS notifications, and comprehensive reporting for better student accountability.",
    benefits: ["Real-time tracking", "Parent notifications", "Attendance analytics", "Biometric integration"],
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: DollarSign,
    title: "Financial Management",
    description: "Complete fee management system with M-Pesa integration, automated billing, expense tracking, and detailed financial reporting.",
    benefits: ["M-Pesa integration", "Automated billing", "Financial reports", "Payment tracking"],
    color: "from-emerald-500 to-emerald-600"
  },
  {
    icon: Calendar,
    title: "Smart Timetabling",
    description: "AI-powered timetable generation that considers teacher availability, room capacity, and subject requirements for optimal scheduling.",
    benefits: ["AI optimization", "Conflict resolution", "Resource management", "Auto-scheduling"],
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: TrendingUp,
    title: "Analytics & Reports",
    description: "Comprehensive analytics dashboard with performance insights, predictive analytics, and customizable reports for data-driven decisions.",
    benefits: ["Performance insights", "Predictive analytics", "Custom reports", "Data visualization"],
    color: "from-indigo-500 to-indigo-600"
  },
  {
    icon: MessageSquare,
    title: "Communication Hub",
    description: "Integrated messaging system connecting teachers, students, and parents with announcements, direct messaging, and notification management.",
    benefits: ["Multi-channel messaging", "Automated notifications", "Parent engagement", "Bulk messaging"],
    color: "from-pink-500 to-pink-600"
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "Enterprise-grade security with role-based access, data encryption, audit trails, and compliance with educational data protection standards.",
    benefits: ["Role-based access", "Data encryption", "Audit trails", "GDPR compliance"],
    color: "from-red-500 to-red-600"
  },
  {
    icon: GraduationCap,
    title: "Academic Management",
    description: "Comprehensive academic workflow management including exam scheduling, result processing, and academic year management.",
    benefits: ["Exam scheduling", "Result processing", "Academic planning", "Term management"],
    color: "from-cyan-500 to-cyan-600"
  },
  {
    icon: FileText,
    title: "Document Management",
    description: "Digital document storage and management system for certificates, transcripts, and administrative documents with secure access controls.",
    benefits: ["Digital certificates", "Document templates", "Secure storage", "Version control"],
    color: "from-yellow-500 to-yellow-600"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Advanced performance tracking and analytics for students, teachers, and overall school performance with actionable insights.",
    benefits: ["Student analytics", "Teacher performance", "School metrics", "Predictive insights"],
    color: "from-violet-500 to-violet-600"
  },
  {
    icon: Settings,
    title: "System Administration",
    description: "Comprehensive system administration tools for user management, school configuration, and system maintenance with full control.",
    benefits: ["User management", "System configuration", "Backup management", "Multi-tenant support"],
    color: "from-slate-500 to-slate-600"
  }
];

export const testimonials = [
  {
    name: "Dr. Grace Wanjiku",
    role: "Principal, Nairobi International School",
    content: "EduFam has revolutionized our school management. The CBC integration is seamless and our efficiency has improved by 300%.",
    rating: 5,
    avatar: "GW",
    school: "Nairobi International School"
  },
  {
    name: "John Kamau",
    role: "Finance Director, Mombasa Academy",
    content: "The M-Pesa integration and automated fee collection has eliminated our payment tracking headaches completely.",
    rating: 5,
    avatar: "JK",
    school: "Mombasa Academy"
  },
  {
    name: "Prof. Sarah Nyong'o",
    role: "Academic Director, Kisumu Learning Center",
    content: "Our teachers love the grading system and parents appreciate the real-time updates on their children's progress.",
    rating: 5,
    avatar: "SN",
    school: "Kisumu Learning Center"
  }
];

export const stats = [
  { number: "10+", label: "Schools Empowered", icon: Globe, description: "Trusted across Kenya" },
  { number: "1K+", label: "Students Managed", icon: Users, description: "Growing daily" },
  { number: "99.9%", label: "Uptime Guarantee", icon: Shield, description: "Always available" },
  { number: "24/7", label: "Expert Support", icon: Clock, description: "Local support team" }
];
