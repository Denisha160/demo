import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Plus, Search, Filter, List, Kanban } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import LeadModal from "./LeadModal";
import LeadPipeline from "./LeadPipeline";
import LeadTable from "./LeadTable";
import { Deal, PipelineColumn } from "../../../types/leads";

// Helper to generate mock data
const generateMockDeals = (count: number, statusId: string): Deal[] => {
    const deals: Deal[] = [];
    const companies = ["TechStart Inc", "NetSolutions", "DataFlow", "GlobalFin", "OldNet", "AlphaCorp", "BetaSystems", "GammaGroup", "DeltaDynamics", "EpsilonEnterprises"];
    const contacts = ["Sarah Lee", "Lisa Wang", "Emma Davis", "Mike Chen", "John Doe", "Robert Brown", "Emily White", "David Wilson", "Jessica Taylor", "Daniel Anderson"];
    const titles = ["Enterprise Plan", "Annual License", "Custom Integration", "Strategic Deal", "Legacy Support", "Consulting Project", "Maintenance Contract", "Cloud Migration", "Security Audit", "Training Workshop"];

    for (let i = 0; i < count; i++) {
        const randomDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
        const randomValue = Math.floor(Math.random() * 100000) + 5000;

        deals.push({
            id: `${statusId}-${i}`,
            title: titles[Math.floor(Math.random() * titles.length)],
            company: companies[Math.floor(Math.random() * companies.length)],
            value: `₹${randomValue.toLocaleString('en-IN')}`,
            contact: contacts[Math.floor(Math.random() * contacts.length)],
            date: randomDate,
            quotationStatus: statusId === "quotation"
                ? (Math.random() > 0.5 ? "approved" : "rejected")
                : undefined,
        });
    }
    return deals;
};

const initialColumns: PipelineColumn[] = [
    { id: "initial", title: "Initial Lead", variant: "default", deals: generateMockDeals(15, "initial") },
    { id: "verified", title: "Verified Lead", variant: "info", deals: generateMockDeals(12, "verified") },
    { id: "quotation", title: "Quotation", variant: "warning", deals: generateMockDeals(10, "quotation") },
    { id: "won", title: "Won", variant: "success", deals: generateMockDeals(12, "won") },
    { id: "lost", title: "Lost", variant: "destructive", deals: generateMockDeals(8, "lost") },
];

const LeadsPage = () => {
    const [columns, setColumns] = useState(initialColumns);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [addModalCol, setAddModalCol] = useState<string | null>(null);
    const [newDeal, setNewDeal] = useState({ title: "", company: "", value: "", contact: "" });

    const [visibleStageIds, setVisibleStageIds] = useState<string[]>(initialColumns.map(c => c.id));
    const [viewMode, setViewMode] = useState<"pipeline" | "table">(() => {
        return (localStorage.getItem("leadsViewMode") as "pipeline" | "table") || "pipeline";
    });

    useEffect(() => {
        localStorage.setItem("leadsViewMode", viewMode);
    }, [viewMode]);

    const isDealVisible = useCallback((deal: Deal) => {
        const matchesSearch =
            deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deal.company.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesDate = true;
        if (dateRange?.from) {
            const dealDate = parseISO(deal.date);
            const fromDate = startOfDay(dateRange.from);
            const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

            matchesDate = isWithinInterval(dealDate, { start: fromDate, end: toDate });
        }

        return matchesSearch && matchesDate;
    }, [searchTerm, dateRange]);

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        const newCols = [...columns];
        const srcCol = newCols.find((c) => c.id === source.droppableId)!;
        const destCol = newCols.find((c) => c.id === destination.droppableId)!;

        const srcFilteredDeals = srcCol.deals.filter(isDealVisible);
        const movedDeal = srcFilteredDeals[source.index];

        if (!movedDeal) return;

        const srcIndexClean = srcCol.deals.findIndex(d => d.id === movedDeal.id);
        if (srcIndexClean === -1) return;

        srcCol.deals.splice(srcIndexClean, 1);

        let destIndexClean = 0;
        const destFilteredDeals = destCol.deals.filter(isDealVisible);

        if (destination.index === destFilteredDeals.length) {
            destIndexClean = destCol.deals.length;
        } else {
            const targetDeal = destFilteredDeals[destination.index];
            destIndexClean = destCol.deals.findIndex(d => d.id === targetDeal.id);
            if (destIndexClean === -1) destIndexClean = destCol.deals.length;
        }

        destCol.deals.splice(destIndexClean, 0, movedDeal);
        setColumns(newCols);

        if (source.droppableId !== destination.droppableId) {
            toast.success(`Lead moved to ${destCol.title}`);
        }
    };

    const handleAddDeal = () => {
        if (!addModalCol || !newDeal.title) return;
        const newCols = columns.map((col) => {
            if (col.id === addModalCol) {
                return {
                    ...col,
                    deals: [{ ...newDeal, id: `d${Date.now()}`, date: new Date().toISOString().split('T')[0] }, ...col.deals],
                };
            }
            return col;
        });
        setColumns(newCols);
        setAddModalCol(null);
        setNewDeal({ title: "", company: "", value: "", contact: "" });
    };

    const toggleStageVisibility = (id: string) => {
        setVisibleStageIds(prev =>
            prev.includes(id) ? prev.filter(stageId => stageId !== id) : [...prev, id]
        );
    };

    const displayedColumns = useMemo(() => {
        return columns
            .filter(col => visibleStageIds.includes(col.id))
            .map(col => ({
                ...col,
                deals: col.deals.filter(isDealVisible)
            }));
    }, [columns, isDealVisible, visibleStageIds]);

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Search leads..."
                            className="h-9 pl-9 text-sm rounded-sm bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="flex-1 sm:flex-none">
                                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 border-border/60 bg-background hover:bg-accent/50">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel className="text-xs font-semibold">Filter Stages</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {initialColumns.map((col) => (
                                        <DropdownMenuCheckboxItem
                                            key={col.id}
                                            checked={visibleStageIds.includes(col.id)}
                                            onCheckedChange={() => toggleStageVisibility(col.id)}
                                            onSelect={(e) => e.preventDefault()}
                                            className="text-sm"
                                        >
                                            {col.title}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-1 border border-border/60 rounded-sm bg-muted/20 p-1 w-full sm:w-auto justify-center">
                            <Button
                                variant={viewMode === "pipeline" ? "secondary" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-7 px-3 text-xs font-semibold rounded-xs transition-all flex-1 sm:flex-none",
                                    viewMode === "pipeline" ? "bg-background shadow-xs text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => setViewMode("pipeline")}
                            >
                                <Kanban className="h-3.5 w-3.5 mr-1.5" />
                                <span>Pipeline</span>
                            </Button>
                            <Button
                                variant={viewMode === "table" ? "secondary" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-7 px-3 text-xs font-semibold rounded-xs transition-all flex-1 sm:flex-none",
                                    viewMode === "table" ? "bg-background shadow-xs text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => setViewMode("table")}
                            >
                                <List className="h-3.5 w-3.5 mr-1.5" />
                                <span>Table</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center">
                    <Button
                        onClick={() => setAddModalCol("initial")}
                        size="sm"
                        className="h-9 w-full lg:w-auto px-4 font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="whitespace-nowrap">Create Lead</span>
                    </Button>
                </div>
            </div>

            {viewMode === "pipeline" ? (
                <LeadPipeline displayedColumns={displayedColumns} onDragEnd={onDragEnd} />
            ) : (
                <LeadTable displayedColumns={displayedColumns} />
            )}

            <LeadModal
                open={!!addModalCol}
                onClose={() => setAddModalCol(null)}
                onSave={handleAddDeal}
                addModalCol={addModalCol}
                columns={columns}
                newDeal={newDeal}
                setNewDeal={setNewDeal}
            />
        </div>
    );
};

export default LeadsPage;
