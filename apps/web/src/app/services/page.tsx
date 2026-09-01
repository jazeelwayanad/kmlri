import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ServicesPage() {
  const services = [
    { name: 'Reading Room', note: 'Open to researchers, Monday to Saturday, 9:00 to 17:00.', action: 'Book a desk or room', href: '/account/bookings' },
    { name: 'Reproduction', note: 'Digital copies of catalogued items on request.', action: 'Request a scan', href: '/ask' },
    { name: 'Reference Help', note: 'Ask a librarian about sources, scripts and citations.', action: 'Ask a question', href: '/ask' },
    { name: 'Membership', note: 'Borrowing and remote access for members of the institute.', action: 'Become a member', href: '/ask' },
  ];

  const hours = [
    { day: 'Monday – Thursday', time: '9:00 – 17:00' },
    { day: 'Friday', time: '9:00 – 12:00' },
    { day: 'Saturday', time: '9:00 – 15:00' },
    { day: 'Sunday and public holidays', time: 'Closed' },
  ];

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-14 px-4 sm:px-5 pb-20">
        <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-2 sm:mb-3 uppercase font-bold">Services</p>
        <h1 className="font-amiri text-[36px] sm:text-[60px] font-bold leading-[1.05] mb-3 sm:mb-[18px] tracking-[-0.015em] max-w-[18ch]">
          Using the library
        </h1>
        <div className="double-rule"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-black border border-black border-t-0">
          {services.map((svc, idx) => (
            <div key={idx} className="bg-paper p-6 sm:p-8 md:p-9 flex flex-col gap-2 sm:gap-[10px]">
              <span className="font-amiri text-[24px] sm:text-[28px] font-semibold">{svc.name}</span>
              <span className="text-[16px] sm:text-[19px] leading-[1.5] text-heritage-body text-pretty font-sans">{svc.note}</span>
              <Link href={svc.href} className="text-[16px] sm:text-[18px] text-heritage-red font-semibold mt-1 sm:mt-[6px] hover:underline">
                {svc.action} →
              </Link>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-11 pt-8 sm:pt-[50px]">
          <div>
            <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-3 sm:mb-4 uppercase font-bold">Opening hours</p>
            <table className="w-full border-collapse text-[16px] sm:text-[19px]">
              <tbody>
                {hours.map((h, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 sm:py-[11px] border-b border-[#D6CCBC]">{h.day}</td>
                    <td className="py-2.5 sm:py-[11px] border-b border-[#D6CCBC] text-right text-heritage-body font-sans">{h.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-3 sm:mb-4 uppercase font-bold">Before you visit</p>
            <ul className="m-0 pl-5 text-[16px] sm:text-[19px] leading-[1.6] text-heritage-body list-disc font-sans">
              <li>Bring photo identification for an institutional day pass.</li>
              <li>Manuscripts are consulted in the supervised Rare Reading Room only.</li>
              <li>Request items at least one working day ahead of arrival.</li>
              <li>Pencils and phone cameras without flash are permitted for private research.</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
