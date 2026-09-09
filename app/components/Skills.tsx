import { portfolioData } from "../../data";

export default function Skills() {
  const { skills } = portfolioData;

  return (
    <section id="skills" className="py-20 px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">My Tech Stack</h2>
        <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Frontend Box */}
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:shadow-lg transition-all">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">Frontend</h3>
          <div className="flex flex-wrap gap-2">
            {skills.frontend.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Backend Box */}
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:shadow-lg transition-all">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">Backend & AI</h3>
          <div className="flex flex-wrap gap-2">
            {skills.backend.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Tools Box */}
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:shadow-lg transition-all">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">Tools & Database</h3>
          <div className="flex flex-wrap gap-2">
            {skills.tools.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}