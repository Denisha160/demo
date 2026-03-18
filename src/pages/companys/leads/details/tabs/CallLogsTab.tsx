import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";

const CallLogsTab = () => {
    const columns: Column<any>[] = [
        { key: "date", header: "Date" },
        { key: "duration", header: "Duration" },
        { key: "calledBy", header: "Called By" },
        { key: "notes", header: "Notes" },
        { key: "outcome", header: "Outcome" },
    ];

    return (
        <div className="bg-card rounded-lg border border-border/50 shadow-sm p-4 w-full animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <Button size="sm" className="gap-2 h-9 px-4">
                    <Plus className="h-4 w-4" />
                    Log a Call
                </Button>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search call logs..." 
                            className="h-9 pl-9 w-[250px] text-sm"
                        />
                    </div>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={[]}
                pageSize={10}
            />
        </div>
    );
};

export default CallLogsTab;
