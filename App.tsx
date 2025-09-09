
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CpuPage from './pages/CpuPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import AvitoPage from './pages/AvitoPage';
import MotherboardPage from './pages/MotherboardPage'; // Import Motherboard page
import RamPage from './pages/RamPage'; // Import RAM page
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<CpuPage />} />
              <Route path="/motherboards" element={<MotherboardPage />} /> {/* Add Motherboard route */}
              <Route path="/ram" element={<RamPage />} /> {/* Add RAM route */}
              <Route path="/avito" element={<AvitoPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/cart" element={<CartPage />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
