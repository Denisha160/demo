import { useParams } from "react-router-dom";
import TasksTable from "@/components/common/TasksTable";

const LeadTaskViewPage = () => {
  const { leadId } = useParams();

  // Handle "lead_id" or "all" as undefined to show all tasks
  const effectiveLeadId =
    leadId === "lead_id" || leadId === "all" ? undefined : leadId;

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] w-full animate-fade-in p-4">
      <div className="flex-1 overflow-hidden">
        <TasksTable leadId={effectiveLeadId} />
      </div>
    </div>
  );
};

export default LeadTaskViewPage;
