import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  
  const BASIC_GENRES = ['All', 'Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'History', 'Drama', 'Fantasy'];

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (selectedGenre === 'All') {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(books.filter(book => {
        const bookGenre = (book.genre || 'General').toLowerCase();
        const target = selectedGenre.toLowerCase();
        if (target === 'sci-fi') return bookGenre.includes('science') || bookGenre.includes('sci-fi');
        return bookGenre.includes(target);
      }));
    }
  }, [selectedGenre, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://127.0.0.1:8000/books/');
      setBooks(res.data);
      setFilteredBooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.post('http://127.0.0.1:8000/upload-books/');
      if (res.data.status === 'success') {
        alert(res.data.message);
      } else {
        alert('Partial success: ' + res.data.message);
      }
      fetchBooks();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      alert('Upload failed: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#1A1A1E]">
      {/* Sidebar */}
      <aside className="w-56 bg-[#1A1A1E] border-r border-gray-800 p-6 hidden lg:block sticky top-0 h-screen overflow-y-auto shrink-0">
        <h2 className="text-gray-500 font-black tracking-[0.2em] text-[10px] uppercase mb-6">Genres</h2>
        <div className="space-y-1">
          {BASIC_GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                selectedGenre === genre 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow p-6 lg:p-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">
              Explore <span className="text-indigo-500">Collection</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Showing {filteredBooks.length} curated titles {selectedGenre !== 'All' ? `in ${selectedGenre}` : ''}.
            </p>
          </div>
          
          <button 
            onClick={uploadBooks}
            disabled={loading}
            className="group relative inline-flex items-center gap-2 bg-white text-black font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:bg-gray-800 disabled:text-gray-600 text-sm"
          >
            {loading ? 'Syncing...' : 'Refresh Library'}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-[#232328] rounded-2xl p-4 animate-pulse">
                <div className="aspect-[2/3] bg-gray-800 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[2rem] border-2 border-dashed border-gray-800">
            <div className="text-5xl mb-6">🔍</div>
            <p className="text-xl font-bold text-white">No books found</p>
            <p className="text-gray-500 mt-2">Try selecting a different genre</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {filteredBooks.map(book => (
              <div key={book.id} className="group bg-[#232328] rounded-2xl p-4 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 border border-transparent hover:border-gray-800 flex flex-col h-full hover:scale-[1.02]">
                <div className="relative aspect-[2/3] bg-gray-800 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                  <img 
                    src={book.image_url || 'https://via.placeholder.com/300x450?text=No+Cover'} 
                    alt={book.title} 
                    className="w-full h-full object-contain p-2"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x450?text=No+Cover';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <Link 
                      to={`/book/${book.id}`}
                      className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-center text-xs shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                
                <div className="px-1 flex-grow flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2 py-0.5 text-[8px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 rounded">
                      {book.genre || 'General'}
                    </span>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                      <span className="text-[11px] font-black text-gray-400 ml-0.5">{book.rating || '4.0'}</span>
                    </div>
                  </div>
                  
                  <h2 className="text-[15px] font-bold text-white mb-1 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
                    {book.title}
                  </h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">
                    {(!book.author || book.author === 'Unknown') ? 'Unknown Author' : book.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
