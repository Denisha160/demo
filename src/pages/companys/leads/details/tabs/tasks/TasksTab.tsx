import TasksTable from "@/components/common/TasksTable";

interface TasksTabProps {
  leadId: string;
  defaultAssignedTo?: { id: string; name: string };
}

const TasksTab = ({ leadId, defaultAssignedTo }: TasksTabProps) => {
  return <TasksTable leadId={leadId} defaultAssignedTo={defaultAssignedTo} />;
};

export default TasksTab;
