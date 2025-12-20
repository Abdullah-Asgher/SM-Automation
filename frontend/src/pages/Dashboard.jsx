import { useEffect } from 'react';
import { usePostStore, useAnalyticsStore } from '../store';
import { Video, Eye, Heart, MessageCircle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const { posts, fetchPosts } = usePostStore();
    const { overview, fetchOverview } = useAnalyticsStore();

    useEffect(() => {
        fetchPosts();
        fetchOverview();
    }, []);

    const platformIcons = {
        YOUTUBE: '📺',
        TIKTOK: '🎵',
        INSTAGRAM: '📸',
        FACEBOOK: '👥',
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
                        {scheduledPosts.map((post) => (
                            <div key={post.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={post.video.thumbnailPath || '/placeholder.jpg'}
                                        alt={post.video.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div>
                                        <p className="font-medium">{post.video.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-2xl">{platformIcons[post.platform]}</span>
                                            <span className="text-sm text-gray-400">
                                                {new Date(post.scheduledTime).toLocaleString()}
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
                                    src={post.video.thumbnailPath || '/placeholder.jpg'}
                                    alt={post.video.title}
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{post.video.title}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                        <span>{platformIcons[post.platform]}</span>
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
