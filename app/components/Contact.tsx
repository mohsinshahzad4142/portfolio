"use client";

import { useState } from "react";
import { portfolioData } from "../../data";

export default function Contact() {
  const { personal } = portfolioData;
  // 🛡️ Honeypot اسٹیٹ کو شامل کیا گیا ہے
  const [formData, setFormData] = useState({ name: "", email: "", message: "", honeypot: "" });
  const [status, setStatus] = useState<{ type: "success" | "error" | null; msg: string }>({ type: null, msg: "" });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const email = "mohsinshahzad4142@gmail.com"; // ⚠️ اپنا اصلی ای میل یہاں لکھیں

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: "" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", msg: data.message });
        // 🛡️ فارم ری سیٹ کرتے وقت honeypot کو بھی خالی کریں
        setFormData({ name: "", email: "", message: "", honeypot: "" });
      } else {
        setStatus({ type: "error", msg: data.error || "میسج نہیں بھیجا جا سکا۔" });
      }
    } catch {
      setStatus({ type: "error", msg: "نیٹ ورک کا مسئلہ ہے۔ دوبارہ کوشش کریں۔" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
        <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-lg mx-auto">
          Have a project in mind, want to collaborate, or prefer hiring via your favorite platform? Let's connect!
        </p>

        {/* Book a Discovery Call Button */}
        <div className="mt-8">
          <a
            href="https://calendly.com/your-calendly-link" // ⚠️ اپنا کیلنڈلی یا میٹنگ لنک یہاں درج کریں
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

      {/* Smart Contact Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        
        {/* 1. Direct Email Copy */}
        <div 
          onClick={copyEmailToClipboard}
          className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:border-blue-500 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">✉️</div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Email</h4>
              <p className="text-xs text-gray-500 truncate max-w-[140px]">{email}</p>
            </div>
          </div>
          <span className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </div>

        {/* 2. Upwork */}
        <a
          href="https://www.upwork.com/freelancers/~YOUR_UPWORK_ID"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:border-emerald-500 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">Up</div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-emerald-500">Upwork</h4>
              <p className="text-xs text-gray-500">Top-Rated Freelancer</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
        </a>

        {/* 3. Fiverr */}
        <a
          href="https://www.fiverr.com/your_fiverr_username"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:border-emerald-500 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">Fi</div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-emerald-500">Fiverr</h4>
              <p className="text-xs text-gray-500">Gigs & Services</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
        </a>

        {/* 4. PeoplePerHour */}
        <a
          href="https://www.peopleperhour.com/freelancer/~YOUR_PPH_ID"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:border-orange-500 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-sm">PPH</div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-orange-500">PeoplePerHour</h4>
              <p className="text-xs text-gray-500">Direct Offers</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
        </a>

        {/* 5. LinkedIn */}
        <a
          href="https://www.linkedin.com/in/your_linkedin_username"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:border-sky-500 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-sm">in</div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-sky-500">LinkedIn</h4>
              <p className="text-xs text-gray-500">Professional Network</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
        </a>

        {/* 6. GitHub */}
        <a
          href="https://github.com/mohsinshahzad4142"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:border-gray-400 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex items-center justify-center font-bold text-sm">Gh</div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">GitHub</h4>
              <p className="text-xs text-gray-500">Source Repositories</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
        </a>

      </div>

      {/* Direct Message Form */}
      <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50 dark:bg-gray-900/50 shadow-sm">
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Or Send a Direct Message</h3>
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          
          {/* 🛡️ Honeypot Field (Anti-Spam) - Visually Hidden */}
          <div style={{ display: 'none' }}>
            <label htmlFor="honeypot">Do not fill this out if you are human</label>
            <input
              type="text"
              id="honeypot"
              name="honeypot"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Message</label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="How can I help you?"
            ></textarea>
          </div>

          {status.msg && (
            <div className={`p-4 rounded-xl text-sm ${status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {status.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      <footer className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} {personal.name}. All rights reserved.</p>
      </footer>
    </section>
  );
}