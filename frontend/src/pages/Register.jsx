import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { ArrowRight, BookOpen } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: '', // For UI match
        role: 'student'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // Backend might not expect confirm_password
            const { confirm_password, ...submitData } = formData;
            await api.post('users/', submitData);
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch (error) {
            toast.error('Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col font-outfit overflow-x-hidden">
            <div className="yellow-blob-1"></div>
            <div className="yellow-blob-2"></div>

            <header className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                        <BookOpen className="text-white w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-gray-800">AI Classroom</span>
                </div>
                {/* <button className="bg-google-blue text-white px-6 py-2 rounded-md text-sm font-medium hover:shadow-lg transition-all">
                    Register your School
                </button> */}
            </header>

            <main className="flex-1 flex items-center justify-center p-4 z-10">
                <div className="bg-white rounded-[2rem] shadow-2xl flex max-w-5xl w-full overflow-hidden animate-slide-up border border-surface-100">
                    <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 border-r border-surface-50 bg-gray-50/30">
                        <img src="/illustration.png" alt="Education" className="max-w-full h-auto mb-8 drop-shadow-xl" />
                        <h2 className="text-2xl font-bold text-google-blue">Igniting the innovative self</h2>
                    </div>

                    <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                        <div className="flex gap-4 mb-8">
                            <span className="text-sm font-bold text-google-blue border-b-2 border-google-blue pb-1">Signup</span>
                            <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Login</Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail</p>
                                    <input type="email" className="aiclassroom-input w-full" placeholder="email@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</p>
                                    <input type="text" className="aiclassroom-input w-full" placeholder="johndoe" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</p>
                                <input type="password" className="aiclassroom-input w-full" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirm Password</p>
                                <input type="password" className="aiclassroom-input w-full" placeholder="••••••••" value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} required />
                            </div>

                            <div className="pt-4 flex flex-col gap-6">
                                {/* <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Download our App</p>
                                    <div className="flex gap-3">
                                        <button type="button" className="flex-1 bg-black text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="GP" className="h-4" />
                                        </button>
                                        <button type="button" className="flex-1 bg-black text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="AS" className="h-4" />
                                        </button>
                                    </div>
                                </div> */}
                                <button type="submit" disabled={loading} className="bg-google-blue text-white px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 w-fit hover:shadow-xl hover:shadow-google-blue/30 transition-all self-end active:scale-95 disabled:opacity-50">
                                    {loading ? 'Creating...' : 'Let\'s Start'} <ArrowRight size={20} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <div className="fixed top-10 right-10 p-4 grid grid-cols-4 gap-2 opacity-5 hidden xl:grid">
                {[...Array(24)].map((_, i) => <div key={i} className="w-2 h-2 bg-black rounded-full" />)}
            </div>
            <div className="fixed bottom-10 left-10 p-4 grid grid-cols-4 gap-2 opacity-5 hidden xl:grid">
                {[...Array(24)].map((_, i) => <div key={i} className="w-2 h-2 bg-black rounded-full" />)}
            </div>
        </div>
    );
};

export default Register;
