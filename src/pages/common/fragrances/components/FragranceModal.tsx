import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Fragrance } from "@/types/fragrance";

const fragranceSchema = z.object({
  name: z
    .string()
    .min(2, "Fragrance name must be at least 2 characters")
    .max(100, "Fragrance name cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
});

interface FragranceModalProps {
  open: boolean;
  onClose: () => void;
  formData: Partial<Fragrance>;
  setFormData: (data: Partial<Fragrance>) => void;
  onSave: () => Promise<void>;
  isPending?: boolean;
}

const FragranceModal = ({
  open,
  onClose,
  formData,
  setFormData,
  onSave,
  isPending = false,
}: FragranceModalProps) => {
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {},
  );

  const isEditing = !!formData.id;

  const handleSave = async () => {
    try {
      fragranceSchema.parse(formData);
      setErrors({});
      await onSave();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const newErrors: { name?: string; description?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "name") newErrors.name = err.message;
          if (err.path[0] === "description")
            newErrors.description = err.message;
        });
        setErrors(newErrors);
      } else {
        // Handle API error
        const apiError =
          (
            error as {
              response?: { data?: { code?: string; message?: string } };
              message?: string;
              code?: string;
            }
          )?.response?.data || (error as { code?: string; message?: string });
        if (apiError?.code === "already_exists") {
          setErrors({ name: apiError.message });
        }
      }
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      headerBg="bg-primary/10"
      titleClassName="text-primary"
      title={isEditing ? "Edit Fragrance" : "New Fragrance"}
      description={
        isEditing
          ? "Modify the fragrance details."
          : "Create a new fragrance for your products."
      }
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-sm text-sm h-8"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="rounded-sm text-sm h-8"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? isEditing
                ? "Saving…"
                : "Creating…"
              : isEditing
                ? "Save Changes"
                : "Create"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Name */}
        <div className="grid gap-2">
          <Label className="text-sm">Fragrance Name</Label>
          <Input
            placeholder="e.g. Lavender Breeze"
            value={formData.name || ""}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            className={`h-8 text-sm rounded-sm ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
            disabled={isPending}
            autoFocus
          />
          {errors.name && (
            <p className="text-[11px] text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label className="text-sm">Description</Label>
          <Textarea
            placeholder="Optional description of the fragrance..."
            value={formData.description || ""}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              if (errors.description)
                setErrors({ ...errors, description: undefined });
            }}
            className={`text-sm rounded-sm min-h-[80px] ${errors.description ? "border-destructive focus-visible:ring-destructive" : ""}`}
            disabled={isPending}
          />
          {errors.description && (
            <p className="text-[11px] text-destructive">{errors.description}</p>
          )}
        </div>

        {/* Is Active */}
        <div className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
          <div className="space-y-0.5">
            <Label className="text-sm">Active Status</Label>
            <p className="text-[11px] text-muted-foreground">
              Toggle to enable or disable this fragrance.
            </p>
          </div>
          <Switch
            checked={formData.is_active ?? true}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_active: checked })
            }
            disabled={isPending}
          />
        </div>
      </div>
    </Modal>
  );
};

export default FragranceModal;
