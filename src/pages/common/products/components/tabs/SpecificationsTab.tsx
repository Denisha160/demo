import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Tags,
  Shield,
  Layers,
  Box,
  Plus,
  Trash2,
} from "lucide-react";

interface KeyValuePair {
  key: string;
  value: string;
}

interface SpecificationsTabProps {
  metadata: {
    metaColors: string[];
    setMetaColors: (val: string[] | ((prev: string[]) => string[])) => void;
    metaFeatures: string[];
    setMetaFeatures: (val: string[] | ((prev: string[]) => string[])) => void;
    metaParams: KeyValuePair[];
    setMetaParams: (
      val: KeyValuePair[] | ((prev: KeyValuePair[]) => KeyValuePair[]),
    ) => void;
    metaAttrs: KeyValuePair[];
    setMetaAttrs: (
      val: KeyValuePair[] | ((prev: KeyValuePair[]) => KeyValuePair[]),
    ) => void;
  };
  disabled?: boolean;
}

export const SpecificationsTab = ({
  metadata,
  disabled,
}: SpecificationsTabProps) => {
  const {
    metaColors,
    setMetaColors,
    metaFeatures,
    setMetaFeatures,
    metaParams,
    setMetaParams,
    metaAttrs,
    setMetaAttrs,
  } = metadata;

  const updateArrayItem = (setter: any, index: number, val: string) => {
    setter((prev: string[]) =>
      prev.map((item, i) => (i === index ? val : item)),
    );
  };

  const removeArrayItem = (setter: any, index: number) => {
    setter((prev: string[]) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : [""],
    );
  };

  const updateObjectItem = (
    setter: any,
    index: number,
    field: "key" | "value",
    val: string,
  ) => {
    setter((prev: KeyValuePair[]) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item)),
    );
  };

  const removeObjectItem = (setter: any, index: number) => {
    setter((prev: KeyValuePair[]) =>
      prev.length > 1
        ? prev.filter((_, i) => i !== index)
        : [{ key: "", value: "" }],
    );
  };

  return (
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Colors */}
        <div className="bg-muted/30 p-4 rounded-sm border flex flex-col gap-3">
          <div className="flex justify-between items-center w-full">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 m-0">
              <Tags className="h-3 w-3" /> Available Colors
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMetaColors((prev: string[]) => [...prev, ""])}
              className="h-6 px-2 text-[10px] uppercase tracking-wider"
              disabled={disabled}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Color
            </Button>
          </div>
          <div className="space-y-2 flex-1 max-h-48 overflow-y-auto pr-2">
            {metaColors.map((color, idx) => (
              <div
                key={`color-${idx}`}
                className="flex gap-2 items-center w-full"
              >
                <Input
                  value={color}
                  onChange={(e) =>
                    updateArrayItem(setMetaColors, idx, e.target.value)
                  }
                  placeholder="e.g. White, Red, Blue"
                  className="text-sm flex-1 min-w-0"
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem(setMetaColors, idx)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  disabled={disabled || (metaColors.length === 1 && !color)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-muted/30 p-4 rounded-sm border flex flex-col gap-3">
          <div className="flex justify-between items-center w-full">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 m-0">
              <Shield className="h-3 w-3" /> Key Features
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMetaFeatures((prev: string[]) => [...prev, ""])}
              className="h-6 px-2 text-[10px] uppercase tracking-wider"
              disabled={disabled}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Feature
            </Button>
          </div>
          <div className="space-y-2 flex-1 max-h-48 overflow-y-auto pr-2">
            {metaFeatures.map((feature, idx) => (
              <div
                key={`feature-${idx}`}
                className="flex gap-2 items-center w-full"
              >
                <Input
                  value={feature}
                  onChange={(e) =>
                    updateArrayItem(setMetaFeatures, idx, e.target.value)
                  }
                  placeholder="e.g. Eco-friendly, Water-resistant"
                  className="text-sm flex-1 min-w-0"
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem(setMetaFeatures, idx)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  disabled={disabled || (metaFeatures.length === 1 && !feature)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="bg-muted/30 p-4 rounded-sm border flex flex-col gap-3">
          <div className="flex justify-between items-center w-full">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 m-0">
              <Layers className="h-3 w-3" /> Parameters
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setMetaParams((prev: KeyValuePair[]) => [
                  ...prev,
                  { key: "", value: "" },
                ])
              }
              className="h-6 px-2 text-[10px] uppercase tracking-wider"
              disabled={disabled}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Parameter
            </Button>
          </div>
          <div className="space-y-2 flex-1 max-h-48 overflow-y-auto pr-2">
            {metaParams.map((param, idx) => (
              <div key={idx} className="flex gap-2 items-center w-full">
                <Input
                  value={param.key}
                  onChange={(e) =>
                    updateObjectItem(setMetaParams, idx, "key", e.target.value)
                  }
                  placeholder="Key (e.g. Wattage)"
                  className="text-sm flex-1 min-w-0"
                  disabled={disabled}
                />
                <Input
                  value={param.value}
                  onChange={(e) =>
                    updateObjectItem(
                      setMetaParams,
                      idx,
                      "value",
                      e.target.value,
                    )
                  }
                  placeholder="Value (e.g. 100W)"
                  className="text-sm flex-1 min-w-0"
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeObjectItem(setMetaParams, idx)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  disabled={
                    disabled ||
                    (metaParams.length === 1 && !param.key && !param.value)
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Attributes */}
        <div className="bg-muted/30 p-4 rounded-sm border flex flex-col gap-3">
          <div className="flex justify-between items-center w-full">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 m-0">
              <Box className="h-3 w-3" /> Attributes
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setMetaAttrs((prev: KeyValuePair[]) => [
                  ...prev,
                  { key: "", value: "" },
                ])
              }
              className="h-6 px-2 text-[10px] uppercase tracking-wider"
              disabled={disabled}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Attribute
            </Button>
          </div>
          <div className="space-y-2 flex-1 max-h-48 overflow-y-auto pr-2">
            {metaAttrs.map((attr, idx) => (
              <div key={idx} className="flex gap-2 items-center w-full">
                <Input
                  value={attr.key}
                  onChange={(e) =>
                    updateObjectItem(setMetaAttrs, idx, "key", e.target.value)
                  }
                  placeholder="Key (e.g. Material)"
                  className="text-sm flex-1 min-w-0"
                  disabled={disabled}
                />
                <Input
                  value={attr.value}
                  onChange={(e) =>
                    updateObjectItem(setMetaAttrs, idx, "value", e.target.value)
                  }
                  placeholder="Value (e.g. Cotton)"
                  className="text-sm flex-1 min-w-0"
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeObjectItem(setMetaAttrs, idx)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  disabled={
                    disabled ||
                    (metaAttrs.length === 1 && !attr.key && !attr.value)
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
