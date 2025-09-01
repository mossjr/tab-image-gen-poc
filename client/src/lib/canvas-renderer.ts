export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private templateImage: HTMLImageElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;
  }

  async loadTemplate(imagePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.templateImage = img;
        this.renderTemplate();
        resolve();
      };
      
      img.onerror = () => {
        console.warn('Template image failed to load, using fallback');
        this.createFallbackTemplate();
        resolve();
      };
      
      img.src = imagePath;
    });
  }

  private createFallbackTemplate(): void {
    // Create a fallback green template matching the harness racing theme
    this.ctx.fillStyle = '#22c55e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Add some gradient for visual appeal
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, '#16a34a');
    gradient.addColorStop(1, '#22c55e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Add "TEMPLATE" watermark
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.font = 'bold 120px Montserrat, Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('TEMPLATE', this.canvas.width / 2, this.canvas.height / 2);
  }

  private renderTemplate(): void {
    if (this.templateImage) {
      // Clear canvas and draw template image
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.templateImage, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.createFallbackTemplate();
    }
  }

  renderWithText(formData: {
    raceName: string;
    prizeAmount: string;
    projectedPool: string;
    day: string;
    numberOfRaces: string;
  }, textConfig?: any): void {
    // Start with clean template
    this.renderTemplate();

    // Set up text rendering properties
    this.ctx.textBaseline = 'bottom';
    
    // Use provided config or fall back to defaults
    const config = textConfig || {
      raceName: { bottom: 200, left: 100, alignment: "left", fontFamily: "Montserrat-BoldItalic", fontSize: 60, color: "#1fd87b" },
      prizeAmount: { bottom: 600, left: 200, alignment: "left", fontFamily: "Montserrat-Black", fontSize: 120, color: "#ffffff" },
      projectedPool: { bottom: 700, left: 540, alignment: "left", fontFamily: "Montserrat-BoldItalic", fontSize: 48, color: "#1fd87b" },
      day: { bottom: 800, left: 700, alignment: "left", fontFamily: "Montserrat-BoldItalic", fontSize: 48, color: "#1fd87b" },
      numberOfRaces: { bottom: 200, center: 1340, alignment: "center", fontFamily: "Montserrat-Bold", fontSize: 80, color: "#1fd87b" }
    };
    
    // Render each text field with its configuration
    this.renderTextField(formData.raceName, config.raceName);
    this.renderTextField(`$${formData.prizeAmount}`, config.prizeAmount);
    this.renderTextField(`$${formData.projectedPool}`, config.projectedPool);
    this.renderTextField(formData.day, config.day);
    this.renderTextField(formData.numberOfRaces, config.numberOfRaces);
  }

  private renderTextField(text: string, config: any): void {
    this.ctx.fillStyle = config.color;
    this.ctx.font = this.getFontString(config.fontFamily, config.fontSize);
    this.ctx.textAlign = config.alignment as CanvasTextAlign;
    
    const x = config.alignment === "center" ? config.center : config.left;
    this.ctx.fillText(text, x, config.bottom);
  }

  private getFontString(fontFamily: string, fontSize: number): string {
    // Convert font family to CSS font string
    switch (fontFamily) {
      case "Montserrat-Bold":
        return `bold ${fontSize}px Montserrat, Arial, sans-serif`;
      case "Montserrat-BoldItalic":
        return `italic bold ${fontSize}px Montserrat, Arial, sans-serif`;
      case "Montserrat-Black":
        return `900 ${fontSize}px Montserrat, Arial, sans-serif`;
      case "Montserrat-Regular":
        return `${fontSize}px Montserrat, Arial, sans-serif`;
      default:
        return `${fontSize}px Montserrat, Arial, sans-serif`;
    }
  }
}
