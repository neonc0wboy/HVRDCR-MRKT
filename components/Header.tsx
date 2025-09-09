import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
      `text-sm font-medium transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-300 hover:text-white'}`;


    return (
        <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
            <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <NavLink to="/" className="text-xl font-bold text-white">HVRDCR MARKET</NavLink>
                    <a> <img alt="Logo" src="/favicons/logo.png" style="max-width: auto; height: auto;"></img></a>
                    <div className="hidden md:flex items-center gap-4">
                        <NavLink to="/" className={navLinkClasses}>CPU</NavLink>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <NavLink to="/cart" className="relative text-gray-300 hover:text-white transition-colors">
                        <CartIcon />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </NavLink>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
                            <button onClick={handleLogout} className="text-sm font-medium text-gray-300 hover:text-white">Выйти</button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <NavLink to="/login" className={navLinkClasses}>Войти</NavLink>
                            <NavLink to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
                                Регистрация
                            </NavLink>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;