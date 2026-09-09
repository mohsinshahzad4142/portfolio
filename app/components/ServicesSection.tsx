'use client';
import { useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createNewOrder } from '@/app/lib/orders';
// Service Marketplace Data
const servicesData = [
  {
    id: 'fullstack',
    title: 'Full Stack Web Development',
    category: 'Web Development',
    price: '$299',
    description: 'Build a modern, responsive, and scalable web application using React, Next.js, Node.js and Databases.',
    delivery: '7–14 Days',
    revisions: '2 Revisions',
    includes: ['Responsive UI', 'Frontend Development', 'Backend / API', 'Database Integration', 'Authentication', 'Deployment'],
    packages: [
      { name: 'Starter', price: '$299', desc: 'Up to 3 pages, responsive frontend, basic backend, contact form, deployment.' },
      { name: 'Professional', price: '$699', desc: 'Up to 8 pages, React/Next.js, Node.js backend, PostgreSQL, auth, admin dashboard, deployment.' },
      { name: 'Custom Application', price: '$1,299+', desc: 'Full custom app, advanced backend, DB architecture, RBAC, 3rd-party APIs, payment gateway, dashboard.' }
    ]
  },
  {
    id: 'saas',
    title: 'SaaS & Dashboard Development',
    category: 'Web Development',
    price: '$499',
    description: 'Custom SaaS web applications, admin panels, role-based access control, and subscription billing systems.',
    delivery: '10–20 Days',
    revisions: '3 Revisions',
    includes: ['Admin Dashboard', 'User Authentication', 'Stripe / Payment Integration', 'Database Design', 'API Integration', 'Cloud Deployment'],
    packages: [
      { name: 'Starter Dashboard', price: '$499', desc: 'Admin panel, analytics charts, user management, basic CRUD operations.' },
      { name: 'SaaS MVP', price: '$999', desc: 'Multi-tenant structure, Stripe billing, user roles, database architecture, full frontend/backend.' },
      { name: 'Advanced SaaS', price: '$1,899+', desc: 'Complex workflows, custom AI integrations, high-performance optimization, dedicated support.' }
    ]
  },
  {
    id: 'wordpress',
    title: 'WordPress Development',
    category: 'WordPress',
    price: '$149',
    description: 'Professional, fast-loading, and SEO-friendly WordPress websites, landing pages, and custom themes.',
    delivery: '3–7 Days',
    revisions: '2 Revisions',
    includes: ['Custom Theme Setup', 'Elementor / Gutenberg', 'Speed Optimization', 'SEO Setup', 'Mobile Responsive', 'Security Hardening'],
    packages: [
      { name: 'Landing Page', price: '$149', desc: '1 high-converting landing page, responsive design, contact form setup.' },
      { name: 'Business Website', price: '$299', desc: 'Up to 6 pages, blog setup, contact forms, speed optimization, basic SEO.' },
      { name: 'Custom WordPress', price: '$599+', desc: 'Advanced custom post types, membership system, multilingual, premium plugins configuration.' }
    ]
  },
  {
    id: 'ecommerce',
    title: 'eCommerce Store Development',
    category: 'eCommerce',
    price: '$349',
    description: 'Full-featured online stores with product management, secure checkout, cart, and payment gateway integration.',
    delivery: '7–12 Days',
    revisions: '3 Revisions',
    includes: ['Product Catalog', 'Cart & Checkout', 'Payment Gateway', 'Inventory Management', 'Order Tracking', 'Mobile Optimized'],
    packages: [
      { name: 'Starter Store', price: '$349', desc: 'Up to 20 products, WooCommerce / Shopify setup, payment gateway, basic design.' },
      { name: 'Professional Store', price: '$749', desc: 'Unlimited products, advanced filtering, multi-currency, coupon system, speed optimized.' },
      { name: 'Custom eCommerce', price: '$1,499+', desc: 'Custom headless store, advanced inventory sync, third-party logistics API integration.' }
    ]
  },
  {
    id: 'api',
    title: 'Backend & API Development',
    category: 'APIs',
    price: '$199',
    description: 'Robust and secure RESTful APIs, microservices, and database architecture using Python FastAPI or Node.js.',
    delivery: '5–10 Days',
    revisions: '2 Revisions',
    includes: ['RESTful Endpoints', 'JWT Authentication', 'Database ORM', 'Swagger Documentation', 'Error Handling', 'Secure Deployment'],
    packages: [
      { name: 'Basic API', price: '$199', desc: 'Up to 5 endpoints, authentication, database connection, documentation.' },
      { name: 'Advanced Backend', price: '$499', desc: 'Complex business logic, multiple models, role-based permissions, automated testing.' },
      { name: 'Microservices & Scaling', price: '$999+', desc: 'Scalable architecture, Redis caching, third-party webhook handling, cloud server setup.' }
    ]
  },
  {
    id: 'optimization',
    title: 'Website Performance & SEO',
    category: 'Optimization',
    price: '$99',
    description: 'Boost your Google PageSpeed scores, optimize Core Web Vitals, fix lag, and improve on-page technical SEO.',
    delivery: '2–4 Days',
    revisions: '1 Revision',
    includes: ['Speed Optimization', 'Image Compression', 'Caching Setup', 'Meta Tags & Schema', 'Core Web Vitals Fix', 'Security Check'],
    packages: [
      { name: 'Basic Speed Fix', price: '$99', desc: 'Image optimization, script deferral, browser caching, basic PageSpeed boost.' },
      { name: 'Advanced Optimization', price: '$199', desc: 'Deep codebase audit, database cleanup, CDN configuration, 90+ mobile score target.' },
      { name: 'Full SEO & Performance', price: '$399', desc: 'Complete technical SEO audit, keyword mapping, schema markup, and speed overhaul.' }
    ]
  },
  {
    id: 'ai',
    title: 'AI-Powered Web Applications',
    category: 'AI',
    price: '$399',
    description: 'Integrate OpenAI, Gemini API, or custom LLMs into your web apps for smart automation and content generation.',
    delivery: '7–14 Days',
    revisions: '3 Revisions',
    includes: ['Gemini / OpenAI API', 'Prompt Engineering', 'Streaming UI', 'Vector DB (Optional)', 'Secure API Keys', 'Full Integration'],
    packages: [
      { name: 'AI Integration', price: '$399', desc: 'Add smart AI chat or content generation feature to your existing web app.' },
      { name: 'AI SaaS Tool', price: '$899', desc: 'Complete AI micro-SaaS application with credit system, user dashboard, and history.' },
      { name: 'Custom AI Agent', price: '$1,599+', desc: 'Advanced RAG implementation, document chat, vector embeddings, custom trained behavior.' }
    ]
  }
];

const categories = ['All', 'Web Development', 'WordPress', 'eCommerce', 'APIs', 'Optimization', 'AI'];

const addOnsList = [
  { id: 'page', label: 'Additional Page', price: 50 },
  { id: 'dashboard', label: 'Admin Dashboard', price: 150 },
  { id: 'gateway', label: 'Payment Gateway Integration', price: 100 },
  { id: 'auth', label: 'Advanced Authentication', price: 100 },
  { id: 'deploy', label: 'Priority Cloud Deployment', price: 50 },
  { id: 'seo', label: 'Technical SEO Optimization', price: 100 },
  { id: 'support', label: '30 Days Extended Support', price: 100 },
];

export default function ServicesSection() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeService, setActiveService] = useState<any>(null);
  const [checkoutItem, setCheckoutItem] = useState<{ service: any, pkg: any } | null>(null);

  // Checkout Form States
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [clientType, setClientType] = useState<'international' | 'local'>('international');
  const [localMethod, setLocalMethod] = useState<'bank' | 'jazzcash' | 'easypaisa'>('bank');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    country: 'Pakistan',
    projectTitle: '',
    projectDesc: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const filteredServices = selectedCategory === 'All' 
    ? servicesData 
    : servicesData.filter(s => s.category === selectedCategory);

  const basePriceNum = checkoutItem ? parseInt(checkoutItem.pkg.price.replace(/[^0-9]/g, '')) || 299 : 0;
  const addonsTotal = selectedAddons.reduce((sum, addOnId) => {
    const found = addOnsList.find(a => a.id === addOnId);
    return sum + (found ? found.price : 0);
  }, 0);
  const totalPrice = basePriceNum + addonsTotal;

  const handleAddonChange = (id: string) => {
    if (selectedAddons.includes(id)) {
      setSelectedAddons(selectedAddons.filter(item => item !== id));
    } else {
      setSelectedAddons([...selectedAddons, id]);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createNewOrder({
        serviceTitle: checkoutItem?.service.title,
        packageName: checkoutItem?.pkg.name,
        packagePrice: checkoutItem?.pkg.price,
        selectedAddons: selectedAddons,
        totalPrice: totalPrice,
        clientType: clientType,
        clientName: formData.fullName,
        clientEmail: formData.email,
        clientCompany: formData.company,
        clientCountry: formData.country,
        projectTitle: formData.projectTitle,
        projectDesc: formData.projectDesc,
        paymentMethod: clientType === 'local' ? localMethod : 'bank',
      });

      if (result.success) {
        setOrderSubmitted(true);
      } else {
        alert('Something went wrong saving the order. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting order: ', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <section id="services" className="py-20 px-4 max-w-6xl mx-auto w-full border-t border-gray-200">
      
      {/* Heading */}
      <div className="text-center mb-12">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Professional Solutions
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-3">
          Services & Packages
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Choose a fixed-scope service package for transparent pricing and professional delivery, or select your required stack.
        </p>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map((service) => (
          <div 
            key={service.id} 
            className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl transition-all group"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {service.category}
                </span>
                <span className="text-base font-bold text-gray-900">
                  From <span className="text-blue-600">{service.price}</span>
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {service.description}
              </p>

              {/* Includes checklist */}
              <div className="space-y-2 mb-6 border-t border-gray-100 pt-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">What&apos;s Included:</p>
                {service.includes.slice(0, 4).map((inc, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                    <span className="text-blue-600 font-bold">✓</span> {inc}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-4 mb-4">
                <span>⏱️ {service.delivery}</span>
                <span>🔄 {service.revisions}</span>
              </div>

              <button 
                onClick={() => setActiveService(service)}
                className="w-full py-3 bg-gray-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-gray-200 hover:border-blue-600 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>View Packages & Pricing →</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- PACKAGES MODAL --- */}
      {activeService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* Sticky Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {activeService.category} Package Selection
                </span>
                <h3 className="text-lg font-extrabold text-gray-900">
                  {activeService.title}
                </h3>
              </div>
              <button 
                onClick={() => setActiveService(null)}
                className="text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <p className="text-gray-600 text-sm">{activeService.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeService.packages.map((pkg: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`bg-gray-50 border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                      idx === 1 ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg relative bg-white' : 'border-gray-200'
                    }`}
                  >
                    {idx === 1 && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Most Popular
                      </span>
                    )}

                    <div>
                      <h4 className="font-bold text-lg text-gray-900 mb-1">{pkg.name}</h4>
                      <div className="text-2xl font-black text-blue-600 mb-4">{pkg.price}</div>
                      <p className="text-gray-600 text-xs leading-relaxed mb-6">{pkg.desc}</p>
                    </div>

                    <button 
                      onClick={() => {
                        const currentService = activeService;
                        setActiveService(null);
                        setCheckoutItem({ service: currentService, pkg: pkg });
                        setSelectedAddons([]);
                        setOrderSubmitted(false);
                      }}
                      className={`w-full py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-sm ${
                        idx === 1 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-white hover:bg-gray-100 text-blue-600 border border-gray-200'
                      }`}
                    >
                      Buy Now
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-4">
                ✓ Secure Bank Transfer / IBAN Payment • Milestone Support • Professional Communication
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- CHECKOUT & BANK TRANSFER MODAL --- */}
      {checkoutItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            
            {orderSubmitted ? (
              <div className="p-8 text-center my-auto">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 font-bold">
                  ✓
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Saved to Database!</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Thank you, <span className="text-gray-900 font-semibold">{formData.fullName}</span>. Your order has been successfully saved in Firebase. We will verify your bank transfer soon.
                </p>
                <button 
                  onClick={() => setCheckoutItem(null)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Close & Return to Portfolio
                </button>
              </div>
            ) : (
              <>
                {/* Sticky Header with Back and Close */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
                  <button
                    onClick={() => {
                      const currentService = checkoutItem.service;
                      setCheckoutItem(null);
                      setActiveService(currentService);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-all cursor-pointer border border-blue-100"
                  >
                    <span>←</span> Back to Packages
                  </button>

                  <button 
                    onClick={() => setCheckoutItem(null)}
                    className="text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Scrollable Form Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Secure Checkout</span>
                    <h2 className="text-2xl font-extrabold text-gray-900 mt-1 mb-2">Complete Your Project Order</h2>
                  </div>

                  <form onSubmit={handleSubmitOrder} id="checkout-form" className="space-y-6">
                    
                    {/* Summary */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <span className="text-xs text-blue-600 font-bold uppercase">{checkoutItem.service.title}</span>
                        <h4 className="text-lg font-bold text-gray-900">{checkoutItem.pkg.name} Package</h4>
                        <p className="text-xs text-gray-500">{checkoutItem.pkg.desc}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Total Investment</span>
                        <span className="text-2xl font-black text-blue-600">${totalPrice}</span>
                      </div>
                    </div>

                    {/* Add-ons */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Optional Add-ons</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {addOnsList.map(addon => (
                          <label 
                            key={addon.id} 
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedAddons.includes(addon.id) 
                                ? 'bg-blue-50/50 border-blue-500 text-gray-900 shadow-sm' 
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-xs">
                              <input 
                                type="checkbox" 
                                checked={selectedAddons.includes(addon.id)}
                                onChange={() => handleAddonChange(addon.id)}
                                className="rounded accent-blue-600"
                              />
                              <span>{addon.label}</span>
                            </div>
                            <span className="text-xs font-bold text-blue-600">+${addon.price}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.fullName}
                          onChange={e => setFormData({...formData, fullName: e.target.value})}
                          placeholder="John Doe"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Email Address *</label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          placeholder="john@example.com"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Company / Business Name</label>
                        <input 
                          type="text" 
                          value={formData.company}
                          onChange={e => setFormData({...formData, company: e.target.value})}
                          placeholder="My Business Ltd."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Country *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.country}
                          onChange={e => setFormData({...formData, country: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Project Title / Brief Idea *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.projectTitle}
                          onChange={e => setFormData({...formData, projectTitle: e.target.value})}
                          placeholder="e.g. Modern E-commerce Store for Clothing Brand"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Project Description & Requirements *</label>
                        <textarea 
                          required
                          rows={3}
                          value={formData.projectDesc}
                          onChange={e => setFormData({...formData, projectDesc: e.target.value})}
                          placeholder="Describe your goals, pages needed, or features required..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-blue-500 outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Payment Region Selection & Details */}
                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Select Client Region for Payment</label>
                      
                      {/* Region Selector Tabs */}
                      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setClientType('international')}
                          className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            clientType === 'international' 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          🌍 International Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setClientType('local')}
                          className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            clientType === 'local' 
                              ? 'bg-white text-emerald-600 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          🇵🇰 Pakistani Client
                        </button>
                      </div>

                      <p className="text-xs text-gray-600">
                        Please transfer <span className="text-blue-600 font-bold">${totalPrice} USD</span> {clientType === 'local' ? '(or equivalent PKR)' : ''} using the details below:
                      </p>

                      {/* Conditional Display based on Client Selection */}
                      {clientType === 'international' ? (
                        <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-2">
                          <h4 className="font-bold text-blue-700 text-xs flex items-center gap-2">
                            <span>🌍</span> International Wire Transfer (IBAN)
                          </h4>
                          <div className="bg-white border border-blue-100 rounded-xl p-3 text-xs space-y-1 text-gray-700 font-mono">
                            <div><span className="text-gray-400">Bank Name:</span> Allied Bank</div>
                            <div><span className="text-gray-400">Account Title:</span> Muhammad Mohsin Shahzad</div>
                            <div><span className="text-gray-400">IBAN:</span> PK84ABPA0020124776820014</div>
                            <div><span className="text-gray-400">SWIFT Code:</span> PK84ABPA</div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3">
  <h4 className="font-bold text-emerald-700 text-xs flex items-center gap-2">
    <span>🇵🇰</span> Local Payment Methods
  </h4>
  
  {/* Local Methods Sub-Tabs */}
  <div className="grid grid-cols-3 gap-1 bg-emerald-100/60 p-1 rounded-xl">
    <button
      type="button"
      onClick={() => setLocalMethod('bank')}
      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
        localMethod === 'bank' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      Bank Transfer
    </button>
    <button
      type="button"
      onClick={() => setLocalMethod('jazzcash')}
      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
        localMethod === 'jazzcash' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      JazzCash
    </button>
    <button
      type="button"
      onClick={() => setLocalMethod('easypaisa')}
      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
        localMethod === 'easypaisa' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      EasyPaisa
    </button>
  </div>

  {/* Dynamic View based on selected local method */}
  {localMethod === 'bank' && (
    <div className="bg-white border border-emerald-100 rounded-xl p-3 text-xs space-y-1 text-gray-700 font-mono">
      <div><span className="text-gray-400">Bank Name:</span> Allied Bank</div>
      <div><span className="text-gray-400">Account Number:</span> 0020124776820014</div>
      <div><span className="text-gray-400">Account Title:</span> Muhammad Mohsin Shahzad</div>
    </div>
  )}

  {localMethod === 'jazzcash' && (
    <div className="bg-white border border-emerald-100 rounded-xl p-3 text-xs text-gray-700">
      <p className="font-bold text-red-600 mb-1">JazzCash Account Details</p>
      <p className="font-mono"><strong>Number:</strong> 0303-4051879</p>
      <p className="font-mono text-gray-500">Name: Muhammad Mohsin Shahzad</p>
    </div>
  )}
{localMethod === 'easypaisa' && (
                            <div className="bg-white border border-emerald-100 rounded-xl p-3 text-xs text-gray-700">
                              <p className="font-bold text-green-600 mb-1">EasyPaisa Account Details</p>
                              <p className="font-mono"><strong>Number:</strong> 0346-4301992</p>
                              <p className="font-mono text-gray-500">Name: Muhammad Mohsin Shahzad</p>
                            </div>
                          )}
                        </div>

                      )} 
                    </div>

                  </form>
                </div>

                {/* Sticky Footer with Submit Button */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 backdrop-blur z-10 shrink-0">
                  <button 
                    type="submit"
                    form="checkout-form"
                    disabled={loading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span> Submitting Order...
                      </>
                    ) : (
                      <>
                        <span>Submit Order & Save to Database</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </section>
  );
}