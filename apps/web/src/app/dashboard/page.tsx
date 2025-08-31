"use client";

import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="container mx-auto py-8">
      {/* Navigation Bar */}
      <nav className="flex gap-4 mb-6">
        <Link 
          href="/dashboard"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Dashboard
        </Link>
        <Link 
          href="/camera"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Connect Camera
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Dashboard Status */}
        <div className="border rounded-lg p-6">
          <h3 className="font-medium text-lg mb-4">Dashboard Status</h3>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm">Connected</span>
          </div>
        </div>

        {/* Camera Status */}
        <div className="border rounded-lg p-6">
          <h3 className="font-medium text-lg mb-4">Camera Status</h3>
          <div className="text-sm text-green-600">Camera connected</div>
        </div>

        {/* AI Detection Status */}
        <div className="border rounded-lg p-6">
          <h3 className="font-medium text-lg mb-4">AI Detection</h3>
          <div className="text-sm text-gray-500">
            No AI models active
            <br />
            <span className="text-xs">Configure AI detection models in the AI Detection page</span>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="border rounded-lg p-6 md:col-span-2 lg:col-span-3">
          <h3 className="font-medium text-lg mb-4">Recent Alerts</h3>
          <div className="text-sm text-gray-500">
            0 alerts in the last 24 hours
            <br />
            <span className="text-xs">Alerts will appear here when detected</span>
          </div>
        </div>
      </div>
    </div>
  );
} 