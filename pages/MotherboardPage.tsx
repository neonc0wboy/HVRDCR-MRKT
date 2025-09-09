
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchMoboAndRam } from '../services/googleSheetsService';
import type { Motherboard } from '../types';
import Spinner from '../components/Spinner';
import { useCart } from '../contexts/CartContext';

interface Filters {
  socket: string;
  formFactor: string;
}

const FilterControls: React.FC<{
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  socketOptions: string[];
  formFactorOptions: string[];
}> = ({ filters, onFilterChange, socketOptions, formFactorOptions }) => {
    
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value });
    };

    return (
        <div className="bg-gray-800/60 p-4 rounded-lg mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
            <h3 className="text-lg font-semibold mr-4 shrink-0">Фильтры</h3>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="socket-filter" className="block text-sm font-medium text-gray-300 mb-1">Сокет</label>
                    <select
                        id="socket-filter"
                        name="socket"
                        value={filters.socket}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Фильтр по сокету"
                    >
                        <option value="all">Все</option>
                        {socketOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="formFactor-filter" className="block text-sm font-medium text-gray-300 mb-1">Форм-фактор</label>
                    <select
                        id="formFactor-filter"
                        name="formFactor"
                        value={filters.formFactor}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Фильтр по форм-фактору"
                    >
                        <option value="all">Все</option>
                        {formFactorOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

const MotherboardTable: React.FC<{ motherboards: Motherboard[]; onAddToCart: (mobo: Motherboard) => void; }> = ({ motherboards, onAddToCart }) => (
    <div className="overflow-x-auto bg-gray-800/60 rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Наименование</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Сокет</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Форм-фактор</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Цена за шт.</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Действие</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
                {motherboards.map(mobo => (
                    <tr key={mobo.id} className="hover:bg-gray-700/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{mobo.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{mobo.socket}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{mobo.formFactor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(mobo.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button onClick={() => onAddToCart(mobo)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105">
                                В корзину
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const MotherboardPage: React.FC = () => {
  const [allMotherboards, setAllMotherboards] = useState<Motherboard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ socket: 'all', formFactor: 'all' });
  const [notification, setNotification] = useState<string | null>(null);
  
  const { addToCart } = useCart();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const { motherboards } = await fetchMoboAndRam();
        setAllMotherboards(motherboards);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Произошла неизвестная ошибка.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const socketOptions = useMemo(() => {
    const sockets = new Set(allMotherboards.map(m => m.socket));
    return Array.from(sockets).sort();
  }, [allMotherboards]);

  const formFactorOptions = useMemo(() => {
    const formFactors = new Set(allMotherboards.map(m => m.formFactor));
    return Array.from(formFactors).sort();
  }, [allMotherboards]);

  const filteredMotherboards = useMemo(() => {
    return allMotherboards.filter(mobo => {
      const socketMatch = filters.socket === 'all' || mobo.socket === filters.socket;
      const formFactorMatch = filters.formFactor === 'all' || mobo.formFactor === filters.formFactor;
      return socketMatch && formFactorMatch;
    });
  }, [allMotherboards, filters]);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleAddToCart = (mobo: Motherboard) => {
    addToCart(mobo);
    setNotification(`${mobo.name} добавлена в корзину!`);
  };

  return (
    <div className="space-y-6">
       {notification && (
            <div className="fixed top-20 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-20 animate-fade-in-out">
                {notification}
            </div>
        )}
      <h1 className="text-3xl font-bold tracking-tight text-white">Материнские платы</h1>
      <FilterControls 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        socketOptions={socketOptions}
        formFactorOptions={formFactorOptions}
      />
      
      {loading && <Spinner />}
      
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Ошибка! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && filteredMotherboards.length > 0 && (
          <MotherboardTable motherboards={filteredMotherboards} onAddToCart={handleAddToCart} />
      )}
      
      {!loading && !error && (
        (allMotherboards.length === 0 || filteredMotherboards.length === 0) && (
          <div className="text-center py-10 bg-gray-800/60 rounded-lg">
              <p className="text-gray-400">
                {allMotherboards.length === 0 ? "Товары не найдены." : "По вашему запросу ничего не найдено."}
              </p>
          </div>
        )
      )}
    </div>
  );
};

export default MotherboardPage;
