import { Droppable, Draggable, DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import { PipelineColumn } from "../../../types/leads";

interface LeadPipelineProps {
    displayedColumns: PipelineColumn[];
    onDragEnd: (result: DropResult) => void;
}

const LeadPipeline = ({ displayedColumns, onDragEnd }: LeadPipelineProps) => {
    const navigate = useNavigate();
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide min-h-[calc(100vh-200px)]">
                {displayedColumns.map((col) => (
                    <div key={col.id} className="flex-shrink-0 w-[280px]">
                        <div className="group/column flex flex-col h-full bg-secondary/20 rounded-xl overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.05)] border border-border/5">
                            <div className="relative flex items-center justify-between p-3.5 bg-background/80 backdrop-blur-xl border-b border-border/10 transition-colors">
                                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover/column:opacity-100 transition-opacity duration-500" />
                                <div className="flex items-center gap-2.5">
                                    <div className="transform transition-transform duration-300 group-hover/column:scale-105">
                                        <StatusBadge status={col.title} variant={col.variant} />
                                    </div>
                                    <div className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-secondary/80 border border-border/40 text-[11px] font-extrabold text-foreground/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                                        {col.deals.length}
                                    </div>
                                </div>

                            </div>

                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`p-3 flex-1 space-y-3 transition-colors duration-300 rounded-b-xl ${snapshot.isDraggingOver ? "bg-primary/10" : "bg-transparent"}`}
                                    >
                                        {col.deals.map((deal, i) => (
                                            <Draggable key={deal.id} draggableId={deal.id} index={i}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                        }}
                                                        className={`group relative bg-card rounded-xl p-4 transition-all duration-300 ease-out cursor-pointer active:cursor-grabbing ${snapshot.isDragging
                                                            ? "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] ring-2 ring-primary/40 scale-[1.04] rotate-2 z-50 opacity-95"
                                                            : "shadow-[0_2px_10px_-3px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:ring-1 hover:ring-primary/20"
                                                            }`}
                                                    >
                                                        <div onClick={() => navigate(deal.id)} className="flex flex-col gap-1.5 focus:outline-none h-full">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <p className="text-[14px] font-semibold text-foreground leading-tight line-clamp-2 transition-colors group-hover:text-primary">
                                                                        {deal.title}
                                                                    </p>
                                                                    <span className="text-[10px] text-muted-foreground/80 tabular-nums whitespace-nowrap bg-secondary/60 px-2 py-0.5 rounded-full font-medium">
                                                                        {deal.date}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-muted-foreground truncate mt-1">{deal.company}</p>

                                                                {deal.quotationStatus && (
                                                                    <div className="mt-2.5 flex items-center gap-1.5">
                                                                        <StatusBadge
                                                                            status={deal.quotationStatus === "approved" ? "Quotation Approved" : "Quotation Rejected"}
                                                                            variant={deal.quotationStatus === "approved" ? "success" : "destructive"}
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border/10">
                                                                    <span className="text-[12px] font-bold text-foreground bg-primary/5 px-2 py-0.5 rounded-md text-primary">{deal.value}</span>
                                                                    <div className="flex items-center gap-1.5 overflow-hidden bg-secondary/30 px-1.5 py-0.5 rounded-full">
                                                                        <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                                                                            {deal.contact.charAt(0)}
                                                                        </div>
                                                                        <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[80px]">{deal.contact}</span>
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
