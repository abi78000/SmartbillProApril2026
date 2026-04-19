export interface RegisterRequest {
  companyName: string;
  companyEmail: string;
  phone: string;
  userName: string;
  userEmail: string;
  passwordHash: string;
}

export interface RegisterResponse {
  success: boolean;
  companyID: number;
}

export interface CompanyDashboardDto {
  totalSalesAmount: number;
  customerOutstandingAmount: number;
  totalPurchaseAmount: number;
  supplierOutstandingAmount: number;
  totalPurchasedQuantity: number;
  totalSoldQuantity: number;
  currentStockQuantity: number;
  customerCount: number;
  supplierCount: number;
  productCount: number;
}

export interface CompanyDashboardResponseDto {
  dashboard: CompanyDashboardDto;
  activeBranchCount: number;
}

export interface Company {
  companyID: number;
  companyCode: string;
  companyName: string;

  phone: string;
  alternatePhone: string;
  email: string;
  website: string;

  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;

  city: string;
  state: string;
  country: string;
  pincode: string;

  gstNumber: string;
  panNumber: string;
  cinNumber: string;

  bankName: string;
  bankBranch?: string;
  bankAccountNumber: string;
  ifscCode: string;
  swiftCode?: string;

  companyLogo: number[] | null;
  companyImage: number[] | null;

  isActive: boolean;

  createdByUserID: number | null;
  createdSystemName: string;
  createdAt?: string | null;

  updatedByUserID?: number | null;
  updatedSystemName?: string | null;
  updatedAt?: string | null;

  businessType?: string;
  businessCategory?: string;
  businessSubCategory?: string;

  stateName?: string;
  countryName?: string;

  timeZone?: string;
  currency?: string;
  currencySymbol?: string;
  languageCompany?: string;
  dateFormat?: string;

  whatsAppNumber?: string;
  tagline?: string;

  financialYearStart?: string | null;
  financialYearEnd?: string | null;
  accountingYear?: string;
}

export interface Branch {
  branchID: number;
  companyID: number;
  branchCode: string;
  branchName: string;
  address: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}
export interface Department {
  departmentID: number;
  branchID: number;
  departmentCode: string;
  departmentName: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}
export interface Role {
  roleID: number;
  roleCode: string;
  roleName: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
}
