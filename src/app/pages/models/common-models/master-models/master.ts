export interface Brand {
  brandID: number;
  brandName: string;
  description: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string; // ISO date string
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}

export interface PriceListMaster {
  priceListID: number;
  companyID: number;
  branchID?: number | null;

  priceListName: string;
  isActive: boolean;

  createdByUserID: number;
  createdSystemName: string;
  createdAt: Date;

  updatedByUserID?: number | null;
  updatedSystemName?: string | null;
  updatedAt?: Date | null;
}

export interface PaymentMode {
  paymentModeID: number;
  paymentModeName: string;
  paymentType: string | null;
  description: string | null;
  isActive: boolean;

  createdByUserID: number;
  createdSystemName: string | null;
  createdAt: Date;

  updatedByUserID?: number | null;
  updatedSystemName?: string | null;
  updatedAt?: Date | null;
}

export interface Category {
  categoryID: number;
  categoryName: string;
  description: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}
export interface Status {
  statusID: number;
  statusCode: string;
  statusName: string;
  description?: string;
}

export interface Customer {
  customerID: number;
  customerCode: string;
  customerName: string;
  phone: string;
  alternatePhone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}
export interface Product {
  sno?: number;
  productID: number;
  productName: string;
  productCode: string;
  categoryID: number;
  subCategoryID: number;
  brandID: number;
  unitID: number;
  hsnid: number;
  taxID: number;
  cessID: number;
  purchaseRate: number;
  retailPrice: number;
  wholesalePrice: number;
  saleRate: number;
  mrp: number;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
  discountAmount: number;
  discountPercentage: number;
  openingStock: number;
  reorderLevel: number;
  currentStock: number;
  barcode: string;
  isService: boolean;
  productDescription: string;
  productImage: string;
  companyID: number;
  branchID: number;

  color?: string;
  size?: string;
  weight?: number;
  volume?: number;
  material?: string;
  finishType?: string;
  shadeCode?: string;
  capacity?: string;
  modelNumber?: string;
  expiryDate?: string;
  secondaryUnitID?: number;
  taxType?: string;
  isGSTInclusive?: boolean;
  taxableValue?: number;

  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
  cessRate?: number;
  cessAmount?: number;

  [key: string]: any;
}

export interface Supplier {
  supplierID: number;
  supplierCode: string;
  supplierName: string;
  phone: string;
  alternatePhone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  gstNumber: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}

export interface Tax {
  taxID: number;
  taxName: string;
  taxRate: number;
  cessRate: number;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}

export interface Unit {
  unitID: number;
  unitName: string;
  unitCode: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}

export interface HSN {
  hsnid: number;
  hsnCode: string;
  description: string;
  taxID: number;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}

export interface Service {
  serviceID: number;
  serviceName: string;
  serviceCode: string;
  categoryID: number;
  hsnid: number;
  taxID: number;
  cessID: number;
  serviceCharge: number;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}

export interface SubCategory {
  subCategoryID: number;
  categoryID: number;
  subCategoryName: string;
  description: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}

export interface Cess {
  cessID: number;
  cessName: string;
  cessRate: number;
  description?: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string; // or Date if you want to parse it
  updatedByUserID?: number | null;
  updatedSystemName?: string | null;
  updatedAt?: string | null; // or Date
}



export interface PriceListProduct extends Product {
  price: number;
}