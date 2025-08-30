"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DetectionModel {
  id: string;
  name: string;
  category: string;
  description: string;
}

const detectionCategories = [
  {
    id: "health",
    name: "Health & Safety",
    icon: "🏥",
    options: [
      { id: "falls", name: "Fall Detection", description: "Detect when someone falls or collapses" },
      { id: "immobility", name: "Extended Immobility", description: "Alert on prolonged lack of movement" },
      { id: "seizures", name: "Seizure Detection", description: "Identify seizure-like movements" },
    ]
  },
  {
    id: "security",
    name: "Security",
    icon: "🔒",
    options: [
      { id: "intruders", name: "Intruder Detection", description: "Detect unauthorized persons" },
      { id: "objects", name: "Abandoned Objects", description: "Identify suspicious left items" },
      { id: "tampering", name: "Camera Tampering", description: "Detect camera obstruction" },
    ]
  },
  {
    id: "emergencies",
    name: "Emergencies",
    icon: "🚨",
    options: [
      { id: "fire", name: "Fire Detection", description: "Identify smoke or flames" },
      { id: "accidents", name: "Accidents", description: "Detect vehicle or personal accidents" },
      { id: "distress", name: "Distress Signs", description: "Recognize help signals" },
    ]
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: "📊",
    options: [
      { id: "occupancy", name: "Occupancy Counting", description: "Track people in areas" },
      { id: "dwell", name: "Dwell Time", description: "Monitor time spent in locations" },
      { id: "traffic", name: "Traffic Patterns", description: "Analyze movement flows" },
    ]
  }
];

export default function AIDetectionPage() {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load saved models on component mount
  useEffect(() => {
    try {
      const savedModels = localStorage.getItem('activeAIModels');
      if (savedModels) {
        setSelectedModels(JSON.parse(savedModels));
      }
    } catch (error) {
      console.error("Failed to load active AI models:", error);
    }
  }, []);

  // Save models to localStorage whenever selection changes
  useEffect(() => {
    localStorage.setItem('activeAIModels', JSON.stringify(selectedModels));
  }, [selectedModels]);

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleApplyModels = () => {
    // Models are automatically saved to localStorage
    // You can add additional logic here if needed
  };

  const filteredCategories = detectionCategories.filter(category => {
    if (selectedCategory && category.id !== selectedCategory) return false;
    
    if (searchTerm) {
      const hasMatchingOption = category.options.some(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return hasMatchingOption;
    }
    
    return true;
  });

  const getCategoryName = (categoryId: string) => {
    const category = detectionCategories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className="container mx-auto py-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">AI Detection</h1>
            <p className="text-muted-foreground">
              Select AI models to monitor your camera feeds
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Zap className="h-3 w-3 mr-1" />
            {selectedModels.length} Active
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search detection models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {detectionCategories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon} {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Detection Models */}
      <div className="grid gap-6">
        {filteredCategories.map(category => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">{category.icon}</span>
                <span>{category.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.options.map(option => (
                  <div
                    key={option.id}
                    className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Switch
                      id={option.id}
                      checked={selectedModels.includes(option.id)}
                      onCheckedChange={() => handleModelToggle(option.id)}
                    />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor={option.id} className="font-medium cursor-pointer">
                        {option.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Apply Button */}
      {selectedModels.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={handleApplyModels} className="px-8">
            Apply & Return to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
} 