import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const OrderCard = ({ order }) => {
  const { merchant, price, limit, crypto, fiat, paymentMethods, type } = order;
  const isBuy = type === 'buy';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="bg-surface backdrop-blur-md rounded-2xl p-4 border border-white/5 mb-3 shadow-lg"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold text-white">
            {merchant.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{merchant.name}</span>
              {merchant.verified && <div className="w-3 h-3 bg-shark-cyan rounded-full" />}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>{merchant.orders} orders</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span>{merchant.completion}%</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tracking-tight text-white">
            {price} <span className="text-sm font-medium text-soft-gold">{fiat}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
           <div className="text-xs text-gray-400">
             Limits: <span className="text-white">{limit}</span>
           </div>
           <div className="flex gap-2">
             {paymentMethods.map((method, i) => (
               <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-medium text-gray-300 border border-white/5">
                 {method}
               </span>
             ))}
           </div>
        </div>
        <button className={clsx(
          "px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors",
          isBuy ? "bg-shark-cyan text-black" : "bg-red-500 text-white"
        )}>
          {isBuy ? "Buy" : "Sell"} {crypto}
        </button>
      </div>
    </motion.div>
  );
};

export default OrderCard;
