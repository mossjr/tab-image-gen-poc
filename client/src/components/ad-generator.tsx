import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, Image, Edit, Info, Clock, Layers, RefreshCw, ZoomIn, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CanvasRenderer } from "@/lib/canvas-renderer";
import { FontLoader } from "@/lib/font-loader";
import { TextPositionEditor } from "@/components/text-position-editor";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type TextConfig } from "@shared/schema";
import templateImagePath from "@assets/2025_08_Green_Harness_Template_1756701532557.png";

const formSchema = z.object({
  raceName: z.string().min(1, "Race name is required"),
  prizeAmount: z.string().min(1, "Prize amount is required"),
  projectedPool: z.string().min(1, "Projected pool is required"),
  day: z.string().min(1, "Day is required"),
  numberOfRaces: z.string().min(1, "Number of races is required"),
});

type FormData = z.infer<typeof formSchema>;

export function AdGenerator() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasRenderer, setCanvasRenderer] = useState<CanvasRenderer | null>(null);
  const [fontLoader, setFontLoader] = useState<FontLoader | null>(null);
  const [status, setStatus] = useState<{
    text: string;
    type: "ready" | "loading" | "error";
  }>({ text: "Initializing...", type: "loading" });
  const [lastUpdated, setLastUpdated] = useState<string>("--");
  const [textConfig, setTextConfig] = useState<TextConfig | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      raceName: "Emerald Stakes",
      prizeAmount: "50,000",
      projectedPool: "125,000",
      day: "SATURDAY",
      numberOfRaces: "8",
    },
  });

  const formData = form.watch();

  // Load text positioning configuration
  const { data: configData } = useQuery({
    queryKey: ['/api/text-config/default'],
    enabled: true,
  });

  // Save text positioning configuration
  const saveConfigMutation = useMutation({
    mutationFn: (config: TextConfig) => apiRequest('POST', '/api/text-config/default', config),
    onSuccess: () => {
      toast({ title: "Configuration Saved", description: "Text positioning settings have been saved." });
      queryClient.invalidateQueries({ queryKey: ['/api/text-config/default'] });
    },
    onError: () => {
      toast({ title: "Save Error", description: "Failed to save configuration.", variant: "destructive" });
    },
  });

  // Update local text config when data loads
  useEffect(() => {
    if (configData) {
      setTextConfig(configData as TextConfig);
    }
  }, [configData]);

  useEffect(() => {
    const initializeCanvas = async () => {
      if (!canvasRef.current) return;

      try {
        setStatus({ text: "Loading fonts...", type: "loading" });
        
        // Initialize font loader with fallback to Google Fonts
        const loader = new FontLoader();
        await loader.loadFonts();
        setFontLoader(loader);

        setStatus({ text: "Loading template...", type: "loading" });
        
        // Initialize canvas renderer
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
          description: "Failed to load template or fonts. Using fallback rendering.",
          variant: "destructive",
        });
      }
    };

    initializeCanvas();
  }, [toast]);

  useEffect(() => {
    if (canvasRenderer && fontLoader && textConfig) {
      try {
        canvasRenderer.renderWithText(formData, textConfig);
        setLastUpdated(new Date().toLocaleTimeString());
        setStatus({ text: "Ready", type: "ready" });
      } catch (error) {
        console.error("Failed to render canvas:", error);
        setStatus({ text: "Render error", type: "error" });
      }
    }
  }, [formData, canvasRenderer, fontLoader, textConfig]);

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
      link.download = `ad_${formData.raceName.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.png`;
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
    form.reset();
    setLastUpdated(new Date().toLocaleTimeString());
  };

  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="content">Ad Content</TabsTrigger>
        <TabsTrigger value="positioning">Text Positioning</TabsTrigger>
      </TabsList>
      
      <TabsContent value="content" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
      {/* Form Panel */}
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-6">
              <Edit className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">Ad Content</h2>
            </div>
            
            <form className="space-y-6">
              <div className="form-field">
                <Label htmlFor="raceName">Race Name</Label>
                <Input
                  id="raceName"
                  data-testid="input-race-name"
                  {...form.register("raceName")}
                  placeholder="Enter race name"
                />
                {form.formState.errors.raceName && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.raceName.message}
                  </p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="prizeAmount">Prize Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                  <Input
                    id="prizeAmount"
                    data-testid="input-prize-amount"
                    {...form.register("prizeAmount")}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
                {form.formState.errors.prizeAmount && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.prizeAmount.message}
                  </p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="projectedPool">Projected Pool</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                  <Input
                    id="projectedPool"
                    data-testid="input-projected-pool"
                    {...form.register("projectedPool")}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
                {form.formState.errors.projectedPool && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.projectedPool.message}
                  </p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="day">Day</Label>
                <Input
                  id="day"
                  data-testid="input-day"
                  {...form.register("day")}
                  placeholder="Enter day"
                />
                {form.formState.errors.day && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.day.message}
                  </p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="numberOfRaces">Number of Races</Label>
                <Input
                  id="numberOfRaces"
                  data-testid="input-number-of-races"
                  type="number"
                  min="1"
                  max="20"
                  {...form.register("numberOfRaces")}
                  placeholder="1"
                />
                {form.formState.errors.numberOfRaces && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.numberOfRaces.message}
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Download Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-card-foreground">Export</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Download your customized ad as a high-quality image file.
            </p>
            <Button
              onClick={handleDownload}
              className="download-btn w-full"
              data-testid="button-download"
              disabled={status.type === "loading"}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              PNG Format • 1080x1920px
            </div>
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
                  <li>• Real-time preview enabled</li>
                  <li>• Editable text positioning</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Canvas Preview Panel */}
      <div className="space-y-6">
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
                  variant="outline"
                  size="sm"
                  data-testid="button-zoom"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Text Positioning Info */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center space-x-2">
              <div className="w-4 h-4 border border-primary rounded-sm flex items-center justify-center">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
              </div>
              <span>Text Positioning</span>
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/50 p-2 rounded">
                  <div className="font-medium text-foreground mb-1">Race Name</div>
                  <div>Bottom: 200px, Left: 100px</div>
                  <div>Font: Montserrat Bold Italic, 60pt</div>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <div className="font-medium text-foreground mb-1">Prize Amount</div>
                  <div>Bottom: 600px, Left: 200px</div>
                  <div>Font: Montserrat Black, 120pt</div>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <div className="font-medium text-foreground mb-1">Projected Pool</div>
                  <div>Bottom: 700px, Left: 540px</div>
                  <div>Font: Montserrat Bold Italic</div>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <div className="font-medium text-foreground mb-1">Day</div>
                  <div>Bottom: 800px, Left: 700px</div>
                  <div>Font: Montserrat Bold Italic</div>
                </div>
              </div>
              <div className="bg-muted/50 p-2 rounded">
                <div className="font-medium text-foreground mb-1">Number of Races</div>
                <div>Bottom: 200px, Center: 1340px</div>
                <div>Font: Montserrat Bold, 80pt</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Bar */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status.type === "loading" 
                      ? "bg-yellow-500 animate-pulse" 
                      : status.type === "error"
                      ? "bg-destructive"
                      : "bg-primary"
                  }`}></div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className="text-sm font-medium text-foreground" data-testid="text-status">
                    {status.text}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last Updated:</span>
                  <span className="text-sm text-foreground" data-testid="text-last-updated">
                    {lastUpdated}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Layers className="h-4 w-4" />
                <span>5 Text Layers</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </TabsContent>
      
      <TabsContent value="positioning" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Text Position Editor */}
          <div>
            {textConfig && (
              <TextPositionEditor
                config={textConfig}
                onConfigChange={setTextConfig}
                onSave={(config) => saveConfigMutation.mutate(config)}
              />
            )}
          </div>
          
          {/* Canvas Preview Panel - Same as content tab */}
          <div className="space-y-6">
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
                    data-testid="canvas-preview-positioning"
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
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      data-testid="button-download-positioning"
                      disabled={status.type === "loading"}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
