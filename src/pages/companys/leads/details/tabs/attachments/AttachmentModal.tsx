import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
    FileIcon, Upload, X, Loader2, Image as ImageIcon, 
    ImagePlus, Trash2, Camera, FileText, File
} from "lucide-react";
import { cn } from "@/lib/utils";
import { compressImage, formatFileSize } from "@/utils/imageCompression";

export interface Attachment {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    url: string;
    uploadedBy: string;
    date: string;
}

interface UploadedFile {
    id: string;
    file: File;
    preview: string;
    name: string;
    size: number;
    originalSize: number;
    isImage: boolean;
}

interface AttachmentModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (file: File, onProgress: (progress: number) => void) => Promise<void>;
    isSubmitting?: boolean;
}

const AttachmentModal = ({ open, onClose, onSave, isSubmitting }: AttachmentModalProps) => {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const clearAllFiles = useCallback(() => {
        setUploadedFiles((prev) => {
            prev.forEach((f) => {
                if (f.preview) URL.revokeObjectURL(f.preview);
            });
            return [];
        });
    }, []);

    const removeFile = useCallback((fileId: string) => {
        setUploadedFiles((prev) => {
            const f = prev.find((x) => x.id === fileId);
            if (f && f.preview) URL.revokeObjectURL(f.preview);
            return prev.filter((x) => x.id !== fileId);
        });
    }, []);

    useEffect(() => {
        if (!open) {
            clearAllFiles();
        }
    }, [open, clearAllFiles]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        setIsCompressing(true);

        try {
            // Only process the first file as we only allow single upload now
            const file = acceptedFiles[0];
            const isImage = file.type.startsWith('image/');
            const finalFile = isImage ? await compressImage(file) : file;

            const processedFile: UploadedFile = {
                file: finalFile,
                id: Math.random().toString(36).substr(2, 9),
                preview: isImage ? URL.createObjectURL(finalFile) : "",
                name: finalFile.name,
                size: finalFile.size,
                originalSize: file.size,
                isImage,
            };

            setUploadedFiles([processedFile]);
        } catch (error) {
            console.error("File processing failed", error);
        } finally {
            setIsCompressing(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
            'application/pdf': ['.pdf']
        },
        disabled: isCompressing || isSubmitting,
    });

    const handleSave = async () => {
        if (uploadedFiles.length === 0) return;
        setUploadProgress(0);
        try {
            await onSave(uploadedFiles[0].file, (progress) => {
                setUploadProgress(progress);
            });
            handleClose();
        } catch (error) {
            console.error("Upload failed", error);
            setUploadProgress(0);
        }
    };

    const handleClose = () => {
        clearAllFiles();
        onClose();
    };

    const getFileIcon = (isImage: boolean, preview?: string) => {
        if (isImage && preview) {
            return <img src={preview} alt="Preview" className="w-full h-full object-cover" />;
        }
        if (isImage) return <ImageIcon className="h-8 w-8 text-muted-foreground" />;
        return <FileText className="h-8 w-8 text-muted-foreground" />;
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            headerBg="bg-primary/10"
            titleClassName="text-primary"
            maxWidth="sm:max-w-[600px]"
            title="Upload Attachment"
            description="Select an image or PDF document to upload. Images are auto-compressed."
            footer={
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-sm text-sm h-8"
                        onClick={handleClose}
                        disabled={isSubmitting || isCompressing}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-sm text-sm h-8 min-w-[100px]"
                        onClick={handleSave}
                        disabled={uploadedFiles.length === 0 || isSubmitting || isCompressing}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                {uploadProgress > 0 ? `${uploadProgress}%` : "Uploading…"}
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-3.5 w-3.5" />
                                Upload File
                            </>
                        )}
                    </Button>
                </>
            }
        >
            <div className="space-y-4 mt-4">
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors",
                        isDragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
                        (isCompressing || isSubmitting) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                        {isCompressing ? (
                            <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        ) : (
                            <Upload className="h-7 w-7 text-muted-foreground" />
                        )}
                        <p className="text-sm font-medium text-foreground">
                            {isCompressing
                                ? "Processing files…"
                                : isDragActive
                                    ? "Drop files here"
                                    : "Drag & drop or click to browse"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Images, PDFs, Docs · Max 20 MB per file
                        </p>
                    </div>
                </div>

                {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Selected File
                            </Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 rounded-sm uppercase tracking-wider font-bold"
                                onClick={clearAllFiles}
                                disabled={isSubmitting}
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
                                    <div className="aspect-square flex items-center justify-center bg-muted">
                                        {getFileIcon(fileObj.isImage, fileObj.preview)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(fileObj.id);
                                        }}
                                        disabled={isSubmitting}
                                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                    <div className="p-1.5 border-t">
                                        <p className="text-[10px] font-medium truncate">{fileObj.name}</p>
                                        <div className="flex items-center justify-between gap-2 mt-0.5">
                                            <p className="text-[9px] text-muted-foreground">
                                                {formatFileSize(fileObj.size)}
                                                {fileObj.isImage && fileObj.originalSize !== fileObj.size && (
                                                    <span className="text-orange-500 ml-1 font-bold">
                                                        (Compressed)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        {isSubmitting && uploadProgress > 0 && (
                                            <div className="mt-1 w-full bg-muted rounded-full h-1 overflow-hidden">
                                                <div 
                                                    className="bg-primary h-full transition-all duration-300" 
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AttachmentModal;
