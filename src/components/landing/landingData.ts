
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
  Clock
} from 'lucide-react';

export const coreFeatures = [
  {
    icon: Users,
    title: "Student Management",
    description: "Complete student lifecycle management from enrollment to graduation with detailed profiles, academic history, and family connections.",
    benefits: ["Automated enrollment", "Digital records", "Parent portal access"],
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: BookOpen,
    title: "Grade Management & CBC",
    description: "Advanced grading system supporting Kenya's CBC curriculum with competency-based assessments and automated report generation.",
    benefits: ["CBC compliance", "Automated calculations", "Progress tracking"],
    color: "from-green-500 to-green-600"
  },
  {
    icon: UserCheck,
    title: "Attendance Tracking",
    description: "Real-time attendance monitoring with biometric integration, SMS notifications, and comprehensive reporting for better student accountability.",
    benefits: ["Real-time tracking", "Parent notifications", "Attendance analytics"],
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: DollarSign,
    title: "Financial Management",
    description: "Complete fee management system with M-Pesa integration, automated billing, expense tracking, and detailed financial reporting.",
    benefits: ["M-Pesa integration", "Automated billing", "Financial reports"],
    color: "from-emerald-500 to-emerald-600"
  },
  {
    icon: Calendar,
    title: "Smart Timetabling",
    description: "AI-powered timetable generation that considers teacher availability, room capacity, and subject requirements for optimal scheduling.",
    benefits: ["AI optimization", "Conflict resolution", "Resource management"],
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: TrendingUp,
    title: "Analytics & Reports",
    description: "Comprehensive analytics dashboard with performance insights, predictive analytics, and customizable reports for data-driven decisions.",
    benefits: ["Performance insights", "Predictive analytics", "Custom reports"],
    color: "from-indigo-500 to-indigo-600"
  },
  {
    icon: MessageSquare,
    title: "Communication Hub",
    description: "Integrated messaging system connecting teachers, students, and parents with announcements, direct messaging, and notification management.",
    benefits: ["Multi-channel messaging", "Automated notifications", "Parent engagement"],
    color: "from-pink-500 to-pink-600"
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "Enterprise-grade security with role-based access, data encryption, audit trails, and compliance with educational data protection standards.",
    benefits: ["Role-based access", "Data encryption", "Audit trails"],
    color: "from-red-500 to-red-600"
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
  { number: "1,000+", label: "Schools Empowered", icon: Globe, description: "Trusted across Kenya" },
  { number: "200K+", label: "Students Managed", icon: Users, description: "Growing daily" },
  { number: "99.9%", label: "Uptime Guarantee", icon: Shield, description: "Always available" },
  { number: "24/7", label: "Expert Support", icon: Clock, description: "Local support team" }
];
