'use client';

import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AskLibrarianPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-14 px-4 sm:px-5 pb-20">
        <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-2 sm:mb-3 uppercase font-bold">Reference help</p>
        <h1 className="font-amiri text-[36px] sm:text-[60px] font-bold leading-[1.05] mb-3 sm:mb-[18px] tracking-[-0.015em] max-w-[18ch]">
          Ask a Librarian
        </h1>
        <p className="text-[17px] sm:text-[21px] leading-[1.5] text-heritage-body max-w-[60ch] mb-6 sm:mb-[30px] text-pretty font-sans">
          Questions about sources, scripts, citations or how to reach an item. We reply within two working days.
        </p>
        <div className="double-rule mb-6 sm:mb-[34px]"></div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-[30px] gap-y-4 sm:gap-y-6 font-sans">
          <label className="flex flex-col gap-1.5">
            <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase font-bold">Your name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Rashid Ahmad"
              className="border-[1.5px] border-black bg-white h-11 sm:h-12 px-3 sm:px-[14px] text-sm sm:text-base outline-none rounded"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase font-bold">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rashid@univ.edu"
              className="border-[1.5px] border-black bg-white h-11 sm:h-12 px-3 sm:px-[14px] text-sm sm:text-base outline-none rounded"
            />
          </label>
          <label className="flex flex-col gap-1.5 col-span-full">
            <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase font-bold">Your question / Shelfmark reference</span>
            <textarea
              rows={5}
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Specify the codex title, folio number, or research topic..."
              className="border-[1.5px] border-black bg-white p-3 text-sm sm:text-base outline-none rounded font-sans resize-y"
            ></textarea>
          </label>
          <div className="col-span-full flex items-center gap-4 flex-wrap pt-2">
            <button
              type="submit"
              className="bg-black text-paper border-none h-[46px] sm:h-[50px] px-6 sm:px-[38px] rounded-full font-amiri text-[17px] sm:text-[19px] font-bold cursor-pointer hover:bg-heritage-red hover:text-white  transition-colors"
            >
              Send question →
            </button>
            {sent && (
              <span className="text-[15px] sm:text-[17px] text-heritage-red font-semibold bg-red-50 px-3 py-1 border border-heritage-red/30">
                Thank you — our reference desk will reply within two working days.
              </span>
            )}
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-9 pt-8 sm:pt-[52px] border-t border-gray-300 mt-8">
          <div>
            <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-1 sm:mb-2 uppercase font-bold">By phone</p>
            <p className="text-[17px] sm:text-[19px] m-0 font-sans">+91 97452 34786</p>
          </div>
          <div>
            <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-1 sm:mb-2 uppercase font-bold">By email</p>
            <p className="text-[17px] sm:text-[19px] m-0 font-sans">info@kmlri.in</p>
          </div>
          <div>
            <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-1 sm:mb-2 uppercase font-bold">In person</p>
            <p className="text-[17px] sm:text-[19px] m-0 font-sans">Reading room desk, 9:00–17:00</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
