import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, Image, Edit, Info, RefreshCw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CanvasRenderer } from "@/lib/canvas-renderer";
import { FontLoader } from "@/lib/font-loader";
import { TextPositionEditor } from "@/components/text-position-editor";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type TextConfig, type AdContent, adContentSchema } from "@shared/schema";
import templateImagePath from "@assets/2025_08_Green_Harness_Template_1756701532557.png";

export function AdGenerator() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasRenderer, setCanvasRenderer] = useState<CanvasRenderer | null>(null);
  const [fontLoader, setFontLoader] = useState<FontLoader | null>(null);
  const [currentAdData, setCurrentAdData] = useState<AdContent>({
    raceName: "Emerald Stakes",
    prizeAmount: "50,000", 
    projectedPool: "125,000",
    day: "SATURDAY",
    numberOfRaces: "8",
  });
  const [status, setStatus] = useState<{
    text: string;
    type: "ready" | "loading" | "error";
  }>({ text: "Initializing...", type: "loading" });
  const [lastUpdated, setLastUpdated] = useState<string>("--");

  const form = useForm<AdContent>({
    resolver: zodResolver(adContentSchema),
    defaultValues: currentAdData,
  });

  // Load ad content from database
  const { data: adContent } = useQuery({
    queryKey: ['/api/ad-content/default'],
    enabled: true,
  });

  // Load text positioning configuration from database
  const { data: textConfig } = useQuery({
    queryKey: ['/api/text-config/default'],
    enabled: true,
  });

  // Save ad content to database
  const saveAdContentMutation = useMutation({
    mutationFn: (content: AdContent) => apiRequest('POST', '/api/ad-content/default', content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ad-content/default'] });
    },
  });

  // Save text positioning configuration to database  
  const saveConfigMutation = useMutation({
    mutationFn: (config: TextConfig) => apiRequest('POST', '/api/text-config/default', config),
    onSuccess: () => {
      toast({ title: "Settings Saved", description: "Text positioning has been saved." });
      queryClient.invalidateQueries({ queryKey: ['/api/text-config/default'] });
    },
    onError: () => {
      toast({ title: "Save Error", description: "Failed to save settings.", variant: "destructive" });
    },
  });

  // Update form when ad content loads from database
  useEffect(() => {
    if (adContent) {
      setCurrentAdData(adContent as AdContent);
      form.reset(adContent as AdContent);
    }
  }, [adContent]);

  // Handle form changes
  const handleFormChange = useCallback((field: keyof AdContent, value: string) => {
    const newData = { ...currentAdData, [field]: value };
    setCurrentAdData(newData);
    form.setValue(field, value);
    
    // Debounced save
    const timeoutId = setTimeout(() => {
      saveAdContentMutation.mutate(newData);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [currentAdData, form, saveAdContentMutation]);

  // Initialize canvas and fonts
  useEffect(() => {
    const initializeCanvas = async () => {
      if (!canvasRef.current) return;

      try {
        setStatus({ text: "Loading fonts...", type: "loading" });
        
        const loader = new FontLoader();
        await loader.loadFonts();
        setFontLoader(loader);

        setStatus({ text: "Loading template...", type: "loading" });
        
        const renderer = new CanvasRenderer(canvasRef.current);
        await renderer.loadTemplate(templateImagePath);
        setCanvasRenderer(renderer);

        setStatus({ text: "Ready", type: "ready" });
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Failed to initialize canvas:", error);
        setStatus({ text: "Error loading template", type: "error" });
        toast({
          title: "Initialization Error",
          description: "Failed to load template or fonts.",
          variant: "destructive",
        });
      }
    };

    initializeCanvas();
  }, [toast]);

  // Re-render canvas when data or config changes
  useEffect(() => {
    if (canvasRenderer && fontLoader && currentAdData && textConfig) {
      try {
        canvasRenderer.renderWithText(currentAdData, textConfig as TextConfig);
        setLastUpdated(new Date().toLocaleTimeString());
        setStatus({ text: "Ready", type: "ready" });
      } catch (error) {
        console.error("Failed to render canvas:", error);
        setStatus({ text: "Render error", type: "error" });
      }
    }
  }, [currentAdData, textConfig, canvasRenderer, fontLoader]);

  const handleConfigChange = (newConfig: TextConfig) => {
    saveConfigMutation.mutate(newConfig);
  };

  const handleDownload = () => {
    if (!canvasRef.current) {
      toast({
        title: "Download Error",
        description: "Canvas not ready for download",
        variant: "destructive",
      });
      return;
    }

    try {
      setStatus({ text: "Preparing download...", type: "loading" });
      
      const link = document.createElement("a");
      link.download = `ad_${currentAdData.raceName.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
      
      setStatus({ text: "Downloaded", type: "ready" });
      toast({
        title: "Download Complete",
        description: "Your ad image has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Download failed:", error);
      setStatus({ text: "Download failed", type: "error" });
      toast({
        title: "Download Error",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    const defaultData: AdContent = {
      raceName: "Emerald Stakes",
      prizeAmount: "50,000",
      projectedPool: "125,000", 
      day: "SATURDAY",
      numberOfRaces: "8",
    };
    setCurrentAdData(defaultData);
    form.reset(defaultData);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 min-h-screen">
      {/* Main Content Area - Left side on desktop */}
      <div className="xl:col-span-3 space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Ad Content</TabsTrigger>
            <TabsTrigger value="positioning">Text Positioning</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6">
            <div className="space-y-6">
              {/* Form Panel */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <Edit className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold text-card-foreground">Ad Content</h2>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Save className="h-4 w-4" />
                      <span>Auto-saving</span>
                    </div>
                  </div>
                  
                  <form className="space-y-6">
                    <div className="form-field">
                      <Label htmlFor="raceName">Race Name</Label>
                      <Input
                        id="raceName"
                        data-testid="input-race-name"
                        value={currentAdData.raceName}
                        onChange={(e) => handleFormChange("raceName", e.target.value)}
                        placeholder="Enter race name"
                      />
                    </div>

                    <div className="form-field">
                      <Label htmlFor="prizeAmount">Prize Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                        <Input
                          id="prizeAmount"
                          data-testid="input-prize-amount"
                          value={currentAdData.prizeAmount}
                          onChange={(e) => handleFormChange("prizeAmount", e.target.value)}
                          className="pl-8"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <Label htmlFor="projectedPool">Projected Pool</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                        <Input
                          id="projectedPool"
                          data-testid="input-projected-pool"
                          value={currentAdData.projectedPool}
                          onChange={(e) => handleFormChange("projectedPool", e.target.value)}
                          className="pl-8"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <Label htmlFor="day">Day</Label>
                      <Input
                        id="day"
                        data-testid="input-day"
                        value={currentAdData.day}
                        onChange={(e) => handleFormChange("day", e.target.value)}
                        placeholder="Enter day"
                      />
                    </div>

                    <div className="form-field">
                      <Label htmlFor="numberOfRaces">Number of Races</Label>
                      <Input
                        id="numberOfRaces"
                        data-testid="input-number-of-races"
                        type="number"
                        min="1"
                        max="20"
                        value={currentAdData.numberOfRaces}
                        onChange={(e) => handleFormChange("numberOfRaces", e.target.value)}
                        placeholder="1"
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Template Info */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Template Information</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Template: 2025_08_Green_Harness_Template.png</li>
                        <li>• Dimensions: 1920x1080 pixels</li>
                        <li>• Fonts: Montserrat variants</li>
                        <li>• Database: PostgreSQL storage</li>
                        <li>• Auto-save: Enabled</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="positioning" className="mt-6">
            <div className="w-full">
              {textConfig && (
                <TextPositionEditor
                  config={textConfig as TextConfig}
                  onConfigChange={handleConfigChange}
                  onSave={(config) => saveConfigMutation.mutate(config)}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Live Preview Panel - Right side on desktop */}
      <div className="xl:col-span-2">
        <div className="sticky top-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-card-foreground">Live Preview</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${
                    status.type === "loading" 
                      ? "bg-yellow-500 animate-pulse" 
                      : status.type === "error"
                      ? "bg-destructive"
                      : "bg-primary"
                  }`}></div>
                  <span>Live</span>
                </div>
              </div>
              
              {/* Canvas Container */}
              <div className="canvas-container bg-muted/20 border-2 border-dashed border-border rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  width={1920}
                  height={1080}
                  className="w-full h-auto bg-white rounded border border-border shadow-sm"
                  data-testid="canvas-preview"
                />
              </div>

              {/* Canvas Controls */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Image className="h-4 w-4" />
                    <span>1920×1080</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full"></span>
                    <span>RGB</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    data-testid="button-reset"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    data-testid="button-download"
                    disabled={status.type === "loading"}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Status and Last Updated */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Status: {status.text}</span>
                  <span>Updated: {lastUpdated}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}