import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth.api';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';

const ProfilePage = () => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [manualStyle, setManualStyle] = useState<string>(user?.manualLearningStyle || 'none');

    useEffect(() => {
        if (user?.manualLearningStyle) {
            setManualStyle(user.manualLearningStyle);
        }
    }, [user]);

    const handleUpdateStyle = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await authAPI.updateProfile({
                manualLearningStyle: manualStyle === 'none' ? null : manualStyle
            });
            await refreshUser();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex flex-col font-outfit">
            <Navigation onCTAClick={() => { }} onSignInClick={() => { }} />

            <main className="flex-grow container mx-auto px-4 py-32 relative">
                {/* Background Glows */}
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-primary mb-8 group transition-colors"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Chat</span>
                    </Link>

                    <h1 className="text-5xl font-black mb-12 text-white tracking-tighter">
                        User <span className="text-primary">Profile</span>
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* User Info Card */}
                        <div className="md:col-span-1 glass p-8 rounded-[2rem] border border-white/5 h-fit">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center text-3xl font-black mb-6 text-secondary shadow-glow-primary">
                                    {user?.name?.[0].toUpperCase()}
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                                <p className="text-white/40 text-sm mb-8">{user?.email}</p>

                                <div className="w-full pt-8 border-t border-white/5 text-left">
                                    <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold mb-2">System Access</p>
                                    <p className="font-bold text-primary capitalize tracking-tight">{user?.authProvider} Interface</p>
                                </div>
                            </div>
                        </div>

                        {/* Learner Profile Card */}
                        <div className="md:col-span-2 space-y-8">
                            <div className="glass p-8 rounded-[2rem] border border-white/5">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                                    <span className="p-2 bg-primary/10 rounded-lg text-primary">🤖</span>
                                    AI Neural Summary
                                </h3>
                                {user?.learnerTypeSummary ? (
                                    <p className="text-lg text-white/80 leading-relaxed italic bg-white/[0.03] p-6 rounded-2xl border border-white/5">
                                        "{user.learnerTypeSummary}"
                                    </p>
                                ) : (
                                    <p className="text-white/40 italic">Sync your neural profile to generate AI summary.</p>
                                )}

                                <div className="mt-10">
                                    <h4 className="font-bold mb-6 text-white/90 tracking-tight text-lg">Cognitive Breakdown</h4>
                                    <div className="space-y-6">
                                        {['visual', 'reading', 'kinesthetic'].map((style) => (
                                            <div key={style} className="space-y-3">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                                    <span className="text-white/40">{style}</span>
                                                    <span className="text-primary">{user?.learningStyle?.[style as keyof typeof user.learningStyle] || 0}%</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary shadow-glow-primary transition-all duration-1000"
                                                        style={{ width: `${user?.learningStyle?.[style as keyof typeof user.learningStyle] || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Preferences Card */}
                            <div className="glass p-8 rounded-[2rem] border border-white/5">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                                    <span className="p-2 bg-accent/10 rounded-lg text-accent">⚙️</span>
                                    Control Core
                                </h3>

                                <form onSubmit={handleUpdateStyle} className="space-y-8">
                                    <div>
                                        <label className="block font-bold text-white/90 mb-2">Manual Style Override</label>
                                        <p className="text-sm text-white/40 mb-6">
                                            The system defaults to your neural mapping results. Use this to manually recalibrate.
                                        </p>
                                        <select
                                            value={manualStyle}
                                            onChange={(e) => setManualStyle(e.target.value)}
                                            className="w-full p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                                        >
                                            <option value="none" className="bg-secondary">System Recommendation (Standard)</option>
                                            <option value="visual" className="bg-secondary">Visual Synthesis (Nodes & Flow)</option>
                                            <option value="reading" className="bg-secondary">Semantic Analysis (Docs & Code)</option>
                                            <option value="kinesthetic" className="bg-secondary">Kinesthetic Execution (Interactions)</option>
                                            <option value="mixed" className="bg-secondary">Hybrid Multi-Modal</option>
                                        </select>
                                    </div>

                                    {error && <p className="text-red-400 text-sm font-medium flex items-center gap-2">⚠️ {error}</p>}
                                    {success && <p className="text-primary text-sm font-bold flex items-center gap-2">✓ Neural profile recalibrated!</p>}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary text-secondary font-black px-8 py-4 rounded-2xl hover:shadow-glow-primary transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                                    >
                                        {loading ? 'Processing...' : 'Save Configuration'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProfilePage;
