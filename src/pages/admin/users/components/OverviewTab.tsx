import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import {
  Camera,
  Briefcase,
  User as UserIcon,
  CreditCard,
  Trash2,
} from "lucide-react";
import { EditableDetailItem, SelectOption } from "./EditableDetailItem";
import {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { useUpdateUser, useUsers, useRemoveUserPhoto } from "@/hooks/useUsers";
import { useShifts } from "@/hooks/useShifts";
import { z } from "zod";
import {
  UserDetailData,
  UserUpdatePayload,
  ApiErrorResponse,
  User,
} from "@/types/user";
import { formatDateForAPI } from "@/utils/date";
import { ComboboxOption } from "@/components/ui/combobox";
import { Shift } from "@/types/shift";

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
    .optional()
    .or(z.literal("")),
});

interface OverviewTabProps {
  userData: UserDetailData;
  setUserData: (data: UserDetailData) => void;
  genderOptions: SelectOption[];
  maritalStatusOptions: SelectOption[];
  onSavingChange?: (isSaving: boolean) => void;
}

export interface OverviewTabRef {
  save: () => void;
  reset: () => void;
}

const OverviewTab = forwardRef<OverviewTabRef, OverviewTabProps>(
  (
    {
      userData,
      setUserData,
      genderOptions,
      maritalStatusOptions,
      onSavingChange,
    },
    ref,
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);

    // Hooks
    const { mutate: updateUser, isPending: isUpdatingDetails } =
      useUpdateUser();
    const { mutate: removePhoto, isPending: isRemovingPhoto } =
      useRemoveUserPhoto();
    const { data: usersData } = useUsers({ combobox: true });
    const { data: shiftsData } = useShifts({ combobox: true });

    const isUpdating = isUpdatingDetails || isRemovingPhoto;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
      userData.image_url || null,
    );

    // Sync previewUrl with userData.image_url when it changes from the parent
    useEffect(() => {
      setPreviewUrl(userData.image_url || null);
    }, [userData.image_url]);

    useEffect(() => {
      onSavingChange?.(isUpdating);
    }, [isUpdating, onSavingChange]);

    const parentOptions: ComboboxOption[] = (usersData?.items || [])
      .filter((u: User) => u.id !== userData.id)
      .map((u: User) => ({
        label: `${u.name} ${u.employee_code ? `(${u.employee_code})` : ""}`,
        value: u.id,
      }));

    const shiftOptions: ComboboxOption[] =
      shiftsData?.shifts?.map((s: Shift) => ({
        label: s.name,
        value: s.id,
      })) || [];

    const handleRemovePhoto = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (
        window.confirm("Are you sure you want to remove your profile photo?")
      ) {
        removePhoto(userData.id!, {
          onSuccess: () => {
            setPreviewUrl(null);
            setSelectedFile(null);
            setUserData({ ...userData, image_url: "" });
            if (fileInputRef.current) fileInputRef.current.value = "";
          },
        });
      }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.type.startsWith("image/")) {
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        } else {
          alert("Please upload an image file.");
        }
      }
    };

    const handleChange = (
      field: keyof UserDetailData,
      value: string | boolean | number | null,
    ) => {
      setUserData({ ...userData, [field]: value });
      if (errors[field]) {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
      if (apiError) setApiError(null);
    };

    const handlePasswordChange = (val: string) => {
      setPassword(val);
      if (errors.password) {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.password;
          return updated;
        });
      }
      if (apiError) setApiError(null);
    };

    const handleConfirmPasswordChange = (val: string) => {
      setConfirmPassword(val);
      if (errors.confirmPassword) {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.confirmPassword;
          return updated;
        });
      }
      if (apiError) setApiError(null);
    };

    useImperativeHandle(ref, () => ({
      save: () => handleSave(),
      reset: () => {
        setPassword("");
        setConfirmPassword("");
        setErrors({});
        setApiError(null);
        setSelectedFile(null);
        setPreviewUrl(userData.image_url || null);
      },
    }));

    const handleSave = () => {
      try {
        userSchema.parse({ ...userData, password: password || undefined });

        if (password && password !== confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords do not match!",
          }));
          return;
        }

        setErrors({});
        setApiError(null);

        const payload: UserUpdatePayload = {
          id: userData.id!,
          name: userData.name,
          phone_number: userData.phone_number,
          email: userData.email,
          personal_email: userData.personal_email,
          date_of_joining: formatDateForAPI(userData.date_of_joining, false),
          department: userData.department,
          region: userData.region,
          shift_id: userData.shift_id,
          is_active: userData.is_active,
          is_root_user: userData.is_root_user,
          gender: userData.gender,
          date_of_birth: formatDateForAPI(userData.date_of_birth, false),
          marital_status: userData.marital_status,
          anniversary_date: formatDateForAPI(userData.anniversary_date, false),
          basic_salary: userData.basic_salary,
          opening_balance: userData.opening_balance,
          pan_number: userData.pan_number,
          gst_number: userData.gst_number,
          address: userData.address,
          parent_id: userData.parent_id,
        };

        if (password) payload.password = password;
        if (payload.date_of_birth === "") payload.date_of_birth = null;
        if (payload.anniversary_date === "") payload.anniversary_date = null;
        payload.opening_balance =
          String(payload.opening_balance) === ""
            ? 0
            : Number(payload.opening_balance);
        payload.basic_salary =
          String(payload.basic_salary) === ""
            ? 0
            : Number(payload.basic_salary);

        updateUser(
          { ...payload, file: selectedFile },
          {
            onSuccess: () => {
              setPassword("");
              setConfirmPassword("");
              setSelectedFile(null);
            },
            onError: (error: unknown) => {
              const err = error as ApiErrorResponse;
              const errorData = (err?.details ||
                err?.response?.data ||
                err ||
                {}) as ApiErrorResponse;
              if (
                errorData?.code === "validation_error" &&
                errorData.details?.body
              ) {
                setErrors(errorData.details.body);
              } else if (errorData?.message) {
                setApiError(errorData.message);
              } else {
                setApiError("An unexpected error occurred while saving.");
              }
            },
          },
        );
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: Record<string, string> = {};
          error.errors.forEach((err) => {
            if (err.path[0]) newErrors[err.path[0] as string] = err.message;
          });
          setErrors(newErrors);
        }
      }
    };

    const handleToggleActive = () => {
      const newStatus = !userData.is_active;
      setApiError(null);
      updateUser(
        { id: userData.id!, is_active: newStatus },
        {
          onSuccess: () => setUserData({ ...userData, is_active: newStatus }),
          onError: (error: unknown) => {
            const err = error as ApiErrorResponse;
            setApiError(err?.message || "Failed to update user status.");
          },
        },
      );
    };

    return (
      <div className="p-5 border border-border rounded-sm bg-card shadow-sm space-y-2">
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-border/50">
          <div className="relative group">
            <div
              className="h-24 w-24 bg-primary/10 text-primary rounded-sm flex items-center justify-center text-4xl font-bold border border-primary/20 shrink-0 overflow-hidden cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                userData.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2) || "U"
              )}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white mb-1" />
                <span className="text-[10px] text-white font-semibold uppercase tracking-widest">
                  Update
                </span>
              </div>
            </div>
            {previewUrl && (
              <button
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 bg-destructive text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/90 hover:scale-110 flex items-center justify-center border-2 border-background z-20"
                title="Remove Photo"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-bold text-foreground truncate leading-none">
                {userData.name || "User Profile"}
              </h3>
              <StatusBadge
                status={userData.is_active ? "Active" : "Inactive"}
                variant={userData.is_active ? "success" : "destructive"}
              />
              {userData.is_root_user && (
                <StatusBadge status="Root Admin" variant="info" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Manage user profile, image, and account details below.
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
              Professional Details
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-2">
            <EditableDetailItem
              label="Full Name"
              value={userData.name}
              error={errors.name}
              isEditing={true}
              onChange={(val) => handleChange("name", val)}
            />
            <EditableDetailItem
              label="Email Address"
              value={userData.email}
              error={errors.email}
              isEditing={true}
              onChange={(val) => handleChange("email", val)}
            />
            <EditableDetailItem
              label="Phone Number"
              value={userData.phone_number}
              error={errors.phone_number}
              isEditing={true}
              onChange={(val) => handleChange("phone_number", val)}
            />
            <EditableDetailItem
              label="Employee Code"
              value={userData.employee_code}
              error={errors.employee_code}
              isEditing={true}
              onChange={(val) => handleChange("employee_code", val)}
            />
            <EditableDetailItem
              label="Department"
              value={userData.department}
              error={errors.department}
              isEditing={true}
              onChange={(val) => handleChange("department", val)}
            />
            <EditableDetailItem
              label="Region / Zone"
              value={userData.region}
              error={errors.region}
              isEditing={true}
              onChange={(val) => handleChange("region", val)}
            />
            <EditableDetailItem
              label="Date of Joining"
              value={
                userData.date_of_joining
                  ? formatDateForAPI(userData.date_of_joining, false)
                  : ""
              }
              error={errors.date_of_joining}
              isEditing={true}
              onChange={(val) => handleChange("date_of_joining", val)}
              type="date"
            />
            <EditableDetailItem
              label="Work Shift"
              value={userData.shift_id}
              resolvedLabel={userData.shift_name}
              error={errors.shift_id}
              isEditing={true}
              onChange={(val) => handleChange("shift_id", val)}
              type="combobox"
              options={shiftOptions}
            />
            <EditableDetailItem
              label="Reporting To (Parent User)"
              value={userData.parent_id}
              error={errors.parent_id}
              isEditing={true}
              onChange={(val) => handleChange("parent_id", val)}
              type="combobox"
              options={parentOptions}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
              Financial & Compliance
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-2">
            <EditableDetailItem
              label="Basic Salary"
              value={userData.basic_salary}
              error={errors.basic_salary}
              isEditing={true}
              onChange={(val) => handleChange("basic_salary", val)}
              type="number"
              prefix="₹"
            />
            <EditableDetailItem
              label="Opening Balance"
              value={userData.opening_balance}
              error={errors.opening_balance}
              isEditing={true}
              onChange={(val) => handleChange("opening_balance", val)}
              type="number"
              prefix="₹"
            />
            <EditableDetailItem
              label="PAN Number"
              value={userData.pan_number}
              error={errors.pan_number}
              isEditing={true}
              onChange={(val) => handleChange("pan_number", val)}
            />
            <EditableDetailItem
              label="GST Number"
              value={userData.gst_number}
              error={errors.gst_number}
              isEditing={true}
              onChange={(val) => handleChange("gst_number", val)}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <UserIcon className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
              Personal Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <EditableDetailItem
              label="Gender"
              value={userData.gender}
              error={errors.gender}
              isEditing={true}
              onChange={(val) => handleChange("gender", val)}
              type="select"
              options={genderOptions}
            />
            <EditableDetailItem
              label="Date of Birth"
              value={
                userData.date_of_birth
                  ? formatDateForAPI(userData.date_of_birth, false)
                  : ""
              }
              error={errors.date_of_birth}
              isEditing={true}
              onChange={(val) => handleChange("date_of_birth", val)}
              type="date"
            />
            <EditableDetailItem
              label="Marital Status"
              value={userData.marital_status}
              error={errors.marital_status}
              isEditing={true}
              onChange={(val) => handleChange("marital_status", val)}
              type="select"
              options={maritalStatusOptions}
            />
            {userData.marital_status === "married" && (
              <EditableDetailItem
                label="Anniversary Date"
                value={
                  userData.anniversary_date
                    ? formatDateForAPI(userData.anniversary_date, false)
                    : ""
                }
                error={errors.anniversary_date}
                isEditing={true}
                onChange={(val) => handleChange("anniversary_date", val)}
                type="date"
              />
            )}
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <EditableDetailItem
                  label="Personal Email"
                  value={userData.personal_email}
                  error={errors.personal_email}
                  isEditing={true}
                  onChange={(val) => handleChange("personal_email", val)}
                />
                <EditableDetailItem
                  label="Residence Address"
                  value={userData.address}
                  error={errors.address}
                  isEditing={true}
                  onChange={(val) => handleChange("address", val)}
                  type="textarea"
                />
                <EditableDetailItem
                  label="Update Password"
                  value={password}
                  error={errors.password}
                  isEditing={true}
                  onChange={handlePasswordChange}
                />
                <EditableDetailItem
                  label="Confirm Password"
                  value={confirmPassword}
                  error={errors.confirmPassword}
                  isEditing={true}
                  onChange={handleConfirmPasswordChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/50 flex justify-between gap-3 items-center">
          <Button
            type="button"
            variant={userData.is_active ? "destructive" : "default"}
            size="sm"
            className="h-8 text-[10px] font-semibold tracking-widest uppercase rounded-sm gap-2 px-4 shadow-sm"
            onClick={handleToggleActive}
            disabled={isUpdating}
          >
            {userData.is_active ? "Deactivate Account" : "Activate Account"}
          </Button>
        </div>
      </div>
    );
  },
);

OverviewTab.displayName = "OverviewTab";

export default OverviewTab;
