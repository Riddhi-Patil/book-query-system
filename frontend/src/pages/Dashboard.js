import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/books/');
      setBooks(res.data);
    } catch (err) {
      console.error(err);
      if (err.message === 'Network Error') {
        alert('Backend server is down. Please wait while it restarts...');
      }
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Book Discovery</h1>
          <p className="text-gray-600 mt-2">Explore our collection of AI-analyzed books.</p>
        </div>
        <button 
          onClick={uploadBooks}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-full shadow-lg transform transition hover:-translate-y-1 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Scrape & Update Library'
          )}
        </button>
      </div>

      {loading && books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-bounce text-6xl mb-4">📚</div>
          <p className="text-xl text-gray-500 font-medium">Fetching books...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {books.map(book => (
            <div key={book.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
              <div className="relative h-48 bg-indigo-100 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                📖
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full">
                    {book.genre || 'General'}
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <span className="text-sm font-bold ml-1">{book.rating || '4.0'}</span>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{book.title}</h2>
                <p className="text-sm text-gray-500 mb-4 italic">by {book.author === 'Unknown' ? 'Anonymous' : book.author}</p>
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow">
                  {book.summary || book.description}
                </p>
                <Link 
                  to={`/book/${book.id}`}
                  className="mt-auto block w-full text-center py-3 px-4 rounded-xl bg-gray-900 text-white font-semibold hover:bg-indigo-600 transition-colors shadow-md"
                >
                  View Analysis
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
