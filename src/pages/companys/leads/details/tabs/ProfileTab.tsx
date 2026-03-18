import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ProfileTab = () => {
    return (
        <div className="bg-card rounded-lg border border-border/50 shadow-sm p-6 w-full animate-fade-in">
            <h3 className="text-lg font-bold mb-4">Lead Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Company Name</Label>
                    <Input defaultValue="Jerde Inc" readOnly className="bg-muted/30" />
                </div>
                <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input defaultValue="info@jerde.com" readOnly className="bg-muted/30" />
                </div>
                <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input defaultValue="+1 234 567 890" readOnly className="bg-muted/30" />
                </div>
                <div className="space-y-1.5">
                    <Label>Website</Label>
                    <Input defaultValue="https://jerde.com" readOnly className="bg-muted/30" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <Label>Address</Label>
                    <Input defaultValue="123 Business Avenue, Suite 100, Tech City" readOnly className="bg-muted/30" />
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <Button>Edit Profile</Button>
            </div>
        </div>
    );
};

export default ProfileTab;
