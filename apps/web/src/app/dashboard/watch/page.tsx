"use client";

import { useState, useEffect } from "react";

interface AIModel {
  id: string;
  name: string;
  category: string;
  description: string;
}

const aiModels: AIModel[] = [
  // Health & Safety
  { id: "falls", name: "Fall Detection", category: "Health & Safety", description: "Detect when someone falls" },
  { id: "immobility", name: "Extended Immobility", category: "Health & Safety", description: "Detect prolonged lack of movement" },
  { id: "seizures", name: "Seizure Detection", category: "Health & Safety", description: "Detect seizure-like movements" },
  
  // Security
  { id: "intruders", name: "Intruder Detection", category: "Security", description: "Detect unauthorized persons" },
  { id: "objects", name: "Abandoned Objects", category: "Security", description: "Detect suspicious objects" },
  { id: "tampering", name: "Camera Tampering", category: "Security", description: "Detect camera obstruction" },
  
  // Emergencies
  { id: "fire", name: "Fire Detection", category: "Emergencies", description: "Detect fire or smoke" },
  { id: "accidents", name: "Accidents", category: "Emergencies", description: "Detect accident scenes" },
  { id: "distress", name: "Distress Signs", category: "Emergencies", description: "Detect signs of distress" },
  
  // Analytics
  { id: "occupancy", name: "Occupancy Counting", category: "Analytics", description: "Count people in area" },
  { id: "dwell", name: "Dwell Time", category: "Analytics", description: "Track time spent in area" },
  { id: "traffic", name: "Traffic Patterns", category: "Analytics", description: "Analyze movement patterns" },
];

export default function AIDetectionPage() {
  const [activeModels, setActiveModels] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Load active models from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("activeAIModels");
      if (saved) {
        setActiveModels(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load active AI models:", error);
    }
  }, []);

  // Save active models to localStorage
  const saveActiveModels = (models: string[]) => {
    try {
      localStorage.setItem("activeAIModels", JSON.stringify(models));
    } catch (error) {
      console.error("Failed to save active AI models:", error);
    }
  };

  const toggleModel = (modelId: string) => {
    const newActiveModels = activeModels.includes(modelId)
      ? activeModels.filter(id => id !== modelId)
      : [...activeModels, modelId];
    
    setActiveModels(newActiveModels);
    saveActiveModels(newActiveModels);
  };

  const getCategories = () => {
    const categories = ["all", ...Array.from(new Set(aiModels.map(m => m.category)))];
    return categories;
  };

  const filteredModels = aiModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || model.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">AI Detection</h1>
      
      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium mb-2">Search Models</label>
            <input
              id="search"
              type="text"
              placeholder="Search AI models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">Category</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {getCategories().map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredModels.map((model) => {
          const isActive = activeModels.includes(model.id);
          return (
            <div key={model.id} className={`border rounded-lg p-6 ${isActive ? "ring-2 ring-blue-500" : ""}`}>
              <div className="mb-4">
                <h3 className="text-lg font-medium">{model.name}</h3>
                <p className="text-sm text-gray-500">{model.category}</p>
              </div>
              <div>
                <p className="text-sm mb-4">{model.description}</p>
                <button
                  onClick={() => toggleModel(model.id)}
                  className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                    isActive 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  {isActive ? "Active" : "Activate"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Models Summary */}
      {activeModels.length > 0 && (
        <div className="mt-8 border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Active Models ({activeModels.length})</h3>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {activeModels.map(modelId => {
              const model = aiModels.find(m => m.id === modelId);
              return model ? (
                <div key={modelId} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-sm text-gray-500">{model.category}</p>
                  </div>
                  <button
                    onClick={() => toggleModel(modelId)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Deactivate
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
} 