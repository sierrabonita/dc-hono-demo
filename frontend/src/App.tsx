import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from '@/pages/home';
import Login from '@/pages/login';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
