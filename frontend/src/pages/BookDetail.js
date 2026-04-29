import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, recRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/books/${id}/`),
          axios.get(`http://127.0.0.1:8000/books/recommend/${id}/`)
        ]);
        setBook(bookRes.data);
        setRecommendations(recRes.data.recommendations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (!book) return <div className="text-center p-10 text-red-500">Book not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold mb-8 group transition-colors">
        <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Back to Library
      </Link>
      
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="md:flex">
          {/* Book Cover Placeholder */}
          <div className="md:w-1/3 bg-indigo-50 flex items-center justify-center p-12 text-9xl">
            📖
          </div>
          
          <div className="md:w-2/3 p-8 md:p-12">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2 leading-tight">{book.title}</h1>
                <p className="text-xl text-gray-500 italic">by {book.author === 'Unknown' ? 'Anonymous' : book.author}</p>
              </div>
              <div className="bg-yellow-50 px-4 py-2 rounded-2xl flex items-center shadow-sm border border-yellow-100">
                <span className="text-yellow-600 font-black text-xl mr-1">{book.rating || '4.0'}</span>
                <svg className="w-6 h-6 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <span className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-sm font-bold tracking-wide shadow-md">
                {book.genre || 'General'}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-bold tracking-wide">
                AI Verified
              </span>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-3 border-b-2 border-indigo-500 inline-block pb-1">Description</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {book.description}
                </p>
              </section>

              <section className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>
                  AI Generated Summary
                </h3>
                <p className="text-indigo-800 font-medium italic text-lg leading-relaxed">
                  "{book.summary || `An intriguing ${book.genre?.toLowerCase() || 'drama'} that captivates from the first page.`}"
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-4 border-b-2 border-indigo-500 inline-block pb-1">You Might Also Like</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec, index) => (
                      <div key={index} className="bg-white border-2 border-gray-50 rounded-xl p-4 hover:border-indigo-200 hover:shadow-lg transition-all cursor-default">
                        <div className="text-2xl mb-2">📚</div>
                        <p className="font-bold text-gray-900 text-sm line-clamp-2">{rec}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic col-span-3">Processing recommendations...</p>
                  )}
                </div>
              </section>
            </div>

            {book.url && (
              <div className="mt-12">
                <a 
                  href={book.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center bg-gray-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl hover:-translate-y-1"
                >
                  Get this Book
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
