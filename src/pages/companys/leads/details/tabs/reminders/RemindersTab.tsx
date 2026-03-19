import { useState } from "react";
import { BellRing, Edit, Plus, Search, Trash2 } from "lucide-react";

import DataTable, { Column } from "@/components/DataTable";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ReminderModal, { Reminder, ReminderFormData } from "./ReminderModal";

const initialReminders: Reminder[] = [
    {
        id: "1",
        remind_date: "2026-03-20",
        title: "Follow up with customer",
        description: "Call the customer and confirm interest in the final quotation.",
    },
    {
        id: "2",
        remind_date: "2026-03-22",
        title: "Send brochure",
        description: "Share the latest product brochure and pricing details over email.",
    },
];

const RemindersTab = () => {
    const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);

    const filteredReminders = reminders.filter((reminder) => {
        const query = search.toLowerCase();

        return (
            reminder.title.toLowerCase().includes(query) ||
            reminder.description.toLowerCase().includes(query) ||
            reminder.remind_date.toLowerCase().includes(query)
        );
    });

    const handleCreate = () => {
        setEditingReminder(null);
        setIsModalOpen(true);
    };

    const handleEdit = (reminder: Reminder) => {
        setEditingReminder(reminder);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
        setReminderToDelete(null);
    };

    const handleSaveReminder = (formData: ReminderFormData) => {
        if (editingReminder) {
            setReminders((prev) =>
                prev.map((reminder) =>
                    reminder.id === editingReminder.id ? { ...reminder, ...formData } : reminder,
                ),
            );
        } else {
            const newReminder: Reminder = {
                id: crypto.randomUUID(),
                ...formData,
            };

            setReminders((prev) => [newReminder, ...prev]);
        }

        setIsModalOpen(false);
        setEditingReminder(null);
    };

    const columns: Column<Reminder>[] = [
        {
            key: "remind_date",
            header: "Reminder Date",
            render: (item) => <span className="text-sm">{item.remind_date}</span>,
        },
        {
            key: "title",
            header: "Title",
            render: (item) => (
                <div className="flex items-start gap-2">

                    <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{item.title}</span>
                        <span className="text-[11px] text-muted-foreground line-clamp-2">
                            {item.description}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "description",
            header: "Description",
            render: (item) => (
                <span className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                    {item.description}
                </span>
            ),
        },
        {
            key: "id",
            header: "Actions",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-sm hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleEdit(item)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setReminderToDelete(item)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-card rounded-lg border border-border/50 shadow-sm p-4 w-full animate-fade-in">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Button size="sm" className="h-9 gap-2 px-4" onClick={handleCreate}>
                    <Plus className="h-4 w-4" />
                    Add Reminder
                </Button>

                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search reminders..."
                        className="h-9 w-[250px] pl-9 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <DataTable columns={columns} data={filteredReminders} pageSize={10} />

            {isModalOpen && (
                <ReminderModal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingReminder(null);
                    }}
                    reminderData={editingReminder}
                    onSave={handleSaveReminder}
                />
            )}

            <AlertDialog
                open={!!reminderToDelete}
                onOpenChange={(open) => !open && setReminderToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the reminder for "{reminderToDelete?.title}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => reminderToDelete && handleDelete(reminderToDelete.id)}
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

export default RemindersTab;
