export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
    sessions: () => [...queryKeys.auth.all, "sessions"] as const,
    permissions: () => [...queryKeys.auth.all, "permissions"] as const,
  },
  parties: {
    all: ["parties"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.parties.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.parties.all, "detail", id] as const,
  },
  products: {
    all: ["products"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.products.all, "list", filters] as const,
    allItems: (filters?: Record<string, unknown>) =>
      [...queryKeys.products.all, "all-items", filters] as const,
    detail: (id: string) => [...queryKeys.products.all, "detail", id] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.orders.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.orders.all, "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.categories.all, "list", filters] as const,
    detail: (id: string) =>
      [...queryKeys.categories.all, "detail", id] as const,
  },
  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
    hierarchy: (id: string) =>
      [...queryKeys.users.detail(id), "hierarchy"] as const,
    systemHierarchy: (params?: Record<string, unknown>) =>
      [...queryKeys.users.all, "system-hierarchy", params] as const,
    sessions: (id: string, params?: Record<string, unknown>) =>
      [...queryKeys.users.detail(id), "sessions", params] as const,
  },
  companies: {
    all: ["companies"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.companies.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.companies.all, "detail", id] as const,
  },
  packages: {
    all: ["packages"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.packages.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.packages.all, "detail", id] as const,
  },
  bom: {
    all: ["bom"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.bom.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.bom.all, "detail", id] as const,
  },
  kits: {
    all: ["kits"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.kits.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.kits.all, "detail", id] as const,
  },
  brands: {
    all: ["brands"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.brands.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.brands.all, "detail", id] as const,
  },
  fragrances: {
    all: ["fragrances"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.fragrances.all, "list", filters] as const,
    detail: (id: string) =>
      [...queryKeys.fragrances.all, "detail", id] as const,
  },
  leadStatus: {
    all: ["leadStatus"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.leadStatus.all, "list", filters] as const,
    detail: (id: string) =>
      [...queryKeys.leadStatus.all, "detail", id] as const,
  },
  leadSource: {
    all: ["leadSource"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.leadSource.all, "list", filters] as const,
    detail: (id: string) =>
      [...queryKeys.leadSource.all, "detail", id] as const,
  },
  leads: {
    all: ["leads"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.leads.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.leads.all, "detail", id] as const,
    followUps: (leadId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.leads.detail(leadId), "follow-ups", filters] as const,
    tasks: (leadId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.leads.detail(leadId), "tasks", filters] as const,
    visits: (leadId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.leads.detail(leadId), "visits", filters] as const,
    reminders: (leadId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.leads.detail(leadId), "reminders", filters] as const,
    attachments: (leadId: string) =>
      [...queryKeys.leads.detail(leadId), "attachments"] as const,
  },
  locations: {
    all: ["locations"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.locations.all, "list", filters] as const,
  },
  allVisits: {
    all: ["allVisits"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.allVisits.all, "list", filters] as const,
  },
  allFollowUps: {
    all: ["allFollowUps"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.allFollowUps.all, "list", filters] as const,
  },
  allReminders: {
    all: ["allReminders"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.allReminders.all, "list", filters] as const,
  },
  allTasks: {
    all: ["allTasks"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.allTasks.all, "list", filters] as const,
  },
  hierarchy: {
    all: ["hierarchy"] as const,
    list: (filters?: string | Record<string, unknown>) =>
      [...queryKeys.hierarchy.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.hierarchy.all, "detail", id] as const,
  },
  quotations: {
    all: ["quotations"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.quotations.all, "list", filters] as const,
    detail: (id: string, params?: Record<string, unknown>) =>
      [...queryKeys.quotations.all, "detail", id, params] as const,
    download: (id: string) =>
      [...queryKeys.quotations.all, "download", id] as const,
  },
} as const;
