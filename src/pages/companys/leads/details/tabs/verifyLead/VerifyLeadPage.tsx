import {
    ShieldCheck, Home, Users, History, Truck,
    FileText, Layout, Package, MapPin, Activity,
    DollarSign, Calendar, Landmark, Warehouse,
    Car, Store, Edit
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import VerifyLeadModal from "./VerifyLeadModal";

interface VerifyLeadPageProps {
    details: any;
    leadId: string;
}

const InfoCard = ({ icon: Icon, label, value, colorClass = "text-muted-foreground" }: { icon: any, label: string, value: any, colorClass?: string }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
        <div className={`p-2 rounded-md bg-background border border-border/50 ${colorClass}`}>
            <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            <span className="text-sm font-semibold text-foreground">{value || "-"}</span>
        </div>
    </div>
);

const VerifyLeadPage = ({ details, leadId }: VerifyLeadPageProps) => {
    const [editModalOpen, setEditModalOpen] = useState(false);

    if (!details) return <div className="p-8 text-center text-muted-foreground">No verification details available.</div>;

    return (
        <div className="space-y-2 animate-fade-in pb-10 w-full rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
            <div className="flex justify-start">
                <Button size="sm" onClick={() => setEditModalOpen(true)} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" /> Edit Details
                </Button>
            </div>

            {/* Top Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <InfoCard icon={ShieldCheck} label="Verification Status" value="Verified" colorClass="text-green-500" />
                <InfoCard icon={Layout} label="Property Type" value={details.property_type?.replace(/_/g, " ")} colorClass="text-blue-500" />
                <InfoCard icon={Store} label="Customer Type" value={details.customer_type} colorClass="text-purple-500" />
                <InfoCard icon={Calendar} label="Verified At" value={details.verified_at ? format(new Date(details.verified_at), "dd MMM yyyy, hh:mm a") : "-"} colorClass="text-orange-500" />
            </div>

            {/* General Information */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Activity className="h-3 w-3" /> General Business Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <InfoCard icon={Home} label="Property Name" value={details.property_name} />
                    <InfoCard icon={Package} label="Number of Properties" value={details.number_of_properties} />
                    <InfoCard icon={Users} label="Total Staff" value={details.total_staff} />
                    <InfoCard icon={History} label="Years of Experience" value={`${details.years_of_experience} Years`} />
                    <InfoCard icon={DollarSign} label="Annual Turnover" value={details.annual_turnover ? `₹${details.annual_turnover.toLocaleString()}` : "-"} />
                    <InfoCard icon={MapPin} label="Cities of Operation" value={details.cities_of_operation?.join(", ")} />
                </div>
            </div>

            {/* Infrastructure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Warehouse */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Warehouse className="h-3 w-3" /> Warehouse Details
                    </h3>
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Has Warehouse?</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${details.has_warehouse ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                {details.has_warehouse ? "Yes" : "No"}
                            </span>
                        </div>
                        {details.has_warehouse && (
                            <>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-muted-foreground uppercase">Location</span>
                                        <span className="text-sm font-medium">{details.warehouse_location || "-"}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-muted-foreground uppercase">Size (sqft)</span>
                                        <span className="text-sm font-medium">{details.warehouse_size || "-"}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Showroom */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Landmark className="h-3 w-3" /> Showroom Details
                    </h3>
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Has Showroom?</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${details.has_showroom ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                {details.has_showroom ? "Yes" : "No"}
                            </span>
                        </div>
                        {details.has_showroom && (
                            <>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-muted-foreground uppercase">Location</span>
                                        <span className="text-sm font-medium">{details.showroom_location || "-"}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-muted-foreground uppercase">Size (sqft)</span>
                                        <span className="text-sm font-medium">{details.showroom_size || "-"}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Delivery Vehicles */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Car className="h-3 w-3" /> Delivery Vehicles
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${details.has_delivery_vehicles ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                        {details.has_delivery_vehicles ? `Yes (${details.number_of_vehicles || 0})` : "No"}
                    </span>
                </div>
                {details.has_delivery_vehicles && details.vehicle_details?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {details.vehicle_details.map((v: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-lg border border-border/50 bg-card/50 flex flex-col gap-2">
                                <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-1">
                                    <span className="text-xs font-bold text-primary">{v.type}</span>
                                    <Truck className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-muted-foreground">Model:</span>
                                        <span className="font-medium">{v.model}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-muted-foreground">Reg No:</span>
                                        <span className="font-medium">{v.registration}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-muted-foreground">Capacity:</span>
                                        <span className="font-medium">{v.capacity}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Verification Notes
                </h3>
                <div className="p-4 rounded-xl border border-border/50 bg-secondary/10">
                    <p className="text-sm text-foreground/90 leading-relaxed italic">
                        {details.verification_notes || "No notes provided."}
                    </p>
                </div>
            </div>

            <VerifyLeadModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                leadId={leadId}
                initialData={details}
            />
        </div>
    );
};

export default VerifyLeadPage;