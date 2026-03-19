import { useState, useRef, useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileIcon, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

export interface Attachment {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    url: string;
    uploadedBy: string;
    date: string;
}

interface AttachmentModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (attachment: Attachment) => void;
    isSubmitting?: boolean;
}

const AttachmentModal = ({ open, onClose, onSave, isSubmitting }: AttachmentModalProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSave = () => {
        if (!selectedFile) return;

        // Mock upload logic
        const newAttachment: Attachment = {
            id: Math.random().toString(36).substr(2, 9),
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            fileSize: formatFileSize(selectedFile.size),
            url: previewUrl || "#", // In real app, this would be the backend URL
            uploadedBy: "Admin User",
            date: new Date().toISOString().split('T')[0],
        };

        onSave(newAttachment);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Upload Attachment"
            description="Upload images, PDFs, or other documents."
            maxWidth="sm:max-w-md"
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={!selectedFile || isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload
                    </Button>
                </div>
            }
        >
            <div className="space-y-4 pt-2">
                <div 
                    className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${selectedFile ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                    />
                    
                    {previewUrl ? (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center">
                            <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ) : selectedFile ? (
                        <div className="flex flex-col items-center text-center">
                            <FileIcon className="h-12 w-12 text-primary mb-2" />
                            <span className="text-sm font-medium truncate max-w-[250px]">{selectedFile.name}</span>
                            <span className="text-[10px] text-muted-foreground">{formatFileSize(selectedFile.size)}</span>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 h-7 text-[10px] text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFile(null);
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                <Upload className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-sm font-medium">Click to upload or drag and drop</span>
                            <span className="text-[10px] text-muted-foreground mt-1">Image, PDF, DOC (max 10MB)</span>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AttachmentModal;
