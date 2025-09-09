
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsPlacingOrder(true);
    setError(null);

    if (typeof (window as any).emailjs === 'undefined') {
        console.error("EmailJS SDK not loaded.");
        setError("Сервис отправки почты не загружен. Пожалуйста, обновите страницу и попробуйте снова.");
        setIsPlacingOrder(false);
        return;
    }

    const SERVICE_ID = 'service_u7p7ehd';
    const TEMPLATE_ID = 'template_9ch06lb';
    const PUBLIC_KEY = 'vlqdVdsk0z-ncGfGz';

    const orderDetails = cartItems.map(item => 
        `- ${item.product.name} (x${item.quantity}): ${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(item.product.price * item.quantity)}`
    ).join('\n');

    const templateParams = {
        from_name: 'HVRDCR MARKET',
        user_email: user.email,
        email: user.email,
        order_details: orderDetails,
        total_price: new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(subtotal),
    };

    try {
      await (window as any).emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        
      clearCart();
      navigate('/', { state: { orderSuccess: true } });

    } catch (err: any) {
        console.error('FAILED TO SEND EMAIL...', err);
        const errorMessage = err.text || 'Произошла неизвестная ошибка.';
        setError(`Не удалось отправить уведомление о заказе. Ошибка: ${errorMessage}`);
    } finally {
        setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-800/60 rounded-lg">
        <h2 className="text-2xl font-semibold text-white mb-4">Ваша корзина пуста</h2>
        <p className="text-gray-400 mb-6">Самое время добавить что-нибудь интересное!</p>
        <Link
          to="/"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-md transition-colors"
        >
          К каталогу
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-white mb-8">Ваша корзина</h1>
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6" role="alert">
          <strong className="font-bold">Ошибка оформления заказа! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-800/60 p-6 rounded-lg shadow-lg space-y-4">
          {cartItems.map(item => (
            <div key={item.product.id} className="flex items-center justify-between gap-4 p-4 border-b border-gray-700 last:border-b-0">
              <div className="flex-grow">
                <p className="font-semibold text-white">{item.product.name}</p>
                <p className="text-sm text-gray-400">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(item.product.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value, 10))}
                  className="w-16 bg-gray-700 text-white text-center rounded border border-gray-600 focus:ring-2 focus:ring-indigo-500"
                  aria-label={`Количество ${item.product.name}`}
                />
                <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-300 transition-colors" aria-label={`Удалить ${item.product.name}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800/60 p-6 rounded-lg shadow-lg h-fit">
          <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-4 mb-4">Сумма заказа</h2>
          <div className="space-y-2 text-gray-300">
            <div className="flex justify-between">
              <span>{totalItems} товар(а)</span>
              <span>{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(subtotal)}</span>
            </div>
             <div className="flex justify-between font-bold text-white text-lg pt-4">
              <span>Итого</span>
              <span>{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(subtotal)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isPlacingOrder}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPlacingOrder ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Оформление...</span>
                </>
            ) : (
                'Оформить заказ'
            )}
          </button>
          {!user && <p className="text-center text-sm text-gray-400 mt-4">Пожалуйста, <Link to="/login" className="text-indigo-400 hover:underline">войдите</Link> для оформления заказа.</p>}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
