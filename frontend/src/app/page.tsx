import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <main className="max-w-4xl text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SM Automation
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Automatically sync and upload your YouTube videos to Facebook, Instagram, TikTok, and more
        </p>
        
        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/connect"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg border"
          >
            Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-semibold mb-2">Automated Sync</h3>
            <p className="text-gray-600 text-sm">Videos are synced every 3 hours automatically</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl mb-2">🎬</div>
            <h3 className="font-semibold mb-2">Multi-Platform</h3>
            <p className="text-gray-600 text-sm">Upload to all social platforms at once</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl mb-2">✏️</div>
            <h3 className="font-semibold mb-2">Custom Edits</h3>
            <p className="text-gray-600 text-sm">Edit titles, descriptions before upload</p>
          </div>
        </div>
      </main>
    </div>
  );
}
