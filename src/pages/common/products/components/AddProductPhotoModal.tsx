import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Modal from "@/components/Modal";
import { Loader2, Upload, X, Trash2, Camera, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadProductPhoto } from "@/hooks/useProducts";
import { compressImage, formatFileSize } from "@/utils/imageCompression";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  originalSize: number;
}

interface AddProductPhotoModalProps {
  product: { id: string; name?: string } | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddProductPhotoModal = ({
  product,
  open,
  onClose,
  onSuccess,
}: AddProductPhotoModalProps) => {
  const { mutateAsync: uploadPhoto, isPending: isUploading } =
    useUploadProductPhoto();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsCompressing(true);

    try {
      const compressedFiles: UploadedFile[] = [];
      for (const file of acceptedFiles) {
        try {
          const compressedFile = await compressImage(file);
          compressedFiles.push({
            file: compressedFile,
            id: Math.random().toString(36).substr(2, 9),
            preview: URL.createObjectURL(compressedFile),
            name: compressedFile.name,
            size: compressedFile.size,
            originalSize: file.size,
          });
        } catch {
          // skip invalid files
        }
      }
      setUploadedFiles((prev) => [...prev, ...compressedFiles]);
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] },
    multiple: true,
    maxSize: 20 * 1024 * 1024,
    disabled: isCompressing || isUploading,
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const f = prev.find((x) => x.id === fileId);
      if (f) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== fileId);
    });
  };

  const clearAllFiles = () => {
    uploadedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setUploadedFiles([]);
  };

  const handleSubmit = async () => {
    if (!product?.id || uploadedFiles.length === 0) return;

    for (const fileObj of uploadedFiles) {
      await uploadPhoto({ productId: product.id, file: fileObj.file });
    }

    onSuccess?.();
    handleClose();
  };

  const handleClose = () => {
    clearAllFiles();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      headerBg="bg-primary/10"
      titleClassName="text-primary"
      maxWidth="sm:max-w-[600px]"
      title={`Add Photos — ${product?.name || "Product"}`}
      description="Drop images below to add to this product. Files over 2 MB are auto-compressed."
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-sm text-sm h-8"
            onClick={handleClose}
            disabled={isUploading || isCompressing}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="rounded-sm text-sm h-8"
            onClick={handleSubmit}
            disabled={
              uploadedFiles.length === 0 || isUploading || isCompressing
            }
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="mr-2 h-3.5 w-3.5" />
                Upload {uploadedFiles.length} Photo
                {uploadedFiles.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4 mt-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
            (isCompressing || isUploading) && "opacity-50 cursor-not-allowed",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {isCompressing ? (
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            ) : (
              <Camera className="h-7 w-7 text-muted-foreground" />
            )}
            <p className="text-sm font-medium text-foreground">
              {isCompressing
                ? "Compressing files…"
                : isDragActive
                  ? "Drop photos here"
                  : "Drag & drop or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, GIF, WebP · Max 20 MB per file
            </p>
          </div>
        </div>

        {/* File preview grid */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Selected ({uploadedFiles.length})
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-sm"
                onClick={clearAllFiles}
                disabled={isUploading}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
              {uploadedFiles.map((fileObj) => (
                <div
                  key={fileObj.id}
                  className="relative group border border-border rounded-sm overflow-hidden bg-muted/40"
                >
                  <div className="aspect-square">
                    <img
                      src={fileObj.preview}
                      alt={fileObj.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFile(fileObj.id)}
                    disabled={isUploading}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {/* File info */}
                  <div className="p-1.5">
                    <p className="text-xs font-medium truncate">
                      {fileObj.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(fileObj.size)}
                      {fileObj.originalSize !== fileObj.size && (
                        <span className="text-orange-500 ml-1">
                          (from {formatFileSize(fileObj.originalSize)})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              {/* Add more slot */}
              <div
                {...getRootProps()}
                className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <input {...getInputProps()} />
                <ImagePlus className="h-5 w-5 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Add more</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddProductPhotoModal;
