import { useEffect } from 'react';
import { usePostStore } from '../store';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Schedule() {
    const { posts, fetchPosts, deletePost } = usePostStore();

    useEffect(() => {
        fetchPosts('SCHEDULED');
    }, []);

    // Platform icon components with official colors
    const PlatformIcon = ({ platform }) => {
        const iconProps = { width: 28, height: 28, className: "inline-block" };

        switch (platform) {
            case 'YOUTUBE':
                return (
                    <div className="flex items-center gap-1 px-3 py-2 bg-red-500/20 rounded-md" title="YouTube">
                        <svg {...iconProps} viewBox="0 0 24 24" fill="#FF0000">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                    </div>
                );
            case 'TIKTOK':
                return (
                    <div className="flex items-center gap-1 px-3 py-2 bg-black/40 rounded-md" title="TikTok">
                        <svg {...iconProps} viewBox="0 0 24 24" fill="#fff">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                    </div>
                );
            case 'INSTAGRAM':
                return (
                    <div className="flex items-center gap-1 px-3 py-2 bg-pink-500/20 rounded-md" title="Instagram">
                        <svg {...iconProps} viewBox="0 0 24 24" fill="url(#instagram-gradient)">
                            <defs>
                                <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f09433" />
                                    <stop offset="25%" stopColor="#e6683c" />
                                    <stop offset="50%" stopColor="#dc2743" />
                                    <stop offset="75%" stopColor="#cc2366" />
                                    <stop offset="100%" stopColor="#bc1888" />
                                </linearGradient>
                            </defs>
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                    </div>
                );
            case 'FACEBOOK':
                return (
                    <div className="flex items-center gap-1 px-3 py-2 bg-blue-500/20 rounded-md" title="Facebook">
                        <svg {...iconProps} viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </div>
                );
            default:
                return <span className="text-2xl">❓</span>;
        }
    };

    const handleCancel = async (postId) => {
        if (window.confirm('Are you sure you want to cancel this scheduled post?')) {
            try {
                await deletePost(postId);
                toast.success('Scheduled post cancelled');
            } catch (error) {
                toast.error('Failed to cancel post');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Scheduled Posts</h1>
                <p className="text-gray-400">Manage your upcoming posts across all platforms.</p>
            </div>

            {posts.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <CalendarIcon size={64} className="mx-auto mb-4 text-gray-500" />
                    <p className="text-xl text-gray-400 mb-2">No scheduled posts</p>
                    <p className="text-gray-500">Upload a video and schedule it to see it here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {posts.map((post) => (
                        <div key={post.id} className="glass-card p-6">
                            <div className="flex items-start gap-6">
                                <img
                                    src={post.video.thumbnailPath ? `http://localhost:3000/${post.video.thumbnailPath}` : '/placeholder.jpg'}
                                    alt={post.video.title}
                                    className="w-40 h-40 rounded-lg object-cover"
                                />

                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">{post.video.title}</h3>

                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="flex items-center gap-2 text-gray-400">
                                            <PlatformIcon platform={post.platform} />
                                            <span className="capitalize">{post.platform.toLowerCase()}</span>
                                        </span>
                                        <span className="text-gray-500">•</span>
                                        <span className="flex items-center gap-1 text-sm font-medium text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded">
                                            <Clock size={16} />
                                            {new Date(post.scheduledTime).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </span>
                                    </div>

                                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                        {post.platformSpecificDescription || post.video.description}
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                                            Scheduled
                                        </span>
                                        <button
                                            onClick={() => handleCancel(post.id)}
                                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 
                                 rounded-lg transition-colors duration-200 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
