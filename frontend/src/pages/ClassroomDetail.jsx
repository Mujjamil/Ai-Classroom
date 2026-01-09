import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import AIAssistant from '../components/AIAssistant';
import NotificationCenter from '../components/NotificationCenter';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Send,
    FileText,
    Users,
    BarChart,
    Info,
    Calendar,
    MoreVertical,
    Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClassroomDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [classroom, setClassroom] = useState(null);
    const [activeTab, setActiveTab] = useState('stream');
    const [streamData, setStreamData] = useState({ announcements: [], assignments: [] });
    const [peopleData, setPeopleData] = useState({ faculty: null, students: [] });
    const [gradesData, setGradesData] = useState({ assignments: [], gradebook: [] });
    const [analyticsData, setAnalyticsData] = useState([]);
    const [announcement, setAnnouncement] = useState('');
    const [showCreateAssignment, setShowCreateAssignment] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '', points: 100, formatting_instructions: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchClassroom();
        if (activeTab === 'stream' || activeTab === 'classwork') fetchStream();
        if (activeTab === 'people') fetchPeople();
        if (activeTab === 'grades') fetchGrades();
        if (activeTab === 'analytics') fetchAnalytics();
    }, [id, activeTab]);

    const fetchClassroom = async () => {
        try {
            const response = await api.get(`classrooms/${id}/`);
            setClassroom(response.data);
        } catch (error) {
            toast.error('Failed to load classroom');
        }
    };

    const fetchStream = async () => {
        try {
            const response = await api.get(`classrooms/${id}/stream/`);
            setStreamData(response.data);
        } catch (error) {
            toast.error('Failed to load stream');
        }
    };

    const fetchPeople = async () => {
        try {
            const response = await api.get(`classrooms/${id}/people/`);
            setPeopleData(response.data);
        } catch (error) {
            toast.error('Failed to load people');
        }
    };

    const fetchGrades = async () => {
        try {
            const response = await api.get(`classrooms/${id}/grades/`);
            setGradesData(response.data);
        } catch (error) {
            toast.error('Failed to load grades');
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await api.get(`classrooms/${id}/analytics/`);
            setAnalyticsData(response.data);
        } catch (error) {
            toast.error('Failed to load analytics');
        }
    };

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post('announcements/', { classroom: id, content: announcement });
            setAnnouncement('');
            fetchStream();
            toast.success('Announcement posted');
        } catch (error) {
            toast.error('Failed to post');
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            await api.post('assignments/', { ...newAssignment, classroom: id });
            setShowCreateAssignment(false);
            fetchStream();
            toast.success('Assignment created');
        } catch (error) {
            toast.error('Failed to create assignment');
        }
    };

    const handleDeleteAssignment = async (assignmentId, e) => {
        e.stopPropagation(); // Prevent navigation when clicking delete
        if (!window.confirm('Delete this assignment? This will also delete all submissions.')) {
            return;
        }

        try {
            await api.delete(`assignments/${assignmentId}/`);
            toast.success('Assignment deleted');
            fetchStream();
        } catch (error) {
            toast.error('Failed to delete assignment');
        }
    };

    if (!classroom) return <div>Loading...</div>;

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-0">
                <div className="glass-card border-b border-white/10 sticky top-0 z-20">
                    <div className="px-8 flex items-center justify-between">
                        <div className="flex gap-8">
                            {['stream', 'classwork', 'people', 'grades', ...(user?.role === 'faculty' ? ['analytics'] : [])].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 px-2 font-medium capitalize border-b-2 transition-all ${activeTab === tab
                                        ? 'border-primary-purple text-primary-purple'
                                        : 'border-transparent text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationCenter />
                            <div className="p-2 hover:bg-white/10 rounded-full cursor-pointer text-gray-400 hover:text-gray-200 transition-colors">
                                <Info size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto p-8">
                    {activeTab === 'stream' && (
                        <div className="space-y-6">
                            <div className="h-60 bg-gradient-main rounded-xl p-8 flex flex-col justify-end relative shadow-glow overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-accent opacity-20 rounded-full -mr-20 -mt-20"></div>
                                <h1 className="text-4xl font-bold text-white font-outfit relative z-10">{classroom.name}</h1>
                                <p className="text-white/90 text-lg relative z-10">{classroom.section}</p>
                                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur px-4 py-1 rounded-full text-white text-sm">
                                    Class code: <span className="font-mono font-bold tracking-widest">{classroom.class_code}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-6">
                                <div className="col-span-1 space-y-4">
                                    <div className="glass-card p-5">
                                        <h4 className="font-semibold text-gray-200 border-b border-white/10 pb-2 mb-3">Upcoming</h4>
                                        {streamData.assignments.length > 0 ? (
                                            <div className="space-y-3">
                                                {streamData.assignments.slice(0, 2).map((a) => (
                                                    <div key={a.id} className="text-sm">
                                                        <p className="text-gray-400">Due {new Date(a.due_date).toLocaleDateString()}</p>
                                                        <p className="font-medium text-primary-purple hover:underline cursor-pointer">{a.title}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No work due soon</p>
                                        )}
                                    </div>
                                </div>

                                <div className="col-span-3 space-y-6">
                                    {/* Announcement Input */}
                                    <div className="glass-card p-4 flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-full bg-gradient-card shadow-glow flex items-center justify-center font-bold text-white flex-shrink-0">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <form onSubmit={handlePostAnnouncement} className="flex-1 flex gap-2">
                                            <input
                                                className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-primary-purple focus:outline-none focus:bg-white/10 transition-all"
                                                placeholder="Announce something to your class"
                                                value={announcement}
                                                onChange={(e) => setAnnouncement(e.target.value)}
                                            />
                                            <button type="submit" className="p-2 rounded-full hover:bg-primary-purple/20 text-primary-purple transition-all">
                                                <Send size={20} />
                                            </button>
                                        </form>
                                    </div>

                                    {/* Combined Stream */}
                                    {streamData.announcements.map((ann) => (
                                        <div key={`ann-${ann.id}`} className="glass-card p-5 hover:bg-white/10 transition-all">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-card shadow-glow flex items-center justify-center font-bold text-white">
                                                    {ann.author_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-gray-200">{ann.author_name}</p>
                                                            <p className="text-xs text-gray-400">{new Date(ann.created_at).toLocaleString()}</p>
                                                        </div>
                                                        <MoreVertical className="text-gray-400" size={18} />
                                                    </div>
                                                    <p className="mt-3 text-gray-300 whitespace-pre-wrap">{ann.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {streamData.assignments.map((asgn) => (
                                        <div
                                            key={`asgn-${asgn.id}`}
                                            onClick={() => navigate(`/classroom/${id}/assignment/${asgn.id}`)}
                                            className="glass-card card-3d p-5 cursor-pointer hover:bg-white/10 transition-all group"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-main shadow-glow flex items-center justify-center text-white">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-300">
                                                                <span className="text-primary-purple font-bold">{asgn.faculty_name}</span> posted a new assignment: <span className="text-white font-semibold">{asgn.title}</span>
                                                            </p>
                                                            <p className="text-xs text-gray-400">{new Date(asgn.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <MoreVertical className="text-gray-400 group-hover:text-primary-purple transition-colors" size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'classwork' && (
                        <div className="space-y-6">
                            {user?.role === 'faculty' && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowCreateAssignment(true)}
                                        className="btn-modern flex items-center gap-2"
                                    >
                                        <Plus size={20} /> Create Assignment
                                    </button>
                                </div>
                            )}

                            <div className="space-y-4">
                                {streamData.assignments.map((asgn) => (
                                    <div
                                        key={asgn.id}
                                        className="glass-card p-4 hover:bg-white/10 cursor-pointer flex items-center justify-between"
                                    >
                                        <div
                                            className="flex items-center gap-4 flex-1"
                                            onClick={() => navigate(`/classroom/${id}/assignment/${asgn.id}`)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-main shadow-glow flex items-center justify-center text-white">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-200">{asgn.title}</h3>
                                                <p className="text-xs text-gray-400">Posted on {new Date(asgn.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right text-sm text-gray-400">
                                                Due {new Date(asgn.due_date).toLocaleDateString()}
                                            </div>
                                            {user?.role === 'faculty' && (
                                                <button
                                                    onClick={(e) => handleDeleteAssignment(asgn.id, e)}
                                                    className="p-2 hover:bg-red-50 rounded-full text-red-500 hover:text-red-700 transition-colors"
                                                    title="Delete assignment"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'people' && (
                        <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <section>
                                <h2 className="text-3xl font-google-sans text-gradient border-b border-primary-purple pb-4 mb-8">Teachers</h2>
                                <div className="flex items-center gap-4 px-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-main text-white flex items-center justify-center font-bold shadow-glow">
                                        {peopleData.faculty?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-gray-200">{peopleData.faculty?.username}</span>
                                </div>
                            </section>

                            <section>
                                <div className="flex justify-between items-center border-b border-primary-purple pb-4 mb-8">
                                    <h2 className="text-3xl font-google-sans text-gradient">Classmates</h2>
                                    <span className="text-sm font-medium text-gray-400">{peopleData.students.length} students</span>
                                </div>
                                <div className="space-y-4">
                                    {peopleData.students.map((student) => (
                                        <div key={student.id} className="flex items-center gap-4 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors border-b border-white/10 last:border-0">
                                            <div className="w-10 h-10 rounded-full bg-gradient-card flex items-center justify-center font-bold text-white shadow-glow">
                                                {student.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-200">{student.username}</span>
                                        </div>
                                    ))}
                                    {peopleData.students.length === 0 && (
                                        <p className="text-center text-gray-400 italic py-10">No students enrolled yet.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'grades' && (
                        <div className="animate-in fade-in duration-500 overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="text-left p-4 border-b border-white/10 sticky left-0 glass-card z-10 w-64 min-w-[256px]">Student</th>
                                        {gradesData.assignments.map((asgn) => (
                                            <th key={asgn.id} className="p-4 border-b border-white/10 text-sm font-medium text-gray-400 min-w-[150px]">
                                                <div className="truncate" title={asgn.title}>{asgn.title}</div>
                                                <div className="text-[10px] font-normal">out of {asgn.points}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {gradesData.gradebook.map((record) => (
                                        <tr key={record.student_id} className="hover:bg-white/10 transition-colors">
                                            <td className="p-4 border-b border-white/10 sticky left-0 glass-card z-10 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-card flex items-center justify-center text-xs">
                                                        {record.student_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {record.student_name}
                                                </div>
                                            </td>
                                            {record.grades.map((g, idx) => (
                                                <td key={idx} className="p-4 border-b border-white/10 text-center">
                                                    {g.grade !== null ? (
                                                        <span className="font-bold text-google-blue">{g.grade}</span>
                                                    ) : (
                                                        <span className={`text-xs italic ${g.status === 'missing' ? 'text-red-400' : 'text-gray-400'}`}>
                                                            {g.status}
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {gradesData.gradebook.length === 0 && (
                                <div className="text-center py-20 bg-surface-50 rounded-xl mt-4">
                                    <BarChart size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No grades recorded yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <h2 className="text-3xl font-google-sans text-google-blue border-b border-google-blue pb-4 mb-4">Class Performance</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {analyticsData.map((stat) => (
                                    <div key={stat.assignment_id} className="google-card p-6">
                                        <h3 className="text-xl font-bold mb-4">{stat.title}</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Avg Grade</p>
                                                <p className="text-3xl font-bold text-blue-700">{stat.average_grade}</p>
                                            </div>
                                            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                                <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Submissions</p>
                                                <p className="text-3xl font-bold text-green-700">{stat.submission_rate}%</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-google-blue transition-all duration-1000"
                                                style={{ width: `${stat.submission_rate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {analyticsData.length === 0 && (
                                <p className="text-center text-gray-500 italic py-20">No data available for assignments yet.</p>
                            )}
                        </div>
                    )}

                    {/* Modal for creating assignment */}
                    {showCreateAssignment && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="glass-card rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-white/10">
                                <h2 className="text-xl font-bold text-gradient mb-6">Create Assignment</h2>
                                <form onSubmit={handleCreateAssignment} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                                        <input
                                            type="text"
                                            className="aiclassroom-input"
                                            value={newAssignment.title}
                                            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                        <textarea
                                            className="aiclassroom-input h-32"
                                            value={newAssignment.description}
                                            onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Formatting Instructions (For AI Check)</label>
                                        <textarea
                                            className="aiclassroom-input h-20 placeholder-gray-400 text-sm"
                                            placeholder="e.g. Font: Times New Roman, Size: 12, Double Spaced, 1 inch margins..."
                                            value={newAssignment.formatting_instructions}
                                            onChange={(e) => setNewAssignment({ ...newAssignment, formatting_instructions: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Points</label>
                                            <input
                                                type="number"
                                                className="aiclassroom-input"
                                                value={newAssignment.points}
                                                onChange={(e) => setNewAssignment({ ...newAssignment, points: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                                            <input
                                                type="datetime-local"
                                                className="aiclassroom-input"
                                                value={newAssignment.due_date}
                                                onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button type="button" onClick={() => setShowCreateAssignment(false)} className="px-4 py-2 text-gray-500 font-medium">Cancel</button>
                                        <button type="submit" className="google-button google-button-primary">Assign</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <AIAssistant classroomId={id} />
        </div>
    );
};

export default ClassroomDetail;
