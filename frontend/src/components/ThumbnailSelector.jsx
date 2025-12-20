import { useState } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ThumbnailSelector({ videoFile, currentThumbnail, onChange, videoId, platform = 'youtube', videoAspectRatio }) {
    const [mode, setMode] = useState('auto'); // 'auto' | 'select' | 'upload'
    const [frames, setFrames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFrame, setSelectedFrame] = useState(null);
    const [youtubeFormat, setYoutubeFormat] = useState('regular'); // 'shorts' | 'regular'
    const [autoThumbnail, setAutoThumbnail] = useState(null);

    // Auto-detect YouTube format based on video aspect ratio
    useState(() => {
        if (platform === 'youtube' && videoAspectRatio) {
            setYoutubeFormat(videoAspectRatio < 1 ? 'shorts' : 'regular');
        }
    }, [videoAspectRatio, platform]);

    const loadFrames = async () => {
        if (!videoFile) {
            toast.error('Please upload a video first');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('video', videoFile);
            formData.append('platform', platform);
            formData.append('format', platform === 'youtube' ? youtubeFormat : 'regular');

            const response = await axios.post('/api/videos/generate-frames', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setFrames(response.data.frames);
        } catch (error) {
            console.error('Error generating frames:', error);
            toast.error('Failed to generate thumbnail frames');
        } finally {
            setLoading(false);
        }
    };

    const handleFrameSelect = async (frame) => {
        if (!videoId) {
            setSelectedFrame(frame.path);
            onChange(frame.path);
            return;
        }

        try {
            await axios.post(`/api/videos/${videoId}/thumbnail/select`, {
                framePath: frame.path
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setSelectedFrame(frame.path);
            onChange(frame.path);
            toast.success('Thumbnail updated!');
        } catch (error) {
            console.error('Error selecting frame:', error);
            toast.error('Failed to update thumbnail');
        }
    };

    const handleCustomUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
            toast.error('Please upload a JPEG or PNG image');
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB');
            return;
        }

        if (!videoId) {
            // Preview mode - just show the local file
            const reader = new FileReader();
            reader.onload = (e) => {
                onChange(e.target.result);
            };
            reader.readAsDataURL(file);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('thumbnail', file);

            const response = await axios.post(`/api/videos/${videoId}/thumbnail/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            onChange(response.data.thumbnailPath);
            toast.success('Custom thumbnail uploaded!');
        } catch (error) {
            console.error('Error uploading thumbnail:', error);
            toast.error('Failed to upload thumbnail');
        }
    };

    // Load auto thumbnail
    const loadAutoThumbnail = async () => {
        if (!videoFile) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('video', videoFile);
            formData.append('platform', platform);
            formData.append('format', platform === 'youtube' ? youtubeFormat : 'regular');

            const response = await axios.post('/api/videos/generate-frames', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Use the first frame as auto thumbnail (at 3-second mark)
            if (response.data.frames && response.data.frames.length > 0) {
                const firstFrame = response.data.frames[0];
                setAutoThumbnail(firstFrame);
                onChange(firstFrame.path);
            }
        } catch (error) {
            console.error('Error generating auto thumbnail:', error);
            toast.error('Failed to generate auto thumbnail');
        } finally {
            setLoading(false);
        }
    };

    // Auto-load frames when switching to "Select Frame" mode or auto thumbnail for "Auto" mode
    const handleModeChange = (newMode) => {
        setMode(newMode);
        if (newMode === 'select' && frames.length === 0) {
            loadFrames();
        } else if (newMode === 'auto' && !autoThumbnail) {
            loadAutoThumbnail();
        }
    };

    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Thumbnail</h3>
            </div>

            {/* YouTube Format Toggle */}
            {platform === 'youtube' && (
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => { setYoutubeFormat('regular'); setFrames([]); }}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2
                            ${youtubeFormat === 'regular' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        Regular (16:9)
                    </button>
                    <button
                        onClick={() => { setYoutubeFormat('shorts'); setFrames([]); }}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2
                            ${youtubeFormat === 'shorts' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        Shorts (9:16)
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                <button
                    onClick={() => handleModeChange('auto')}
                    className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2
                        ${mode === 'auto' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <Sparkles size={16} />
                    Auto
                </button>
                <button
                    onClick={() => handleModeChange('select')}
                    className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2
                        ${mode === 'select' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <Film size={16} />
                    Select Frame
                </button>
                <button
                    onClick={() => handleModeChange('upload')}
                    className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2
                        ${mode === 'upload' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <ImageIcon size={16} />
                    Upload Custom
                </button>
            </div>

            {/* Current Thumbnail Preview */}
            {currentThumbnail && !currentThumbnail.startsWith('blob:') && (
                <div>
                    <p className="text-sm text-gray-400 mb-2">Current Thumbnail:</p>
                    <div className="w-full h-48 bg-black/20 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                            src={currentThumbnail.startsWith('data:')
                                ? currentThumbnail
                                : `http://localhost:3000/${currentThumbnail}`}
                            alt="Video thumbnail"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                </div>
            )}

            {/* Mode-specific UI */}
            {mode === 'auto' && (
                <div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                            <p className="text-gray-400">Generating auto thumbnail...</p>
                        </div>
                    ) : autoThumbnail ? (
                        <div className="space-y-3">
                            <div className={`${platform === 'youtube' && youtubeFormat === 'shorts' || platform !== 'youtube' ? 'aspect-[9/16] max-w-xs mx-auto' : 'aspect-[16/9]'} bg-black/20 rounded-lg overflow-hidden flex items-center justify-center`}>
                                <img
                                    src={autoThumbnail.url}
                                    alt="Auto-generated thumbnail"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <p className="text-sm text-gray-400 text-center">
                                Generated at {autoThumbnail.time.toFixed(1)}s
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white/5 rounded-lg p-4 text-center">
                            <Sparkles className="mx-auto mb-2 text-primary-400" size={32} />
                            <p className="text-sm text-gray-400 mb-3">
                                Click below to generate an auto thumbnail
                            </p>
                            <button
                                onClick={loadAutoThumbnail}
                                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                            >
                                Generate Auto Thumbnail
                            </button>
                        </div>
                    )}
                </div>
            )}

            {mode === 'select' && (
                <div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                            <p className="text-gray-400">Generating frames...</p>
                        </div>
                    ) : frames.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                            {frames.map((frame, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleFrameSelect(frame)}
                                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                                        ${selectedFrame === frame.path
                                            ? 'border-primary-500 ring-2 ring-primary-500/50'
                                            : 'border-white/10 hover:border-primary-500/50'}`}
                                >
                                    <div className="w-full h-24 bg-black/20 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={frame.url}
                                            alt={`Frame ${index + 1}`}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                                        <p className="text-xs text-white">{frame.time.toFixed(1)}s</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 rounded-lg p-4 text-center">
                            <Film className="mx-auto mb-2 text-gray-400" size={32} />
                            <p className="text-sm text-gray-400 mb-3">
                                Click below to generate thumbnail options from your video
                            </p>
                            <button
                                onClick={loadFrames}
                                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                            >
                                Generate Frames
                            </button>
                        </div>
                    )}
                </div>
            )}

            {mode === 'upload' && (
                <div>
                    <label className="block">
                        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
                            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                            <p className="text-sm text-gray-400 mb-1">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                                PNG or JPEG (max 2MB)
                            </p>
                        </div>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleCustomUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            )}
        </div>
    );
}
