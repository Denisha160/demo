import { useState } from "react";
import { Search, Upload, FileIcon, Trash2, Eye, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import AttachmentModal, { Attachment } from "./AttachmentModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const initialAttachments: Attachment[] = [
    {
        id: "1",
        fileName: "Contract_Signed.pdf",
        fileType: "application/pdf",
        fileSize: "1.2 MB",
        url: "#",
        uploadedBy: "Admin User",
        date: "2024-03-15",
    },
    {
        id: "2",
        fileName: "Lead_Site_Photo.jpg",
        fileType: "image/jpeg",
        fileSize: "2.5 MB",
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
        uploadedBy: "Sales Rep",
        date: "2024-03-16",
    }
];

const AttachmentsTab = () => {
    const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);

    const filteredAttachments = attachments.filter((file) =>
        file.fileName.toLowerCase().includes(search.toLowerCase())
    );

    const handleSaveAttachment = (newAttachment: Attachment) => {
        setAttachments(prev => [newAttachment, ...prev]);
    };

    const handleDelete = (id: string) => {
        setAttachments(prev => prev.filter(file => file.id !== id));
        setAttachmentToDelete(null);
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4 text-blue-500" />;
        if (type === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />;
        return <FileIcon className="h-4 w-4 text-gray-500" />;
    };

    const columns: Column<Attachment>[] = [
        {
            key: "fileName",
            header: "File",
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {item.fileType.startsWith('image/') && item.url !== "#" ? (
                            <img src={item.url} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                            getFileIcon(item.fileType)
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm truncate max-w-[200px]">{item.fileName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{item.fileType.split('/')[1] || item.fileType}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "fileSize",
            header: "Size",
            render: (item) => <span className="text-sm text-muted-foreground">{item.fileSize}</span>
        },
        {
            key: "uploadedBy",
            header: "Uploaded By",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm">{item.uploadedBy}</span>
                    <span className="text-[10px] text-muted-foreground">{item.date}</span>
                </div>
            )
        },
        {
            key: "id",
            header: "Actions",
            render: (item) => (
                <div className="flex bg-transparent items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-sm"
                        onClick={() => window.open(item.url, '_blank')}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 rounded-sm text-destructive"
                        onClick={() => setAttachmentToDelete(item)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="bg-card rounded-lg border border-border/50 shadow-sm p-4 w-full animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <Button size="sm" className="gap-2 h-9 px-4" onClick={() => setIsModalOpen(true)}>
                    <Upload className="h-4 w-4" />
                    Upload File
                </Button>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search files..."
                            className="h-9 pl-9 w-[250px] text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={filteredAttachments}
                pageSize={10}
            />

            {isModalOpen && (
                <AttachmentModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveAttachment}
                />
            )}

            <AlertDialog open={!!attachmentToDelete} onOpenChange={(open) => !open && setAttachmentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the attachment "{attachmentToDelete?.fileName}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => attachmentToDelete && handleDelete(attachmentToDelete.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AttachmentsTab;
