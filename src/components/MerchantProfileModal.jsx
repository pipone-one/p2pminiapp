import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Star, Clock, ThumbsUp, ExternalLink } from 'lucide-react';
import { openLink } from '../utils/telegram';

const MerchantProfileModal = ({ isOpen, onClose, merchant }) => {
  if (!merchant) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C] border-t border-white/10 rounded-t-[32px] z-50 p-6 pb-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl font-bold text-white border-2 border-shark-cyan">
                    {merchant.name[0]}
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold flex items-center gap-2">
                     {merchant.name}
                     {merchant.verified && <ShieldCheck size={20} className="text-shark-cyan" />}
                   </h2>
                   <div className="flex items-center gap-2 text-sm text-gray-400">
                     <span className="text-green-400">Online</span>
                     <span>•</span>
                     <span>Registered 2 years ago</span>
                   </div>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Star size={14} />
                  <span className="text-xs">Completion</span>
                </div>
                <div className="text-xl font-bold text-white">{merchant.completion}%</div>
              </div>
              <div className="bg-surface p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Clock size={14} />
                  <span className="text-xs">Avg. Release</span>
                </div>
                <div className="text-xl font-bold text-white">{merchant.avgTime || '5 min'}</div>
              </div>
              <div className="bg-surface p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <ThumbsUp size={14} />
                  <span className="text-xs">Positive Feedback</span>
                </div>
                <div className="text-xl font-bold text-white">{merchant.positive || '98%'}</div>
              </div>
              <div className="bg-surface p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <ShieldCheck size={14} />
                  <span className="text-xs">Total Orders</span>
                </div>
                <div className="text-xl font-bold text-white">{merchant.orders}</div>
              </div>
            </div>

            {/* Trading Terms */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Trading Terms</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Fast release! ⚡️
                I am online 24/7. 
                Please do not include crypto related words in the bank transfer description.
                Third party payments are not accepted.
              </p>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => openLink('https://p2p.binance.com')}
              className="w-full py-4 bg-shark-cyan text-black font-bold rounded-xl text-lg hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2"
            >
              Go to Exchange <ExternalLink size={20} />
            </button>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MerchantProfileModal;
