import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { User, UserCreatePayload, ApiErrorResponse } from "@/types/user";
import { useCreateUser, useUsers } from "@/hooks/useUsers";
import { useShifts } from "@/hooks/useShifts";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Shift } from "@/types/shift";
import { formatDateForAPI } from "@/utils/date";

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user?: User | null;
}

// Validation schema
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  employee_code: z
    .string()
    .min(3, "Employee code must be at least 3 characters"),
  date_of_joining: z.string().min(1, "Date of joining is required"),
  department: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  shift_id: z.string().uuid().optional().nullable().or(z.literal("")),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional()
    .nullable(),
  marital_status: z
    .enum(["single", "married", "divorced", "widowed"])
    .optional()
    .nullable(),
  anniversary_date: z.string().optional().nullable(),
  personal_email: z
    .string()
    .email("Invalid personal email")
    .optional()
    .nullable()
    .or(z.literal("")),
  address: z.string().optional().nullable(),
  pan_number: z
    .string()
    .regex(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "Invalid PAN number format (e.g., ABCDE1234F)",
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  gst_number: z
    .string()
    .regex(
      /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
      "Invalid GST number format",
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  basic_salary: z.coerce.number().optional().nullable(),
  opening_balance: z.coerce.number().optional().nullable(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  is_active: z.boolean().optional(),
  parent_id: z.string().uuid().optional().nullable().or(z.literal("")),
});

type UserFormData = z.infer<typeof userSchema>;

const UserModal = ({ open, onClose, onSave, user }: UserModalProps) => {
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { data: usersData } = useUsers({ combobox: true }, { enabled: open });
  const { data: shiftsData } = useShifts({ combobox: true });

  const shiftOptions: ComboboxOption[] =
    shiftsData?.shifts?.map((s: Shift) => ({
      value: s.id,
      label: `${s.name} (${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)})`,
    })) || [];

  const userOptions: ComboboxOption[] =
    usersData?.items?.map((u: User) => ({
      value: u.id,
      label: `${u.name} ${u.employee_code ? `(${u.employee_code})` : ""} ${u.is_root_user ? "[ROOT]" : ""}`,
    })) || [];

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserFormData | "confirmPassword", string>>
  >({});
  const [apiError, setApiError] = useState<string | null>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    phone_number: user?.phone_number || "",
    employee_code: user?.employee_code || "",
    date_of_joining: user?.date_of_joining
      ? formatDateForAPI(user?.date_of_joining, false)
      : formatDateForAPI(new Date(), false),
    department: user?.department || "",
    is_active: user?.is_active ?? true,
    basic_salary: user?.basic_salary || 0,
    parent_id: user?.parent_id || "",
    shift_id: user?.shift_id || "",
  });

  const validateForm = () => {
    try {
      // Validate main form data
      userSchema.parse(formData);

      // Validate password match for new users
      if (!user) {
        if (!formData.password) {
          setErrors({ password: "Password is required" });
          return false;
        }
        if (formData.password !== confirmPassword) {
          setErrors({ confirmPassword: "Passwords do not match" });
          return false;
        }
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof UserFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof UserFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      // Use formatDateForAPI with false for YYYY-MM-DD
      const payload: UserCreatePayload = {
        ...formData,
        date_of_joining: formatDateForAPI(
          formData.date_of_joining || new Date(),
          false,
        ),
        anniversary_date: formData.anniversary_date
          ? formatDateForAPI(formData.anniversary_date, false)
          : null,
      } as UserCreatePayload;

      createUser(payload, {
        onSuccess: (data) => {
          handleClose();
          if (onSave) onSave(data as unknown as User);
        },
        onError: (error: unknown) => {
          console.error("Failed to create user:", error);
          const err = error as ApiErrorResponse;
          const errorData = (err?.details ||
            err?.response?.data ||
            err ||
            {}) as ApiErrorResponse;

          if (
            errorData?.code === "duplicate_key_value" ||
            errorData?.code === "CONFLICT" ||
            errorData?.code === "conflict"
          ) {
            const msg = errorData.message || "A duplicate record exists.";
            setApiError(msg);

            // Show below specific input based on message content
            if (msg.toLowerCase().includes("email")) {
              setErrors((prev) => ({ ...prev, email: msg }));
            } else if (msg.toLowerCase().includes("phone")) {
              setErrors((prev) => ({ ...prev, phone_number: msg }));
            } else if (msg.toLowerCase().includes("employee")) {
              setErrors((prev) => ({ ...prev, employee_code: msg }));
            }
          } else if (errorData?.message) {
            setApiError(errorData.message);
          } else {
            setApiError("An unexpected error occurred while saving.");
          }
        },
      });
    } else {
      handleClose();
    }
  };

  const handleChange = (
    field: keyof UserFormData,
    value: string | boolean | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (apiError) setApiError(null);
  };

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        fullNameRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = () => {
    setErrors({});
    setApiError(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone_number: "",
      employee_code: "",
      date_of_joining: formatDateForAPI(new Date(), false),
      parent_id: "",
      shift_id: "",
    });
    setConfirmPassword("");
    setShowPassword(false);
    onClose();
  };

  const isPending = isCreating;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      headerBg="bg-primary/10"
      titleClassName="text-primary"
      maxWidth="sm:max-w-[600px]"
      title="Add New User"
      description="Fill in the required information below to create a new user"
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
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Creating..." : "Save User"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                ref={fullNameRef}
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`h-8 text-sm rounded-sm ${errors.name ? "border-destructive" : ""}`}
                disabled={isPending}
                required
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">
                Business Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@basalt.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`h-8 text-sm rounded-sm ${errors.email ? "border-destructive" : ""}`}
                disabled={isPending}
                required
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-sm">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={formData.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                className={`h-8 text-sm rounded-sm ${errors.phone_number ? "border-destructive" : ""}`}
                disabled={isPending}
                required
              />
              {errors.phone_number && (
                <p className="text-xs text-destructive mt-1">
                  {errors.phone_number}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-sm">Reporting To (Parent User)</Label>
              <Combobox
                options={userOptions}
                value={formData.parent_id || ""}
                onValueChange={(val) => handleChange("parent_id", val)}
                placeholder="Select parent user..."
                className="h-8 text-sm"
                disabled={isPending}
                clearable
              />
              {errors.parent_id && (
                <p className="text-xs text-destructive mt-1">
                  {errors.parent_id}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="employee_code" className="text-sm">
                Employee Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="employee_code"
                placeholder="EMP-001"
                value={formData.employee_code}
                onChange={(e) => handleChange("employee_code", e.target.value)}
                className={`h-8 text-sm rounded-sm ${errors.employee_code ? "border-destructive" : ""}`}
                disabled={isPending}
                required
              />
              {errors.employee_code && (
                <p className="text-xs text-destructive mt-1">
                  {errors.employee_code}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="doj" className="text-sm">
                Date of Joining <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                value={
                  formData.date_of_joining
                    ? formatDateForAPI(formData.date_of_joining, false)
                    : ""
                }
                onChange={(val) =>
                  handleChange(
                    "date_of_joining",
                    val
                      ? formatDateForAPI(val, false)
                      : formatDateForAPI(new Date(), false),
                  )
                }
                placeholder="dd/MM/yyyy"
                disabled={isPending}
              />
              {errors.date_of_joining && (
                <p className="text-xs text-destructive mt-1">
                  {errors.date_of_joining}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="shift_id" className="text-sm">
              Shift
            </Label>
            <Combobox
              options={shiftOptions}
              value={formData.shift_id || ""}
              onValueChange={(val) => handleChange("shift_id", val)}
              placeholder="Select shift..."
              className="h-8 text-sm"
              disabled={isPending}
              clearable
            />
            {errors.shift_id && (
              <p className="text-xs text-destructive mt-1">{errors.shift_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password..."
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`h-8 text-sm rounded-sm pr-9 ${errors.password ? "border-destructive" : ""}`}
                  disabled={isPending}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-0 top-0 h-8 w-8 px-0 py-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">
                  {errors.password}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm_password" className="text-sm">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password..."
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }
                  }}
                  className={`h-8 text-sm rounded-sm pr-9 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  disabled={isPending}
                  required
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UserModal;
