import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProfessionalProfile from './pages/ProfessionalProfile';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm relative pb-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/professional/:id" element={<ProfessionalProfile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
