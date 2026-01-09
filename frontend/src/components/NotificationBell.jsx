import { useState, useEffect } from 'react';
import { Bell, BellRing, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { clsx } from 'clsx';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

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

    const markAllRead = async () => {
        try {
            await api.post('notifications/mark_all_as_read/');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read');
        }
    };

    return (
        <div className="relative font-outfit">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-400 hover:text-google-blue hover:bg-blue-50 rounded-full transition-all"
            >
                {unreadCount > 0 ? (
                    <>
                        <BellRing className="w-6 h-6 animate-swing" />
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                            {unreadCount}
                        </span>
                    </>
                ) : (
                    <Bell className="w-6 h-6" />
                )}
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowDropdown(false)}
                        ></div>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-surface-200 z-50 overflow-hidden"
                        >
                            <header className="p-4 border-b border-surface-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-800">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs font-semibold text-google-blue hover:underline"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </header>

                            <div className="max-h-[400px] overflow-y-auto thin-scrollbar">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={clsx(
                                                "p-4 border-b border-surface-50 last:border-0 transition-colors",
                                                !n.is_read ? "bg-blue-50/30" : "hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="flex justify-between gap-3">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-gray-900">{n.title}</p>
                                                    <p className="text-xs text-gray-600 line-clamp-2">{n.message}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {n.link && (
                                                            <Link
                                                                to={n.link}
                                                                onClick={() => setShowDropdown(false)}
                                                                className="text-[10px] text-google-blue font-bold flex items-center gap-0.5 hover:underline"
                                                            >
                                                                View <ExternalLink size={10} />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                                {!n.is_read && (
                                                    <div className="w-2 h-2 bg-google-blue rounded-full mt-1.5 flex-shrink-0"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
