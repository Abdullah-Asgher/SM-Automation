import { useEffect } from 'react';
import { useIntegrationStore } from '../store';
import { Link2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Integrations() {
    const { connections, fetchConnections, getAuthUrl, disconnect } = useIntegrationStore();

    useEffect(() => {
        fetchConnections();
    }, []);

    const platforms = [
        { id: 'youtube', name: 'YouTube', emoji: '📺', color: 'bg-red-500' },
        { id: 'tiktok', name: 'TikTok', emoji: '🎵', color: 'bg-cyan-500' },
        { id: 'instagram', name: 'Instagram', emoji: '📸', color: 'bg-pink-500' },
        { id: 'facebook', name: 'Facebook', emoji: '👥', color: 'bg-blue-500' },
    ];

    const isConnected = (platformId) => {
        return connections.some(
            (c) => c.platform === platformId.toUpperCase() && c.isActive
        );
    };

    const handleConnect = async (platformId) => {
        try {
            const authUrl = await getAuthUrl(platformId);
            window.location.href = authUrl;
        } catch (error) {
            toast.error(`Failed to connect to ${platformId}`);
        }
    };

    const handleDisconnect = async (platformId) => {
        if (window.confirm(`Are you sure you want to disconnect ${platformId}?`)) {
            try {
                await disconnect(platformId);
                toast.success(`${platformId} disconnected`);
            } catch (error) {
                toast.error(`Failed to disconnect ${platformId}`);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Platform Integrations</h1>
                <p className="text-gray-400">Connect your social media accounts to start posting.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {platforms.map((platform) => {
                    const connected = isConnected(platform.id);
                    return (
                        <div key={platform.id} className="glass-card p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-4 ${platform.color} rounded-lg text-4xl`}>
                                    {platform.emoji}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-1">{platform.name}</h3>

                                    <div className="flex items-center gap-2 mb-4">
                                        {connected ? (
                                            <>
                                                <CheckCircle size={16} className="text-green-500" />
                                                <span className="text-sm text-green-400">Connected</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={16} className="text-gray-500" />
                                                <span className="text-sm text-gray-400">Not connected</span>
                                            </>
                                        )}
                                    </div>

                                    {connected ? (
                                        <button
                                            onClick={() => handleDisconnect(platform.id)}
                                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 
                                 rounded-lg transition-colors duration-200 text-sm"
                                        >
                                            Disconnect
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleConnect(platform.id)}
                                            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white 
                                 rounded-lg transition-colors duration-200 text-sm font-medium"
                                        >
                                            Connect {platform.name}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Important Notes */}
            <div className="glass-card p-6 border-yellow-500/30">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>⚠️</span> Important Notes
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li>• <strong>YouTube:</strong> Uses official YouTube Data API v3</li>
                    <li>• <strong>TikTok:</strong> Requires developer approval (may take 1-2 weeks)</li>
                    <li>• <strong>Instagram:</strong> Requires Business/Creator account linked to Facebook Page</li>
                    <li>• <strong>Facebook:</strong> Posts to your connected Facebook Page</li>
                </ul>
            </div>
        </div>
    );
}
