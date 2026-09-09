import { portfolioData } from "../../data";

export default function Hero() {
  const { personal } = portfolioData;

  return (
    <section className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4 py-20">
      
      {/* 2026 Trend: Animated Availability Badge */}
      <div className="flex items-center gap-2 px-4 py-1.5 mb-6 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-semibold tracking-wide border border-emerald-500/20 shadow-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        AVAILABLE FOR PROJECTS
      </div>
      
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
        Hi, I'm <span className="text-blue-600 dark:text-blue-500">{personal.name}</span>
      </h1>
      
      <h2 className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 font-medium mb-4">
        {personal.role}
      </h2>
      
      <p className="max-w-2xl text-gray-600 dark:text-gray-400 mb-10 text-lg md:text-xl leading-relaxed">
        {personal.about}
      </p>
      
      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4">
        
        {/* Primary CTA */}
        <a 
          href="#projects" 
          className="px-8 py-3.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 w-full sm:w-auto"
        >
          View My Work
        </a>

        {/* Contact CTA */}
        <a 
          href="#contact"
          className="px-8 py-3.5 border-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all w-full sm:w-auto"
        >
          Contact Me
        </a>

        {/* 2026 Trend: Download CV Button with Icon */}
        <a 
          href="/mohsin-cv.pdf" 
          download="Muhammad_Mohsin_CV.pdf"
          className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-md w-full sm:w-auto"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 group-hover:-translate-y-1 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CV
        </a>

      </div>
    </section>
  );
}