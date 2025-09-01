import { AdGenerator } from "@/components/ad-generator";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-image text-primary-foreground text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-foreground">Ad Template Generator</h1>
              <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-md">POC</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <i className="fas fa-info-circle"></i>
              <span>Proof of Concept</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdGenerator />
      </main>
    </div>
  );
}
