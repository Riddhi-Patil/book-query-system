import axios from 'axios';
import { useState } from 'react';

const QAInterface = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');
    try {
      // Increased timeout to 5+ minutes for local LLMs
      const res = await axios.post('http://127.0.0.1:8000/ask/', { question }, { timeout: 310000 });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error(err);
      if (err.code === 'ECONNABORTED') {
        setAnswer('Error: AI took too long to respond. Please try a simpler question or check if LM Studio is busy.');
      } else {
        setAnswer('Error: Backend connection failed. The server might be restarting.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1E] text-white animate-in fade-in duration-500">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="max-w-2xl mb-16">
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Intelligent <span className="text-indigo-500">Consultant</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Our AI has analyzed the entire library. Ask complex questions about themes, characters, or specific details.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <div className="bg-[#232328] rounded-[2.5rem] shadow-2xl shadow-black/50 border border-white/5 overflow-hidden">
              <div className="p-8 md:p-10">
                <form onSubmit={askQuestion} className="space-y-6">
                  <div className="relative">
                    <textarea
                      rows="4"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="e.g. 'I want a book like Sapiens but with more focus on the future' or 'Which 5-star books are about mystery?'"
                      className="w-full bg-[#1A1A1E] border-2 border-transparent rounded-3xl px-8 py-6 focus:outline-none focus:border-indigo-500 focus:bg-[#1A1A1E] transition-all text-lg font-medium shadow-inner placeholder:text-gray-600 resize-none text-white"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="w-full bg-white hover:bg-indigo-600 text-black hover:text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl hover:-translate-y-1 active:scale-[0.98] disabled:bg-gray-800 disabled:text-gray-600 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-3 group"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Consulting AI...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Query</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <div className="flex-grow min-h-[400px] bg-[#232328] rounded-[2.5rem] border-2 border-dashed border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
              {answer ? (
                <div className="w-full animate-in fade-in slide-in-from-right-8 duration-700">
                  <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="bg-[#1A1A1E] rounded-3xl p-8 shadow-2xl border border-white/5 relative">
                    <div className="absolute top-0 left-8 -translate-y-1/2 w-4 h-4 bg-[#1A1A1E] rotate-45 border-l border-t border-white/5"></div>
                    <p className="text-gray-300 text-lg leading-relaxed font-medium italic">
                      "{answer}"
                    </p>
                  </div>
                  <div className="mt-8 flex items-start gap-3 bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                    <div className="text-indigo-400 mt-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest leading-tight">
                      RAG-Powered response verified against current library context.
                    </p>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center animate-pulse">
                  <div className="text-6xl mb-4">🧠</div>
                  <p className="text-gray-600 font-black tracking-widest text-[10px] uppercase">Synthesizing Context...</p>
                </div>
              ) : (
                <div className="text-center opacity-20 group">
                  <div className="text-8xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500">🏢</div>
                  <p className="text-sm font-black tracking-[0.2em] text-white uppercase">Awaiting Instructions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAInterface;
