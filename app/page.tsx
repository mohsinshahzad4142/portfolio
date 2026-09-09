'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from './lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, increment, query, orderBy } from 'firebase/firestore';
import GitHubSection from './components/GitHubSection';// (یا اپنے فولڈر کے حساب سے پاتھ دیں)
import ProjectsSection from './components/Projects'; 
import ServicesSection from './components/ServicesSection';
import FAQ from './components/FAQ';
interface Review {
  id?: string;
  name: string;
  company?: string;
  project?: string;
  platform?: string;
  rating: number;
  comment: string;
  approved?: boolean;
  createdAt: any;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export default function Home() {
  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Interaction Stats State (Views & Likes)
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Reviews & Rating State
  const [reviewName, setReviewName] = useState('');
  const [reviewCompany, setReviewCompany] = useState('');
  const [reviewProject, setReviewProject] = useState('');
  const [reviewPlatform, setReviewPlatform] = useState('Upwork');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  // AI Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "Hi! I'm Mohsin's AI Assistant. Ask me anything about his skills, tech stack, or projects!" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Fetch Views, Likes, and Reviews on Load
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const statsRef = doc(db, 'stats', 'portfolio');
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
          await updateDoc(statsRef, { views: increment(1) });
          setViews(statsSnap.data().views + 1);
          setLikes(statsSnap.data().likes || 0);
        } else {
          setViews(1);
          setLikes(0);
        }

        const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(reviewsQuery);
        const fetchedReviews: Review[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // 👈 صرف وہ ریویو دکھائیں جو ایڈمن نے اپروو کیے ہوں
          if (data.approved === true) {
            fetchedReviews.push({ id: docSnap.id, ...data } as Review);
          }
        });
        setReviewsList(fetchedReviews);
      } catch (error) {
        setViews(1);
        setLikes(0);
      }
    };

    fetchPortfolioData();
  }, []);

  const handleLike = async () => {
    if (hasLiked) return;
    try {
      const statsRef = doc(db, 'stats', 'portfolio');
      await updateDoc(statsRef, { likes: increment(1) });
      setLikes(prev => prev + 1);
      setHasLiked(true);
    } catch (error) {
      console.error('Error liking portfolio:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      await addDoc(collection(db, 'contacts'), {
        name,
        email,
        message,
        createdAt: new Date(),
      });
      setStatus('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      setStatus('Sorry, an error occurred while sending the message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewStatus('');

    try {
      const newReview = {
        name: reviewName,
        company: reviewCompany || 'Independent Client',
        project: reviewProject || 'Web Development',
        platform: reviewPlatform || 'Upwork',
        rating: Number(rating),
        comment: reviewComment,
        approved: false, // 👈 سب سے اہم: اب یہ ایڈمن کی اجازت کے بغیر شو نہیں ہوگا
        createdAt: new Date(),
      };
      
      await addDoc(collection(db, 'reviews'), newReview);
      
      // نوٹ: اسے یہاں list میں اس لیے ایڈ نہیں کیا کیونکہ یہ ابھی pending ہے
      setReviewStatus('Thank you! Your review has been submitted and will be published after admin approval.');
      setReviewName('');
      setReviewCompany('');
      setReviewProject('');
      setReviewPlatform('Upwork');
      setRating(5);
      setReviewComment('');
    } catch (error) {
      setReviewStatus('Error submitting review. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 relative">
      
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-20">
      <div className="flex-shrink-0">
        <a href="#" className="text-2xl font-bold text-gray-900 tracking-tight">
          Muhammad<span className="text-blue-600">.ai</span>
        </a>
      </div>
      <div className="hidden md:block">
        <div className="ml-10 flex items-center space-x-6">
          <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">Home</a>
          <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">About</a>
          <a href="#skills" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">Skills</a>
          <a href="#projects" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">Projects</a>
          <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">Services</a>
          <a href="/blog" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">Blog</a>
          <a href="#reviews" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">Reviews</a>
          <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">Contact</a>
          <a href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium">Admin</a>
        </div>
      </div>
    </div>
  </div>
</nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        
        {/* Hero Section */}
        <section className="text-center pt-16 pb-24 flex flex-col items-center justify-center min-h-[60vh]">
          
          <div className="flex items-center gap-2 px-4 py-1.5 mb-6 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-semibold tracking-wide border border-emerald-500/20 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            AVAILABLE FOR PROJECTS & AI INTEGRATION
          </div>

          <h1 className="mt-8 text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
            Hi, I'm <span className="text-blue-600">Muhammad Mohsin Shahzad</span>
          </h1>
          <h2 className="mt-4 text-3xl md:text-4xl font-medium text-gray-700">
            Full Stack & AI Developer
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed">
            Operating out of Kabirwala, District Khanewal, Pakistan. Building modern, scalable, and high-performance web applications using the latest technologies.
          </p>

          <div className="mt-8 flex items-center gap-6 bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              👀 <span>{views} Portfolio Views</span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <button
              onClick={handleLike}
              disabled={hasLiked}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                hasLiked 
                  ? 'bg-red-50 text-red-600 border border-red-200' 
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-2xs'
              }`}
            >
              ❤️ <span>{likes} Likes</span> {hasLiked && '✨'}
            </button>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
            <a href="#projects" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all text-center">
              View My Work
            </a>
            
            <a href="#services" className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-8 py-3.5 rounded-xl font-medium shadow-sm transition-all text-center flex items-center justify-center gap-2">
              <span>⚡ Explore Services</span>
            </a>

            <a href="#contact" className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-3.5 rounded-xl font-medium shadow-sm transition-all text-center">
              Contact Me
            </a>
            
            <a 
              href="/mohsin-cv.pdf" 
              download="Muhammad_Mohsin_CV.pdf"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-md text-center"
            >
              Download CV
            </a>
          </div>
        </section>

        {/* About Me Section */}
        <section id="about" className="py-20 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">About Me</h3>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p>
                I’m a Full Stack Developer focused on building modern, scalable, and high-performance web applications using the latest technologies and development practices.
              </p>
              <p>
                I work across the complete development lifecycle — from responsive frontend interfaces and reusable components to robust backend systems, REST APIs, database architecture, authentication, role-based access control, and cloud deployment.
              </p>
              <p>
                My expertise spans the MERN Stack, Next.js, TypeScript, Python, PostgreSQL, MongoDB, Supabase, Prisma, and WordPress. I build business websites, dashboards, management systems, eCommerce platforms, SaaS applications, PWAs, and custom web solutions with a strong focus on performance, security, scalability, and user experience.
              </p>
              <p className="font-medium text-gray-900">
                I enjoy turning complex requirements into clean, reliable, and production-ready digital products.
              </p>
            </div>
          </div>
        </section>
        <GitHubSection />
{/* --- About Me Section (آپ کا موجودہ سیکشن) --- */}
<section id="about" className="py-20 bg-white">
  {/* ... About Me ka content ... */}
</section>

{/* --- Find Me On / Platform Verification Section (یہاں پیسٹ کریں) --- */}
<section id="profiles" className="py-20 bg-gray-50 border-t border-b border-gray-100">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center max-w-2xl mx-auto mb-12">
      <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Trusted Presence</span>
      <h2 className="text-3xl font-bold text-gray-900 mt-1 mb-3">Find Me Online</h2>
      <p className="text-gray-600 text-sm sm:text-base">
        Verify my professional profile, work history, and client reviews across top-rated freelance and tech platforms.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* 1. Upwork */}
      <a 
        href="https://www.upwork.com/freelancers/~0171c1dda123ee65e4" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            Up
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Upwork</h3>
              <span className="text-blue-500 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded-full">Verified</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Top-Rated Freelancer</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>

      {/* 2. PeoplePerHour */}
      <a 
        href="https://www.peopleperhour.com/freelancer/design/muhammad_mohsin-shahzad-full-stack-developer-next-js-react-zyyvjzqy" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-orange-500 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
            PPH
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">PeoplePerHour</h3>
              <span className="text-blue-500 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Custom Offers & Services</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>

      {/* 3. Fiverr */}
      <a 
        href="https://www.fiverr.com/s/9d2vwoA" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            Fi
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Fiverr</h3>
              <span className="text-blue-500 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded-full">Verified</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Gigs & Web Development</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>

      {/* 4. LinkedIn */}
      <a 
        href="https://www.linkedin.com/in/muhammad-mohsin-shahzad-273bb01bb/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-sky-600 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg group-hover:bg-sky-600 group-hover:text-white transition-colors">
            in
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-900 group-hover:text-sky-600 transition-colors">LinkedIn</h3>
              <span className="text-blue-500 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded-full">Connected</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Professional Network</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>

      {/* 5. GitHub */}
      <a 
        href="mohsinshahzad4142" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-gray-900 transition-all flex items-center justify-between group sm:col-span-2 lg:col-span-2"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center font-bold text-lg group-hover:bg-gray-900 group-hover:text-white transition-colors">
            Gh
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-900 group-hover:text-gray-900 transition-colors">GitHub Repositories</h3>
              <span className="text-blue-500 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded-full">Source Code</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Explore open source projects and code architectures</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>

    </div>
  </div>
</section>

{/* --- Skills Section (اگلا سیکشن) --- */}
<section id="skills" className="py-20 bg-white">
  {/* ... Skills ka content ... */}
</section>
        {/* Skills Section */}
        <section id="skills" className="py-20 border-t border-gray-100">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-4">Skills & Expertise</h3>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">Comprehensive technical skill set covering modern frontend, backend, databases, and DevOps workflows.</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-xl text-gray-900 mb-4 pb-2 border-b border-gray-200">Frontend Development</h4>
              <div className="flex flex-wrap gap-2">
                {['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript', 'React.js', 'Next.js', 'Tailwind CSS', 'Bootstrap', 'Responsive Design', 'REST API Integration', 'Component-Based Architecture', 'State Management', 'Progressive Web Apps (PWA)'].map((skill, index) => (
                  <span key={index} className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium shadow-2xs">{skill}</span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-xl text-gray-900 mb-4 pb-2 border-b border-gray-200">Backend Development</h4>
              <div className="flex flex-wrap gap-2">
                {['Node.js', 'Express.js', 'Python', 'RESTful APIs', 'Authentication & Authorization', 'JWT', 'Role-Based Access Control (RBAC)', 'Server-Side Development', 'API Integration', 'Backend Architecture'].map((skill, index) => (
                  <span key={index} className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium shadow-2xs">{skill}</span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-xl text-gray-900 mb-4 pb-2 border-b border-gray-200">Databases & ORM</h4>
              <div className="flex flex-wrap gap-2">
                {['PostgreSQL', 'MongoDB', 'MySQL', 'Supabase', 'Prisma ORM', 'Database Design', 'Relational Database Architecture', 'CRUD Operations', 'Data Modeling'].map((skill, index) => (
                  <span key={index} className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium shadow-2xs">{skill}</span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-xl text-gray-900 mb-4 pb-2 border-b border-gray-200">Full Stack / MERN</h4>
              <div className="flex flex-wrap gap-2">
                {['MongoDB', 'Express.js', 'React.js', 'Node.js', 'MERN Stack', 'Full Stack Application Development'].map((skill, index) => (
                  <span key={index} className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium shadow-2xs">{skill}</span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-xl text-gray-900 mb-4 pb-2 border-b border-gray-200">WordPress</h4>
              <div className="flex flex-wrap gap-2">
                {['WordPress Development', 'Elementor', 'WooCommerce', 'Theme Customization', 'Plugin Configuration', 'Custom WordPress Websites', 'Website Migration', 'Performance Optimization', 'Security Optimization', 'Responsive WordPress Design'].map((skill, index) => (
                  <span key={index} className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium shadow-2xs">{skill}</span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-xl text-gray-900 mb-4 pb-2 border-b border-gray-200">DevOps & Deployment</h4>
              <div className="flex flex-wrap gap-2">
                {['Git', 'GitHub', 'Vercel', 'Cloud Deployment', 'Environment Configuration', 'Production Deployment', 'Version Control'].map((skill, index) => (
                  <span key={index} className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium shadow-2xs">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
{/* Why Work With Me Section */}
        <section className="py-20 border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Work With Me?</h3>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                I don't just write code; I build reliable, scalable, and business-focused solutions tailored to your needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🚀", title: "Modern Technology", desc: "Using the latest tech stacks to build fast and future-proof web apps." },
                { icon: "🏗️", title: "Clean Architecture", desc: "Writing clean, modular, and maintainable code for long-term success." },
                { icon: "📱", title: "Responsive Development", desc: "Flawless user experiences across all devices, from mobile to desktop." },
                { icon: "📈", title: "Scalable Solutions", desc: "Building architecture that grows seamlessly with your business." },
                { icon: "🔒", title: "Security-Conscious", desc: "Implementing best practices to keep your data and users safe." },
                { icon: "💬", title: "Clear Communication", desc: "Transparent updates and active collaboration throughout the project." },
                { icon: "⏱️", title: "On-Time Delivery", desc: "Respecting deadlines and delivering quality work within the agreed timeframe." },
                { icon: "🛠️", title: "Post-Launch Support", desc: "Providing reliable maintenance and support even after the project goes live." },
                { icon: "💼", title: "Business-Focused", desc: "Aligning technical solutions with your core business goals and ROI." },
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{feature.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Development Process Section */}
        <section className="py-20 border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">How We Build Together</h3>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                A transparent, streamlined development process designed to deliver exceptional results on time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  step: "01", 
                  title: "Discovery", 
                  desc: "Understanding your requirements, target audience, and core business goals.",
                  icon: "🔍"
                },
                { 
                  step: "02", 
                  title: "Planning", 
                  desc: "Defining system architecture, wireframes, and selecting the right tech stack.",
                  icon: "📋"
                },
                { 
                  step: "03", 
                  title: "Design", 
                  desc: "Creating intuitive UI/UX layouts and responsive designs tailored to your brand.",
                  icon: "🎨"
                },
                { 
                  step: "04", 
                  title: "Development", 
                  desc: "Writing clean code for frontend interfaces, backend APIs, and database structures.",
                  icon: "💻"
                },
                { 
                  step: "05", 
                  title: "Testing", 
                  desc: "Rigorous bug fixing, performance optimization, and cross-browser checks.",
                  icon: "⚡"
                },
                { 
                  step: "06", 
                  title: "Deployment", 
                  desc: "Setting up production environments, custom domains, and launching live.",
                  icon: "🚀"
                },
                { 
                  step: "07", 
                  title: "Support", 
                  desc: "Providing ongoing maintenance, security updates, and future feature upgrades.",
                  icon: "🛡️"
                },
              ].map((process, index) => (
                <div 
                  key={index} 
                  className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group hover:border-blue-200 transition-all ${
                    index === 6 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{process.icon}</span>
                    <span className="text-2xl font-black text-blue-600/20 group-hover:text-blue-600/40 transition-colors">
                      {process.step}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">{process.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{process.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* ڈائنامک پروجیکٹس سیکشن (ایڈمن پینل سے آنے والا) */}
        <ProjectsSection />
        
        {/* سروسز مارکیٹ پلیس سیکشن */}
        <ServicesSection />

        {/* Client Reviews Section */}
        <section id="reviews" className="py-20 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Client Reviews & Ratings</h3>
              <p className="text-gray-600">See what clients say or leave your honest rating and feedback.</p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm mb-12">
              <h4 className="font-bold text-lg text-gray-900 mb-4">Leave a Review</h4>
              {reviewStatus && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${reviewStatus.includes('Thank') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {reviewStatus}
                </div>
              )}
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      required
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company / Position (Optional)</label>
                    <input
                      type="text"
                      value={reviewCompany}
                      onChange={(e) => setReviewCompany(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                      placeholder="CEO, TechCorp"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name (Optional)</label>
                    <input
                      type="text"
                      value={reviewProject}
                      onChange={(e) => setReviewProject(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                      placeholder="E-Commerce Web App"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hired Via Platform</label>
                    <select
                      value={reviewPlatform}
                      onChange={(e) => setReviewPlatform(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="Upwork">Upwork</option>
                      <option value="PeoplePerHour">PeoplePerHour</option>
                      <option value="Direct / LinkedIn">Direct / LinkedIn</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars - Very Good)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars - Good)</option>
                    <option value={2}>⭐⭐ (2 Stars - Fair)</option>
                    <option value={1}>⭐ (1 Star - Poor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback / Comment</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                    placeholder="Amazing communication and delivered exactly what we needed on time!"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Approved Reviews List */}
            <div className="space-y-4">
              {reviewsList.length === 0 ? (
                <p className="text-center text-gray-500 py-6">No reviews yet. Be the first to leave a review!</p>
              ) : (
                reviewsList.map((rev, index) => (
                  <div key={rev.id || index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <h5 className="font-bold text-gray-900 text-base">{rev.name}</h5>
                        <p className="text-xs text-gray-500">
                          {rev.company} {rev.project && `• Project: ${rev.project}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                          {rev.platform || 'Direct'}
                        </span>
                        <span className="text-amber-500 text-sm">
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        </section>
        <FAQ />
        {/* Contact Section */}
<section id="contact" className="py-20 border-t border-gray-100 bg-gray-50/50">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    
    {/* Header & Discovery Call */}
    <div className="text-center mb-12">
      <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get In Touch</h3>
      <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mb-4"></div>
      <p className="text-gray-600 max-w-lg mx-auto">
        Have a project in mind, want to collaborate, or prefer hiring via your favorite platform? Let's connect!
      </p>

      <div className="mt-8">
        <a
          href="https://calendly.com/your-calendly-link" 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Book a Discovery Call
        </a>
      </div>
    </div>

    {/* Smart Platform Options Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
      
      {/* Email Copy Box */}
      <div 
        onClick={() => {
          navigator.clipboard.writeText("mohsinshahzad4142@gmail.com");
          alert("Email copied to clipboard!");
        }}
        className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-blue-500 transition-all cursor-pointer group flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">✉️</div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900">Email</h4>
            <p className="text-xs text-gray-500 truncate max-w-[140px]">mohsinshahzad4142@gmail.com</p>
          </div>
        </div>
        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">Copy</span>
      </div>

      {/* Upwork */}
      <a
        href="https://www.upwork.com/freelancers/~0171c1dda123ee65e4"
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-emerald-500 transition-all flex items-center justify-between group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">Up</div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 group-hover:text-emerald-600">Upwork</h4>
            <p className="text-xs text-gray-500">Top-Rated Freelancer</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
      </a>

      {/* Fiverr */}
      <a
        href="https://www.fiverr.com/s/9d2vwoA"
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-emerald-500 transition-all flex items-center justify-between group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">Fi</div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 group-hover:text-emerald-600">Fiverr</h4>
            <p className="text-xs text-gray-500">Gigs & Services</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
      </a>

      {/* PeoplePerHour */}
      <a
        href="https://www.peopleperhour.com/freelancer/design/muhammad_mohsin-shahzad-full-stack-developer-next-js-react-zyyvjzqy"
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-orange-500 transition-all flex items-center justify-between group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">PPH</div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 group-hover:text-orange-600">PeoplePerHour</h4>
            <p className="text-xs text-gray-500">Direct Offers</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
      </a>

      {/* LinkedIn */}
      <a
        href="https://www.linkedin.com/in/muhammad-mohsin-shahzad-273bb01bb/"
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-sky-500 transition-all flex items-center justify-between group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">in</div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 group-hover:text-sky-600">LinkedIn</h4>
            <p className="text-xs text-gray-500">Professional Network</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
      </a>

      {/* GitHub */}
      <a
        href="https://github.com/mohsinshahzad4142"
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-gray-800 transition-all flex items-center justify-between group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center font-bold text-sm">Gh</div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900">GitHub</h4>
            <p className="text-xs text-gray-500">Source Repositories</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
      </a>

    </div>

    {/* Direct Message Form */}
    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg shadow-gray-200/50">
      <h4 className="text-xl font-bold text-gray-900 mb-6">Or Send a Direct Message</h4>
      {status && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${status.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {status}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              placeholder="Muhammad Mohsin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              placeholder="mohsin@example.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            placeholder="Tell me about your project..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>

  </div>
</section>

</main>

{/* Floating AI Chatbot Widget */}
<div className="fixed bottom-6 right-6 z-50">
  {!isChatOpen ? (
    <button
      onClick={() => setIsChatOpen(true)}
      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2 font-medium transition-all transform hover:scale-105 cursor-pointer"
    >
      🤖 <span>Ask Mohsin's AI</span>
    </button>
  ) : (
    <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
          <h4 className="font-bold text-sm">Mohsin's AI Assistant</h4>
        </div>
        <button
          onClick={() => setIsChatOpen(false)}
          className="text-white/80 hover:text-white font-bold text-lg cursor-pointer"
        >
          &times;
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="p-4 h-80 overflow-y-auto space-y-3 bg-gray-50 text-sm flex flex-col">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          disabled={chatLoading}
        />
        <button
          type="submit"
          disabled={chatLoading || !chatInput.trim()}
          className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )}
</div>

</div>
);
}
// Cache bust update 2026