import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const userQuery = message.toLowerCase();

    const apiKey = process.env.GROQ_API_KEY;

    // Smart Local Fallback Response Generator (Guarantees 100% uptime)
    const getLocalReply = (query: string) => {
      if (query.includes('tech') || query.includes('stack') || query.includes('skills') || query.includes('language')) {
        return "Mohsin's tech stack includes Next.js, React, TypeScript, Tailwind CSS, Python FastAPI, Node.js, PostgreSQL, MongoDB, Firebase, and Gemini API.";
      }
      if (query.includes('project') || query.includes('clinic') || query.includes('pharmacy') || query.includes('saas')) {
        return "Mohsin's featured projects include Smart Clinic ERP, Pharmacy Management System, AI-Powered Freelancer Assistant, Modern SaaS Dashboard, and eCommerce Platforms.";
      }
      if (query.includes('location') || query.includes('where') || query.includes('pakistan')) {
        return "Mohsin is based in Kabirwala, District Khanewal, Pakistan, and works with international clients remotely.";
      }
      if (query.includes('hire') || query.includes('contact') || query.includes('available') || query.includes('freelance')) {
        return "Yes! Mohsin is available for freelance projects and full-time roles. You can reach out directly using the contact form on this website.";
      }
      if (query.includes('wordpress') || query.includes('ecommerce') || query.includes('woocommerce')) {
        return "Yes, Mohsin also builds custom WordPress, Elementor, and WooCommerce websites alongside full-stack web applications.";
      }
      return "Mohsin is an expert Full Stack & AI Developer specializing in Next.js, Python, and AI integrations. Feel free to ask about his skills, projects, or how to hire him!";
    };

    if (!apiKey) {
      return NextResponse.json({ reply: getLocalReply(userQuery) });
    }

    const systemPrompt = `You are an intelligent AI assistant for Muhammad Mohsin Shahzad's professional portfolio website. 
    Mohsin is an expert Full Stack & AI Developer based in Kabirwala, District Khanewal, Pakistan.
    
    His Technical Expertise:
    - Frontend: Next.js, React, TypeScript, Tailwind CSS, HTML5, CSS3, PWA, Responsive Design.
    - Backend & APIs: Node.js, Express.js, Python, FastAPI, RESTful APIs, JWT, RBAC.
    - Databases & ORM: PostgreSQL, MongoDB, Supabase, Prisma ORM.
    - AI & Other: Gemini API, Groq, Custom AI Tools, WordPress, Elementor, WooCommerce, DevOps (Git, Vercel).
    
    His Featured Projects:
    1. Smart Clinic ERP
    2. Pharmacy Management System
    3. AI-Powered Freelancer Assistant
    4. Modern SaaS Dashboard
    5. eCommerce Platform
    6. Business Management System

    Answer visitor inquiries professionally, concisely, and warmly.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.2-3b-preview', // Current stable lightweight model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('Groq API fallback triggered due to:', data?.error?.message);
      return NextResponse.json({ reply: getLocalReply(userQuery) });
    }

    const reply = data.choices?.[0]?.message?.content || getLocalReply(userQuery);
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      reply: "Mohsin is an expert Full Stack & AI Developer. Feel free to explore his projects and contact him directly!" 
    });
  }
}