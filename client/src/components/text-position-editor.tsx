import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, RotateCcw } from "lucide-react";
import { type TextConfig, type TextPositionConfig } from "@shared/schema";

const fieldNames = {
  raceName: "Race Name",
  prizeAmount: "Prize Amount", 
  projectedPool: "Projected Pool",
  day: "Day",
  numberOfRaces: "Number of Races"
} as const;

const fontOptions = [
  { value: "Montserrat-Bold", label: "Montserrat Bold" },
  { value: "Montserrat-BoldItalic", label: "Montserrat Bold Italic" },
  { value: "Montserrat-Black", label: "Montserrat Black" },
  { value: "Montserrat-Regular", label: "Montserrat Regular" },
];

const singleFieldSchema = z.object({
  bottom: z.number().min(0).max(1080),
  position: z.number().min(0).max(1920),
  alignment: z.enum(["left", "center"]),
  fontFamily: z.string(),
  fontSize: z.number().min(8).max(300),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

type SingleFieldData = z.infer<typeof singleFieldSchema>;

interface TextPositionEditorProps {
  config: TextConfig;
  onConfigChange: (config: TextConfig) => void;
  onSave: (config: TextConfig) => void;
}

export function TextPositionEditor({ config, onConfigChange, onSave }: TextPositionEditorProps) {
  const [activeField, setActiveField] = useState<keyof TextConfig>("raceName");

  const currentFieldConfig = config[activeField];
  
  const form = useForm<SingleFieldData>({
    resolver: zodResolver(singleFieldSchema),
    values: {
      bottom: currentFieldConfig.bottom,
      position: currentFieldConfig.alignment === "center" ? currentFieldConfig.center || 0 : currentFieldConfig.left || 0,
      alignment: currentFieldConfig.alignment,
      fontFamily: currentFieldConfig.fontFamily,
      fontSize: currentFieldConfig.fontSize,
      color: currentFieldConfig.color,
    },
  });

  const handleFieldUpdate = (data: SingleFieldData) => {
    const updatedFieldConfig: TextPositionConfig = {
      bottom: data.bottom,
      alignment: data.alignment,
      fontFamily: data.fontFamily,
      fontSize: data.fontSize,
      color: data.color,
      ...(data.alignment === "center" 
        ? { center: data.position } 
        : { left: data.position }
      ),
    };

    const newConfig = {
      ...config,
      [activeField]: updatedFieldConfig,
    };

    onConfigChange(newConfig);
  };

  const formData = form.watch();
  
  // Update config whenever form data changes
  useEffect(() => {
    handleFieldUpdate(formData);
  }, [formData]);

  const resetToDefaults = () => {
    const defaultConfig: TextConfig = {
      raceName: {
        bottom: 200,
        left: 100,
        alignment: "left",
        fontFamily: "Montserrat-BoldItalic",
        fontSize: 60,
        color: "#1fd87b"
      },
      prizeAmount: {
        bottom: 600,
        left: 200,
        alignment: "left",
        fontFamily: "Montserrat-Black",
        fontSize: 120,
        color: "#ffffff"
      },
      projectedPool: {
        bottom: 700,
        left: 540,
        alignment: "left",
        fontFamily: "Montserrat-BoldItalic",
        fontSize: 48,
        color: "#1fd87b"
      },
      day: {
        bottom: 800,
        left: 700,
        alignment: "left",
        fontFamily: "Montserrat-BoldItalic",
        fontSize: 48,
        color: "#1fd87b"
      },
      numberOfRaces: {
        bottom: 200,
        center: 1340,
        alignment: "center",
        fontFamily: "Montserrat-Bold",
        fontSize: 80,
        color: "#1fd87b"
      }
    };
    onConfigChange(defaultConfig);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-primary" />
          <span>Text Positioning</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Field Selection */}
          <Tabs value={activeField} onValueChange={(value) => setActiveField(value as keyof TextConfig)}>
            <TabsList className="grid w-full grid-cols-5">
              {Object.entries(fieldNames).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {label.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(fieldNames).map(([key, label]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="text-sm font-medium text-card-foreground mb-3">
                  Editing: {label}
                </div>

                <form className="space-y-4">
                  {/* Position Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bottom">Bottom (px)</Label>
                      <Input
                        id="bottom"
                        type="number"
                        min="0"
                        max="1080"
                        data-testid={`input-${key}-bottom`}
                        {...form.register("bottom", { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">
                        {form.watch("alignment") === "center" ? "Center (px)" : "Left (px)"}
                      </Label>
                      <Input
                        id="position"
                        type="number"
                        min="0"
                        max="1920"
                        data-testid={`input-${key}-position`}
                        {...form.register("position", { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  {/* Alignment */}
                  <div>
                    <Label htmlFor="alignment">Text Alignment</Label>
                    <Select
                      value={form.watch("alignment")}
                      onValueChange={(value) => form.setValue("alignment", value as "left" | "center")}
                    >
                      <SelectTrigger data-testid={`select-${key}-alignment`}>
                        <SelectValue placeholder="Select alignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left Aligned</SelectItem>
                        <SelectItem value="center">Center Aligned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fontFamily">Font</Label>
                      <Select
                        value={form.watch("fontFamily")}
                        onValueChange={(value) => form.setValue("fontFamily", value)}
                      >
                        <SelectTrigger data-testid={`select-${key}-font`}>
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fontSize">Font Size (pt)</Label>
                      <Input
                        id="fontSize"
                        type="number"
                        min="8"
                        max="300"
                        data-testid={`input-${key}-font-size`}
                        {...form.register("fontSize", { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  {/* Color Control */}
                  <div>
                    <Label htmlFor="color">Text Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="color"
                        type="color"
                        className="w-16 h-10 p-1 border-2"
                        data-testid={`input-${key}-color`}
                        {...form.register("color")}
                      />
                      <Input
                        type="text"
                        placeholder="#1fd87b"
                        className="flex-1"
                        data-testid={`input-${key}-color-hex`}
                        {...form.register("color")}
                      />
                    </div>
                  </div>
                </form>
              </TabsContent>
            ))}
          </Tabs>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              data-testid="button-reset-defaults"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button
              onClick={() => onSave(config)}
              data-testid="button-save-config"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}