import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { Shift } from "@/types/shift";

const shiftSchema = z.object({
  name: z
    .string()
    .min(2, "Shift name must be at least 2 characters long")
    .max(100, "Shift name cannot exceed 100 characters"),

  start_time: z
    .string()
    .min(1, "Start time is required"),

  end_time: z
    .string()
    .min(1, "End time is required"),

  is_active: z.boolean().optional().default(true),
});

interface ShiftModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: Partial<Shift>) => void;
  shift: Shift | null;
}

const ShiftModal = ({ open, onClose, onSave, shift }: ShiftModalProps) => {
  const [name, setName] = useState(shift?.name || "");
  const [startTime, setStartTime] = useState(shift?.start_time || "");
  const [endTime, setEndTime] = useState(shift?.end_time || "");
  const [isActive, setIsActive] = useState(shift?.is_active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setName(shift?.name || "");
    setStartTime(shift?.start_time || "");
    setEndTime(shift?.end_time || "");
    setIsActive(shift?.is_active ?? true);
    setErrors({});
  }, [shift, open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const parsed = shiftSchema.parse({
        name,
        start_time: startTime,
        end_time: endTime,
        is_active: isActive,
      });
      setErrors({});
      onSave(parsed);
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerBg="bg-primary/10"
      titleClassName="text-primary"
      title={shift ? "Edit Shift" : "Add New Shift"}
      description={shift ? "Update shift details below" : "Fill in the shift details below"}
      footer={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-sm text-sm h-8"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button size="sm" className="rounded-sm text-sm h-8" onClick={handleSubmit}>
            {shift ? "Save Changes" : "Create Shift"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="shift-name"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Shift Name
          </Label>
          <Input
            id="shift-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            placeholder="e.g. Morning Shift"
            className={`h-9 text-sm rounded-sm ${errors.name ? "border-destructive" : ""}`}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="start-time"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Start Time
            </Label>
            <Input
              id="start-time"
              type="time"
              step="60"
              min="00:00"
              max="23:59"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                if (errors.start_time) setErrors({ ...errors, start_time: "" });
              }}
              className={`h-9 text-sm rounded-sm ${errors.start_time ? "border-destructive" : ""}`}
            />
            {errors.start_time && (
              <p className="text-xs text-destructive">{errors.start_time}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="end-time"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              End Time
            </Label>
            <Input
              id="end-time"
              type="time"
              step="60"
              min="00:00"
              max="23:59"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                if (errors.end_time) setErrors({ ...errors, end_time: "" });
              }}
              className={`h-9 text-sm rounded-sm ${errors.end_time ? "border-destructive" : ""}`}
            />
            {errors.end_time && <p className="text-xs text-destructive">{errors.end_time}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between border rounded-md p-3 bg-muted/30">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Active
            </p>
            <p className="text-[11px] text-muted-foreground">Toggle to enable or disable</p>
          </div>
          <Switch checked={isActive} onCheckedChange={(val) => setIsActive(!!val)} />
        </div>
      </form>
    </Modal>
  );
};

export default ShiftModal;
