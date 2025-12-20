import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../store';
import { TrendingUp, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';

export default function Analytics() {
    const { overview, platformData, fetchOverview, fetchPlatformAnalytics } = useAnalyticsStore();
    const [selectedPlatform, setSelectedPlatform] = useState('all');

    useEffect(() => {
        fetchOverview();
    }, []);

    useEffect(() => {
        if (selectedPlatform !== 'all') {
            fetchPlatformAnalytics(selectedPlatform);
        }
    }, [selectedPlatform]);

    const platforms = [
        { id: 'all', name: 'All Platforms', emoji: '📊' },
        { id: 'youtube', name: 'YouTube', emoji: '📺' },
        { id: 'tiktok', name: 'TikTok', emoji: '🎵' },
        { id: 'instagram', name: 'Instagram', emoji: '📸' },
        { id: 'facebook', name: 'Facebook', emoji: '👥' },
    ];

    const currentData =
        selectedPlatform === 'all'
            ? overview?.overview
            : overview?.byPlatform?.[selectedPlatform];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Analytics</h1>
                <p className="text-gray-400">Track your performance across all platforms.</p>
            </div>

            {/* Platform Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {platforms.map((platform) => (
                    <button
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={`px-6 py-3 rounded-lg whitespace-nowrap transition-all duration-300 
                       ${selectedPlatform === platform.id
                                ? 'bg-primary-500 text-white'
                                : 'glass-card hover:bg-white/10'
                            }`}
                    >
                        <span className="mr-2">{platform.emoji}</span>
                        {platform.name}
                    </button>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Posts</p>
                            <p className="text-3xl font-bold mt-1">{currentData?.posts || currentData?.totalPosts || 0}</p>
                        </div>
                        <TrendingUp className="text-primary-500" size={32} />
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Views</p>
                            <p className="text-3xl font-bold mt-1">
                                {(currentData?.views || currentData?.totalViews || 0).toLocaleString()}
                            </p>
                        </div>
                        <Eye className="text-blue-500" size={32} />
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Likes</p>
                            <p className="text-3xl font-bold mt-1">
                                {(currentData?.likes || currentData?.totalLikes || 0).toLocaleString()}
                            </p>
                        </div>
                        <Heart className="text-red-500" size={32} />
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Comments</p>
                            <p className="text-3xl font-bold mt-1">
                                {(currentData?.comments || currentData?.totalComments || 0).toLocaleString()}
                            </p>
                        </div>
                        <MessageCircle className="text-green-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Platform Breakdown (when "All Platforms" selected) */}
            {selectedPlatform === 'all' && overview?.byPlatform && (
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold mb-4">Platform Breakdown</h2>
                    <div className="space-y-4">
                        {Object.entries(overview.byPlatform).map(([platform, data]) => (
                            <div key={platform} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">
                                        {platform === 'youtube' && '📺'}
                                        {platform === 'tiktok' && '🎵'}
                                        {platform === 'instagram' && '📸'}
                                        {platform === 'facebook' && '👥'}
                                    </span>
                                    <div>
                                        <p className="font-medium capitalize">{platform}</p>
                                        <p className="text-sm text-gray-400">{data.posts} posts</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 text-sm">
                                    <span className="flex items-center gap-1">
                                        <Eye size={16} className="text-blue-500" />
                                        {data.views.toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart size={16} className="text-red-500" />
                                        {data.likes.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Posts for Selected Platform */}
            {selectedPlatform !== 'all' && platformData[selectedPlatform] && (
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
                    <div className="space-y-3">
                        {platformData[selectedPlatform].map((post) => (
                            <div key={post.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                                <img
                                    src={post.video.thumbnailPath || '/placeholder.jpg'}
                                    alt={post.video.title}
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{post.video.title}</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Posted {new Date(post.postedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-4 text-sm">
                                    <span className="flex items-center gap-1">
                                        <Eye size={16} /> {post.analytics?.views || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart size={16} /> {post.analytics?.likes || 0}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
