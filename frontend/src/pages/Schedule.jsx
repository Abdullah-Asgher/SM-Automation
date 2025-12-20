import { useEffect } from 'react';
import { usePostStore } from '../store';
import { Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Schedule() {
    const { posts, fetchPosts, deletePost } = usePostStore();

    useEffect(() => {
        fetchPosts('SCHEDULED');
    }, []);

    const platformIcons = {
        YOUTUBE: '📺',
        TIKTOK: '🎵',
        INSTAGRAM: '📸',
        FACEBOOK: '👥',
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
                                    src={post.video.thumbnailPath || '/placeholder.jpg'}
                                    alt={post.video.title}
                                    className="w-40 h-40 rounded-lg object-cover"
                                />

                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">{post.video.title}</h3>

                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="flex items-center gap-2 text-gray-400">
                                            <span className="text-3xl">{platformIcons[post.platform]}</span>
                                            <span className="capitalize">{post.platform.toLowerCase()}</span>
                                        </span>
                                        <span className="text-gray-500">•</span>
                                        <span className="text-gray-400">
                                            {new Date(post.scheduledTime).toLocaleString()}
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
