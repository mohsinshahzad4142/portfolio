'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const postsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postsList);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-emerald-400 animate-pulse text-lg font-medium">Loading articles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="text-sm text-emerald-400 hover:underline mb-4 inline-block">
            ← Back to Portfolio
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Insights & Articles</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-base">
            Thoughts, tutorials, and deep dives into full-stack development, modern architectures, and web engineering.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center bg-gray-800 p-12 rounded-2xl border border-gray-700 max-w-lg mx-auto shadow-xl">
            <p className="text-gray-400 mb-2">No articles published yet.</p>
            <p className="text-xs text-gray-500">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  {post.coverImage && (
                    <div className="h-52 w-full overflow-hidden bg-gray-900 relative">
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>
                        {post.createdAt?.seconds 
                          ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                          : 'Recent'}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {post.tags.slice(0, 4).map((tag: string, i: number) => (
                          <span key={i} className="text-xs px-2.5 py-1 bg-gray-900 text-gray-300 rounded-md border border-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0 flex items-center text-emerald-400 text-sm font-semibold gap-1 group-hover:translate-x-1 transition-transform">
                  Read Article →
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}