import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';
import { User, Mail, Shield, Camera, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        role: '',
        first_name: '',
        last_name: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('users/me/');
            setProfile(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load profile');
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.patch('users/me/', profile);
            setProfile(response.data);
            // Also update auth context user if needed
            setUser({ ...user, username: response.data.username });
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="flex  min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-10 animate-fade-in flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-200 font-outfit">My Profile</h1>
                            <p className="text-gray-400 mt-1">Manage your account settings and preferences</p>
                        </div>
                        <NotificationCenter />
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="md:col-span-1 space-y-6 animate-slide-up">
                            <div className="glass-card p-8 flex flex-col items-center text-center">
                                <div className="relative group mb-6">
                                    <div className="w-32 h-32 rounded-full bg-gradient-main border-4 border-white shadow-xl flex items-center justify-center text-5xl font-bold text-white overflow-hidden">
                                        {profile.avatar ? (
                                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            profile.username?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg border border-white/10 text-gray-300 hover:text-white transition-colors">
                                        <Camera size={18} />
                                    </button>
                                </div>
                                <h2 className="text-xl font-bold text-gray-200">{profile.username}</h2>
                                <p className="text-sm text-gray-400 capitalize px-3 py-1 bg-white/10 rounded-full mt-2 font-medium">
                                    {profile.role}
                                </p>
                            </div>

                            <div className="glass-card p-6 space-y-4">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Shield size={18} className="text-white" />
                                    <span className="text-sm font-medium">Account Status: Active</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Mail size={18} className="text-white" />
                                    <span className="text-sm font-medium truncate">{profile.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Settings Form */}
                        <div className="md:col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="glass-card p-8">
                                <h3 className="text-lg font-bold text-gray-200 mb-6 pb-2 border-b border-white/10">Personal Information</h3>
                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                                            <input
                                                type="text"
                                                className="aiclassroom-input"
                                                value={profile.username || ''}
                                                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                                            <input
                                                type="email"
                                                className="aiclassroom-input"
                                                value={profile.email || ''}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">First Name</label>
                                            <input
                                                type="text"
                                                className="aiclassroom-input"
                                                value={profile.first_name || ''}
                                                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Name</label>
                                            <input
                                                type="text"
                                                className="aiclassroom-input"
                                                value={profile.last_name || ''}
                                                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="google-button btn-modern px-8 py-3 rounded-xl shadow-lg shadow-google-blue/20 hover:shadow-google-blue/40"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="glass-card p-8 mt-8 border-red-100 bg-red-50/10">
                                <h3 className="text-lg font-bold text-red-600 mb-4">Security</h3>
                                <p className="text-sm text-gray-400 mb-6">Updating your password will require you to log in again on all devices.</p>
                                <button className="google-button border border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-6 py-2 font-semibold transition-all">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
