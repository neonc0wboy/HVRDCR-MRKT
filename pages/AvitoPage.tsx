
import React from 'react';

const AvitoPage: React.FC = () => {
  const sellerUrl = "https://www.avito.ru/brands/a4b76430c8409b64799148aa69cc905c/all/tovary_dlya_kompyutera?page_from=from_item_card&iid=7600471472&sellerId=a4b76430c8409b64799148aa69cc905c";

  // Example items - you can replace these with dynamic data later
  const featuredItems = [
    {
      id: 1,
      name: 'Игровые ПК и комплектующие',
      description: 'Мощные процессоры, видеокарты и готовые сборки для геймеров.'
    },
    {
      id: 2,
      name: 'Серверное оборудование',
      description: 'Надежные решения для вашего бизнеса. Процессоры и компоненты для серверов.'
    },
    {
      id: 3,
      name: 'Аксессуары и периферия',
      description: 'Все необходимое для вашего компьютера: от мышей до мониторов.'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Наши объявления на Avito</h1>
        <p className="text-lg text-gray-400">
          Ознакомьтесь со всеми нашими товарами на нашей официальной странице Avito.
        </p>
      </div>

      <div className="flex justify-center">
        <a
          href={sellerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg"
        >
          Перейти в наш магазин на Avito
        </a>
      </div>

      <div className="bg-gray-800/60 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-700 pb-3">Популярные категории</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {featuredItems.map(item => (
            <div key={item.id} className="bg-gray-700/50 p-5 rounded-lg">
              <h3 className="text-xl font-bold text-indigo-400 mb-2">{item.name}</h3>
              <p className="text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvitoPage;
