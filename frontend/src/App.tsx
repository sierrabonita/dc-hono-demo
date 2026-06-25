import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Toaster } from '@/components/Toaster';
import Admin from '@/pages/admin';
import Home from '@/pages/home';
import Login from '@/pages/login';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<AuthLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
};

export default App;
