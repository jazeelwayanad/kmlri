'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.subscribeNewsletter(email);
      setFeedback(res.message || 'Thank you — please confirm from the email we just sent.');
      setEmail('');
    } catch (err: any) {
      setFeedback('Thank you for subscribing.');
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="text-center py-10 sm:py-[67px] px-4 sm:px-5 font-amiri max-w-[1100px] mx-auto">
      <h2 className="text-[36px] sm:text-[50px] font-bold leading-none mb-4 sm:mb-[33px] text-black">
        E-Newsletter
      </h2>
      <p className="text-[17px] sm:text-[20px] leading-relaxed text-black max-w-[542px] mx-auto mb-6 sm:mb-[33px]">
        Sign up for our monthly e-newsletter for updates, newly digitized manuscripts, and codicological highlights.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full max-w-[440px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            aria-label="Email for newsletter"
            className="border-[1.5px] border-black bg-transparent h-[44px] px-4 text-[16px] sm:text-[17px] outline-none rounded-full flex-1 w-full"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-paper border-none w-full sm:w-[154px] h-[44px] rounded-[59px] font-amiri text-[16px] font-bold cursor-pointer hover:bg-heritage-red hover:text-white  transition-colors disabled:opacity-50"
          >
            {loading ? '...' : 'SUBSCRIBE'}
          </button>
        </div>
        {feedback && (
          <p className="text-[15px] sm:text-[17px] text-heritage-red font-semibold min-h-[24px]">
            {feedback}
          </p>
        )}
      </form>
    </section>
  );
}
