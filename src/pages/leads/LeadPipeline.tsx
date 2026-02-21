import { Droppable, Draggable, DragDropContext, DropResult } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { PipelineColumn } from "./types";

interface LeadPipelineProps {
    displayedColumns: PipelineColumn[];
    onDragEnd: (result: DropResult) => void;
}

const LeadPipeline = ({ displayedColumns, onDragEnd }: LeadPipelineProps) => {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide min-h-[calc(100vh-200px)]">
                {displayedColumns.map((col) => (
                    <div key={col.id} className="flex-shrink-0 w-[280px]">
                        <div className="flex flex-col h-full bg-secondary/10 border border-border/50 rounded-sm">
                            <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/50 bg-background/50">
                                <div className="flex items-center gap-1.5">
                                    <StatusBadge status={col.title} variant={col.variant} />
                                    <span className="text-[10px] font-bold text-muted-foreground">{col.deals.length}</span>
                                </div>
                            </div>

                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`p-1.5 flex-1 space-y-1.5 transition-colors ${snapshot.isDraggingOver ? "bg-primary/5" : ""}`}
                                    >
                                        {col.deals.map((deal, i) => (
                                            <Draggable key={deal.id} draggableId={deal.id} index={i}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`group relative border border-border bg-card rounded-sm p-2 transition-all ${snapshot.isDragging ? "shadow-md ring-1 ring-primary/20" : "shadow-sm hover:border-primary/40"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-1.5">
                                                            <span
                                                                {...provided.dragHandleProps}
                                                                className="text-muted-foreground/30 group-hover:text-primary mt-0.5 cursor-grab active:cursor-grabbing"
                                                            >
                                                                <GripVertical className="h-3 w-3" />
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start">
                                                                    <p className="text-[12px] font-semibold text-foreground truncate leading-none mb-1">
                                                                        {deal.title}
                                                                    </p>
                                                                    <span className="text-[9px] text-muted-foreground tabular-nums">
                                                                        {deal.date}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground truncate">{deal.company}</p>

                                                                {deal.quotationStatus && (
                                                                    <div className="mt-1.5 flex items-center gap-1.5">
                                                                        <StatusBadge
                                                                            status={deal.quotationStatus === "approved" ? "Quotation Approved" : "Quotation Rejected"}
                                                                            variant={deal.quotationStatus === "approved" ? "success" : "destructive"}
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/40">
                                                                    <span className="text-[11px] font-bold text-foreground">{deal.value}</span>
                                                                    <div className="flex items-center gap-1 overflow-hidden">
                                                                        <div className="h-3.5 w-3.5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                                                                            {deal.contact.charAt(0)}
                                                                        </div>
                                                                        <span className="text-[9px] text-muted-foreground truncate max-w-[60px]">{deal.contact}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
};

export default LeadPipeline;
