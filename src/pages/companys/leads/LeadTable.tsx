import { useMemo } from "react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Deal, PipelineColumn } from "../../types/leads";

interface LeadTableProps {
    displayedColumns: PipelineColumn[];
}

const LeadTable = ({ displayedColumns }: LeadTableProps) => {
    const flatDeals = useMemo(() => {
        return displayedColumns.flatMap(col =>
            col.deals.map(deal => ({
                ...deal,
                stage: col.title,
                stageVariant: col.variant
            }))
        );
    }, [displayedColumns]);

    const tableColumns: Column<Deal & { stage: string; stageVariant: string }>[] = [
        { key: "title", header: "Deal Title", render: (item) => <span className="font-medium text-foreground">{item.title}</span> },
        { key: "company", header: "Company" },
        { key: "value", header: "Value", className: "font-medium" },
        { key: "contact", header: "Contact", className: "hidden sm:table-cell" },
        {
            key: "stage",
            header: "Stage",
            render: (item) => <StatusBadge status={item.stage} variant={item.stageVariant || "default"} />
        },
        {
            key: "quotationStatus",
            header: "Quotation Status",
            className: "hidden lg:table-cell",
            render: (item) => item.quotationStatus ? (
                <StatusBadge
                    status={item.quotationStatus === "approved" ? "Approved" : "Rejected"}
                    variant={item.quotationStatus === "approved" ? "success" : "destructive"}
                />
            ) : <span className="text-muted-foreground text-[11px]">-</span>
        },
        { key: "date", header: "Date", className: "hidden md:table-cell text-muted-foreground" },
    ];

    return (
        <div className="flex-1 overflow-auto bg-card rounded-sm border border-border/40 shadow-sm">
            <DataTable
                data={flatDeals}
                columns={tableColumns}
                pageSize={15}
            />
        </div>
    );
};

export default LeadTable;
