import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BookDetail from './pages/BookDetail';
import QAInterface from './pages/QAInterface';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/qa" element={<QAInterface />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
