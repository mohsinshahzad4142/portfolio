'use client';
import { useState } from 'react';

const faqs = [
  {
    question: "How do you start a new project?",
    answer: "We start with a discovery chat or a detailed message about your requirements, goals, and timeline. Once aligned, I share a clear roadmap, proposal, and tech stack blueprint before diving into development."
  },
  {
    question: "What technologies do you specialize in?",
    answer: "I specialize in modern full-stack web development using React, Next.js, TypeScript, Tailwind CSS, Python FastAPI, Firebase, and AI APIs like Gemini for intelligent features."
  },
  {
    question: "Do you work with international clients?",
    answer: "Yes! I regularly collaborate with international clients worldwide via direct contracts, Upwork, Fiverr, and PeoplePerHour, ensuring smooth communication across time zones."
  },
  {
    question: "How long does a typical project take?",
    answer: "Project timelines depend on complexity. A landing page or MVP prototype might take 3–7 days, while a full-stack SaaS web application or custom ERP system typically takes 2–4 weeks."
  },
  {
    question: "Do you provide post-launch support and maintenance?",
    answer: "Absolutely. I provide bug fixes, performance optimizations, and feature expansions post-launch to ensure your web application runs seamlessly."
  },
  {
    question: "Can you work with an existing codebase or application?",
    answer: "Yes, I can audit, refactor, optimize performance, or add new features to your existing React, Next.js, or full-stack codebase."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 border-t border-gray-100 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600">
            Got questions? Here are answers to some of the most common things clients ask before starting a project.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="border border-gray-200 rounded-2xl overflow-hidden transition-all bg-gray-50/50 hover:border-blue-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left font-semibold text-gray-900 flex justify-between items-center gap-4 focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <span className={`w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 bg-blue-50 border-blue-200' : ''}`}>
                    ↓
                  </span>
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}