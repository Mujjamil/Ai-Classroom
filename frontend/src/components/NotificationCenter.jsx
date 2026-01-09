import { useState, useEffect } from 'react';
import { Bell, BellRing, X, ExternalLink, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { clsx } from 'clsx';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const response = await api.get('notifications/');
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Check every 15s
        return () => clearInterval(interval);
    }, []);

    const markAllRead = async () => {
        try {
            await api.post('notifications/mark_all_as_read/');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read');
        }
    };

    const handleNotificationClick = (link) => {
        if (link) {
            navigate(link);
            setShowPanel(false);
        }
    };

    return (
        <div className="relative font-outfit">
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="relative p-2 text-gray-500 hover:text-google-blue hover:bg-blue-50 rounded-full transition-all"
            >
                {unreadCount > 0 ? (
                    <>
                        <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                        >
                            <BellRing className="w-6 h-6 text-google-blue" />
                        </motion.div>
                        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                            {unreadCount}
                        </span>
                    </>
                ) : (
                    <Bell className="w-6 h-6" />
                )}
            </button>

            <AnimatePresence>
                {showPanel && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowPanel(false)}
                        ></div>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 md:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-surface-200 z-50 overflow-hidden"
                        >
                            <header className="p-4 border-b border-surface-100 flex justify-between items-center bg-gray-50/80">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">Notifications</h3>
                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Stay Updated</p>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-[11px] font-bold text-google-blue bg-blue-50 px-3 py-1.5 rounded-full hover:bg-google-blue hover:text-white transition-all flex items-center gap-1"
                                    >
                                        <CheckSquare size={12} /> Mark read
                                    </button>
                                )}
                            </header>

                            <div className="max-h-[450px] overflow-y-auto thin-scrollbar bg-gradient-to-b from-white to-surface-50">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n.link)}
                                            className={clsx(
                                                "p-4 border-b border-surface-50 last:border-0 cursor-pointer transition-all",
                                                !n.is_read ? "bg-blue-50/40 relative" : "hover:bg-blue-50/20"
                                            )}
                                        >
                                            {!n.is_read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-google-blue"></div>
                                            )}
                                            <div className="flex justify-between gap-3">
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-sm font-bold text-gray-900 leading-tight pr-4">{n.title}</p>
                                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[13px] text-gray-600 line-clamp-2 leading-snug">{n.message}</p>

                                                    {n.link && (
                                                        <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-gray-100/50">
                                                            <span className="text-[11px] text-google-blue font-bold flex items-center gap-1">
                                                                Explore <ExternalLink size={10} />
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-surface-100">
                                            <Bell className="w-8 h-8 text-gray-200" />
                                        </div>
                                        <p className="text-sm text-gray-500 font-bold">All caught up!</p>
                                        <p className="text-xs text-gray-400 mt-1">No new notifications at the moment.</p>
                                    </div>
                                )}
                            </div>

                            <footer className="p-3 bg-gray-50/50 border-t border-surface-100 text-center">
                                <button className="text-[11px] font-bold text-gray-400 hover:text-google-blue uppercase tracking-widest transition-colors">
                                    Clear History
                                </button>
                            </footer>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
