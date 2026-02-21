const Settings = () => {
  return (
    <div className="animate-fade-in max-w-lg">
      <div className="shadow-card border border-border bg-card rounded-sm p-3 space-y-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your account settings</p>
        </div>
        <div className="space-y-2">
          {[
            { label: "Name", value: "John Doe" },
            { label: "Email", value: "john@company.com" },
            { label: "Role", value: "Admin" },
            { label: "Timezone", value: "UTC-5 (EST)" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="text-sm text-foreground font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
