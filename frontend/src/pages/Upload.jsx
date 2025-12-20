import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, Sparkles, Calendar, Zap, Bot } from 'lucide-react';
import { useVideoStore, usePostStore, useAIStore } from '../store';
import toast from 'react-hot-toast';
import PlatformSelector from '../components/PlatformSelector';
import AIDescriptionModal from '../components/AIDescriptionModal';
import SchedulingOptions from '../components/SchedulingOptions';
import ThumbnailSelector from '../components/ThumbnailSelector';

export default function Upload() {
    const navigate = useNavigate();
    const { uploadVideo } = useVideoStore();
    const { createPosts } = usePostStore();
    const { generateDescriptions } = useAIStore();

    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [videoAspectRatio, setVideoAspectRatio] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [platformThumbnails, setPlatformThumbnails] = useState({});
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [platformDescriptions, setPlatformDescriptions] = useState({});
    const [scheduleMode, setScheduleMode] = useState('now'); // 'now', 'manual', 'ai'
    const [scheduledTimes, setScheduledTimes] = useState({});
    const [showAIModal, setShowAIModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'video/*': ['.mp4', '.mov', '.webm'],
        },
        maxSize: 500 * 1024 * 1024, // 500MB
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                setVideoFile(file);
                const videoUrl = URL.createObjectURL(file);
                setVideoPreview(videoUrl);

                // Detect video aspect ratio
                const video = document.createElement('video');
                video.onloadedmetadata = () => {
                    const ratio = video.videoWidth / video.videoHeight;
                    setVideoAspectRatio(ratio);
                    URL.revokeObjectURL(videoUrl);
                };
                video.src = videoUrl;

                // Auto-fill title from filename
                if (!title) {
                    setTitle(file.name.replace(/\.[^/.]+$/, ''));
                }
            }
        },
    });

    const handlePlatformToggle = (platform) => {
        setSelectedPlatforms((prev) =>
            prev.includes(platform)
                ? prev.filter((p) => p !== platform)
                : [...prev, platform]
        );
    };

    const handleSelectAllPlatforms = () => {
        setSelectedPlatforms(['youtube', 'tiktok', 'instagram', 'facebook']);
    };

    const handleGenerateAI = async () => {
        if (!description) {
            toast.error('Please enter a description first');
            return;
        }

        try {
            setShowAIModal(true);
        } catch (error) {
            toast.error('Failed to generate AI descriptions');
        }
    };

    const handleAISelect = (platformData) => {
        // Update the main description textarea
        setDescription(platformData.description);

        // Also update platform-specific descriptions
        setPlatformDescriptions((prev) => ({
            ...prev,
            [platformData.platform]: platformData.description,
        }));

        toast.success(`Description updated for ${platformData.platform}`);
    };

    const handleSubmit = async () => {
        if (!videoFile) {
            toast.error('Please select a video file');
            return;
        }

        if (!title) {
            toast.error('Please enter a title');
            return;
        }

        if (selectedPlatforms.length === 0) {
            toast.error('Please select at least one platform');
            return;
        }

        setIsUploading(true);

        try {
            // Step 1: Upload video
            const formData = new FormData();
            formData.append('video', videoFile);
            formData.append('title', title);
            formData.append('description', description);

            const uploadedVideo = await uploadVideo(formData);
            toast.success('Video uploaded successfully!');

            // Step 2: Create posts for each platform
            const platforms = selectedPlatforms.map((platform) => ({
                platform,
                title,
                description: platformDescriptions[platform] || description,
                hashtags: [], // Could extract from description
            }));

            await createPosts({
                videoId: uploadedVideo.id,
                platforms,
                scheduleMode,
                scheduledTimes: scheduleMode === 'manual' ? scheduledTimes : undefined,
            });

            toast.success(
                scheduleMode === 'now'
                    ? 'Posts are being uploaded!'
                    : 'Posts scheduled successfully!'
            );

            // Reset form
            setVideoFile(null);
            setVideoPreview(null);
            setTitle('');
            setDescription('');
            setSelectedPlatforms([]);
            setPlatformDescriptions({});
            setScheduleMode('now');

            // Navigate to dashboard
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.error || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
                <p className="text-gray-400">Upload once, post everywhere.</p>
            </div>

            {/* Drag and Drop */}
            <div
                {...getRootProps()}
                className={`glass-card p-12 text-center cursor-pointer transition-all duration-300 
                   ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'hover:border-white/20'}`}
            >
                <input {...getInputProps()} />
                <UploadIcon size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">
                    {isDragActive ? 'Drop the video here' : 'Drag & Drop Video Here'}
                </p>
                <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                <p className="text-xs text-gray-500">
                    Supported: MP4, MOV, WebM • Max 500MB • Max 60 seconds
                </p>
            </div>

            {/* Video Preview */}
            {videoPreview && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <video
                            src={videoPreview}
                            className="w-32 h-32 rounded-lg object-cover"
                            controls
                        />
                        <div className="flex-1">
                            <p className="font-medium">{videoFile.name}</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Size: {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Title */}
            <div className="glass-card p-6">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {/* Description */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Description</label>
                    <button
                        onClick={handleGenerateAI}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 
                       text-purple-400 rounded-lg transition-colors duration-200"
                    >
                        <Sparkles size={16} />
                        AI Rewrite
                    </button>
                </div>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter video description and hashtags"
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
            </div>

            {/* Thumbnail Selection - Platform Specific */}
            {videoPreview && selectedPlatforms.length > 0 && (
                <div className="space-y-4">
                    {selectedPlatforms.map((platform) => (
                        <div key={platform} className="glass-card p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span className="capitalize">{platform}</span> Thumbnail
                                {platform === 'youtube' && videoAspectRatio && (
                                    <span className="text-sm text-gray-400">
                                        ({videoAspectRatio < 1 ? 'Detected: Vertical' : 'Detected: Horizontal'})
                                    </span>
                                )}
                            </h3>
                            <ThumbnailSelector
                                videoFile={videoFile}
                                platform={platform}
                                videoAspectRatio={videoAspectRatio}
                                currentThumbnail={platformThumbnails[platform]}
                                onChange={(thumb) => setPlatformThumbnails(prev => ({ ...prev, [platform]: thumb }))}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Platform Selection */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium">Select Platforms</label>
                    <button
                        onClick={handleSelectAllPlatforms}
                        className="text-sm text-primary-400 hover:text-primary-300"
                    >
                        Select All
                    </button>
                </div>
                <PlatformSelector
                    selectedPlatforms={selectedPlatforms}
                    onToggle={handlePlatformToggle}
                />
            </div>

            {/* Scheduling Options */}
            <div className="glass-card p-6">
                <label className="block text-sm font-medium mb-4">Scheduling</label>
                <SchedulingOptions
                    scheduleMode={scheduleMode}
                    setScheduleMode={setScheduleMode}
                    selectedPlatforms={selectedPlatforms}
                    scheduledTimes={scheduledTimes}
                    setScheduledTimes={setScheduledTimes}
                />
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={isUploading || !videoFile || !title || selectedPlatforms.length === 0}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUploading ? (
                    <span>Uploading...</span>
                ) : scheduleMode === 'now' ? (
                    'Upload & Post Now'
                ) : (
                    'Schedule & Upload'
                )}
            </button>

            {/* AI Modal */}
            {showAIModal && (
                <AIDescriptionModal
                    originalDescription={description}
                    onSelect={handleAISelect}
                    onClose={() => setShowAIModal(false)}
                />
            )}
        </div>
    );
}
