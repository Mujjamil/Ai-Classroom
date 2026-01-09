import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Trash2, User, Zap, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { clsx } from 'clsx';

const AIAssistant = ({ classroomId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        {
            id: 1,
            role: 'assistant',
            text: 'Hello! I am your AI classroom companion. How can I help you excel today?',
            time: new Date()
        }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [chat, isOpen]);

    const handleSend = async (e, textOverride = null) => {
        if (e) e.preventDefault();
        const textToSend = textOverride || message;
        if (!textToSend.trim()) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            text: textToSend,
            time: new Date()
        };

        if (!textOverride) setMessage('');
        setChat(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const endpoint = classroomId
                ? `classrooms/${classroomId}/ai_chat/`
                : 'classrooms/global_chat/';

            const response = await api.post(endpoint, { message: textToSend });
            const fullResponse = response.data.response;

            setLoading(false);
            const aiMsgId = Date.now() + 1;
            setChat(prev => [...prev, {
                id: aiMsgId,
                role: 'assistant',
                text: '',
                time: new Date()
            }]);

            const words = fullResponse.split(' ');
            let currentText = '';

            for (let i = 0; i < words.length; i++) {
                currentText += words[i] + (i === words.length - 1 ? '' : ' ');
                await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 20));

                setChat(prev => prev.map(msg =>
                    msg.id === aiMsgId ? { ...msg, text: currentText } : msg
                ));
            }

        } catch (error) {
            setLoading(false);
            const errorMessage = "I'm having trouble connecting. Let me know if you want me to try again!";
            setChat(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                text: errorMessage,
                time: new Date(),
                isError: true
            }]);
        }
    };

    const clearChat = () => {
        setChat([{
            id: Date.now(),
            role: 'assistant',
            text: 'History cleared. What else is on your mind?',
            time: new Date()
        }]);
    };

    const suggestions = [
        "Class summary",
        "Next deadline?",
        "Help with homework",
        "Study tips"
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 font-outfit">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-80 md:w-[380px] flex flex-col overflow-hidden border border-white/40 mb-4"
                    >
                        <header className="ai-gradient-bg p-4 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-tight leading-none mb-1">AI Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                                        <span className="text-[9px] font-bold text-blue-100 uppercase tracking-widest">Active Intelligence</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 relative z-10">
                                <button
                                    onClick={clearChat}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-blue-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 h-[400px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-surface-50 to-white thin-scrollbar">
                            {chat.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={clsx(
                                        "flex w-full gap-3",
                                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                    )}
                                >
                                    <div className={clsx(
                                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                                        msg.role === 'user' ? 'bg-surface-100 text-gray-400' : 'ai-gradient-bg text-white'
                                    )}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={clsx(
                                        "max-w-[80%] p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                                        msg.role === 'user'
                                            ? 'bg-google-blue text-white rounded-tr-none'
                                            : msg.isError
                                                ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none'
                                                : 'bg-white text-gray-800 border border-surface-200 rounded-tl-none'
                                    )}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <div className="flex justify-start gap-3">
                                    <div className="w-8 h-8 rounded-lg ai-gradient-bg text-white flex items-center justify-center flex-shrink-0">
                                        <Bot size={14} />
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl border border-surface-200 shadow-sm flex gap-1.5 items-center">
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-google-blue rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-google-blue rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-google-blue rounded-full" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {chat.length === 1 && !loading && (
                            <div className="px-4 py-2 flex flex-wrap gap-2">
                                {suggestions.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(null, suggestion)}
                                        className="text-[10px] font-bold text-google-blue bg-blue-50 hover:bg-google-blue hover:text-white border border-blue-100 rounded-full px-3 py-1 transition-all"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-surface-100">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="Message AI Assistant..."
                                    className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-4 pr-10 py-2.5 text-xs focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue outline-none transition-all"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || loading}
                                    className="absolute right-1 p-2 bg-google-blue text-white rounded-lg hover:shadow-lg disabled:opacity-20 transition-all"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-white transition-all duration-300 relative group overflow-hidden",
                    isOpen ? 'bg-gray-900 ring-4 ring-gray-900/10' : 'ai-gradient-bg ring-4 ring-google-blue/10'
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isOpen ? <X size={24} /> : <Bot size={24} />}
                {!isOpen && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping"></div>
                )}
            </motion.button>
        </div>
    );
};

export default AIAssistant;
