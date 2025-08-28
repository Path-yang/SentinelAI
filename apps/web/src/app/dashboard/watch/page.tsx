"use client";

import { useState } from "react";
import { ArrowLeft, Shield, Heart, AlertTriangle, PieChart, Eye, Bell, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Define monitoring categories and options
const detectionModels = [
  {
    id: "health",
    name: "Health & Safety",
    icon: Heart,
    description: "Monitor for health-related emergencies",
    options: [
      { id: "falls", name: "Fall Detection", description: "Detect when someone falls" },
      { id: "immobility", name: "Extended Immobility", description: "Alert when someone is immobile for too long" },
      { id: "seizures", name: "Seizure Detection", description: "Detect signs of seizure activity" },
    ]
  },
  {
    id: "security",
    name: "Security",
    icon: Shield,
    description: "Monitor for security concerns",
    options: [
      { id: "intruders", name: "Intruder Detection", description: "Detect unauthorized persons" },
      { id: "objects", name: "Abandoned Objects", description: "Identify suspicious unattended items" },
      { id: "tampering", name: "Camera Tampering", description: "Alert if camera is tampered with" },
    ]
  },
  {
    id: "emergencies",
    name: "Emergencies",
    icon: AlertTriangle,
    description: "Monitor for emergency situations",
    options: [
      { id: "fire", name: "Fire Detection", description: "Detect flames or smoke" },
      { id: "accidents", name: "Accidents", description: "Detect potential accidents" },
      { id: "distress", name: "Distress Signs", description: "Identify distress behaviors" },
    ]
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: PieChart,
    description: "Gather analytical insights",
    options: [
      { id: "occupancy", name: "Occupancy Counting", description: "Count people in the area" },
      { id: "dwell", name: "Dwell Time", description: "Measure how long people stay in areas" },
      { id: "traffic", name: "Traffic Patterns", description: "Analyze movement patterns" },
    ]
  }
];

export default function AIDetectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeCategory, setActiveCategory] = useState("health");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [processingModel, setProcessingModel] = useState<string | null>(null);

  // Toggle monitoring option
  const toggleOption = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(prev => prev.filter(id => id !== optionId));
    } else {
      setProcessingModel(optionId);
      setIsConfirmOpen(true);
    }
  };

  // Confirm selection
  const confirmSelection = () => {
    if (processingModel) {
      setSelectedOptions(prev => [...prev, processingModel]);
      setIsConfirmOpen(false);
      
      // Get the model details for the toast
      let modelName = "";
      let categoryName = "";
      
      for (const category of detectionModels) {
        for (const option of category.options) {
          if (option.id === processingModel) {
            modelName = option.name;
            categoryName = category.name;
            break;
          }
        }
      }
      
      toast({
        title: `${modelName} activated`,
        description: `This model will now be used to monitor your camera feed.`,
      });
    }
  };

  // Apply selected models and go back to dashboard
  const applyModels = () => {
    // In a real app, you would save these selections to a global state or backend
    localStorage.setItem('activeAIModels', JSON.stringify(selectedOptions));
    
    toast({
      title: `AI Detection Active`,
      description: `${selectedOptions.length} detection model${selectedOptions.length !== 1 ? 's' : ''} activated.`,
    });
    
    // Navigate back to dashboard
    router.push('/dashboard');
  };

  // Get model name by ID
  const getModelName = (modelId: string) => {
    for (const category of detectionModels) {
      for (const option of category.options) {
        if (option.id === modelId) {
          return option.name;
        }
      }
    }
    return modelId;
  };

  // Get the selected model details for confirmation
  const getSelectedModelDetails = () => {
    if (!processingModel) return null;
    
    for (const category of detectionModels) {
      for (const option of category.options) {
        if (option.id === processingModel) {
          return {
            name: option.name,
            description: option.description,
            category: category.name
          };
        }
      }
    }
    return null;
  };

  const selectedModelDetails = getSelectedModelDetails();

  return (
    <div className="container mx-auto py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">AI Detection Models</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedOptions.length > 0 && (
            <Badge className="bg-primary">
              <Eye className="w-3 h-3 mr-1" />
              {selectedOptions.length} Selected
            </Badge>
          )}
          
          <Button 
            onClick={applyModels} 
            disabled={selectedOptions.length === 0}
            className="ml-2"
          >
            Apply & Return to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-6">
        {/* Category tabs */}
        <div className="md:col-span-6">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              {detectionModels.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                  {category.options.some(option => selectedOptions.includes(option.id)) && (
                    <Badge variant="secondary" className="ml-auto">
                      {category.options.filter(option => selectedOptions.includes(option.id)).length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Active category models */}
        <div className="md:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {detectionModels.find(c => c.id === activeCategory)?.name} Models
              </CardTitle>
              <CardDescription>
                {detectionModels.find(c => c.id === activeCategory)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {detectionModels.find(c => c.id === activeCategory)?.options.map(option => (
                  <Card 
                    key={option.id} 
                    className={`hover:bg-accent/30 transition-colors cursor-pointer ${
                      selectedOptions.includes(option.id) ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium flex items-center">
                            {option.name}
                            {selectedOptions.includes(option.id) && (
                              <Check className="w-4 h-4 ml-2 text-primary" />
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                        <Switch 
                          checked={selectedOptions.includes(option.id)}
                          onCheckedChange={() => toggleOption(option.id)}
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Selected models summary */}
        {selectedOptions.length > 0 && (
          <div className="md:col-span-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Selected Detection Models
                </CardTitle>
                <CardDescription>
                  These models will be applied to your camera feed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {selectedOptions.map(optionId => (
                    <div 
                      key={optionId} 
                      className="flex items-center justify-between border rounded-md p-2"
                    >
                      <span>{getModelName(optionId)}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => toggleOption(optionId)}
                      >
                        <span className="sr-only">Remove</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="destructive" 
                    onClick={() => setSelectedOptions([])}
                    className="mr-2"
                  >
                    Clear All
                  </Button>
                  <Button onClick={applyModels}>
                    Apply & Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate {selectedModelDetails?.name}</DialogTitle>
            <DialogDescription>
              This will add {selectedModelDetails?.name} detection to your camera monitoring system.
              <div className="mt-2 p-2 bg-muted rounded-md">
                <p><strong>Category:</strong> {selectedModelDetails?.category}</p>
                <p><strong>Function:</strong> {selectedModelDetails?.description}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSelection}>
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 