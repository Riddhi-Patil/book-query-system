import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div className="container mx-auto px-4 h-16 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-2xl group-hover:rotate-12 transition-transform">📚</span>
        <span className="text-xl font-black tracking-tighter text-indigo-600 uppercase">BookAI</span>
      </Link>
      <div className="flex gap-8">
        <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">Dashboard</Link>
        <Link to="/qa" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">Intelligent Q&A</Link>
      </div>
    </div>
  </nav>
);

export default Navbar;
