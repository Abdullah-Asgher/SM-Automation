import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAIStore } from '../store';
import toast from 'react-hot-toast';

export default function AIDescriptionModal({ originalDescription, onSelect, onClose }) {
    const { generateDescriptions } = useAIStore();
    const [descriptions, setDescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDescriptions() {
            try {
                const result = await generateDescriptions(originalDescription);
                setDescriptions(result);
            } catch (error) {
                toast.error('Failed to generate descriptions');
                onClose();
            } finally {
                setLoading(false);
            }
        }

        fetchDescriptions();
    }, [originalDescription]);

    const platformEmojis = {
        tiktok: '🎵',
        youtube: '📺',
        instagram: '📸',
        facebook: '👥',
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-card p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span>✨</span> AI-Generated Descriptions
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 size={48} className="animate-spin text-primary-500 mb-4" />
                        <p className="text-gray-400">Generating optimized descriptions...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {descriptions.map((item, index) => (
                            <div key={index} className="bg-white/5 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{platformEmojis[item.platform] || '📝'}</span>
                                    <span className="font-medium capitalize">{item.platform}</span>
                                </div>
                                <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">
                                    {item.description}
                                </p>
                                <button
                                    onClick={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg 
                             transition-colors duration-200 text-sm font-medium"
                                >
                                    Use This Description
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg 
                     transition-colors duration-200"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
