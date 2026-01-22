import React from 'react';
import { motion } from 'framer-motion';

const OrderCard = ({ order, onClick }) => {
  const { merchant, price, limit, crypto, fiat, paymentMethods } = order;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(order)}
      className="py-4 border-b border-white/5 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        {/* Left: Price */}
        <div>
          <div className="text-xl font-bold text-white tracking-wide">
            ₴{price} <span className="text-xs font-normal text-gray-400">at Binance</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Количество: <span className="text-white font-medium">{order.price * 2.5} {crypto}</span>
          </div>
        </div>

        {/* Right: Merchant Info */}
        <div className="text-right">
          <div className="text-xs text-gray-300 font-medium mb-1">
            {merchant.name}
          </div>
          <div className="text-[10px] text-gray-500">
            Лимит:
          </div>
          <div className="text-xs text-white font-medium">
            ₴{limit}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="flex flex-wrap gap-2 mt-2">
        {paymentMethods.map((method, i) => (
          <div key={i} className="flex items-center gap-1">
             <div className={`w-0.5 h-3 rounded-full ${i === 0 ? 'bg-shark-cyan' : 'bg-soft-gold'}`} />
             <span className="text-[10px] text-gray-300">{method}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default OrderCard;
