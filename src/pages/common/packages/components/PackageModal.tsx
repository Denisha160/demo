import { z } from "zod";
import { useState, useEffect, useRef } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePackage,
  useCreatePackage,
  useUpdatePackage,
} from "@/hooks/usePackages";
import {
  PackageCreatePayload,
  PackageUpdatePayload,
  ApiErrorResponse,
} from "@/types/packages";
import { Loader2 } from "lucide-react";

// Validation schema
const packageSchema = z.object({
  package_code: z
    .string()
    .min(3, "Package code must be at least 3 characters")
    .max(20, "Package code too long"),
  package_name: z.string().min(2, "Package name must be at least 2 characters"),
  package_type: z.string().min(1, "Package type is required"),
  description: z.string().optional(),
  length_cm: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Length must be a positive number",
    ),
  width_cm: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Width must be a positive number",
    ),
  height_cm: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Height must be a positive number",
    ),
  is_active: z.boolean().optional(),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId?: string;
}

const PACKAGE_TYPES = [
  "carton",
  "box",
  "bottle",
  "pouch",
  "pallet",
  "bag",
  "drum",
  "can",
];

const PackageModal = ({ isOpen, onClose, packageId }: PackageModalProps) => {
  const isEditing = !!packageId;
  const { data: pkg, isLoading: isLoadingPkg } = usePackage(packageId);
  const { mutate: createPkg, isPending: isCreating } = useCreatePackage();
  const { mutate: updatePkg, isPending: isUpdating } = useUpdatePackage();
  const packageCodeRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<PackageFormData>({
    package_code: "",
    package_name: "",
    package_type: "carton",
    description: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof PackageFormData, string>>
  >({});

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        packageCodeRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (pkg && isEditing) {
      setFormData({
        package_code: pkg.package_code,
        package_name: pkg.package_name,
        package_type: pkg.package_type || "carton",
        description: pkg.description || "",
        length_cm: pkg.length_cm?.toString() || "",
        width_cm: pkg.width_cm?.toString() || "",
        height_cm: pkg.height_cm?.toString() || "",
        is_active: pkg.is_active,
      });
    } else if (!isEditing) {
      setFormData({
        package_code: "",
        package_name: "",
        package_type: "carton",
        description: "",
        length_cm: "",
        width_cm: "",
        height_cm: "",
        is_active: true,
      });
    }
    setErrors({});
  }, [pkg, isEditing, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof PackageFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, package_type: value }));
    if (errors.package_type) {
      setErrors((prev) => ({ ...prev, package_type: undefined }));
    }
  };

  const validateForm = () => {
    try {
      packageSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof PackageFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof PackageFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const calculateVolume = () => {
    const l = parseFloat(formData.length_cm);
    const w = parseFloat(formData.width_cm);
    const h = parseFloat(formData.height_cm);
    if (isNaN(l) || isNaN(w) || isNaN(h)) return 0;
    return l * w * h;
  };

  const calculateCBM = () => {
    return calculateVolume() / 1000000;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      ...formData,
      length_cm: parseFloat(formData.length_cm),
      width_cm: parseFloat(formData.width_cm),
      height_cm: parseFloat(formData.height_cm),
    };

    const handleError = (error: unknown) => {
      const err = error as ApiErrorResponse;
      const errorData = (err?.details ||
        err?.response?.data ||
        err ||
        {}) as ApiErrorResponse;

      if (errorData?.code === "validation_error") {
        const bodyErrors =
          errorData.details?.body || errorData.details?.params || {};
        setErrors(bodyErrors);
      } else if (errorData?.code === "duplicate_key_value") {
        const msg =
          errorData.message || "A package with this code already exists.";
        setErrors({ package_code: msg });
      }
    };

    if (isEditing) {
      updatePkg({ id: packageId, ...payload } as PackageUpdatePayload, {
        onSuccess: () => {
          onClose();
        },
        onError: handleError,
      });
    } else {
      createPkg(payload as PackageCreatePayload, {
        onSuccess: () => {
          onClose();
        },
        onError: handleError,
      });
    }
  };

  const volume = calculateVolume();
  const cbm = calculateCBM();
  const isPending = isCreating || isUpdating || isLoadingPkg;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      headerBg="bg-primary/10"
      titleClassName="text-primary font-bold"
      maxWidth="sm:max-w-[600px]"
      title={isEditing ? "Edit Package" : "Add New Package"}
      description={
        isEditing
          ? "Modify package dimensions and details"
          : "Fill in the required information below to create a new package type"
      }
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-sm text-sm h-8"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="rounded-sm text-sm h-8 px-6"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {(isCreating || isUpdating) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? "Save Changes" : "Save Package"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="package_code" className="text-sm">
                Package Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="package_code"
                ref={packageCodeRef}
                name="package_code"
                placeholder="e.g. PKG-001"
                value={formData.package_code}
                onChange={handleChange}
                className={`h-8 text-sm rounded-sm ${errors.package_code ? "border-destructive" : ""}`}
                disabled={isPending}
                required
              />
              {errors.package_code && (
                <p className="text-[10px] text-destructive mt-1 font-medium">
                  {errors.package_code}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="package_type" className="text-sm">
                Package Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.package_type}
                onValueChange={handleSelectChange}
                disabled={isPending}
              >
                <SelectTrigger
                  className={`h-8 text-sm rounded-sm ${errors.package_type ? "border-destructive" : ""}`}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGE_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="text-sm">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.package_type && (
                <p className="text-[10px] text-destructive mt-1 font-medium">
                  {errors.package_type}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="package_name" className="text-sm">
              Package Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="package_name"
              name="package_name"
              placeholder="e.g. Standard Large Box"
              value={formData.package_name}
              onChange={handleChange}
              className={`h-8 text-sm rounded-sm ${errors.package_name ? "border-destructive" : ""}`}
              disabled={isPending}
              required
            />
            {errors.package_name && (
              <p className="text-[10px] text-destructive mt-1 font-medium">
                {errors.package_name}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Optional packaging details..."
              value={formData.description}
              onChange={handleChange}
              className={`text-sm rounded-sm min-h-[60px] ${errors.description ? "border-destructive" : ""}`}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="length_cm" className="text-sm">
                Length (cm) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="length_cm"
                name="length_cm"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.length_cm}
                onChange={handleChange}
                className={`h-8 text-sm rounded-sm ${errors.length_cm ? "border-destructive/50" : ""}`}
                disabled={isPending}
                required
              />
              {errors.length_cm && (
                <p className="text-[10px] text-destructive mt-1 font-medium">
                  {errors.length_cm}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="width_cm" className="text-sm">
                Width (cm) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="width_cm"
                name="width_cm"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.width_cm}
                onChange={handleChange}
                className={`h-8 text-sm rounded-sm ${errors.width_cm ? "border-destructive/50" : ""}`}
                disabled={isPending}
                required
              />
              {errors.width_cm && (
                <p className="text-[10px] text-destructive mt-1 font-medium">
                  {errors.width_cm}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="height_cm" className="text-sm">
                Height (cm) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="height_cm"
                name="height_cm"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.height_cm}
                onChange={handleChange}
                className={`h-8 text-sm rounded-sm ${errors.height_cm ? "border-destructive/50" : ""}`}
                disabled={isPending}
                required
              />
              {errors.height_cm && (
                <p className="text-[10px] text-destructive mt-1 font-medium">
                  {errors.height_cm}
                </p>
              )}
            </div>
          </div>

          <div className="p-3 bg-primary/5 border border-primary/10 rounded-sm flex justify-between items-center text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground uppercase tracking-wider font-semibold text-[9px]">
                Total Volume
              </span>
              <span className="font-bold text-primary">
                {volume.toLocaleString()} cm³
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-muted-foreground uppercase tracking-wider font-semibold text-[9px]">
                CBM Index
              </span>
              <span className="font-bold text-primary">
                {cbm.toFixed(6)} m³
              </span>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PackageModal;
