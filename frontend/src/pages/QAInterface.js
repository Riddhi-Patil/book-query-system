import axios from 'axios';
import { useState } from 'react';

const QAInterface = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Thinking...');

  const askQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');
    
    // Cycle through status messages to keep the user engaged
    const messages = ['Searching collection...', 'Reading book details...', 'Synthesizing answer...'];
    let i = 0;
    const interval = setInterval(() => {
      setStatus(messages[i % messages.length]);
      i++;
    }, 3000);

    try {
      // Increased timeout to 5+ minutes for local LLMs
      const res = await axios.post('http://127.0.0.1:8000/ask/', { question }, { timeout: 310000 });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error(err);
      if (err.code === 'ECONNABORTED') {
        setAnswer('Error: AI took too long to respond. Please check if LM Studio is busy or try a simpler question.');
      } else {
        setAnswer('Error: Backend connection failed. The server might be restarting.');
      }
    } finally {
      clearInterval(interval);
      setLoading(false);
      setStatus('Thinking...');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1E] text-white animate-in fade-in duration-500">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="max-w-2xl mb-16">
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Book <span className="text-indigo-500">Assistant</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Ask questions about the books in our library. Our AI will help you find themes, plots, or recommendations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Input */}
          <div className={`${answer ? 'lg:col-span-5' : 'lg:col-span-7'} transition-all duration-500`}>
            <div className="bg-[#232328] rounded-[2.5rem] shadow-2xl shadow-black/50 border border-white/5 overflow-hidden sticky top-32">
              <div className="p-8 md:p-10">
                <form onSubmit={askQuestion} className="space-y-6">
                  {/* Student Note: Using a standard textarea with custom styling for better UX */}
                  <div className="relative">
                    <div className="absolute top-6 left-8 text-indigo-500/50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <textarea
                      rows="6"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask me anything about the library..."
                      className="w-full bg-[#1A1A1E] border-2 border-transparent rounded-[2rem] pl-16 pr-8 py-6 focus:outline-none focus:border-indigo-500 focus:bg-[#1A1A1E] transition-all text-lg font-medium shadow-inner placeholder:text-gray-600 resize-none text-white"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      type="submit"
                      disabled={loading || !question.trim()}
                      className="flex-grow bg-white hover:bg-indigo-600 text-black hover:text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl hover:-translate-y-1 active:scale-[0.98] disabled:bg-gray-800 disabled:text-gray-600 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-3 group"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-3 border-current border-t-transparent rounded-full"></div>
                          <span>{status}</span>
                        </>
                      ) : (
                        <>
                          <span>Ask Assistant</span>
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                    
                    {answer && (
                      <button 
                        type="button"
                        onClick={() => { setQuestion(''); setAnswer(''); }}
                        className="p-5 bg-[#232328] border border-white/10 text-gray-400 hover:text-white rounded-2xl transition-all hover:bg-white/5"
                        title="Reset"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Answer */}
          <div className={`${answer ? 'lg:col-span-7' : 'lg:col-span-5'} transition-all duration-500`}>
            <div className={`min-h-[500px] bg-[#232328] rounded-[2.5rem] border-2 border-dashed border-white/5 p-8 md:p-12 flex flex-col relative overflow-hidden transition-all ${answer ? 'border-solid border-indigo-500/20' : ''}`}>
              {answer ? (
                <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-black text-lg tracking-tight">AI Response</h3>
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Library Search Results</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1E] rounded-[2rem] p-8 md:p-10 shadow-2xl border border-white/5 relative">
                    <div className="absolute top-10 -left-2 w-4 h-4 bg-[#1A1A1E] rotate-45 border-l border-b border-white/5 hidden lg:block"></div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-200 text-xl leading-[1.8] font-medium whitespace-pre-wrap">
                        {answer}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-indigo-500/5 p-6 rounded-[1.5rem] border border-indigo-500/10">
                    <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">RAG Search</p>
                      <p className="text-sm text-indigo-300/60 font-medium">This answer is based on the books currently in our database.</p>
                    </div>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex-grow flex flex-col items-center justify-center animate-pulse">
                  <div className="relative mb-8">
                    {/* Visual effect for loading state */}
                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
                    <div className="text-7xl relative">🧠</div>
                  </div>
                  <p className="text-gray-500 font-black tracking-[0.3em] text-xs uppercase mb-2">Analyzing Request</p>
                  <p className="text-indigo-500/40 font-bold text-[10px] uppercase">Searching library...</p>
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center opacity-20 group">
                  <div className="text-8xl mb-8 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110">📚</div>
                  <h4 className="text-white font-black tracking-[0.2em] uppercase text-sm mb-2">Awaiting Input</h4>
                  <p className="text-gray-500 text-xs font-bold max-w-[200px]">Enter a question to search the collection</p>
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
