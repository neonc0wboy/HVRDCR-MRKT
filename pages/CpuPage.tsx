import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchCpus } from '../services/googleSheetsService';
import type { Cpu } from '../types';
import Spinner from '../components/Spinner';
import { useCart } from '../contexts/CartContext';

// Define the shape of our filters
interface Filters {
  manufacturer: 'all' | 'AMD';
  type: 'all' | 'desktop' | 'server';
}

// A new component for filter dropdowns
const FilterControls: React.FC<{ filters: Filters; onFilterChange: (newFilters: Filters) => void; }> = ({ filters, onFilterChange }) => {
    // A single handler for any select change
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Update the filters object with the new value
        onFilterChange({ ...filters, [name]: value as Filters[keyof Filters] });
    };

    return (
        <div className="bg-gray-800/60 p-4 rounded-lg mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
            <h3 className="text-lg font-semibold mr-4 shrink-0">Фильтры</h3>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                {/* Manufacturer Dropdown */}
                <div className="w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="manufacturer-filter" className="block text-sm font-medium text-gray-300 mb-1">Производитель</label>
                    <select
                        id="manufacturer-filter"
                        name="manufacturer"
                        value={filters.manufacturer}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Фильтр по производителю"
                    >
                        <option value="all">Все</option>
                        <option value="AMD">AMD</option>
                    </select>
                </div>
                {/* CPU Type Dropdown */}
                <div className="w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="type-filter" className="block text-sm font-medium text-gray-300 mb-1">Тип</label>
                    <select
                        id="type-filter"
                        name="type"
                        value={filters.type}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Фильтр по типу процессора"
                    >
                        <option value="all">Все</option>
                        <option value="desktop">Десктопные</option>
                        <option value="server">Серверные</option>
                    </select>
                </div>
            </div>
        </div>
    );
};


// The table component remains unchanged
const CpuTable: React.FC<{ cpus: Cpu[]; onAddToCart: (cpu: Cpu) => void; }> = ({ cpus, onAddToCart }) => (
    <div className="overflow-x-auto bg-gray-800/60 rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Наименование</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Сокет</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Цена за шт.</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Действие</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
                {cpus.map(cpu => (
                    <tr key={cpu.id} className="hover:bg-gray-700/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{cpu.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{cpu.socket}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(cpu.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button onClick={() => onAddToCart(cpu)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105">
                                В корзину
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const CpuPage: React.FC = () => {
  const [allCpus, setAllCpus] = useState<Cpu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ manufacturer: 'all', type: 'all' });
  const [notification, setNotification] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const location = useLocation();

  // Effect to fetch CPU data
  useEffect(() => {
    const loadCpus = async () => {
      try {
        setLoading(true);
        setError(null);
        const cpus = await fetchCpus();
        setAllCpus(cpus);
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
    loadCpus();
  }, []);
  
  // Effect to handle notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Effect to show order success notification from navigation state
  useEffect(() => {
    if (location.state?.orderSuccess) {
      setNotification('Ваш заказ успешно оформлен! Уведомление отправлено.');
      // Clean up location state to prevent message from re-appearing on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);


  const filteredCpus = useMemo(() => {
    return allCpus.filter(cpu => {
      const manufacturerMatch = filters.manufacturer === 'all' || cpu.manufacturer === filters.manufacturer;
      const typeMatch = filters.type === 'all' ||
                       (filters.type === 'server' && cpu.isServer) ||
                       (filters.type === 'desktop' && !cpu.isServer);
      return manufacturerMatch && typeMatch;
    });
  }, [allCpus, filters]);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleAddToCart = (cpu: Cpu) => {
    addToCart(cpu);
    setNotification(`${cpu.name} добавлен в корзину!`);
  };


  return (
    <div className="space-y-6">
       {notification && (
            <div className="fixed top-20 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-20">
                {notification}
            </div>
        )}
      <h1 className="text-3xl font-bold tracking-tight text-white">Каталог процессоров</h1>
      <FilterControls filters={filters} onFilterChange={handleFilterChange} />
      
      {loading && <Spinner />}
      
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Ошибка! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && filteredCpus.length > 0 && (
          <CpuTable cpus={filteredCpus} onAddToCart={handleAddToCart} />
      )}
      
      {!loading && !error && filteredCpus.length === 0 && allCpus.length > 0 && (
          <div className="text-center py-10 bg-gray-800/60 rounded-lg">
              <p className="text-gray-400">По вашему запросу ничего не найдено.</p>
          </div>
      )}
    </div>
  );
};

export default CpuPage;