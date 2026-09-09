import { portfolioData } from "../../data";

export default function About() {
  const { personal } = portfolioData;

  return (
    <section id="about" className="py-20 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">About Me</h2>
        <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Bio & Professional Summary */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Passionate Full Stack & AI Developer
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {personal.about} Based in {personal.location}, I specialize in bridging the gap between high-performance code and search engine visibility.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Whether it is building scalable web apps with Next.js and FastAPI or optimizing digital assets for peak performance, I focus on delivering clean, maintainable, and result-oriented solutions.
          </p>
        </div>

        {/* Right Column: Working Process / Highlights */}
        <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50 dark:bg-gray-900/50 shadow-sm space-y-6">
          <h4 className="text-xl font-bold text-blue-600">My Working Process</h4>
          
          <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center font-bold justify-center text-xs">1</span>
              <span><strong>Requirement Analysis:</strong> Understanding project goals, tech stack requirements, and SEO targets.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center font-bold justify-center text-xs">2</span>
              <span><strong>Development & Integration:</strong> Crafting responsive UIs, backend APIs, and modern AI tools.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center font-bold justify-center text-xs">3</span>
              <span><strong>SEO & Optimization:</strong> Ensuring high performance, metadata setup, and smooth deployment.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}