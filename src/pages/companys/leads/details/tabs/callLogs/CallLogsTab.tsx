import { useState } from "react";
import { Search, Plus, Edit, Trash2, Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import CallLogModal, { CallLog, CallLogFormData } from "./CallLogModal";
import StatusBadge from "@/components/StatusBadge";
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

const initialCallLogs: CallLog[] = [
    {
        id: "1",
        call_type: "outbound",
        call_start_time: "10:00:00",
        call_end_time: "10:05:30",
        recording_url: "https://example.com/rec1.mp3",
        subject: "Introduction call",
        remarks: "Discussed product features",
        created_at: "2024-03-18",
    },
    {
        id: "2",
        call_type: "inbound",
        call_start_time: "14:20:00",
        call_end_time: "14:22:15",
        recording_url: "",
        subject: "Pricing inquiry",
        remarks: "Client asked about bulk discounts",
        created_at: "2024-03-19",
    }
];

const CallLogsTab = () => {
    const [callLogs, setCallLogs] = useState<CallLog[]>(initialCallLogs);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<CallLog | null>(null);
    const [logToDelete, setLogToDelete] = useState<CallLog | null>(null);

    const filteredLogs = callLogs.filter((log) =>
        log.subject.toLowerCase().includes(search.toLowerCase()) ||
        log.call_type.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => {
        setEditingLog(null);
        setIsModalOpen(true);
    };

    const handleEdit = (log: CallLog) => {
        setEditingLog(log);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setCallLogs(prev => prev.filter(log => log.id !== id));
        setLogToDelete(null);
    };

    const handleSaveLog = (formData: CallLogFormData) => {
        if (editingLog) {
            setCallLogs(prev => prev.map(log => log.id === editingLog.id ? { ...log, ...formData } : log));
        } else {
            const newLog: CallLog = {
                ...formData,
                id: Math.random().toString(36).substr(2, 9),
            };
            setCallLogs(prev => [newLog, ...prev]);
        }
        setIsModalOpen(false);
    };

    const getCallTypeIcon = (type: string) => {
        switch (type) {
            case "inbound": return <PhoneIncoming className="h-3 w-3 mr-1" />;
            case "outbound": return <PhoneOutgoing className="h-3 w-3 mr-1" />;
            case "missed": return <PhoneMissed className="h-3 w-3 mr-1" />;
            default: return <Phone className="h-3 w-3 mr-1" />;
        }
    };

    const getCallTypeVariant = (type: string) => {
        switch (type) {
            case "inbound": return "success";
            case "outbound": return "info";
            case "missed": return "destructive";
            default: return "default";
        }
    };

    const columns: Column<CallLog>[] = [
        {
            key: "created_at",
            header: "Date",
            render: (item) => <span className="text-sm">{item.created_at}</span>
        },
        {
            key: "call_type",
            header: "Type",
            render: (item) => (
                <div className="flex items-center">
                    <StatusBadge
                        status={item.call_type.toUpperCase()}
                        variant={getCallTypeVariant(item.call_type)}
                    />
                </div>
            ),
        },
        {
            key: "subject",
            header: "Subject",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{item.subject}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">{item.remarks}</span>
                </div>
            ),
        },
        {
            key: "duration",
            header: "Times",
            render: (item) => (
                <div className="text-[11px] text-muted-foreground">
                    <div>{item.call_start_time}</div>
                    <div>{item.call_end_time}</div>
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
                        onClick={() => handleEdit(item)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 rounded-sm text-destructive"
                        onClick={() => setLogToDelete(item)}
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
                <Button size="sm" className="gap-2 h-9 px-4" onClick={handleCreate}>
                    <Plus className="h-4 w-4" />
                    Log a Call
                </Button>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search call logs..."
                            className="h-9 pl-9 w-[250px] text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={filteredLogs}
                pageSize={10}
            />

            {isModalOpen && (
                <CallLogModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    callLogData={editingLog}
                    onSave={handleSaveLog}
                />
            )}

            <AlertDialog open={!!logToDelete} onOpenChange={(open) => !open && setLogToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the call log for "{logToDelete?.subject}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => logToDelete && handleDelete(logToDelete.id)}
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

export default CallLogsTab;
