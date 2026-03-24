import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar } from "lucide-react";

interface Task {
  id: string;
  title: string;
  assignee: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  category: string;
}

const initialTasks: Task[] = [
  {
    id: "t1",
    title: "Follow up with Acme Corp",
    assignee: "John Smith",
    due: "Feb 14",
    priority: "High",
    completed: false,
    category: "Sales",
  },
  {
    id: "t2",
    title: "Prepare proposal for DataFlow",
    assignee: "Emma Davis",
    due: "Feb 15",
    priority: "Medium",
    completed: false,
    category: "Sales",
  },
  {
    id: "t3",
    title: "Update CRM contact records",
    assignee: "Lisa Wang",
    due: "Feb 13",
    priority: "Low",
    completed: true,
    category: "Admin",
  },
  {
    id: "t4",
    title: "Schedule demo with CloudBase",
    assignee: "Alex Kim",
    due: "Feb 16",
    priority: "High",
    completed: false,
    category: "Sales",
  },
  {
    id: "t5",
    title: "Review quarterly report",
    assignee: "Sarah Lee",
    due: "Feb 17",
    priority: "Medium",
    completed: false,
    category: "Reports",
  },
  {
    id: "t6",
    title: "Send invoice to GlobalFin",
    assignee: "Mike Chen",
    due: "Feb 13",
    priority: "High",
    completed: true,
    category: "Finance",
  },
  {
    id: "t7",
    title: "Team standup notes",
    assignee: "Tom Brown",
    due: "Feb 14",
    priority: "Low",
    completed: false,
    category: "Admin",
  },
  {
    id: "t8",
    title: "Onboard new team member",
    assignee: "Kate Miller",
    due: "Feb 18",
    priority: "Medium",
    completed: false,
    category: "HR",
  },
];

const priorityVariant: Record<string, "destructive" | "warning" | "default"> = {
  High: "destructive",
  Medium: "warning",
  Low: "default",
};

const filters = ["All", "Active", "Completed"];

const Tasks = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "",
    due: "",
    priority: "Medium" as Task["priority"],
  });

  const toggleComplete = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "Active") return !t.completed;
    if (filter === "Completed") return t.completed;
    return true;
  });

  const handleAdd = () => {
    if (!newTask.title) return;
    setTasks([
      ...tasks,
      { ...newTask, id: `t${Date.now()}`, completed: false, category: "Sales" },
    ]);
    setAddOpen(false);
    setNewTask({ title: "", assignee: "", due: "", priority: "Medium" });
  };

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-sm rounded-sm transition-all ${
                filter === f
                  ? "gradient-active shadow-sm"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          className="h-7 text-sm rounded-sm gradient-active border-0"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Task
        </Button>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{tasks.filter((t) => !t.completed).length} active</span>
        <span>{tasks.filter((t) => t.completed).length} completed</span>
      </div>

      {/* Task List */}
      <div className="shadow-card border border-border bg-card rounded-sm divide-y divide-border">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 px-3 py-2 hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleComplete(task.id)}
              className="rounded-sm"
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
              >
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-muted-foreground">
                  {task.assignee}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-0.5">
                  <Calendar className="h-3 w-3" /> {task.due}
                </span>
              </div>
            </div>
            <StatusBadge
              status={task.priority}
              variant={priorityVariant[task.priority]}
            />
            <span className="text-sm text-muted-foreground hidden sm:block">
              {task.category}
            </span>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Task"
        description="Create a new task for your team"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm text-sm h-8"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="rounded-sm text-sm h-8"
              onClick={handleAdd}
            >
              Add Task
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-sm">Title</Label>
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="h-8 text-sm rounded-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Assignee</Label>
            <Input
              placeholder="John Doe"
              value={newTask.assignee}
              onChange={(e) =>
                setNewTask({ ...newTask, assignee: e.target.value })
              }
              className="h-8 text-sm rounded-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Due Date</Label>
            <Input
              placeholder="Feb 15"
              value={newTask.due}
              onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
              className="h-8 text-sm rounded-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Priority</Label>
            <div className="flex gap-1">
              {(["High", "Medium", "Low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewTask({ ...newTask, priority: p })}
                  className={`px-2 py-1 text-sm rounded-sm border transition-all ${
                    newTask.priority === p
                      ? "gradient-active border-transparent"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
