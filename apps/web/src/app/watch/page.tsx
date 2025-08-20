"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Info, AlertCircle, Copy, Settings } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";

export default function WatchPage() {
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const { toast } = useToast();
  
  // Get HLS URL from environment variable
  const src = process.env.NEXT_PUBLIC_HLS_URL;

  const copyHlsUrl = async () => {
    if (!src) return;
    
    try {
      await navigator.clipboard.writeText(src);
      toast({
        title: "HLS URL copied",
        description: "The stream URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (!src) {
    return (
      <MainLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Live Stream</h1>
            <p className="text-muted-foreground">
              Watch your live camera feed in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No Stream Configured</CardTitle>
              <CardDescription>
                Please set up your live video stream to start watching.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p className="font-medium">To get started:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Create a <code className="bg-muted px-1 rounded">.env.local</code> file in the web app directory</li>
                  <li>Add <code className="bg-muted px-1 rounded">NEXT_PUBLIC_HLS_URL=your_stream_url</code></li>
                  <li>Restart the development server</li>
                </ol>
              </div>
              
              <div className="pt-4">
                <Button asChild className="w-full">
                  <a href="https://github.com/aler9/mediamtx" target="_blank" rel="noopener noreferrer">
                    <Video className="w-4 h-4 mr-2" />
                    Learn about MediaMTX
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Stream</h1>
          <p className="text-muted-foreground">
            Watch your live camera feed in real-time.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={copyHlsUrl}>
            <Copy className="w-4 h-4 mr-2" />
            Copy URL
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main video player */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VideoPlayer 
              src={src} 
              fullWidth 
              className="aspect-video"
            />
          </motion.div>
        </div>

        {/* Tips and info panel */}
        <div className="space-y-4">
          <Collapsible open={isTipsOpen} onOpenChange={setIsTipsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Info className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">Tips</CardTitle>
                    </div>
                    <Settings className={`h-4 w-4 transition-transform ${isTipsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">If video doesn't play:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Check your internet connection</li>
                      <li>• Verify the HLS URL is correct</li>
                      <li>• Try refreshing the page</li>
                      <li>• Check browser console for errors</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">For better performance:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Use a wired connection</li>
                      <li>• Close other bandwidth-heavy apps</li>
                      <li>• Try LL-HLS for lower latency</li>
                    </ul>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Current stream: <code className="bg-muted px-1 rounded text-xs">{src}</code>
                    </p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stream Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                  Live
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latency:</span>
                <span>~1-2s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <span>HLS</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 