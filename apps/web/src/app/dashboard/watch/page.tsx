"use client";

import { useState, useEffect } from "react";

interface AIModel {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  accuracy: number;
  lastUpdated: number;
}

export default function WatchPage() {
  const [models, setModels] = useState<AIModel[]>([
    {
      id: '1',
      name: 'Object Detection v2.1',
      status: 'active',
      accuracy: 94.2,
      lastUpdated: Date.now() - 3600000 // 1 hour ago
    },
    {
      id: '2',
      name: 'Face Recognition v1.8',
      status: 'inactive',
      accuracy: 89.7,
      lastUpdated: Date.now() - 7200000 // 2 hours ago
    }
  ]);

  const [newModelName, setNewModelName] = useState('');

  const addModel = () => {
    if (!newModelName.trim()) return;
    
    const newModel: AIModel = {
      id: Date.now().toString(),
      name: newModelName,
      status: 'inactive',
      accuracy: 0,
      lastUpdated: Date.now()
    };
    
    setModels([...models, newModel]);
    setNewModelName('');
  };

  const toggleModel = (id: string) => {
    setModels(models.map(model => 
      model.id === id 
        ? { ...model, status: model.status === 'active' ? 'inactive' : 'active' }
        : model
    ));
  };

  const deleteModel = (id: string) => {
    setModels(models.filter(model => model.id !== id));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">AI Detection Models</h1>
      
      {/* Add New Model */}
      <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Model</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newModelName}
            onChange={(e) => setNewModelName(e.target.value)}
            placeholder="Enter model name"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addModel}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Model
          </button>
        </div>
      </div>

      {/* Models List */}
      <div className="grid gap-4">
        {models.map((model) => (
          <div key={model.id} className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{model.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    model.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {model.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  <span>Accuracy: {model.accuracy}%</span>
                  <span>Updated: {new Date(model.lastUpdated).toLocaleTimeString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => toggleModel(model.id)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    model.status === 'active'
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {model.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteModel(model.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 