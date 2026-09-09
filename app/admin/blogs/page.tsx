'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase'; // Updated relative path
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  createdAt: any;
  published: boolean;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(true);

  // Fetch blogs from Firestore
  const fetchBlogs = async () => {
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const blogList: BlogPost[] = [];
      querySnapshot.forEach((docSnap) => {
        blogList.push({ id: docSnap.id, ...docSnap.data() } as BlogPost);
      });
      setBlogs(blogList);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(generatedSlug);
  };
// Handle Cloudinary Image Upload with Debugging
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    
    const formData = new FormData();
    formData.append("file", file);
    
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    formData.append("upload_preset", uploadPreset);

    console.log("Uploading to Cloud:", cloudName, "Preset:", uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      console.log("Cloudinary Response:", data); // Check browser console for exact error message if any
      
      if (data.secure_url) {
        setCoverImage(data.secure_url);
        alert("Image uploaded successfully to Cloudinary! 📸");
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Failed to upload image: ${error.message || 'Check console'}`);
    } finally {
      setUploadingImage(false);
    }
  };
  // Save Blog to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !slug) {
      alert('Please fill in Title, Slug, and Content.');
      return;
    }

    setSubmitting(true);
    try {
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      
      await addDoc(collection(db, 'blogs'), {
        title,
        slug,
        excerpt,
        content,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', // Default fallback
        tags: tagArray,
        createdAt: serverTimestamp(),
        published,
      });

      alert('Blog post published successfully! 🚀');
      // Reset form
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      setCoverImage('');
      setTags('');
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to publish blog.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Blog
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteDoc(doc(db, 'blogs', id));
        setBlogs(blogs.filter((b) => b.id !== id));
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">📝 Blog Management</h1>
            <p className="text-slate-400 text-sm mt-1">Create, manage, and publish articles directly to Firestore.</p>
          </div>
          <Link href="/admin/orders" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition">
            ← Back to Orders
          </Link>
        </div>

        {/* Create Blog Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-12 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">✨ Create New Blog Post</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Blog Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g. How I built a Real-time SaaS Dashboard"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="how-i-built-realtime-saas"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image (Cloudinary URL or Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../image.jpg"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 text-sm"
                  />
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center transition shrink-0">
                    {uploadingImage ? 'Uploading...' : '📁 Upload'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Next.js, Firebase, Tailwind, Web Dev"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Short Excerpt (Card Summary)</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="A brief overview of what this article is about..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Article Content (Markdown / HTML / Text)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="Write your detailed blog post content here..."
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-purple-500 font-mono text-sm leading-relaxed"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-slate-300 font-medium">Publish immediately</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/30 transition disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Publish Blog Post 🚀'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Blogs List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">📚 Published Articles ({blogs.length})</h2>
          
          {loading ? (
            <p className="text-slate-400">Loading blogs...</p>
          ) : blogs.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              No blog posts found yet. Create your first post above! ✍️
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map((blog) => (
                <div key={blog.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    {blog.coverImage && (
                      <div className="h-40 w-full mb-4 rounded-xl overflow-hidden bg-slate-950">
                        <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${blog.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {blog.published ? 'Live' : 'Draft'}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {blog.createdAt?.toDate ? new Date(blog.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 mb-2">{blog.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">{blog.excerpt || blog.content}</p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
                    <div className="flex flex-wrap gap-1">
                      {blog.tags?.map((t, idx) => (
                        <span key={idx} className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium p-2 transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}