import { useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import TaskModal, { Task, TaskFormData } from "./TaskModal";
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

const initialTasks: Task[] = [
    {
        id: "1",
        title: "Initial callback",
        description: "Call the lead to introduce our services",
        status: "completed",
        priority: "high",
        assigned_to: "Admin User",
        due_date: "2024-03-20",
        created_at: new Date().toISOString(),
    },
    {
        id: "2",
        title: "Send proposal",
        description: "Prepare and send the detailed service proposal",
        status: "pending",
        priority: "medium",
        assigned_to: "Sales Manager",
        due_date: "2024-03-25",
        created_at: new Date().toISOString(),
    }
];

const TasksTab = () => {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    const filteredTasks = tasks.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.assigned_to.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        setTaskToDelete(null);
    };

    const handleSaveTask = (formData: TaskFormData) => {
        if (editingTask) {
            setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...formData } : t));
        } else {
            const newTask: Task = {
                ...formData,
                id: Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
            };
            setTasks(prev => [newTask, ...prev]);
        }
        setIsModalOpen(false);
    };

    const getPriorityVariant = (priority: string) => {
        switch (priority) {
            case "urgent": return "destructive";
            case "high": return "warning";
            case "medium": return "info";
            case "low": return "success";
            default: return "default";
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "completed": return "success";
            case "in_progress": return "info";
            case "pending": return "warning";
            case "cancelled": return "destructive";
            default: return "default";
        }
    };

    const columns: Column<Task>[] = [
        {
            key: "title",
            header: "Task",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</span>
                </div>
            ),
        },
        {
            key: "priority",
            header: "Priority",
            render: (item) => (
                <StatusBadge
                    status={item.priority.toUpperCase()}
                    variant={getPriorityVariant(item.priority)}
                />
            ),
        },
        {
            key: "assigned_to",
            header: "Assigned To",
            render: (item) => <span className="text-sm">{item.assigned_to}</span>
        },
        {
            key: "due_date",
            header: "Due Date",
            render: (item) => <span className="text-sm">{item.due_date || "No date"}</span>
        },
        {
            key: "status",
            header: "Status",
            render: (item) => (
                <StatusBadge
                    status={item.status.replace("_", " ").toUpperCase()}
                    variant={getStatusVariant(item.status)}
                />
            ),
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
                        onClick={() => setTaskToDelete(item)}
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
                    New Task
                </Button>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            className="h-9 pl-9 w-[250px] text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={filteredTasks}
                pageSize={10}
            />

            {isModalOpen && (
                <TaskModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    taskData={editingTask}
                    onSave={handleSaveTask}
                />
            )}

            <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the task "{taskToDelete?.title}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => taskToDelete && handleDelete(taskToDelete.id)}
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

export default TasksTab;
