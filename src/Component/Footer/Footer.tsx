import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left */}
        <p>
          © {currentYear} <span className="text-gray-200 font-medium">Magic Lamp</span>. All rights reserved.
        </p>

        {/* Right */}
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-white transition">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-white transition">
            Terms
          </Link>
        </div>

      </div>
    </footer>
  );
}
