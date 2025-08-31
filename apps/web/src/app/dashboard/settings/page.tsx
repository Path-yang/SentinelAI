"use client";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Application Settings */}
        <div className="border rounded-lg p-6">
          <h3 className="font-medium text-lg mb-4">Application Settings</h3>
          <p className="text-sm text-gray-500">
            Application configuration options will appear here.
          </p>
        </div>

        {/* Camera Settings */}
        <div className="border rounded-lg p-6">
          <h3 className="font-medium text-lg mb-4">Camera Settings</h3>
          <p className="text-sm text-gray-500">
            Camera configuration options will appear here.
          </p>
        </div>
      </div>
    </div>
  );
} 