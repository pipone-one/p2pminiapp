import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ArrowRight } from 'lucide-react';
import { hapticFeedback } from '../utils/telegram';

const Notification = ({ notifications, removeNotification, onOpenAlert }) => {
  return (
    <div className="fixed top-4 left-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="bg-surface/90 backdrop-blur-md border border-[#FCD535] p-4 rounded-2xl shadow-lg pointer-events-auto flex items-start gap-3"
            onClick={() => {
              onOpenAlert(notif.alertId);
              removeNotification(notif.id);
            }}
          >
            <div className="p-2 bg-[#FCD535]/10 rounded-full shrink-0">
              <Bell size={20} className="text-[#FCD535]" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-text mb-0.5">{notif.title}</h4>
              <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notif.id);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
