import axios from "./httpRequest";

// Analytics
// ===================== Analytics =====================

export const getDashboardStats = (params) => {
  const url = `analytics/dashboard-stats`;
  return axios({ method: "GET", url, params });
};

// end region

// region Auth
// ===================== Auth =====================

export const accountLogin = (data) => {
  const url = `auth/login`;
  return axios({ method: "POST", url, data });
};

export const accountLogout = () => {
  const url = `auth/logout`;
  return axios({ method: "DELETE", url });
};

export const verifyLogin = (data) => {
  const url = `auth/verify-login`;
  return axios({ method: "POST", url, data });
};

export const getPermissions = () => {
  const url = `auth/permissions`;
  return axios({ method: "GET", url });
};

export const logoutSession = (sessionId, token = null) => {
  const url = `auth/sessions/${sessionId}`;
  const config = { method: "DELETE", url };
  if (token) {
    config.headers = { Authorization: token };
  }
  return axios(config);
};
// end region

// region Product Categories
// ===================== Product Categories =====================

export const listProductCategories = (params) => {
  const url = `categories`;
  return axios({ method: "GET", url, params });
};

export const getProductCategoryDetails = (id) => {
  const url = `categories/${id}`;
  return axios({ method: "GET", url });
};

export const createProductCategory = (data) => {
  const url = `categories`;
  return axios({ method: "POST", url, data });
};

export const updateProductCategory = ({ id, ...data }) => {
  const url = `categories/${id}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteProductCategory = (id) => {
  const url = `categories/${id}`;
  return axios({ method: "DELETE", url });
};

// end region

// region Users
// ===================== Users =====================

export const listUsers = (params) => {
  const url = `users`;
  return axios({ method: "GET", url, params });
};

export const getUserDetails = (id) => {
  const url = `users/${id}`;
  return axios({ method: "GET", url });
};

export const createUser = (data) => {
  const url = `users`;
  return axios({ method: "POST", url, data });
};

export const updateUser = ({ id, ...data }) => {
  const url = `users/${id}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteUser = (id) => {
  const url = `users/${id}`;
  return axios({ method: "DELETE", url });
};

export const removeUserPhoto = (id) => {
  const url = `users/${id}/image`;
  return axios({ method: "DELETE", url });
};

export const updateUserPermissions = (id, data) => {
  const url = `users/${id}/permissions`;
  return axios({ method: "PUT", url, data });
};

export const listUserSessions = (id, params) => {
  const url = `users/${id}/sessions`;
  return axios({ method: "GET", url, params });
};

export const getUserHierarchy = (id) => {
  const url = `users/${id}/hierarchy`;
  return axios({ method: "GET", url });
};

export const getSystemHierarchy = (params) => {
  const url = `users/hierarchy`;
  return axios({ method: "GET", url, params });
};

// end region

// region Companies
// ===================== Companies =====================

export const listCompanies = (params) => {
  const url = `companies`;
  return axios({ method: "GET", url, params });
};

export const getCompanyDetails = (id) => {
  const url = `companies/${id}`;
  return axios({ method: "GET", url });
};

export const updateCompany = ({ id, ...data }) => {
  const url = `companies/${id}`;
  return axios({ method: "PUT", url, data });
};

// end region

// region Roles
// ===================== Roles =====================

export const listRoles = (params) => {
  const url = `roles`;
  return axios({ method: "GET", url, params });
};

export const getRoleDetails = (id) => {
  const url = `roles/${id}`;
  return axios({ method: "GET", url });
};

export const createRole = (data) => {
  const url = `roles`;
  return axios({ method: "POST", url, data });
};

export const updateRole = ({ id, ...data }) => {
  const url = `roles/${id}`;
  return axios({ method: "PUT", url, data });
};

export const deleteRole = (id) => {
  const url = `roles/${id}`;
  return axios({ method: "DELETE", url });
};

export const getAvailablePermissions = () => {
  const url = `roles/permissions`;
  return axios({ method: "GET", url });
};

// end region

// region products
// ===================== Products =====================

export const listProducts = (params) => {
  const url = `products`;
  return axios({ method: "GET", url, params });
};

export const listAllProducts = (params) => {
  const url = `products/all-items`;
  return axios({ method: "GET", url, params });
};

export const getProductDetails = (id) => {
  const url = `products/${id}`;
  return axios({ method: "GET", url });
};

export const createProduct = (data) => {
  const url = `products`;
  return axios({ method: "POST", url, data });
};

export const updateProduct = (id, data) => {
  const url = `products/${id}`;
  return axios({ method: "PATCH", url, data });
};

export const uploadProductPhoto = (id, data) => {
  const url = `products/${id}/images`;
  return axios({ method: "POST", url, data });
};

export const deleteProductPhoto = (id, imageId) => {
  const url = `products/${id}/images/${imageId}`;
  return axios({ method: "DELETE", url });
};

export const listBrands = (params) => {
  const url = `products/brands`;
  return axios({ method: "GET", url, params });
};

export const createBrand = (data) => {
  const url = `products/brands`;
  return axios({ method: "POST", url, data });
};

export const updateBrand = (id, data) => {
  const url = `products/brands/${id}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteBrand = (id) => {
  const url = `products/brands/${id}`;
  return axios({ method: "DELETE", url });
};

export const listFragrance = (params) => {
  const url = `products/fragrances`;
  return axios({ method: "GET", url, params });
};

export const createFragrance = (data) => {
  const url = `products/fragrances`;
  return axios({ method: "POST", url, data });
};

export const updateFragrance = (id, data) => {
  const url = `products/fragrances/${id}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteFragrance = (id) => {
  const url = `products/fragrances/${id}`;
  return axios({ method: "DELETE", url });
};

// end region

// region packages
// ===================== Packages =====================

export const listPackages = (params) => {
  const url = `package`;
  return axios({ method: "GET", url, params });
};

export const getPackageDetails = (id) => {
  const url = `package/${id}`;
  return axios({ method: "GET", url });
};

export const createPackage = (data) => {
  const url = `package`;
  return axios({ method: "POST", url, data });
};

export const updatePackage = ({ id, ...data }) => {
  const url = `package/${id}`;
  return axios({ method: "PATCH", url, data });
};

export const deletePackage = (id) => {
  const url = `package/${id}`;
  return axios({ method: "DELETE", url });
};

// end region

// region Leads
// ===================== Leads =====================

export const listLeads = (params) => {
  const url = `leads`;
  return axios({ method: "GET", url, params });
};

export const listLeadTags = (params) => {
  const url = `leads/tags`;
  return axios({ method: "GET", url, params });
};

export const createLead = (data) => {
  const url = `leads`;
  return axios({ method: "POST", url, data });
};

export const getLeadDetails = (leadId) => {
  const url = `leads/${leadId}`;
  return axios({ method: "GET", url });
};

export const updateLead = ({ leadId, ...data }) => {
  const url = `leads/${leadId}`;
  return axios({ method: "PATCH", url, data });
};

export const updateLeadStatus = ({ leadId, ...data }) => {
  const url = `leads/${leadId}/status`;
  return axios({ method: "PATCH", url, data });
};

export const verifyLead = (leadId, data) => {
  const url = `leads/${leadId}/verification`;
  return axios({ method: "POST", url, data });
};

export const updateVerifyLead = (leadId, data) => {
  const url = `leads/${leadId}/verification`;
  return axios({ method: "PATCH", url, data });
};

export const convertLead = (leadId) => {
  const url = `leads/${leadId}/convert-to-customer`;
  return axios({ method: "POST", url });
};

export const bulkUpdateLeads = (data) => {
  const url = `leads/bulkupdate`;
  return axios({ method: "PATCH", url, data });
};

export const importLeads = (data) => {
  const url = `leads/import`;
  return axios({ method: "POST", url, data });
};

export const exportLeads = (params) => {
  const url = `leads/export`;
  return axios({ method: "GET", url, params, responseType: "blob" });
};

export const downloadDemoCSV = () => {
  const url = `leads/democsv`;
  return axios({ method: "GET", url, responseType: "blob" });
};

// end region

// region Lead Follow Ups
// ===================== Lead Follow Ups =====================

export const listLeadFollowUps = (leadId, params) => {
  const url = `leads/${leadId}/follow-ups`;
  return axios({ method: "GET", url, params });
};

export const createLeadFollowUp = (leadId, data) => {
  const url = `leads/${leadId}/follow-ups`;
  return axios({ method: "POST", url, data });
};

export const updateLeadFollowUp = ({ leadId, followupId, ...data }) => {
  const url = `leads/${leadId}/follow-ups/${followupId}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteLeadFollowUp = ({ leadId, followupId }) => {
  const url = `leads/${leadId}/follow-ups/${followupId}`;
  return axios({ method: "DELETE", url });
};

// end region

// region Lead Tasks
// ===================== Lead Tasks =====================

export const listLeadTasks = (leadId, params) => {
  const url = `leads/${leadId}/tasks`;
  return axios({ method: "GET", url, params });
};

export const createLeadTask = (leadId, data) => {
  const url = `leads/${leadId}/tasks`;
  return axios({ method: "POST", url, data });
};

export const updateLeadTask = ({ leadId, taskId, ...data }) => {
  const url = `leads/${leadId}/tasks/${taskId}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteLeadTask = ({ leadId, taskId }) => {
  const url = `leads/${leadId}/tasks/${taskId}`;
  return axios({ method: "DELETE", url });
};

// end region

// region Lead Visits
// ===================== Lead Visits =====================

export const listLeadVisits = (leadId, params) => {
  const url = `leads/${leadId}/visits`;
  return axios({ method: "GET", url, params });
};

export const createLeadVisit = (leadId, data) => {
  const url = `leads/${leadId}/visits`;
  return axios({ method: "POST", url, data });
};

export const updateLeadVisit = ({ leadId, visitId, data }) => {
  const url = `leads/${leadId}/visits/${visitId}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteLeadVisit = ({ leadId, visitId }) => {
  const url = `leads/${leadId}/visits/${visitId}`;
  return axios({ method: "DELETE", url });
};

// end region

// region Lead Interested Products
// ===================== Lead Interested Products =====================

export const listInterestedProducts = (leadId, params) => {
  const url = `leads/${leadId}/interested-products`;
  return axios({ method: "GET", url, params });
};

export const addInterestedProduct = (leadId, data) => {
  const url = `leads/${leadId}/interested-products`;
  return axios({ method: "POST", url, data });
};

export const removeInterestedProduct = ({ leadId, productId }) => {
  const url = `leads/${leadId}/interested-products/${productId}`;
  return axios({ method: "DELETE", url });
};

// end region

// region Lead Attachments
// ===================== Lead Attachments =====================

export const listLeadAttachments = (leadId, params) => {
  const url = `leads/${leadId}/attachments`;
  return axios({ method: "GET", url, params });
};

export const uploadLeadAttachment = (leadId, formData, onUploadProgress) => {
  const url = `leads/${leadId}/attachments`;
  return axios({
    method: "POST",
    url,
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
};

export const deleteLeadAttachment = (attachmentId) => {
  const url = `leads/attachments/${attachmentId}`;
  return axios({ method: "DELETE", url });
};

// end region

// region Lead Reminders
// ===================== Lead Reminders =====================

export const listLeadReminders = (leadId, params) => {
  const url = `leads/${leadId}/reminders`;
  return axios({ method: "GET", url, params });
};

export const createLeadReminder = (leadId, data) => {
  const url = `leads/${leadId}/reminders`;
  return axios({ method: "POST", url, data });
};

export const updateLeadReminder = ({ leadId, reminderId, ...data }) => {
  const url = `leads/${leadId}/reminders/${reminderId}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteLeadReminder = ({ leadId, reminderId }) => {
  const url = `leads/${leadId}/reminders/${reminderId}`;
  return axios({ method: "DELETE", url });
};

// end region

// region Lead Reminders
// ===================== Lead Activities =====================

export const listLeadActivities = (leadId, params) => {
  const url = `leads/${leadId}/activities`;
  return axios({ method: "GET", url, params });
};

// end region

// region Lead Contacts
// ===================== Lead Contacts =====================

export const listContacts = (leadId, params) => {
  const url = `leads/${leadId}/contacts`;
  return axios({ method: "GET", url, params });
};

export const createLeadContacts = (leadId, data) => {
  const url = `leads/${leadId}/contacts`;
  return axios({ method: "POST", url, data });
};

export const updateLeadContacts = ({ leadId, contactId, ...data }) => {
  const url = `leads/${leadId}/contacts/${contactId}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteLeadContacts = ({ leadId, contactId }) => {
  const url = `leads/${leadId}/contacts/${contactId}`;
  return axios({ method: "DELETE", url });
};

// end region

// region BOM
// ===================== BOM =====================

export const listBOM = (params) => {
  const url = `bom`;
  return axios({ method: "GET", url, params });
};

export const getBOMDetails = (bom_id) => {
  const url = `bom/${bom_id}`;
  return axios({ method: "GET", url });
};

export const createBOM = (data) => {
  const url = `bom`;
  return axios({ method: "POST", url, data });
};

export const updateBOM = ({ bom_id, ...data }) => {
  const url = `bom/${bom_id}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteBOM = (bom_id) => {
  const url = `bom/${bom_id}`;
  return axios({ method: "DELETE", url });
};

// end region

// region Kits
// ===================== Kits =====================

export const listKits = (params) => {
  const url = `kit`;
  return axios({ method: "GET", url, params });
};

export const getKitDetails = (id) => {
  const url = `kit/${id}`;
  return axios({ method: "GET", url });
};

export const createKit = (data) => {
  const url = `kit`;
  return axios({ method: "POST", url, data });
};

export const updateKit = ({ id, ...data }) => {
  const url = `kit/${id}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteKit = (id) => {
  const url = `kit/${id}`;
  return axios({ method: "DELETE", url });
};

export const associateProductToKit = (data) => {
  const url = `kit/associate`;
  return axios({ method: "POST", url, data });
};

export const disassociateProductFromKit = (data) => {
  const url = `kit/disassociate`;
  return axios({ method: "DELETE", url, data });
};

export const listKitsByProduct = (productId) => {
  const url = `kit/product/${productId}`;
  return axios({ method: "GET", url });
};

export const uploadKitPhoto = (id, formData) => {
  const url = `kit/${id}/image`;
  return axios({
    method: "POST",
    url,
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteKitPhoto = (id) => {
  const url = `kit/${id}/image`;
  return axios({ method: "DELETE", url });
};

// end region

// region Batches
// ===================== Batches =====================

export const listBatch = (params) => {
  const url = `inventory/batches`;
  return axios({ method: "GET", url, params });
};

export const createBatch = (data) => {
  const url = `inventory/batches`;
  return axios({ method: "POST", url, data });
};

export const getBatch = (id) => {
  const url = `inventory/batches/${id}`;
  return axios({ method: "GET", url });
};

export const updateBatch = ({ id, ...data }) => {
  const url = `inventory/batches/${id}`;
  return axios({ method: "PATCH", url, data });
};

// region Serials
// ===================== Serials =====================

export const listSerials = (params) => {
  const url = `inventory/serials`;
  return axios({ method: "GET", url, params });
};

export const generateSerials = (data) => {
  const url = `inventory/serials/generate`;
  return axios({ method: "POST", url, data });
};

export const bulkSyncSerials = (data) => {
  const url = `inventory/serials/bulk-sync`;
  return axios({ method: "POST", url, data });
};
// end region

// region Inventory
// ===================== Inventory =====================

export const listInventories = (params) => {
  const url = `inventory`;
  return axios({ method: "GET", url, params });
};

export const listTransactions = (params) => {
  const url = `inventory/transactions`;
  return axios({ method: "GET", url, params });
};

// end region

// region Lead Status
// ===================== Lead Status =====================

export const listStatus = (params) => {
  const url = `leads/lead-status`;
  return axios({ method: "GET", url, params });
};

export const createStatus = (data) => {
  const url = `leads/lead-status`;
  return axios({ method: "POST", url, data });
};

export const updateStatus = ({ id, ...data }) => {
  const url = `leads/lead-status/${id}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteStatus = (id) => {
  const url = `leads/lead-status/${id}`;
  return axios({ method: "DELETE", url });
};

export const updateLeadStatusOrder = (data) => {
  return axios({ method: "PATCH", url: "leads/lead-status/order", data });
};
// end region

// region Lead source
// ===================== Lead Source =====================
export const listSource = (params) => {
  const url = `leads/lead-source`;
  return axios({ method: "GET", url, params });
};

export const createSource = (data) => {
  const url = `leads/lead-source`;
  return axios({ method: "POST", url, data });
};

export const updateSource = ({ id, ...data }) => {
  const url = `leads/lead-source/${id}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteSource = (id) => {
  const url = `leads/lead-source/${id}`;
  return axios({ method: "DELETE", url });
};
// end region

// region General Visits, Followps, Reminders and Tasks
export const listAllVisits = (params) => {
  return axios({ method: "GET", url: `visits`, params });
};

export const listAllFollowUps = (params) => {
  return axios({ method: "GET", url: `followups`, params });
};

export const listAllReminders = (params) => {
  return axios({ method: "GET", url: `reminders`, params });
};

export const listAllTasks = (params) => {
  return axios({ method: "GET", url: `tasks`, params });
};
// end region

// region City State Country
// ===================== City State Country =====================
export const listCityStateCountry = (params) => {
  const url = `city-state-country`;
  return axios({ method: "GET", url, params });
};

export const listCity = (params) => {
  const url = `city-state-country/city`;
  return axios({ method: "GET", url, params });
};
// end region
// region Hierarchy
// ===================== Hierarchy =====================
export const listHierarchy = (params) => {
  const url = typeof params === "string" ? `hierarchy/${params}` : `hierarchy`;
  return axios({
    method: "GET",
    url,
    params: typeof params === "object" ? params : undefined,
  });
};

export const getAllHierarchy = (params) => {
  const url = `hierarchy/all`;
  return axios({ method: "GET", url, params });
};

export const createHierarchy = (data) => {
  const url = `hierarchy`;
  return axios({ method: "POST", url, data });
};

export const updateHierarchy = ({ id, ...data }) => {
  const url = `hierarchy/${id}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteHierarchy = (id) => {
  const url = `hierarchy/${id}`;
  return axios({ method: "DELETE", url });
};
// end region
// region Shifts
// ===================== Shifts =====================

export const listShifts = (params) => {
  const url = `shifts`;
  return axios({ method: "GET", url, params });
};

export const getShiftDetails = (id, params) => {
  const url = `shifts/${id}`;
  return axios({ method: "GET", url, params });
};

export const createShift = (data) => {
  const url = `shifts`;
  return axios({ method: "POST", url, data });
};

export const updateShift = ({ id, ...data }) => {
  const url = `shifts/${id}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteShift = (id) => {
  const url = `shifts/${id}`;
  return axios({ method: "DELETE", url });
};

export const listQuotation = (params) => {
  const url = `quotation`;
  return axios({ method: "GET", url, params });
};

export const getQuotationDetails = (id, params) => {
  const url = `quotation/${id}`;
  return axios({ method: "GET", url, params });
};

export const createQuotation = (data) => {
  const url = `quotation`;
  return axios({ method: "POST", url, data });
};

export const updateQuotation = ({ id, ...data }) => {
  const url = `quotation/${id}`;
  return axios({ method: "PATCH", url, data });
};

export const deleteQuotation = (id) => {
  const url = `quotation/${id}`;
  return axios({ method: "DELETE", url });
};

export const downloadQuotation = (id, params) => {
  const url = `quotation/${id}/download`;
  return axios({ method: "GET", url, params, responseType: "blob" });
};

// end region

// region Files
// ===================== Files =====================

export const uploadFile = (formData) => {
  const url = `files/uploads`;
  const folder = formData.get("folder");
  const params = folder ? { folder } : {};
  return axios({
    method: "POST",
    url,
    data: formData,
    params,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// end region
