import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type TextConfig, type TextPositionConfig } from "@shared/schema";

interface TextPositionEditorProps {
  config: TextConfig;
  onConfigChange: (config: TextConfig) => void;
  onSave: (config: TextConfig) => void;
}

const TEXT_FIELDS = [
  { key: 'raceName' as const, label: 'Race Name' },
  { key: 'prizeAmount' as const, label: 'Prize Amount' },
  { key: 'projectedPool' as const, label: 'Projected Pool' },
  { key: 'day' as const, label: 'Day' },
  { key: 'numberOfRaces' as const, label: 'Number of Races' },
];

const FONT_OPTIONS = [
  'Montserrat-Regular',
  'Montserrat-Bold', 
  'Montserrat-BoldItalic',
  'Montserrat-Black',
  'Montserrat-BlackItalic',
];

export function TextPositionEditor({ config, onConfigChange, onSave }: TextPositionEditorProps) {
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Handle field changes with immediate preview
  const handleFieldChange = useCallback((
    fieldKey: keyof TextConfig,
    property: keyof TextPositionConfig,
    value: string | number
  ) => {
    const updatedConfig = {
      ...config,
      [fieldKey]: {
        ...config[fieldKey],
        [property]: value,
      }
    };

    setHasUnsavedChanges(true);
    onConfigChange(updatedConfig); // Immediate preview update
  }, [config, onConfigChange]);

  // Manual save function
  const handleSave = useCallback(() => {
    onSave(config);
    setHasUnsavedChanges(false);
    toast({
      title: "Settings Saved",
      description: "Text positioning settings have been saved.",
    });
  }, [config, onSave, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Text Position Settings</h3>
        <Button 
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          size="sm"
          data-testid="button-save-positioning"
        >
          <Save className="w-4 h-4 mr-2" />
          {hasUnsavedChanges ? "Save Changes" : "Saved"}
        </Button>
      </div>

      <div className="grid gap-6">
        {TEXT_FIELDS.map(({ key, label }) => {
          const fieldConfig = config[key];
          
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-sm">{label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Position Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${key}-left`}>Left Position (px)</Label>
                    <Input
                      id={`${key}-left`}
                      type="number"
                      value={fieldConfig.left}
                      onChange={(e) => handleFieldChange(key, 'left', parseInt(e.target.value) || 0)}
                      data-testid={`input-${key}-left`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${key}-bottom`}>Bottom Position (px)</Label>
                    <Input
                      id={`${key}-bottom`}
                      type="number"
                      value={fieldConfig.bottom}
                      onChange={(e) => handleFieldChange(key, 'bottom', parseInt(e.target.value) || 0)}
                      data-testid={`input-${key}-bottom`}
                    />
                  </div>
                </div>

                {/* Typography Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${key}-font`}>Font Family</Label>
                    <Select
                      value={fieldConfig.fontFamily}
                      onValueChange={(value) => handleFieldChange(key, 'fontFamily', value)}
                    >
                      <SelectTrigger data-testid={`select-${key}-font`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font.replace('Montserrat-', '')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`${key}-size`}>Font Size (px)</Label>
                    <Input
                      id={`${key}-size`}
                      type="number"
                      value={fieldConfig.fontSize}
                      onChange={(e) => handleFieldChange(key, 'fontSize', parseInt(e.target.value) || 12)}
                      data-testid={`input-${key}-size`}
                    />
                  </div>
                </div>

                {/* Color and Alignment */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${key}-color`}>Text Color</Label>
                    <Input
                      id={`${key}-color`}
                      type="color"
                      value={fieldConfig.color}
                      onChange={(e) => handleFieldChange(key, 'color', e.target.value)}
                      data-testid={`input-${key}-color`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${key}-alignment`}>Text Alignment</Label>
                    <Select
                      value={fieldConfig.alignment}
                      onValueChange={(value) => handleFieldChange(key, 'alignment', value as 'left' | 'center' | 'right')}
                    >
                      <SelectTrigger data-testid={`select-${key}-alignment`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}