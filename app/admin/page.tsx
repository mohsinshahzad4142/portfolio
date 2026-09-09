'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status?: string;
  createdAt?: any;
}

interface Review {
  id: string;
  name: string;
  company?: string;
  project?: string;
  platform?: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt?: any;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'messages' | 'projects' | 'reviews'>('messages');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [status, setStatus] = useState('live');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  const [challenge, setChallenge] = useState('');
  const [solution, setSolution] = useState('');
  const [result, setResult] = useState('');

  const [projectLoading, setProjectLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    const savedPass = localStorage.getItem('admin_pass');
    if (auth === 'true' && savedPass) {
      fetchAdminData(savedPass);
    }
  }, []);

  const fetchAdminData = async (pwd: string) => {
    setAuthLoading(true);
    setError('');
    try {
      const res = await fetch('/api/messages', {
        headers: { 'x-admin-password': pwd },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authenticate');
      setMessages(data.messages);

      const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(reviewsQuery);
      const fetchedReviews: Review[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedReviews.push({ id: docSnap.id, ...docSnap.data() } as Review);
      });
      setReviewsList(fetchedReviews);

      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_pass', pwd);
    } catch (err: any) {
      setError(err.message);
      setIsAuthenticated(false);
      sessionStorage.removeItem('admin_auth');
      localStorage.removeItem('admin_pass');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdminData(password);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_pass');
    setPassword('');
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const msgRef = doc(db, 'contacts', id);
      await updateDoc(msgRef, { status: newStatus });
      setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } catch (error) {
      console.error('Error updating message status:', error);
      alert('Failed to update status.');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteDoc(doc(db, 'contacts', id));
      setMessages(messages.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message.');
    }
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const reviewRef = doc(db, 'reviews', id);
      await updateDoc(reviewRef, { approved: !currentStatus });
      setReviewsList(reviewsList.map(r => r.id === id ? { ...r, approved: !currentStatus } : r));
    } catch (error) {
      console.error('Error updating review status:', error);
      alert('Failed to update review status.');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      setReviewsList(reviewsList.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review.');
    }
  };

  // --- Cloudinary Image Upload Logic ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "YOUR_UPLOAD_PRESET"); 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.secure_url) {
        setImage(data.secure_url);
        alert("Image uploaded successfully to Cloudinary! 📸");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please check your Cloudinary settings.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectLoading(true);
    setSuccessMsg('');

    try {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);

      await addDoc(collection(db, 'projects'), {
        title,
        description,
        category,
        image,
        status,
        liveUrl,
        githubUrl,
        tags,
        challenge,
        solution,
        result,
        createdAt: new Date(),
      });

      setSuccessMsg('Project and Case Study added successfully! It is now live on your portfolio.');
      setTitle('');
      setDescription('');
      setCategory('');
      setImage('');
      setLiveUrl('');
      setGithubUrl('');
      setTagsInput('');
      setChallenge('');
      setSolution('');
      setResult('');
    } catch (error) {
      console.error('Error adding project: ', error);
      alert('Failed to add project. Please try again.');
    } finally {
      setProjectLoading(false);
    }
  };

  const formatDate = (dateData: any) => {
    if (!dateData) return 'Just now';
    if (dateData.seconds) {
      return new Date(dateData.seconds * 1000).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    }
    return new Date(dateData).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2 text-center text-emerald-400">Admin Login</h1>
          <p className="text-gray-400 text-sm mb-6 text-center">Enter your password to access the private dashboard:</p>
          
          {error && <p className="text-red-400 text-sm mb-4 text-center bg-red-950/50 p-3 rounded-lg border border-red-800">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              required
            />
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-colors cursor-pointer"
            >
              {authLoading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage messages, portfolio projects, and client reviews.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
            <div className="flex bg-gray-800 p-1 rounded-xl flex-1 md:flex-none">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'messages' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                📥 Messages ({messages.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reviews' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                ⭐ Reviews
              </button>
              
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'projects' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
               🚀 Add Project
              </button>

              {/* 👇 Yahan Blogs ka link paste kar dein 👇 */}
              <Link
                href="/admin/blogs"
                className="flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium text-purple-400 hover:text-white hover:bg-purple-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                📝 Blogs
              </Link>

              <Link
                href="/admin/orders"
                className="flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium text-blue-400 hover:text-white hover:bg-blue-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                📦 Orders
              </Link>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>

        {activeTab === 'messages' && (
          <div>
            {messages.length === 0 ? (
              <div className="text-center bg-gray-800 p-10 rounded-2xl border border-gray-700">
                <p className="text-gray-400">No messages received yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold text-emerald-400">{msg.name}</h2>
                          <select
                            value={msg.status || "New"}
                            onChange={(e) => handleStatusChange(msg.id, e.target.value)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium border-0 cursor-pointer focus:ring-2
                              ${msg.status === "New" ? "bg-red-500/20 text-red-400 border border-red-500/30" : ""}
                              ${msg.status === "Contacted" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : ""}
                              ${msg.status === "In Progress" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : ""}
                              ${msg.status === "Resolved" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : ""}
                            `}
                          >
                            <option value="New" className="bg-gray-900 text-red-400">🔴 New</option>
                            <option value="Contacted" className="bg-gray-900 text-blue-400">🔵 Contacted</option>
                            <option value="In Progress" className="bg-gray-900 text-yellow-400">🟡 In Progress</option>
                            <option value="Resolved" className="bg-gray-900 text-emerald-400">🟢 Resolved</option>
                          </select>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{formatDate(msg.createdAt)}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-300 bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-full">
                          {msg.email}
                        </span>
                        <a 
                          href={`mailto:${msg.email}?subject=Reply to your inquiry on Mohsin's Portfolio`}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          Reply
                        </a>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer"
                          title="Delete Message"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviewsList.length === 0 ? (
              <div className="text-center bg-gray-800 p-10 rounded-2xl border border-gray-700">
                <p className="text-gray-400">No client reviews submitted yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className={`bg-gray-800 p-6 rounded-2xl border shadow-md transition-all ${rev.approved ? 'border-gray-700' : 'border-amber-500/50 bg-amber-950/10'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold text-white">{rev.name}</h2>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${rev.approved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                            {rev.approved ? '🟢 Published' : '⏳ Pending Approval'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {rev.company || 'Independent'} • {rev.project || 'Project'} ({rev.platform || 'Platform'}) • {formatDate(rev.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 font-bold tracking-wider">
                          {'⭐'.repeat(rev.rating)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/50 mb-4">
                      <p className="text-gray-300 italic">"{rev.comment}"</p>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleToggleApproval(rev.id, rev.approved)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${rev.approved ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30 hover:bg-amber-600/30' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                      >
                        {rev.approved ? 'Hide from Portfolio' : 'Approve & Publish'}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-xl max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-emerald-400">Add New Project</h2>

            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-center font-medium">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleAddProject} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Project Title</label>
                <input 
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Content Generator"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
                <input 
                  type="text" required value={category} onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. SaaS Web App"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                <textarea 
                  required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what the project does..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Project Image</label>
                <div className="flex flex-col gap-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600/20 file:text-emerald-400 hover:file:bg-emerald-600/30 cursor-pointer"
                  />
                  {uploadingImage && <p className="text-sm text-emerald-400 animate-pulse">Uploading to Cloudinary... ⏳</p>}
                  <input 
                    type="text" value={image} onChange={(e) => setImage(e.target.value)}
                    placeholder="Or paste image URL here..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    readOnly={uploadingImage}
                  />
                  {image && (
                    <div className="mt-2">
                      <img src={image} alt="Preview" className="h-24 w-auto object-cover rounded-lg border border-gray-700 shadow-lg" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Status</label>
                <select 
                  value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="live">🟢 Live</option>
                  <option value="dev">🟡 In Development</option>
                </select>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Live Demo URL (Optional)</label>
                  <input 
                    type="text" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://your-app.vercel.app"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">GitHub URL (Optional)</label>
                  <input 
                    type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Tech Stack Tags (Comma separated)</label>
                <input 
                  type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Next.js, React, Tailwind CSS, Firebase"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="border-t border-gray-700 pt-5 mt-5">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4">Case Study Details (Optional)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Challenge</label>
                    <textarea 
                      rows={3} value={challenge} onChange={(e) => setChallenge(e.target.value)}
                      placeholder="What was the primary challenge?"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Solution</label>
                    <textarea 
                      rows={3} value={solution} onChange={(e) => setSolution(e.target.value)}
                      placeholder="How did you solve it?"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Result / Key Takeaway</label>
                    <textarea 
                      rows={3} value={result} onChange={(e) => setResult(e.target.value)}
                      placeholder="What was the outcome or impact?"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={projectLoading || uploadingImage}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 mt-4"
              >
                {projectLoading ? 'Adding Project...' : '🚀 Publish Project'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}