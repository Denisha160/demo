export interface Deal {
    id: string;
    title: string;
    company: string;
    value: string;
    contact: string;
    date: string; // YYYY-MM-DD
    stage?: string; // Optional stage for table view
    stageVariant?: "default" | "info" | "warning" | "success" | "destructive";
    quotationStatus?: "approved" | "rejected" | "pending";
}

export interface PipelineColumn {
    id: string;
    title: string;
    variant: "default" | "info" | "warning" | "success" | "destructive";
    deals: Deal[];
}
