import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Bot, Sparkles, Send, User, Brain, Zap, Trash2, Layout, MessageSquare, History, Star, ArrowRight, Upload, FileText, X, BookOpen, List, HelpCircle, Lightbulb, Target, CheckCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

// Simple markdown parser for AI responses
const parseMarkdown = (text) => {
    if (!text) return '';

    let html = text
        // Bold text: **text** -> <strong>text</strong>
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Bullet points: * item or • item -> <li>item</li>
        .replace(/^[•\*\-]\s+(.+)$/gm, '<li>$1</li>')
        // Numbered lists: 1. item -> <li>item</li>
        .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>');

    // Wrap in paragraph
    html = '<p>' + html + '</p>';

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*?<\/li>)/gs, (match) => {
        return '<ul class="markdown-list">' + match + '</ul>';
    });

    return html;
};

const AIAssistantHub = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        {
            id: 1,
            role: 'assistant',
            text: `Welcome to the AI Intelligence Hub, ${user?.username}! I'm your advanced classroom companion. How can I assist your academic journey today?`,
            time: new Date()
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ classrooms: 0, assignments: 0, pending: 0 });
    const [uploadedFile, setUploadedFile] = useState(null);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('classrooms/');
            const classrooms = response.data;
            let totalAssignments = 0;
            // This is a simplified stat calculation
            setStats({
                classrooms: classrooms.length,
                assignments: 12, // Mock for now
                pending: 3
            });
        } catch (error) { }
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat]);

    const handleSend = async (e, textOverride = null) => {
        if (e) e.preventDefault();
        const textToSend = textOverride || message;
        if (!textToSend.trim()) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            text: uploadedFile ? `📄 ${uploadedFile.name}: ${textToSend}` : textToSend,
            time: new Date()
        };

        if (!textOverride) setMessage('');
        setChat(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            // If file is uploaded, use file analysis endpoint
            if (uploadedFile) {
                const formData = new FormData();
                formData.append('file', uploadedFile);
                formData.append('question', textToSend);

                const response = await api.post('analyze-file/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const aiMsg = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    text: response.data.answer,
                    time: new Date()
                };
                setChat(prev => [...prev, aiMsg]);
            } else {
                // Regular chat without file
                const response = await api.post('classrooms/global_chat/', { message: textToSend });
                const aiMsg = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    text: response.data.response,
                    time: new Date()
                };
                setChat(prev => [...prev, aiMsg]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            console.error('Error response:', error.response);
            setChat(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                text: error.response?.data?.error || error.response?.data?.detail || error.message || "I encountered an error. Please try again.",
                time: new Date(),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        { title: "Summarize Progress", desc: "Get a high-level overview of your classes", icon: Layout },
        { title: "Upcoming Deadlines", desc: "Check what's due soon", icon: Zap },
        { title: "Improve My Work", desc: "Tips based on your latest analysis", icon: Brain },
    ];

    const fileQuestions = [
        { q: "Explain this file in simple and easy words for learning", icon: BookOpen },
        { q: "Summarize this file in points for quick study or revision", icon: List },
        { q: "What concepts or topics should I learn from this file?", icon: Brain },
        { q: "Generate important questions and answers from this file", icon: HelpCircle },
        { q: "Explain difficult or technical parts of this file in an easy way", icon: Lightbulb },
        { q: "What is the main objective of this file?", icon: Target },
        { q: "What are the key points or important sections in this file?", icon: Star },
        { q: "Does this file follow proper academic format and structure?", icon: CheckCircle },
        { q: "How can I improve this file to get better marks?", icon: TrendingUp },
        { q: "What questions can a teacher ask from this file during evaluation or viva?", icon: MessageSquare }
    ];

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFile(file);
        }
    };

    const handleFileQuestion = async (question) => {
        if (!uploadedFile) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            text: `📄 ${uploadedFile.name}: ${question}`,
            time: new Date()
        };

        setChat(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            formData.append('question', question);

            const response = await api.post('analyze-file/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const aiMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                text: response.data.answer,
                time: new Date()
            };
            setChat(prev => [...prev, aiMsg]);
        } catch (error) {
            setChat(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                text: error.response?.data?.error || "Failed to analyze file. Please try again.",
                time: new Date(),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen font-outfit">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="glass-card border-b border-white/10 px-8 py-2 flex justify-between items-center z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-main rounded-2xl flex items-center justify-center shadow-glow">
                            <Bot className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gradient flex items-center gap-2">
                                AI Intelligence Hub
                                <span className="text-[10px] bg-primary-purple/20 text-primary-purple px-2 py-0.5 rounded-full uppercase tracking-tighter border border-primary-purple/30">Pro</span>
                            </h1>
                            <p className="text-sm text-gray-400">Processing real-time classroom insights</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-8 px-6 py-2 glass-card rounded-xl border border-white/10">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-white-50 uppercase">Classes</p>
                                <p className="text-lg font-bold text-white-200">{stats.classrooms}</p>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-white-50 uppercase">Pending</p>
                                <p className="text-lg font-bold text-white-200">{stats.pending}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col relative">
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 thin-scrollbar">
                            {chat.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={clsx(
                                        "flex w-full gap-4",
                                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                    )}
                                >
                                    <div className={clsx(
                                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-110",
                                        msg.role === 'user' ? 'bg-gradient-card text-white shadow-glow' : 'ai-gradient-bg text-white'
                                    )}>
                                        {msg.role === 'user' ? <User size={20} /> : <Brain size={20} />}
                                    </div>
                                    <div className={clsx(
                                        "max-w-[80%] p-5 rounded-3xl text-[15px] leading-relaxed relative group",
                                        msg.role === 'user'
                                            ? 'bg-gradient-main text-white shadow-glow rounded-tr-none shadow-premium'
                                            : msg.isError
                                                ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none'
                                                : 'glass-card text-gray-200 border border-white/10 rounded-tl-none shadow-sm'
                                    )}>
                                        {msg.role === 'assistant' && !msg.isError ? (
                                            <div
                                                className="markdown-content"
                                                dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                                            />
                                        ) : (
                                            msg.text
                                        )}
                                        <div className={clsx(
                                            "text-[10px] mt-2 font-medium opacity-50",
                                            msg.role === 'user' ? 'text-blue-100 text-right' : 'text-gray-400'
                                        )}>
                                            {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start gap-4">
                                    <div className="w-10 h-10 rounded-xl ai-gradient-bg text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                                        <Bot size={20} />
                                    </div>
                                    <div className="ai-glass p-6 rounded-3xl border border-surface-200 shadow-sm flex gap-2 items-center">
                                        <div className="flex gap-1.5">
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-google-blue rounded-full" />
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-google-blue rounded-full" />
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-google-blue rounded-full" />
                                        </div>
                                        <span className="text-xs font-semibold text-google-blue ml-2 animate-pulse">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 glass-card border-t border-white/10">
                            {/* File Upload Section */}
                            {uploadedFile && (
                                <div className="max-w-4xl mx-auto mb-4 p-4 glass-card bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-main text-white shadow-glow flex items-center justify-center">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">{uploadedFile.name}</p>
                                            <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setUploadedFile(null)}
                                        className="p-2 hover:bg-red-50 rounded-full text-red-500"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSend} className="relative group max-w-4xl mx-auto">
                                <div className="absolute -inset-1 bg-gradient-to-r from-google-blue to-purple-600 rounded-[28px] opacity-20 blur-lg group-focus-within:opacity-40 transition-opacity"></div>
                                <div className="relative flex items-center glass-card border border-white/10 rounded-[24px] focus-within:border-primary-purple transition-all shadow-xl shadow-black/5 overflow-hidden">
                                    <div className="pl-6 text-gray-400">
                                        <MessageSquare size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={uploadedFile ? "Ask a question about your file..." : "Ask me anything about your classes, assignments, or progress..."}
                                        className="w-full bg-transparent border-none px-4 py-4 text-base text-gray-200 focus:ring-0 focus:outline-none placeholder:text-gray-400"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={loading}
                                    />
                                    <div className="pr-4 flex gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.docx,.doc,.txt"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-3 glass-card text-gray-300 rounded-2xl hover:bg-primary-purple hover:text-white transition-all border border-white/10"
                                            title="Upload file"
                                        >
                                            <Upload size={20} />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!message.trim() || loading}
                                            className="p-3 bg-gradient-to-r from-primary-purple to-blue-500 text-white shadow-lg shadow-primary-purple/50 rounded-2xl hover:shadow-xl hover:shadow-primary-purple/70 hover:scale-105 transition-all disabled:opacity-20 flex items-center justify-center"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <p className="text-[11px] text-center text-gray-400 mt-4 font-medium uppercase tracking-[0.2em]">Neural Intelligence Engine v2.0</p>
                        </div>
                    </div>

                    {/* Right Panel: Suggestions & Tools */}
                    <div className="w-96 glass-card border-l border-white/10 p-8 space-y-8 overflow-y-auto thin-scrollbar">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                                {uploadedFile ? 'File Questions' : 'Quick Actions'}
                            </h3>
                            <div className="space-y-4">
                                {uploadedFile ? (
                                    // Show file-specific questions
                                    fileQuestions.map((fq, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleFileQuestion(fq.q)}
                                            disabled={loading}
                                            className="w-full text-left p-4 glass-card rounded-2xl border border-white/10 hover:border-primary-purple hover:shadow-md transition-all group active:scale-95 disabled:opacity-50"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary-purple/20 text-primary-purple flex items-center justify-center group-hover:bg-primary-purple group-hover:text-white transition-colors flex-shrink-0 mt-0.5">
                                                    <fq.icon size={16} />
                                                </div>
                                                <p className="text-xs text-gray-300 leading-relaxed">{fq.q}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    // Show general suggestions
                                    suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(null, s.title)}
                                            className="w-full text-left p-4 glass-card rounded-2xl border border-white/10 hover:border-primary-purple hover:shadow-md transition-all group active:scale-95"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary-purple/20 text-primary-purple flex items-center justify-center group-hover:bg-primary-purple group-hover:text-white transition-colors">
                                                    <s.icon size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-200">{s.title}</h4>
                                                    <p className="text-xs text-gray-400">{s.desc}</p>
                                                </div>
                                                <ArrowRight size={14} className="ml-auto text-gray-500 group-hover:text-primary-purple transform translate-x-0 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Recent Insights</h3>
                            <div className="ai-glass rounded-2xl p-6 border border-white/10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <p className="text-xs font-medium text-gray-300">Vocabulary score improved by 12%</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <p className="text-xs font-medium text-gray-300">Similarity patterns found in last 2 tasks</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <p className="text-xs font-medium text-gray-300">Readability is "Easy" for current level</p>
                                    </div>
                                </div>
                                <button className="w-full mt-6 py-2 text-xs font-bold text-primary-purple hover:underline">View Detailed Analysis</button>
                            </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl text-white relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <h3 className="text-lg font-bold mb-2 relative z-10">AI Writing Tutor</h3>
                            <p className="text-xs text-blue-100/70 mb-4 relative z-10">Get real-time feedback while you draft your assignments.</p>
                            <button className="bg-white text-gray-900 px-6 py-2 rounded-xl text-xs font-bold hover:shadow-xl transition-all active:scale-95">Open Editor</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AIAssistantHub;
