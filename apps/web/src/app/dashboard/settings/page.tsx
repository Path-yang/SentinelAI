"use client";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Application Settings */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Application Settings</h2>
          <p className="text-sm text-gray-600">
            Application configuration options will appear here.
          </p>
        </div>

        {/* Camera Settings */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Camera Settings</h2>
          <p className="text-sm text-gray-600">
            Camera configuration options will appear here.
          </p>
        </div>
      </div>
    </div>
  );
} 