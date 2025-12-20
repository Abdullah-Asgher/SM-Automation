import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Home, Upload as UploadIcon, Calendar, BarChart3, Link2, LogOut } from 'lucide-react';
import { useAuthStore } from '../store';

export default function Layout() {
    const navigate = useNavigate();
    const { logout, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: Home, label: 'Dashboard' },
        { to: '/upload', icon: UploadIcon, label: 'Upload' },
        { to: '/schedule', icon: Calendar, label: 'Schedule' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/integrations', icon: Link2, label: 'Integrations' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-dark-800/50 backdrop-blur-lg border-r border-white/10 p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gradient">🎬 ShortSync</h1>
                    <p className="text-sm text-gray-400 mt-1">Multi-Platform Automation</p>
                </div>

                <nav className="space-y-2">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 
                         transition-colors duration-200 text-gray-300 hover:text-white"
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 
                     transition-colors duration-200 text-gray-400 hover:text-red-400 w-full"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
