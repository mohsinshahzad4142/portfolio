'use client';

import { useState, useEffect } from 'react';

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
}

export default function GitHubSection() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ اپنا اصلی گিট ہب یوزر نیم یہاں لکھیں
  const githubUsername = 'mohsinshahzad4142'; 

  useEffect(() => {
    // File Path: app/components/GitHubSection.tsx

const fetchGitHubRepos = async () => {
  if (!githubUsername) {
    setLoading(false);
    return;
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!res.ok) {
      console.warn(`GitHub API notice: ${res.status} ${res.statusText}`);
      return;
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      setRepos(data);
    }
  } catch (error) {
    console.error('Error fetching github repos:', error);
  } finally {
    setLoading(false);
  }
};

    fetchGitHubRepos();
  }, [githubUsername]);

  return (
    <section id="github-repos" className="py-20 bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Open Source & Code</span>
          <h2 className="text-3xl font-bold text-white mt-1 mb-3">Live GitHub Activity</h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Explore my latest public repositories, source code architectures, and active tech stacks directly synced from GitHub.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500 mx-auto mb-3"></div>
            Loading live repositories from GitHub...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-6 rounded-2xl border border-gray-700/80 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors truncate">
                      {repo.name}
                    </h3>
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {repo.description || 'No description provided for this repository.'}
                  </p>
                </div>

                <div>
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {repo.topics.slice(0, 3).map((topic, idx) => (
                        <span key={idx} className="text-xs bg-gray-900 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/60 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5 font-medium text-gray-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                      {repo.language || 'Code'}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">⭐ {repo.stargazers_count}</span>
                      <span className="flex items-center gap-1">🍴 {repo.forks_count}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}