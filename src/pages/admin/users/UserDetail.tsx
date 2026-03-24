import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUser } from "@/hooks/useUsers";

import OverviewTab, { OverviewTabRef } from "./components/OverviewTab";
import LeadsTab from "./components/LeadsTab";
import AnalyticsTab from "./components/AnalyticsTab";
import PermissionsTab from "./components/PermissionsTab";
import { SelectOption } from "./components/EditableDetailItem";
import { UserDetailData } from "@/types/user";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState("overview");
  const [isSavingOverview, setIsSavingOverview] = useState(false);
  const overviewRef = useRef<OverviewTabRef>(null);

  // Form State initialization
  const [userData, setUserData] = useState<UserDetailData>({
    id: id || "",
    name: "",
    phone_number: "",
    email: "",
    personal_email: "",
    employee_code: "",
    date_of_joining: "",
    department: "",
    region: "",
    work_shift: "morning",
    is_root_user: false,
    is_active: true,
    gender: "male",
    date_of_birth: "",
    marital_status: "single",
    anniversary_date: "",
    basic_salary: 0,
    opening_balance: 0,
    pan_number: "",
    gst_number: "",
    address: "",
    image_url: "",
    role: "User",

    // Mock Performance Metrics
    revenue: "₹1,42,500",
    target: "₹2,00,000",
    attainment: "71%",
    totalLeads: 124,
    conversionRate: "18.5%",
    avgProductionTime: "42 Hours",
    fulfillmentRate: "98.2%",
    sessions: [
      {
        id: 1,
        device: "Chrome / MacOS",
        ip: "192.168.1.1",
        lastActive: "Just now",
        current: true,
      },
      {
        id: 2,
        device: "Safari / iPhone 15",
        ip: "172.20.10.4",
        lastActive: "2 hours ago",
        current: false,
      },
    ],
  });

  const { data: fetchedUser, isLoading } = useUser(id as string);

  useEffect(() => {
    if (fetchedUser && fetchedUser.id) {
      const apiUser = fetchedUser;
      setUserData((prev: UserDetailData) => {
        const newData: UserDetailData = {
          ...prev,
          id: apiUser.id,
          name: apiUser.name || "",
          phone_number: apiUser.phone_number || "",
          email: apiUser.email || "",
          personal_email: apiUser.personal_email || "",
          employee_code: apiUser.employee_code || "",
          date_of_joining: apiUser.date_of_joining
            ? apiUser.date_of_joining.split("T")[0]
            : "",
          department: apiUser.department || "",
          region: apiUser.region || "",
          work_shift: apiUser.work_shift || "morning",
          is_root_user: apiUser.is_root_user || false,
          is_active: apiUser.is_active ?? true,
          gender: apiUser.gender || "male",
          date_of_birth: apiUser.date_of_birth
            ? apiUser.date_of_birth.split("T")[0]
            : "",
          marital_status: apiUser.marital_status || "single",
          anniversary_date: apiUser.anniversary_date
            ? apiUser.anniversary_date.split("T")[0]
            : "",
          basic_salary: Number(apiUser.basic_salary) || 0,
          opening_balance: Number(apiUser.opening_balance) || 0,
          pan_number: apiUser.pan_number || "",
          gst_number: apiUser.gst_number || "",
          address: apiUser.address || "",
          role: apiUser.role || "User",
        };

        // Prevent infinite render loop by only updating state if data changed
        if (JSON.stringify(prev) !== JSON.stringify(newData)) {
          return newData;
        }
        return prev;
      });

      if (apiUser.allocations && Array.isArray(apiUser.allocations)) {
        const newCompanyRoles: Record<string, string> = {};
        apiUser.allocations.forEach(
          (alloc: { company_name: string; role_name: string }) => {
            newCompanyRoles[alloc.company_name] = alloc.role_name;
          },
        );

        setInitialCompanyRoles((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(newCompanyRoles)) {
            return newCompanyRoles;
          }
          return prev;
        });

        setCompanyRoles((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(newCompanyRoles)) {
            return newCompanyRoles;
          }
          return prev;
        });
      }
    }
  }, [fetchedUser]);

  const [initialCompanyRoles, setInitialCompanyRoles] = useState<
    Record<string, string>
  >({});
  const [companyRoles, setCompanyRoles] = useState<Record<string, string>>({});

  const genderOptions: SelectOption[] = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];
  const maritalStatusOptions: SelectOption[] = [
    { label: "Single", value: "single" },
    { label: "Married", value: "married" },
  ];
  const workShiftOptions: SelectOption[] = [
    { label: "Morning", value: "morning" },
    { label: "Evening", value: "evening" },
    { label: "Night", value: "night" },
    { label: "Rotating", value: "rotating" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 pt-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading user details...</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-2 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm border border-border shrink-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground leading-none truncate uppercase tracking-widest text-primary">
              User Profile Analytics
            </h2>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-4 overflow-y-hidden"
      >
        <div className="flex items-center justify-between border-b border-border pr-2">
          <TabsList className="bg-transparent rounded-none h-11 justify-start gap-2 p-0 overflow-x-auto border-none">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all shrink-0"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all shrink-0"
            >
              Leads
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all shrink-0"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all shrink-0"
            >
              Permissions
            </TabsTrigger>
          </TabsList>

          {activeTab === "overview" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px] font-semibold tracking-widest uppercase rounded-sm px-4"
                onClick={() => {
                  if (fetchedUser) {
                    setUserData((prev) => ({
                      ...prev,
                      id: fetchedUser.id,
                      name: fetchedUser.name || "",
                      phone_number: fetchedUser.phone_number || "",
                      email: fetchedUser.email || "",
                      personal_email: fetchedUser.personal_email || "",
                      employee_code: fetchedUser.employee_code || "",
                      date_of_joining: fetchedUser.date_of_joining
                        ? fetchedUser.date_of_joining.split("T")[0]
                        : "",
                      department: fetchedUser.department || "",
                      region: fetchedUser.region || "",
                      work_shift: fetchedUser.work_shift || "morning",
                      is_root_user: fetchedUser.is_root_user || false,
                      is_active: fetchedUser.is_active ?? true,
                      gender: fetchedUser.gender || "male",
                      date_of_birth: fetchedUser.date_of_birth
                        ? fetchedUser.date_of_birth.split("T")[0]
                        : "",
                      marital_status: fetchedUser.marital_status || "single",
                      anniversary_date: fetchedUser.anniversary_date
                        ? fetchedUser.anniversary_date.split("T")[0]
                        : "",
                      basic_salary: Number(fetchedUser.basic_salary) || 0,
                      opening_balance: Number(fetchedUser.opening_balance) || 0,
                      pan_number: fetchedUser.pan_number || "",
                      gst_number: fetchedUser.gst_number || "",
                      address: fetchedUser.address || "",
                      role: fetchedUser.role || "User",
                    }));
                  }
                  overviewRef.current?.reset();
                }}
                disabled={isSavingOverview}
              >
                Reset
              </Button>
              <Button
                size="sm"
                className="h-8 text-[10px] font-semibold tracking-widest uppercase rounded-sm px-6"
                onClick={() => overviewRef.current?.save()}
                disabled={isSavingOverview}
              >
                {isSavingOverview && (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <TabsContent
          value="overview"
          className="space-y-2 animate-in fade-in-50 duration-300"
        >
          <OverviewTab
            ref={overviewRef}
            onSavingChange={setIsSavingOverview}
            userData={userData}
            setUserData={setUserData}
            genderOptions={genderOptions}
            maritalStatusOptions={maritalStatusOptions}
            workShiftOptions={workShiftOptions}
          />
        </TabsContent>

        <TabsContent
          value="leads"
          className="space-y-4 animate-in fade-in-50 duration-300"
        >
          <LeadsTab userData={userData} />
        </TabsContent>

        <TabsContent
          value="analytics"
          className="space-y-2 animate-in fade-in-50 duration-300"
        >
          <AnalyticsTab />
        </TabsContent>

        <TabsContent
          value="permissions"
          className="space-y-2 animate-in fade-in-50 duration-300"
        >
          <PermissionsTab
            userData={userData}
            setUserData={setUserData}
            initialCompanyRoles={initialCompanyRoles}
            companyRoles={companyRoles}
            setCompanyRoles={setCompanyRoles}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetailPage;
