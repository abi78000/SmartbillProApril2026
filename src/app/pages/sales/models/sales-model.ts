export interface BusinessType {
  businessTypeID: number;
  companyID: number | null;
  businessTypeName: string;
  description: string;
  isActive: boolean;
  createdBy: string | null;
  createdDate: string;
  updatedBy: string | null;
  updatedDate: string | null;
  createdSystemName: string;
}
export interface GstTransactionType {
  gstTransactionTypeID: number;
  transactionTypeName: string;
  description: string;
  isActive: boolean;
  createdBy: string | null;
  createdDate: string;
  updatedBy: string | null;
  updatedDate: string | null;
  createdSystemName: string;
}

export interface ProductStockPrice {
  categoryID: number;
  sno: number;
  productID: number;
  productCode: string;
  productName: string;
  retailPrice: number;
  wholesalePrice: number;
  gstPercentage: number;
  currentStock: number;

  purchaseRate: number;
  quantity: number;
  saleRate: number;
  mrp: number;

  supplierName: string | null;
  poNumber: string | null;
  purchaseDate: string | null; // ISO string from API
}
export interface SalesInvoice {
  sno?: number;
  invoiceID: number;
  invoiceNumber: string;
  invoiceDate: string;

  companyID: number | null;

  companyName: string;
  branchID: number | null;
  branchName: string;

  customerID: number;
  customerName: string;
  customerContact?: string;
  customerGSTIN: string;
  customerState: string;
  companyState: string;

  accountingYear: string;
  billingType: string;
  isGSTApplicable: boolean;
  gstType: string;

  productID: number;
  barcode: string;
  productCode: string;
  productName: string;

  brandID: number;
  categoryID: number;
  subCategoryID: number;
  hsnid: number;
  unitID: number;
  secondaryUnitID: number;
  statusID: number | null;
  color: string;
  size: string;
  weight: number;
  volume: number;
  material: string;
  finishType: string;
  shadeCode: string;
  capacity: string;
  modelNumber: string;

  expiryDate: string;
  manufacturingDate: string;

  quantity: number;
  productRate: number;
  saleRate: number;
  retailPrice: number;
  wholesalePrice: number;
  mrp: number;

  discountPercentage: number;
  discountAmount: number;

  inclusiveAmount: number;
  exclusiveAmount: number;

  gstPercentage: number;
  gstAmount: number;

  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  cessRate: number;
  cessAmount: number;

  grossAmount: number;
  customerDiscount: number;
  netAmount: number;
  taxableAmount: number;
  grandTotal: number;

  billingMode: string;
  cashAmount: number;
  cardAmount: number;
  upiAmount: number;
  advanceAmount: number;
  paidAmount: number;
  balanceAmount: number;

  status: string;
  isActive: boolean;
  isService: boolean;
  remarks: string;

  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
  cancelledDate: string;
  cancelledBy: string;
  cancelReason: string;

  totalSaleRate: number;
  totalDiscountAmount: number;
  totalCGSTAmount: number;
  totalSGSTAmount: number;
  totalIGSTAmount: number;
  totalCESSAmount: number;

  totalGrossAmount: number;
  totalDiscAmount: number;
  totalTaxableAmount: number;
  totalGstAmount: number;
  totalNetAmount: number;
  totalInvoiceAmount: number;
  totalPaidAmount: number;
  totalBalanceAmount: number;
  totalRoundOff: number;
  totalQuantity: number;
}
export interface SaveSalesEntryResponse {
  lastInvoiceNumber: any;
  lastInvoiceID: number;
}
