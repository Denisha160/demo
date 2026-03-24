export interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  status: string;
}

export const initialRoles: Role[] = [
  {
    id: 1,
    name: "Admin",
    description: "Full system access with all permissions",
    userCount: 3,
    status: "Active",
  },
  {
    id: 2,
    name: "Manager",
    description: "Can manage users and view all reports",
    userCount: 5,
    status: "Active",
  },
  {
    id: 3,
    name: "User",
    description: "Standard access to common features",
    userCount: 12,
    status: "Active",
  },
  {
    id: 4,
    name: "HR",
    description: "Can manage employee records and attendance",
    userCount: 2,
    status: "Active",
  },
  {
    id: 5,
    name: "Dealer",
    description: "External partners with performance tracking",
    userCount: 8,
    status: "Active",
  },
  {
    id: 6,
    name: "Supplier",
    description: "Fulfillment partners with supply metrics",
    userCount: 4,
    status: "Active",
  },
];
