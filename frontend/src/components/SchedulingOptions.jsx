import { Zap, Calendar, Bot } from 'lucide-react';

export default function SchedulingOptions({
    scheduleMode,
    setScheduleMode,
    selectedPlatforms,
    scheduledTimes,
    setScheduledTimes,
}) {
    const options = [
        {
            id: 'now',
            label: 'Post Now',
            icon: Zap,
            description: 'Upload with smart delays (5-15 min between platforms)',
        },
        {
            id: 'manual',
            label: 'Manual Schedule',
            icon: Calendar,
            description: 'Choose specific times for each platform',
        },
        {
            id: 'ai',
            label: 'AI Smart Schedule',
            icon: Bot,
            description: 'Let AI choose optimal posting times',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {options.map((option) => {
                    const Icon = option.icon;
                    const isSelected = scheduleMode === option.id;
                    return (
                        <button
                            key={option.id}
                            onClick={() => setScheduleMode(option.id)}
                            className={`glass-card p-4 text-left transition-all duration-300 hover:scale-105 
                         ${isSelected ? 'border-2 border-primary-500 bg-primary-500/10' : ''}`}
                        >
                            <Icon size={24} className={isSelected ? 'text-primary-500' : 'text-gray-400'} />
                            <p className="font-medium mt-2">{option.label}</p>
                            <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                        </button>
                    );
                })}
            </div>

            {/* Manual Schedule Inputs */}
            {scheduleMode === 'manual' && selectedPlatforms.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm text-gray-400">Set times for each platform:</p>
                    {selectedPlatforms.map((platform) => (
                        <div key={platform} className="flex items-center gap-4">
                            <span className="w-28 capitalize">{platform}</span>
                            <input
                                type="datetime-local"
                                value={scheduledTimes[platform] || ''}
                                onChange={(e) =>
                                    setScheduledTimes((prev) => ({
                                        ...prev,
                                        [platform]: e.target.value,
                                    }))
                                }
                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
