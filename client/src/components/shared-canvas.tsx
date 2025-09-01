import { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Image, Download, RefreshCw, ZoomIn } from "lucide-react";

interface SharedCanvasProps {
  status: {
    text: string;
    type: "ready" | "loading" | "error";
  };
  onDownload: () => void;
  onReset?: () => void;
  showResetButton?: boolean;
}

export const SharedCanvas = forwardRef<HTMLCanvasElement, SharedCanvasProps>(
  ({ status, onDownload, onReset, showResetButton = true }, ref) => {
    return (
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
              ref={ref}
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
              {showResetButton && onReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  data-testid="button-reset"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={onDownload}
                variant="outline"
                size="sm"
                data-testid="button-download"
                disabled={status.type === "loading"}
              >
                <Download className="h-4 w-4" />
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
    );
  }
);

SharedCanvas.displayName = "SharedCanvas";