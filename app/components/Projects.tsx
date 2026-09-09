'use client';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

export default function ProjectsSection() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null); // For Case Study Modal

  useEffect(() => {
    async function fetchProjects() {
      try {
        const q = query(collection(db, 'projects'));
        const querySnapshot = await getDocs(q);
        const projectsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsList);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <section id="projects" className="py-20 px-4 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
        <p className="text-gray-400">No projects added yet. Open your <a href="/admin" className="text-emerald-400 underline">Admin Page</a> to add your first project!</p>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 px-4 max-w-6xl mx-auto w-full">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
        <p className="text-gray-400">Real-world applications built to solve business problems.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Project Image & Status Badge */}
              <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
                <div className="absolute top-3 right-3 z-10">
                  {project.status === 'live' ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/90 text-white text-xs font-semibold rounded-full shadow-md backdrop-blur-sm">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                      🟢 Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/90 text-white text-xs font-semibold rounded-full shadow-md backdrop-blur-sm">
                      <span className="h-2 w-2 rounded-full bg-white"></span>
                      🟡 In Development
                    </span>
                  )}
                </div>

                {project.image ? (
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    [ No Image Provided ]
                  </div>
                )}
              </div>

              {/* Project Details */}
              <div className="p-6">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {project.category}
                </span>
                <h3 className="text-2xl font-bold mt-1 mb-2 text-white">
                  {project.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags && project.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-2.5 py-1 bg-gray-900 text-gray-300 text-xs rounded-md font-medium border border-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Case Study Button (Shows only if challenge exists) */}
                {project.challenge && (
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="w-full mt-2 py-2.5 bg-gray-900 hover:bg-gray-950 border border-gray-700 text-emerald-400 font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>📊 Read Business Case Study</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action Links */}
            <div className="px-6 pb-6 pt-0 flex items-center gap-4">
              {project.status === 'live' && project.liveUrl && (
                <a 
                  href={project.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all"
                >
                  Live Demo →
                </a>
              )}
              {project.githubUrl && (
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-gray-700 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg transition-all"
                >
                  GitHub Code
                </a>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* --- CASE STUDY MODAL (POPUP) --- */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full p-6 md:p-8 relative shadow-2xl my-8">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full transition-colors"
            >
              ✕
            </button>

            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Case Study • {selectedProject.category}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-1 mb-6">
              {selectedProject.title}
            </h2>

            <div className="space-y-6 text-gray-300 text-sm md:text-base">
              {/* Challenge */}
              <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50">
                <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-2">
                  <span>⚠️ The Challenge</span>
                </h4>
                <p className="leading-relaxed">{selectedProject.challenge}</p>
              </div>

              {/* Solution */}
              <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50">
                <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-2">
                  <span>💡 The Solution</span>
                </h4>
                <p className="leading-relaxed">{selectedProject.solution}</p>
              </div>

              {/* Result */}
              {selectedProject.result && (
                <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50">
                  <h4 className="font-bold text-blue-400 mb-1 flex items-center gap-2">
                    <span>🚀 Business Result & Impact</span>
                  </h4>
                  <p className="leading-relaxed">{selectedProject.result}</p>
                </div>
              )}
            </div>

            {/* Close Modal Button at bottom */}
            <div className="mt-8 text-right">
              <button 
                onClick={() => setSelectedProject(null)}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-all"
              >
                Close Case Study
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}