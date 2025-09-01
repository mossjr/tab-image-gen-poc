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
  }): void {
    // Start with clean template
    this.renderTemplate();

    // Set up text rendering properties
    this.ctx.textBaseline = 'bottom';
    
    // Race Name - Bottom edge at 200px, Left edge at 100px, 60pt Montserrat Bold Italic, #1fd87b
    this.ctx.fillStyle = '#1fd87b';
    this.ctx.font = 'italic bold 60px Montserrat, Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(formData.raceName, 100, 200);
    
    // Prize Amount - Bottom edge at 600px, Left edge at 200px, 120pt Montserrat Black, white
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '900 120px Montserrat, Arial, sans-serif'; // 900 weight for Black
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`$${formData.prizeAmount}`, 200, 600);
    
    // Projected Pool - Bottom edge at 700px, Left edge at 540px, Montserrat Bold Italic, #1fd87b
    this.ctx.fillStyle = '#1fd87b';
    this.ctx.font = 'italic bold 48px Montserrat, Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`$${formData.projectedPool}`, 540, 700);
    
    // Day - Bottom edge at 800px, Left edge at 700px, Montserrat Bold Italic, #1fd87b
    this.ctx.fillStyle = '#1fd87b';
    this.ctx.font = 'italic bold 48px Montserrat, Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(formData.day, 700, 800);
    
    // Number of Races - Bottom edge at 200px, Center at 1340px, 80pt Montserrat Bold, #1fd87b
    this.ctx.fillStyle = '#1fd87b';
    this.ctx.font = 'bold 80px Montserrat, Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(formData.numberOfRaces, 1340, 200);
  }
}
