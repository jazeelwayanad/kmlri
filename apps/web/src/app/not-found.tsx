import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F3F3F1] flex flex-col items-center justify-center p-6 text-center font-sans text-[rgb(20,20,20)]">
      <h1 className="font-amiri text-6xl font-bold text-black mb-2">404</h1>
      <h2 className="text-xl font-semibold mb-3">Page Not Found</h2>
      <p className="text-sm text-gray-600 max-w-md mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#A52307] text-white rounded font-medium hover:bg-red-700 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
