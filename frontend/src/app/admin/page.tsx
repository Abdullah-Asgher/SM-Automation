'use client';

import { useState } from 'react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');

  // Mock data - in production, fetch from API
  const stats = {
    totalUsers: 156,
    activeUsers: 89,
    totalVideos: 1247,
    successfulUploads: 1189,
    failedUploads: 58,
    jobsInQueue: 12,
  };

  const recentUsers = [
    { id: '1', email: 'user1@example.com', connectedAccounts: 4, videosProcessed: 23, joinedAt: '2024-11-01' },
    { id: '2', email: 'user2@example.com', connectedAccounts: 2, videosProcessed: 45, joinedAt: '2024-11-05' },
    { id: '3', email: 'user3@example.com', connectedAccounts: 3, videosProcessed: 12, joinedAt: '2024-11-08' },
  ];

  const recentJobs = [
    { id: '1', user: 'user1@example.com', video: 'My Tutorial Video', status: 'completed', platforms: 'FB, IG, TT, YT', timestamp: '2 mins ago' },
    { id: '2', user: 'user2@example.com', video: 'Product Review', status: 'uploading', platforms: 'FB, IG, TT', timestamp: '5 mins ago' },
    { id: '3', user: 'user3@example.com', video: 'Vlog #45', status: 'failed', platforms: 'FB, IG', timestamp: '10 mins ago' },
  ];

  const systemLogs = [
    { id: '1', level: 'info', message: 'YouTube polling completed: 45 channels checked', timestamp: '1 min ago' },
    { id: '2', level: 'error', message: 'Failed to upload to TikTok: API rate limit exceeded', timestamp: '3 mins ago' },
    { id: '3', level: 'warning', message: 'Token expiring soon for user user4@example.com (Facebook)', timestamp: '15 mins ago' },
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              System Healthy
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Active Users</p>
            <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Videos</p>
            <p className="text-2xl font-bold">{stats.totalVideos}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Successful</p>
            <p className="text-2xl font-bold text-green-600">{stats.successfulUploads}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Failed</p>
            <p className="text-2xl font-bold text-red-600">{stats.failedUploads}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Queue</p>
            <p className="text-2xl font-bold text-blue-600">{stats.jobsInQueue}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b">
            <div className="flex gap-4 px-6">
              {['users', 'jobs', 'logs'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 font-semibold transition ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Connected</th>
                        <th className="text-left py-3 px-4">Videos</th>
                        <th className="text-left py-3 px-4">Joined</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">{user.connectedAccounts}</td>
                          <td className="py-3 px-4">{user.videosProcessed}</td>
                          <td className="py-3 px-4">{user.joinedAt}</td>
                          <td className="py-3 px-4">
                            <button className="text-blue-600 hover:underline text-sm">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Video</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Platforms</th>
                        <th className="text-left py-3 px-4">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentJobs.map((job) => (
                        <tr key={job.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{job.user}</td>
                          <td className="py-3 px-4">{job.video}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              job.status === 'completed' ? 'bg-green-100 text-green-800' :
                              job.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{job.platforms}</td>
                          <td className="py-3 px-4">{job.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">System Logs</h2>
                <div className="space-y-2">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm">{log.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

