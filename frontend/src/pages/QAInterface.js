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
      const res = await axios.post('http://127.0.0.1:8000/ask/', { question }, { timeout: 120000 });
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Intelligent Q&A</h1>
        <p className="text-gray-600 text-lg">Ask anything about our book library and get AI-powered insights.</p>
      </div>
      
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <form onSubmit={askQuestion} className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. 'Suggest a romantic thriller' or 'Tell me about A Light in the Attic'"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-5 pr-36 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-lg shadow-inner"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl font-bold transition-all disabled:bg-gray-400 flex items-center justify-center min-w-[120px]"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Ask AI'
              )}
            </button>
          </form>

          {answer && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-600 text-white p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI Response</h3>
              </div>
              <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100 shadow-sm">
                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg italic font-medium">
                  "{answer}"
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Answers are generated using local RAG pipeline with book context and source citations.</span>
              </div>
            </div>
          )}
          
          {!answer && !loading && (
            <div className="mt-16 text-center opacity-40">
              <div className="text-8xl mb-6">🤖</div>
              <p className="text-xl font-medium text-gray-500 tracking-wide">Ready for your questions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QAInterface;
