export default function PlatformSelector({ selectedPlatforms, onToggle }) {
    const platforms = [
        { id: 'youtube', name: 'YouTube', emoji: '📺', color: 'text-red-500', bg: 'bg-red-500/10' },
        { id: 'tiktok', name: 'TikTok', emoji: '🎵', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        { id: 'instagram', name: 'Instagram', emoji: '📸', color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { id: 'facebook', name: 'Facebook', emoji: '👥', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                    <button
                        key={platform.id}
                        onClick={() => onToggle(platform.id)}
                        className={`platform-btn ${isSelected ? 'active ' + platform.color : ''} ${platform.bg}`}
                    >
                        <span className="text-4xl">{platform.emoji}</span>
                        <span className={`font-medium ${isSelected ? platform.color : 'text-gray-400'}`}>
                            {platform.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
