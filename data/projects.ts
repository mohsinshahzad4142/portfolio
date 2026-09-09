// data/projects.ts

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;       // یہاں آپ اپنے اسکرین شاٹ کا پاتھ یا لنک دیں گے
  status: 'live' | 'dev'; // 🟢 Live یا 🟡 In Development
  liveUrl?: string;
  githubUrl?: string;
  tags: string[];
}

export const projectsData: Project[] = [
  {
    id: 'smart-clinic-erp',
    title: 'Smart Clinic ERP',
    description: 'Healthcare management platform designed to streamline patients, appointments, records and administrative workflows.',
    category: 'Full Stack Web App',
    image: '/projects/clinic-erp.png', // public folder mein image ka path
    status: 'live',
    liveUrl: 'https://smart-clinic-erp.vercel.app',
    githubUrl: 'https://github.com/yourusername/smart-clinic-erp',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase']
  },
  {
    id: 'pharmacy-mgt',
    title: 'Pharmacy Management System',
    description: 'Progressive Web Application for inventory tracking, medicine sales, and automated stock alerts.',
    category: 'SaaS / PWA',
    image: '/projects/pharmacy.png',
    status: 'dev', // یہ ابھی ڈویلپمنٹ میں شو ہوگا 🟡
    liveUrl: '#',
    githubUrl: 'https://github.com/yourusername/pharmacy-mgt',
    tags: ['React', 'Next.js', 'Firebase', 'PWA']
  },
  // آپ یہاں مزید پروجیکٹس خود آسانی سے ایڈ کر سکتے ہیں!
];