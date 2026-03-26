import { useState } from "react";
import { User, Plus, Users, Edit2, Trash2, Info, ChevronRight } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

export interface HierarchyNode {
  id: string;
  name: string;
  role: string;
  relation: string;
  parentId: string | null;
  children: string[]; 
  userId: string;
  createdAt: string;
}

interface HierarchyTableViewProps {
  currentChildren: HierarchyNode[];
  nodes: Record<string, HierarchyNode>;
  userOptions: any[];
  inlineAddingToId: string | null;
  openAccordionIds: string[];
  setOpenAccordionIds: (ids: string[]) => void;
  onInlineAdd: (id: string) => void;
  onCancelInline: () => void;
  handleCreateNode: (parentId?: string) => void;
  selectedUserId: string;
  setSelectedUserId: (v: string) => void;
  newNodeRelation: string;
  setNewNodeRelation: (v: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, relation: string) => void;
  onAddGlobal: () => void;
  currentNodeName: string;
}

export const HierarchyTableView = ({
  currentChildren,
  nodes,
  userOptions,
  inlineAddingToId,
  openAccordionIds,
  setOpenAccordionIds,
  onInlineAdd,
  onCancelInline,
  handleCreateNode,
  selectedUserId,
  setSelectedUserId,
  newNodeRelation,
  setNewNodeRelation,
  onDelete,
  onUpdate,
  onAddGlobal,
  currentNodeName
}: HierarchyTableViewProps) => {
  return (
    <div className="border border-border/60 rounded-sm bg-background shadow-xs overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[950px]">
          <Accordion 
            type="multiple" 
            value={openAccordionIds}
            onValueChange={setOpenAccordionIds}
            className="w-full"
          >
            {currentChildren.map(node => (
              <NestedHierarchyRow 
                key={node.id} 
                node={node} 
                nodes={nodes} 
                userOptions={userOptions}
                inlineAddingToId={inlineAddingToId}
                openAccordionIds={openAccordionIds}
                setOpenAccordionIds={setOpenAccordionIds}
                onInlineAdd={onInlineAdd}
                onCancelInline={onCancelInline}
                handleCreateNode={handleCreateNode}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                newNodeRelation={newNodeRelation}
                setNewNodeRelation={setNewNodeRelation}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </Accordion>
        </div>
      </div>
      <div 
        className="flex items-center gap-3 px-6 py-3 border-t border-border/40 hover:bg-muted/10 group cursor-pointer transition-colors" 
        onClick={onAddGlobal}
      >
        <Plus className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-wider">
          Assign new member to {currentNodeName}
        </span>
      </div>
    </div>
  );
};

const NestedHierarchyRow = ({ 
  node, 
  nodes, 
  userOptions, 
  inlineAddingToId, 
  openAccordionIds,
  setOpenAccordionIds,
  onInlineAdd, 
  onCancelInline, 
  handleCreateNode,
  selectedUserId,
  setSelectedUserId,
  newNodeRelation,
  setNewNodeRelation,
  onDelete,
  onUpdate
}: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editRelation, setEditRelation] = useState(node.relation);

  const hasChildren = node.children.length > 0;
  const isAddingHere = inlineAddingToId === node.id;
  
  return (
    <AccordionItem value={node.id} className="border-none relative">
      <div className={cn("flex items-center justify-between px-5 py-3 hover:bg-muted/5 transition-colors group border-b border-border/40", (hasChildren || isAddingHere) && "data-[state=open]:bg-primary/5")}>
        <div className="flex items-center gap-4 flex-1 truncate">
          {(hasChildren || isAddingHere) ? (
            <AccordionTrigger className="p-0 hover:no-underline [&[data-state=open]>svg]:rotate-90">
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
            </AccordionTrigger>
          ) : <div className="w-4" />}
          
          <div className="flex items-center gap-3 truncate">
            <div className="h-9 w-9 bg-primary/10 rounded-sm flex items-center justify-center border border-primary/20 shrink-0"><User className="h-5 w-5 text-primary" /></div>
            <div className="truncate">
              <p className="text-sm font-bold text-foreground leading-none truncate">{node.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mt-1 truncate">{node.role}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8 shrink-0 ml-4 pr-6">
          <div className="hidden sm:flex flex-col items-end w-[130px]">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Relation</p>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1 px-1">
                <Input 
                  className="h-7 text-xs w-[110px]" 
                  value={editRelation} 
                  onChange={e => setEditRelation(e.target.value)}
                  autoFocus
                  onBlur={() => { onUpdate(node.id, editRelation); setIsEditing(false); }}
                />
              </div>
            ) : (
              <p className="text-xs font-bold text-primary italic leading-none truncate w-full text-right">{node.relation || "Reports To"}</p>
            )}
          </div>

          <div className="hidden md:flex flex-col items-center w-10">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight text-center">Team</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">{node.children.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 w-[120px] justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => { e.stopPropagation(); onInlineAdd(node.id); }}><Plus className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => { e.stopPropagation(); setIsEditing(true); }}><Edit2 className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => { e.stopPropagation(); onDelete(node.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>

      {(hasChildren || isAddingHere) && (
        <AccordionContent className="pb-0 pt-0 pl-10 border-l border-primary/20 translate-x-2 bg-muted/5">
          {isAddingHere && (
            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-primary/5 border-b border-border/40 animate-in slide-in-from-top-2">
              <Combobox options={userOptions} value={selectedUserId} onValueChange={setSelectedUserId} placeholder="Select User..." className="h-8 w-full sm:w-[200px] text-xs shadow-xs" />
              <Input placeholder="Relation..." value={newNodeRelation} onChange={e => setNewNodeRelation(e.target.value)} className="h-8 text-xs bg-background w-full sm:w-[150px]" />
              <div className="flex items-center gap-2">
                <Button size="sm" className="h-8 shadow-xs text-[10px] font-bold uppercase tracking-tight" onClick={() => handleCreateNode(node.id)}>Save</Button>
                <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold uppercase tracking-tight" onClick={onCancelInline}>Cancel</Button>
              </div>
            </div>
          )}
          <Accordion 
            type="multiple" 
            value={openAccordionIds}
            onValueChange={setOpenAccordionIds}
            className="w-full"
          >
            {node.children.map((childId: string) => (
              <NestedHierarchyRow 
                key={childId} 
                node={nodes[childId]} 
                nodes={nodes} 
                userOptions={userOptions} 
                inlineAddingToId={inlineAddingToId} 
                openAccordionIds={openAccordionIds}
                setOpenAccordionIds={setOpenAccordionIds}
                onInlineAdd={onInlineAdd} 
                onCancelInline={onCancelInline} 
                handleCreateNode={handleCreateNode}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                newNodeRelation={newNodeRelation}
                setNewNodeRelation={setNewNodeRelation}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </Accordion>
        </AccordionContent>
      )}
    </AccordionItem>
  );
};
