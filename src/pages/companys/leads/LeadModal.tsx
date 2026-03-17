import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PipelineColumn } from "../../types/leads";

interface LeadModalProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    addModalCol: string | null;
    columns: PipelineColumn[];
    newDeal: { title: string; company: string; value: string; contact: string };
    setNewDeal: (deal: { title: string; company: string; value: string; contact: string }) => void;
}

const LeadModal = ({ open, onClose, onSave, addModalCol, columns, newDeal, setNewDeal }: LeadModalProps) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Create Lead"
            description={addModalCol ? `Stage: ${columns.find((c) => c.id === addModalCol)?.title}` : ""}
            footer={
                <>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onClose}>Cancel</Button>
                    <Button size="sm" className="h-8 text-xs" onClick={onSave}>Save Lead</Button>
                </>
            }
        >
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Deal Title</Label>
                        <Input value={newDeal.title} onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })} className="h-8 text-sm" placeholder="e.g. Q4 Growth" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Company</Label>
                        <Input value={newDeal.company} onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Value</Label>
                        <Input value={newDeal.value} onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })} className="h-8 text-sm" placeholder="₹0.00" />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Contact Person</Label>
                        <Input value={newDeal.contact} onChange={(e) => setNewDeal({ ...newDeal, contact: e.target.value })} className="h-8 text-sm" />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default LeadModal;
