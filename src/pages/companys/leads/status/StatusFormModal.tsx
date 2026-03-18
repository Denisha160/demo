import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const statusSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  displayOrder: z.number().min(1, "Display order must be at least 1"),
});

export interface StatusFormData {
  name: string;
  color: string;
  displayOrder: number;
}

interface StatusFormModalProps {
  open: boolean;
  onClose: () => void;
  statusData?: StatusFormData | null;
  onSave: (data: StatusFormData) => void;
}

const StatusFormModal = ({ open, onClose, statusData, onSave }: StatusFormModalProps) => {
  const [formData, setFormData] = useState<StatusFormData>({
    name: "",
    color: "#3b82f6",
    displayOrder: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (statusData) {
        setFormData({
          name: statusData.name,
          color: statusData.color,
          displayOrder: statusData.displayOrder,
        });
      }
      setErrors({});
    }
  }, [open, statusData]);

  const handleSave = () => {
    const result = statusSchema.safeParse(formData);
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
      title="Edit Status"
      description="Update status details."
      maxWidth="sm:max-w-md"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="h-9">
            Update Status
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
            placeholder="e.g. New Lead"
            className={`h-9 text-xs ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1.5 flex flex-col">
          <Label className="text-xs font-bold flex gap-1">
            <span className="text-destructive">*</span> Color
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={formData.color}
              onChange={(e) => {
                setFormData({ ...formData, color: e.target.value });
                if (errors.color) setErrors({ ...errors, color: undefined });
              }}
              className="w-14 h-9 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={formData.color.toUpperCase()}
              onChange={(e) => {
                setFormData({ ...formData, color: e.target.value });
                if (errors.color) setErrors({ ...errors, color: undefined });
              }}
              placeholder="#000000"
              className={`flex-1 h-9 text-xs uppercase ${errors.color ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
          </div>
          {errors.color && <p className="text-[10px] text-destructive">{errors.color}</p>}
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
      </div>
    </Modal>
  );
};

export default StatusFormModal;
