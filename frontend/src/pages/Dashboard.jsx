import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';
import AIAssistant from '../components/AIAssistant';
import { Plus, UserPlus, MoreVertical, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [classrooms, setClassrooms] = useState([]);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [classCode, setClassCode] = useState('');
    const [newClass, setNewClass] = useState({ name: '', section: '', subject_code: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const response = await api.get('classrooms/');
            setClassrooms(response.data);
        } catch (error) {
            toast.error('Failed to load classrooms');
        }
    };

    const handleJoinClass = async (e) => {
        e.preventDefault();
        try {
            await api.post('classrooms/join/', { code: classCode });
            toast.success('Joined classroom!');
            setShowJoinModal(false);
            fetchClassrooms();
        } catch (error) {
            toast.error('Invalid class code');
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await api.post('classrooms/', newClass);
            toast.success('Classroom created!');
            setShowCreateModal(false);
            fetchClassrooms();
        } catch (error) {
            toast.error('Failed to create classroom');
        }
    };

    const handleDeleteClassroom = async (classroomId, e) => {
        e.stopPropagation(); // Prevent navigation when clicking delete
        if (!window.confirm('Delete this classroom? This will also delete all assignments and submissions.')) {
            return;
        }

        try {
            await api.delete(`classrooms/${classroomId}/`);
            toast.success('Classroom deleted');
            fetchClassrooms();
        } catch (error) {
            toast.error('Failed to delete classroom');
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gradient font-outfit">My Classes</h1>
                        <p className="text-gray-400 mt-2">Manage your educational spaces</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <NotificationCenter />
                        {user?.role === 'student' ? (
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="btn-modern flex items-center gap-2"
                            >
                                <UserPlus size={20} /> Join Class
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn-modern flex items-center gap-2"
                            >
                                <Plus size={20} /> Create Class
                            </button>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {classrooms.map((cls) => (
                        <div
                            key={cls.id}
                            onClick={() => navigate(`/classroom/${cls.id}`)}
                            className="glass-card card-3d group cursor-pointer h-72 flex flex-col overflow-hidden relative"
                        >
                            <div className="h-24 bg-gradient-main p-5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <MoreVertical className="text-white" size={20} />
                                </div>
                                <h3 className="text-white font-bold text-xl truncate pr-6 relative z-10">{cls.name}</h3>
                                <p className="text-white/90 text-sm relative z-10">{cls.section}</p>
                            </div>
                            <div className="flex-1 p-5 relative bg-gradient-to-b from-transparent to-black/10">
                                <div className="absolute -top-8 right-6 w-16 h-16 rounded-full bg-gradient-card shadow-glow flex items-center justify-center font-bold text-2xl text-white border-2 border-white/20">
                                    {cls.faculty_name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-semibold text-gray-200">{cls.faculty_name}</p>
                                </div>
                            </div>
                            <div className="p-3 border-t border-white/10 flex justify-between items-center gap-2 bg-black/20">
                                <div className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors">
                                    <BookOpen size={18} />
                                </div>
                                {user?.role === 'faculty' && (
                                    <button
                                        onClick={(e) => handleDeleteClassroom(cls.id, e)}
                                        className="w-8 h-8 rounded-full hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                                        title="Delete classroom"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Join Modal */}
                {showJoinModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="glass-card rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-white/20">
                            <h2 className="text-2xl font-bold mb-4 text-gradient">Join Class</h2>
                            <form onSubmit={handleJoinClass}>
                                <input
                                    type="text"
                                    placeholder="Class code"
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-gray-200 placeholder-gray-400 focus:border-primary-purple focus:outline-none mb-4"
                                    value={classCode}
                                    onChange={(e) => setClassCode(e.target.value)}
                                    required
                                />
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowJoinModal(false)} className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors">Cancel</button>
                                    <button type="submit" className="btn-modern">Join</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="glass-card rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-white/20">
                            <h2 className="text-2xl font-bold mb-4 text-gradient">Create Class</h2>
                            <form onSubmit={handleCreateClass} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Class name"
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-gray-200 placeholder-gray-400 focus:border-primary-purple focus:outline-none"
                                    value={newClass.name}
                                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Section"
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-gray-200 placeholder-gray-400 focus:border-primary-purple focus:outline-none"
                                    value={newClass.section}
                                    onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Subject Code"
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-gray-200 placeholder-gray-400 focus:border-primary-purple focus:outline-none"
                                    value={newClass.subject_code}
                                    onChange={(e) => setNewClass({ ...newClass, subject_code: e.target.value })}
                                    required
                                />
                                <div className="flex justify-end gap-3 mt-4">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors">Cancel</button>
                                    <button type="submit" className="btn-modern">Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
            <AIAssistant />
        </div>
    );
};

export default Dashboard;
