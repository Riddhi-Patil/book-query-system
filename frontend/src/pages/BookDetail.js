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
        setLoading(true);
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center">
        <div className="bg-[#232328] p-8 rounded-[2rem] shadow-2xl flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-white font-bold">Analyzing Book...</p>
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="min-h-screen bg-[#1A1A1E] text-white animate-in fade-in duration-500">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-indigo-400 font-bold mb-12 group transition-all">
          <div className="bg-white/5 group-hover:bg-indigo-500/10 p-2 rounded-xl mr-3 transition-colors border border-white/5">
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </div>
          Back to Collection
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left: Book Visual */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 max-w-[380px] mx-auto">
            <div className="relative aspect-[2/3] bg-[#232328] rounded-[2rem] shadow-2xl shadow-black/50 overflow-hidden flex items-center justify-center group border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent z-10"></div>
              <img 
                src={book.image_url || 'https://via.placeholder.com/600x800?text=No+Cover'} 
                alt={book.title} 
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-1000 z-0"
              />
              
              {/* Rating Badge */}
              <div className="absolute top-6 right-6 z-20">
                <div className="bg-[#1A1A1E]/80 backdrop-blur-xl px-4 py-2 rounded-xl shadow-2xl flex items-center gap-1.5 border border-white/10">
                  <span className="text-lg font-black text-white">{book.rating || '4.0'}</span>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {book.url && (
              <a 
                href={book.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-8 w-full flex items-center justify-center gap-3 bg-white hover:bg-indigo-600 text-black hover:text-white py-4 rounded-2xl font-black text-base transition-all shadow-2xl hover:-translate-y-1 active:scale-95 group border border-transparent"
              >
                <span>Acquire Full Copy</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Right: Content */}
        <div className="lg:col-span-8 space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[9px] font-black tracking-[0.2em] uppercase border border-indigo-500/20">
                {book.genre || 'General'}
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-500 text-[9px] font-black tracking-[0.2em] uppercase border border-white/5">
                AI Analyzed
              </span>
            </div>
            <h1 className="text-5xl font-black text-white leading-tight mb-4 tracking-tighter">
              {book.title}
            </h1>
            <p className="text-xl text-gray-500 font-medium italic">
              by <span className="text-gray-300 font-bold not-italic">{(!book.author || book.author === 'Unknown Author') ? 'Unknown Author' : book.author}</span>
            </p>
          </div>

          <div className="h-px bg-white/5 w-full"></div>

          <div className="space-y-10">
            <section>
              <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-4">Original Synopsis</h3>
              <p className="text-lg text-gray-400 leading-relaxed font-medium">
                {book.description}
              </p>
            </section>

            <section className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-[2rem] opacity-50 group-hover:opacity-100 transition-opacity -z-10 border border-white/5"></div>
              <div className="p-2">
                <h3 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                  AI Intelligence Summary
                </h3>
                <p className="text-2xl text-indigo-100 font-black italic leading-tight tracking-tight">
                  "{book.summary || `An intriguing ${book.genre?.toLowerCase() || 'drama'} that captivates from the first page.`}"
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-6">Related Intelligence</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, index) => (
                    <div key={index} className="group/rec bg-[#232328] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all cursor-default">
                      <div className="w-8 h-8 bg-white/5 group-hover/rec:bg-indigo-500/20 rounded-lg flex items-center justify-center text-lg mb-3 transition-colors">📚</div>
                      <p className="font-bold text-gray-300 text-sm leading-tight group-hover/rec:text-white transition-colors">{rec}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-10 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-gray-600 font-bold text-[9px] uppercase tracking-[0.3em]">Processing neural recommendations...</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default BookDetail;
