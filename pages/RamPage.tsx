
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchMoboAndRam } from '../services/googleSheetsService';
import type { Ram } from '../types';
import Spinner from '../components/Spinner';
import { useCart } from '../contexts/CartContext';

interface Filters {
  vendor: string;
  type: string;
  capacity: string;
}

const FilterControls: React.FC<{
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  vendorOptions: string[];
  typeOptions: string[];
  capacityOptions: string[];
}> = ({ filters, onFilterChange, vendorOptions, typeOptions, capacityOptions }) => {
    
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value });
    };

    return (
        <div className="bg-gray-800/60 p-4 rounded-lg mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
            <h3 className="text-lg font-semibold mr-4 shrink-0">Фильтры</h3>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="vendor-filter" className="block text-sm font-medium text-gray-300 mb-1">Вендор</label>
                    <select
                        id="vendor-filter"
                        name="vendor"
                        value={filters.vendor}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Фильтр по вендору"
                    >
                        <option value="all">Все</option>
                        {vendorOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="type-filter" className="block text-sm font-medium text-gray-300 mb-1">Тип</label>
                    <select
                        id="type-filter"
                        name="type"
                        value={filters.type}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Фильтр по типу"
                    >
                        <option value="all">Все</option>
                        {typeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="capacity-filter" className="block text-sm font-medium text-gray-300 mb-1">Объем</label>
                    <select
                        id="capacity-filter"
                        name="capacity"
                        value={filters.capacity}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Фильтр по объему"
                    >
                        <option value="all">Все</option>
                        {capacityOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

const RamTable: React.FC<{ ramItems: Ram[]; onAddToCart: (ram: Ram) => void; }> = ({ ramItems, onAddToCart }) => (
    <div className="overflow-x-auto bg-gray-800/60 rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Наименование</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Вендор</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Объем</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Цена за шт.</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Действие</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
                {ramItems.map(ram => (
                    <tr key={ram.id} className="hover:bg-gray-700/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{ram.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ram.vendor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ram.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ram.capacity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(ram.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button onClick={() => onAddToCart(ram)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105">
                                В корзину
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const RamPage: React.FC = () => {
  const [allRam, setAllRam] = useState<Ram[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ vendor: 'all', type: 'all', capacity: 'all' });
  const [notification, setNotification] = useState<string | null>(null);
  
  const { addToCart } = useCart();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const { ram } = await fetchMoboAndRam();
        setAllRam(ram);
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

  const vendorOptions = useMemo(() => {
    const vendors = new Set(allRam.map(r => r.vendor));
    return Array.from(vendors).sort();
  }, [allRam]);

  const typeOptions = useMemo(() => {
    const types = new Set(allRam.map(r => r.type));
    return Array.from(types).sort();
  }, [allRam]);

  const capacityOptions = useMemo(() => {
    const capacities = new Set(allRam.map(r => r.capacity));
    return Array.from(capacities).sort();
  }, [allRam]);

  const filteredRam = useMemo(() => {
    return allRam.filter(ram => {
      const vendorMatch = filters.vendor === 'all' || ram.vendor === filters.vendor;
      const typeMatch = filters.type === 'all' || ram.type === filters.type;
      const capacityMatch = filters.capacity === 'all' || ram.capacity === filters.capacity;
      return vendorMatch && typeMatch && capacityMatch;
    });
  }, [allRam, filters]);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleAddToCart = (ram: Ram) => {
    addToCart(ram);
    setNotification(`${ram.name} добавлена в корзину!`);
  };

  return (
    <div className="space-y-6">
       {notification && (
            <div className="fixed top-20 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-20 animate-fade-in-out">
                {notification}
            </div>
        )}
      <h1 className="text-3xl font-bold tracking-tight text-white">Оперативная память</h1>
      <FilterControls 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        vendorOptions={vendorOptions}
        typeOptions={typeOptions}
        capacityOptions={capacityOptions}
      />
      
      {loading && <Spinner />}
      
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Ошибка! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && filteredRam.length > 0 && (
          <RamTable ramItems={filteredRam} onAddToCart={handleAddToCart} />
      )}
      
      {!loading && !error && (
        (allRam.length === 0 || filteredRam.length === 0) && (
          <div className="text-center py-10 bg-gray-800/60 rounded-lg">
              <p className="text-gray-400">
                {allRam.length === 0 ? "Товары не найдены." : "По вашему запросу ничего не найдено."}
              </p>
          </div>
        )
      )}
    </div>
  );
};

export default RamPage;