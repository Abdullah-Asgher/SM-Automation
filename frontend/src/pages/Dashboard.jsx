import { useEffect } from 'react';
import { usePostStore, useAnalyticsStore } from '../store';
import { Video, Eye, Heart, MessageCircle, TrendingUp, Clock } from 'lucide-react';

export default function Dashboard() {
    const { posts, fetchPosts } = usePostStore();
    const { overview, fetchOverview } = useAnalyticsStore();

    useEffect(() => {
        fetchPosts();
        fetchOverview();
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

    const scheduledPosts = posts.filter((p) => p.status === 'SCHEDULED');
    const recentPosts = posts.filter((p) => p.status === 'POSTED').slice(0, 5);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-gray-400">Welcome back! Here's your content overview.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Posts</p>
                            <p className="text-3xl font-bold mt-1">{overview?.overview?.totalPosts || 0}</p>
                        </div>
                        <Video className="text-primary-500" size={32} />
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Views</p>
                            <p className="text-3xl font-bold mt-1">
                                {(overview?.overview?.totalViews || 0).toLocaleString()}
                            </p>
                        </div>
                        <Eye className="text-blue-500" size={32} />
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text- gray-400 text-sm">Total Likes</p>
                            <p className="text-3xl font-bold mt-1">
                                {(overview?.overview?.totalLikes || 0).toLocaleString()}
                            </p>
                        </div>
                        <Heart className="text-red-500" size={32} />
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Comments</p>
                            <p className="text-3xl font-bold mt-1">
                                {(overview?.overview?.totalComments || 0).toLocaleString()}
                            </p>
                        </div>
                        <MessageCircle className="text-green-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Scheduled Posts */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4">Scheduled Posts</h2>
                {scheduledPosts.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No scheduled posts</p>
                ) : (
                    <div className="space-y-3">
                        {/* Group posts by video */}
                        {Object.entries(
                            scheduledPosts.reduce((acc, post) => {
                                const videoId = post.video.id;
                                if (!acc[videoId]) {
                                    acc[videoId] = {
                                        video: post.video,
                                        platforms: [],
                                        scheduledTime: post.scheduledTime,
                                    };
                                }
                                acc[videoId].platforms.push(post.platform);
                                return acc;
                            }, {})
                        ).map(([videoId, data]) => (
                            <div key={videoId} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={data.video.thumbnailPath ? `http://localhost:3000/${data.video.thumbnailPath}` : '/placeholder.jpg'}
                                        alt={data.video.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div>
                                        <p className="font-medium">{data.video.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex gap-1">
                                                {data.platforms.map((platform, idx) => (
                                                    <PlatformIcon key={idx} platform={platform} />
                                                ))}
                                            </div>
                                            <span className="flex items-center gap-1 text-sm font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                                                <Clock size={14} />
                                                {new Date(data.scheduledTime).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                                    Scheduled
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Posts */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
                {recentPosts.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No posts yet</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {recentPosts.map((post) => (
                            <div key={post.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                                <img
                                    src={post.video.thumbnailPath ? `http://localhost:3000/${post.video.thumbnailPath}` : '/placeholder.jpg'}
                                    alt={post.video.title}
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{post.video.title}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                        <PlatformIcon platform={post.platform} />
                                        <span className="flex items-center gap-1">
                                            <Eye size={16} /> {post.analytics?.views || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Heart size={16} /> {post.analytics?.likes || 0}
                                        </span>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                    Posted
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
