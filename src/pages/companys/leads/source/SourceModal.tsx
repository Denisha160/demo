import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";

const sourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean(),
  displayOrder: z.number().min(1, "Display order must be at least 1"),
});

export interface SourceFormData {
  name: string;
  category: string;
  isActive: boolean;
  displayOrder: number;
}

interface SourceModalProps {
  open: boolean;
  onClose: () => void;
  sourceData?: SourceFormData | null;
  onSave: (data: SourceFormData) => void;
}

const SourceModal = ({ open, onClose, sourceData, onSave }: SourceModalProps) => {
  const [formData, setFormData] = useState<SourceFormData>({
    name: "",
    category: "",
    isActive: true,
    displayOrder: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (sourceData) {
        setFormData({
          name: sourceData.name,
          category: sourceData.category,
          isActive: sourceData.isActive,
          displayOrder: sourceData.displayOrder,
        });
      }
      setErrors({});
    }
  }, [open, sourceData]);

  const handleSave = () => {
    const result = sourceSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave(formData);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Source"
      description="Update lead source details."
      maxWidth="sm:max-w-md"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="h-9">
            Update Source
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold flex gap-1">
            <span className="text-destructive">*</span> Name
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            placeholder="e.g. Organic Search"
            className={`h-9 text-xs ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1.5 flex flex-col">
          <Label className="text-xs font-bold flex gap-1">
            <span className="text-destructive">*</span> Category
          </Label>
          <Input
            value={formData.category}
            onChange={(e) => {
              setFormData({ ...formData, category: e.target.value });
              if (errors.category) setErrors({ ...errors, category: undefined });
            }}
            placeholder="e.g. Inbound"
            className={`h-9 text-xs ${errors.category ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {errors.category && <p className="text-[10px] text-destructive">{errors.category}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold flex gap-1">
            <span className="text-destructive">*</span> Display Order
          </Label>
          <Input
            type="number"
            min="1"
            value={formData.displayOrder}
            onChange={(e) => {
              setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 });
              if (errors.displayOrder) setErrors({ ...errors, displayOrder: undefined });
            }}
            className={`h-9 text-xs ${errors.displayOrder ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {errors.displayOrder && <p className="text-[10px] text-destructive">{errors.displayOrder}</p>}
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked === true })}
          />
          <Label
            htmlFor="isActive"
            className="text-xs font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Active
          </Label>
        </div>
      </div>
    </Modal>
  );
};

export default SourceModal;
