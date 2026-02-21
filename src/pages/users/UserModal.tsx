import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface User {
    id?: number;
    name: string;
    email: string;
    role: string;
    status: string;
    department?: string;
    companyName?: string;
    gstNumber?: string;
    phone?: string;
    region?: string;
    // Expanded Fields
    gender?: string;
    dateOfJoining?: string;
    basicSalary?: string;
    dateOfBirth?: string;
    fatherName?: string;
    panNumber?: string;
    personalEmail?: string;
    residenceAddress?: string;
}

interface UserModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user?: User | null;
}

const companies = [
    { id: "basalt-amenities", name: "Basalt Amenities" },
    { id: "smart-home", name: "Smart Home Automation" }
];

const UserModal = ({ open, onClose, onSave, user }: UserModalProps) => {
    const [activeTab, setActiveTab] = useState("professional");
    const [formData, setFormData] = useState<User>({
        name: "",
        email: "",
        role: "User",
        status: "Active",
        department: "",
        companyName: "",
        gstNumber: "",
        phone: "",
        region: "",
        gender: "",
        dateOfJoining: "",
        basicSalary: "",
        dateOfBirth: "",
        fatherName: "",
        panNumber: "",
        personalEmail: "",
        residenceAddress: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                ...user,
                department: user.department || "",
                companyName: user.companyName || "",
                gstNumber: user.gstNumber || "",
                phone: user.phone || "",
                region: user.region || "",
                gender: user.gender || "",
                dateOfJoining: user.dateOfJoining || "",
                basicSalary: user.basicSalary || "",
                dateOfBirth: user.dateOfBirth || "",
                fatherName: user.fatherName || "",
                panNumber: user.panNumber || "",
                personalEmail: user.personalEmail || "",
                residenceAddress: user.residenceAddress || "",
            });
        } else {
            setFormData({
                name: "",
                email: "",
                role: "User",
                status: "Active",
                department: "",
                companyName: "",
                gstNumber: "",
                phone: "",
                region: "",
                gender: "",
                dateOfJoining: "",
                basicSalary: "",
                dateOfBirth: "",
                fatherName: "",
                panNumber: "",
                personalEmail: "",
                residenceAddress: "",
            });
        }
        setActiveTab("professional");
    }, [user, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            headerBg="bg-primary/10"
            titleClassName="text-primary"
            maxWidth="sm:max-w-[800px]"
            title={user ? "Maintain Profile Information" : "Add New User"}
            description={user ? "Update basic and personal details for the user" : "Fill in the required information below"}
            footer={
                <>
                    <Button variant="outline" size="sm" className="rounded-sm text-sm h-8" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button size="sm" className="rounded-sm text-sm h-8" onClick={handleSubmit}>
                        {user ? "Save Changes" : "Save User"}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-9 bg-muted/50 border border-border rounded-sm p-1">
                        <TabsTrigger value="professional" className="text-xs font-bold uppercase tracking-wider">Professional</TabsTrigger>
                        <TabsTrigger value="personal" className="text-xs font-bold uppercase tracking-wider">Personal</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit}>
                        <TabsContent value="professional" className="space-y-4 mt-4 animate-in fade-in-50">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="name" className="text-sm">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-8 text-sm rounded-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="email" className="text-sm">Business Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@basalt.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="h-8 text-sm rounded-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="gender" className="text-sm">Gender</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                                    >
                                        <SelectTrigger className="h-8 text-sm rounded-sm">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="doj" className="text-sm">Date of Joining</Label>
                                    <Input
                                        id="doj"
                                        type="date"
                                        value={formData.dateOfJoining}
                                        onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                                        className="h-8 text-sm rounded-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="company" className="text-sm">Associated Company</Label>
                                    <Select
                                        value={formData.companyName}
                                        onValueChange={(value) => setFormData({ ...formData, companyName: value })}
                                    >
                                        <SelectTrigger className="h-8 text-sm rounded-sm">
                                            <SelectValue placeholder="Select Company" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies.map(c => (
                                                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="salary" className="text-sm">Basic Salary Info</Label>
                                    <Input
                                        id="salary"
                                        placeholder="₹ 0.00"
                                        value={formData.basicSalary}
                                        onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                                        className="h-8 text-sm rounded-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="gst" className="text-sm">GST Number</Label>
                                    <Input
                                        id="gst"
                                        placeholder="27AAAAA0000A1Z5"
                                        value={formData.gstNumber}
                                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                        className="h-8 text-sm rounded-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="region" className="text-sm">Region / Zone</Label>
                                    <Input
                                        id="region"
                                        placeholder="North / South / East / West"
                                        value={formData.region}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                        className="h-8 text-sm rounded-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="phone" className="text-sm">Business Phone</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+91"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="h-8 text-sm rounded-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="status" className="text-sm">Account Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger className="h-8 text-sm rounded-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                            <SelectItem value="Suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="personal" className="space-y-4 mt-4 animate-in fade-in-50">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="dob" className="text-sm">Date of Birth</Label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="h-8 text-sm rounded-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="pan" className="text-sm">PAN Number</Label>
                                    <Input
                                        id="pan"
                                        placeholder="ABCDE1234F"
                                        value={formData.panNumber}
                                        onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                                        className="h-8 text-sm rounded-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="fatherName" className="text-sm">Father's Name</Label>
                                <Input
                                    id="fatherName"
                                    placeholder="Full Name"
                                    value={formData.fatherName}
                                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                    className="h-8 text-sm rounded-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="personalEmail" className="text-sm">Personal Email</Label>
                                <Input
                                    id="personalEmail"
                                    type="email"
                                    placeholder="personal@gmail.com"
                                    value={formData.personalEmail}
                                    onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                                    className="h-8 text-sm rounded-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="address" className="text-sm">Residence Address</Label>
                                <textarea
                                    id="address"
                                    placeholder="Enter full address here..."
                                    value={formData.residenceAddress}
                                    onChange={(e) => setFormData({ ...formData, residenceAddress: e.target.value })}
                                    className="w-full min-h-[80px] px-3 py-2 text-sm border border-input bg-background rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                        </TabsContent>
                    </form>
                </Tabs>
            </div>
        </Modal>
    );
};

export default UserModal;
