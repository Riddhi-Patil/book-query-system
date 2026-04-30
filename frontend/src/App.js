import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import BookDetail from './pages/BookDetail';
import Dashboard from './pages/Dashboard';
import QAInterface from './pages/QAInterface';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="pb-20">
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
