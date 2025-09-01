export class FontLoader {
  private fontsLoaded = false;

  async loadFonts(): Promise<void> {
    try {
      // Check if FontFace API is available
      if ('FontFace' in window) {
        // Since we can't load local OTF files due to CORS restrictions,
        // we'll rely on the Google Fonts Montserrat that's already loaded
        // The Google Fonts version includes multiple weights including:
        // - 100-900 normal weights
        // - 100-900 italic weights
        
        // Verify the font is loaded by testing text measurement
        await this.verifyFontLoading();
        this.fontsLoaded = true;
      } else {
        // Fallback for older browsers
        console.warn('FontFace API not supported, using fallback fonts');
        this.fontsLoaded = true;
      }
    } catch (error) {
      console.error('Font loading failed:', error);
      // Continue with fallback fonts
      this.fontsLoaded = true;
    }
  }

  private async verifyFontLoading(): Promise<void> {
    return new Promise((resolve) => {
      // Create a temporary canvas to test font rendering
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve();
        return;
      }

      // Test if Montserrat is actually loaded
      ctx.font = '16px Montserrat, Arial, sans-serif';
      const testText = 'Test Font Loading';
      const montserratWidth = ctx.measureText(testText).width;
      
      ctx.font = '16px Arial, sans-serif';
      const arialWidth = ctx.measureText(testText).width;
      
      // If widths are different, Montserrat is likely loaded
      if (Math.abs(montserratWidth - arialWidth) > 1) {
        console.log('Montserrat font successfully loaded');
      } else {
        console.warn('Montserrat font may not be loaded, using fallback');
      }
      
      resolve();
    });
  }

  isFontsLoaded(): boolean {
    return this.fontsLoaded;
  }

  // Get the appropriate font string for canvas rendering
  getFontString(weight: 'normal' | 'bold' | 'black', style: 'normal' | 'italic', size: number): string {
    let fontWeight = '400';
    
    switch (weight) {
      case 'bold':
        fontWeight = '700';
        break;
      case 'black':
        fontWeight = '900';
        break;
      default:
        fontWeight = '400';
    }
    
    const fontStyle = style === 'italic' ? 'italic ' : '';
    
    return `${fontStyle}${fontWeight} ${size}px Montserrat, Arial, sans-serif`;
  }
}
