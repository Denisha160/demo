import axios from "./httpRequest";

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

export const updateUserPermissions = (id, data) => {
  const url = `users/${id}/permissions`;
  return axios({ method: "PUT", url, data });
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
  return axios({ method: "GET", url, params })
}

export const getProductDetails = (id) => {
  const url = `products/${id}`;
  return axios({ method: 'GET', url });
}

export const createProduct = (data) => {
  const url = `products`;
  return axios({ method: 'POST', url, data });
}

export const updateProduct = (id, data) => {
  const url = `products/${id}`;
  return axios({ method: 'PATCH', url, data });
}

export const uploadProductPhoto = (id, formData) => {
  const url = `products/${id}/images`;
  return axios({ method: "POST", url, data: formData, headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteProductPhoto = (id, imageId) => {
  const url = `products/${id}/images/${imageId}`;
  return axios({ method: "DELETE", url });
};


// end region

// region packages
// ===================== Packages =====================

export const listPackages = (params) => {
  const url = `package`;
  return axios({ method: "GET", url, params })
}

export const getPackageDetails = (id) => {
  const url = `package/${id}`;
  return axios({ method: 'GET', url });
}

export const createPackage = (data) => {
  const url = `package`;
  return axios({ method: 'POST', url, data });
}

export const updatePackage = ({ id, ...data }) => {
  const url = `package/${id}`;
  return axios({ method: 'PATCH', url, data });
}

export const deletePackage = (id) => {
  const url = `package/${id}`;
  return axios({ method: "DELETE", url });
}

// end region

// region BOM
// ===================== BOM =====================

export const listBOM = (params) => {
  const url = `bom`;
  return axios({ method: "GET", url, params })
}

export const getBOMDetails = (id) => {
  const url = `bom/${id}`;
  return axios({ method: 'GET', url });
}

export const createBOM = (data) => {
  const url = `bom`;
  return axios({ method: 'POST', url, data });
}

export const updateBOM = ({ id, ...data }) => {
  const url = `bom/${id}`;
  return axios({ method: 'PATCH', url, data });
}

export const deleteBOM = (id) => {
  const url = `bom/${id}`;
  return axios({ method: "DELETE", url });
}

// end region
