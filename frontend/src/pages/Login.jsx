import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ArrowRight, BookOpen } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(credentials.username, credentials.password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col font-outfit">
            <div className="yellow-blob-1"></div>
            <div className="yellow-blob-2"></div>

            {/* Header */}
            <header className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-gradient-main rounded flex items-center justify-center shadow-glow">
                        <BookOpen className="text-white w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-gradient">AI Classroom</span>
                </div>
                {/* <button className="bg-google-blue text-white px-6 py-2 rounded-md text-sm font-medium hover:shadow-lg transition-all">
                    Register your School
                </button> */}
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="glass-card rounded-[2rem] shadow-2xl flex max-w-5xl w-full overflow-hidden animate-slide-up border border-white/10">
                    {/* Left side: Illustration */}
                    <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 border-r border-white/10 bg-gradient-to-br from-gray-900 to-gray-800">
                        <img
                            src="/dark-illustration.png"
                            alt="AI-Powered Classroom"
                            className="max-w-full h-auto mb-8"
                        />
                        <h2 className="text-2xl font-bold text-gradient">AI Classroom</h2>
                    </div>

                    {/* Right side: Form */}
                    <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
                        {/* <div className="mb-8">
                            <p className="text-gray-500 text-sm font-medium mb-4">Download our App</p>
                            <div className="flex gap-3">
                                <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-800">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-6" />
                                </div>
                                <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-800">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-6" />
                                </div>
                            </div>
                        </div> */}

                        <div className="flex gap-4 mb-8">
                            <Link to="/register" className="text-sm font-bold text-gray-400 hover:text-gray-300 transition-colors">Signup</Link>
                            <span className="text-sm font-bold text-primary-purple border-b-2 border-primary-purple pb-1">Login</span>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</p>
                                <input
                                    type="text"
                                    className="aiclassroom-input w-full"
                                    placeholder="your username"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</p>
                                <input
                                    type="password"
                                    className="aiclassroom-input w-full"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="pt-4 flex flex-col gap-6">
                                <p className="text-[10px] text-gray-400">
                                    By logging in, you agree with our <span className="text-primary-purple cursor-pointer font-bold">Terms & Conditions</span>
                                </p>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-modern px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 w-fit self-end active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Logging in...' : 'Let\'s Start'} <ArrowRight size={20} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Decoration dots */}
            <div className="fixed top-10 right-10 p-4 grid grid-cols-4 gap-2 opacity-10 hidden xl:grid pointer-events-none">
                {[...Array(24)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-black rounded-full"></div>
                ))}
            </div>
            <div className="fixed bottom-10 left-10 p-4 grid grid-cols-4 gap-2 opacity-10 hidden xl:grid pointer-events-none">
                {[...Array(24)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-black rounded-full"></div>
                ))}
            </div>
        </div>
    );
};

export default Login;
