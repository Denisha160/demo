import { useState } from "react";
import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Shield, Check } from "lucide-react";
import { initialRoles } from "@/data/rolesData";

interface RoleSelectionModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (role: string) => void;
    currentRole: string;
}

const RoleSelectionModal = ({ open, onClose, onSelect, currentRole }: RoleSelectionModalProps) => {
    const [search, setSearch] = useState("");

    const filteredRoles = initialRoles.filter(role =>
        role.name.toLowerCase().includes(search.toLowerCase()) ||
        role.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Assign User Role"
            description="Search and select a role to update user permissions."
            headerBg="bg-primary/5"
        >
            <div className="space-y-4 py-2">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search roles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 pl-8 text-sm rounded-sm"
                        autoFocus
                    />
                </div>

                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredRoles.map((role) => {
                        const isSelected = role.name === currentRole;
                        return (
                            <button
                                key={role.id}
                                onClick={() => {
                                    onSelect(role.name);
                                    onClose();
                                }}
                                className={`w-full flex items-start text-left p-3 rounded-sm border transition-all duration-200 group ${isSelected
                                    ? "bg-primary/5 border-primary shadow-sm"
                                    : "bg-background border-border hover:border-primary/50 hover:bg-muted/30"
                                    }`}
                            >
                                <div className={`h-8 w-8 rounded-sm flex items-center justify-center shrink-0 border ${isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20"
                                    }`}>
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-bold leading-none ${isSelected ? "text-primary" : "text-foreground"}`}>
                                            {role.name}
                                        </p>
                                        {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-tight">
                                        {role.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                    {filteredRoles.length === 0 && (
                        <div className="py-8 text-center bg-muted/20 border border-dashed border-border rounded-sm">
                            <p className="text-xs text-muted-foreground italic">No roles found matching "{search}"</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs rounded-sm">
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default RoleSelectionModal;
