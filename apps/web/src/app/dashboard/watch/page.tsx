"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            <Label htmlFor="search">Search Models</Label>
            <Input
              id="search"
              placeholder="Search AI models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
            <Card key={model.id} className={isActive ? "ring-2 ring-primary" : ""}>
              <CardHeader>
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{model.category}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{model.description}</p>
                <Button
                  variant={isActive ? "default" : "outline"}
                  onClick={() => toggleModel(model.id)}
                  className="w-full"
                >
                  {isActive ? "Active" : "Activate"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Models Summary */}
      {activeModels.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Active Models ({activeModels.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {activeModels.map(modelId => {
                const model = aiModels.find(m => m.id === modelId);
                return model ? (
                  <div key={modelId} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-sm text-muted-foreground">{model.category}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleModel(modelId)}
                    >
                      Deactivate
                    </Button>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 