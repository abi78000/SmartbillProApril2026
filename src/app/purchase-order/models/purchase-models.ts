export interface PurchaseOrderEntry {
  sno: number;

  poid: number | null;

  companyID: number | null;
  companyName: string | null;

  branchID: number | null;
  branchName: string | null;

  poNumber: string | null;

  poDate: string | Date | null;
  expectedDeliveryDate: string | Date | null;

  supplierID: number | null;
  supplierName: string | null;

  statusID: number | null;
  statusName: string | null;

  totalAmount: number | null;
  poRemarks: string | null;

  // Product
  productID: number | null;
  productCode: string | null;
  productName: string | null;

  productCategoryId: number | null;
  productCategoryName: string | null;

  productSubCategory: number | null;
  productSubCategoryName: string | null;

  poRate: number | null;
  orderedQty: number | null;
  approvedQty: number | null;

  productRemarks: string | null;

  // ⭐ ADDED FOR GRN SCREEN
  receivedQty?: number | null;
  acceptedQty?: number | null;
  rejectedQty?: number | null;

  // System fields
  isActive: boolean;

  createdByUserID: number | null;
  createdSystemName: string | null;
  createdAt: Date | null;

  updatedByUserID: number | null;
  updatedSystemName: string | null;
  updatedAt: Date | null;

  cancelledDate: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;

  accountingYear: string | null;
}
export interface GRNEntry {
  grnEntryID: number;
  grnNumber: string;
  grnDate: string | Date;

  poid: number;
  poDetailID: number;
  purchaseID: number;

  supplierID: number;
  supplierName: string;

  companyID: number;
  branchID: number;

  invoiceNumber: string;
  invoiceDate: string | Date | null;

  transportName: string;
  vehicleNumber: string;

  receivedBy: string;

  productID: number;
  productCode: string;
  productName: string;

  unitID: number;

  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  orderedQty: number;

  purchaseRate: number;

  taxPercentage: number;
  taxAmount: number;

  totalAmount: number;

  remarks: string;

  isApproved: boolean;
  statusID: number;
  statusName: string;

  approvedBy: number;
  approvedAt: string | Date | null;

  isActive: boolean;

  createdBy: number | string;
  createdAt: string | Date | null;

  updatedBy: number | string;
  updatedAt: string | Date | null;
}

export interface PurchaseEntry {
  sno: number;

  purchaseID: number;
  poNumber: string | null;

  purchaseDate: string | Date | null;

  companyID: number;
  companyName: string | null;

  branchID: number;
  branchName: string | null;

  supplierID: number;
  supplierName: string | null;

  statusID: number;

  invoiceNumber: string | null;
  invoiceDate: string | Date | null;

  supplierInvoiceNumber: string | null;
  supplierInvoiceDate: string | Date | null;

  brandID: number;
  unitID: number;
  hsnid: number;

  categoryID: number;
  subCategoryID: number;

  barcode: string | null;
  productCode: string | null;
  productName: string | null;

  productRate: number;
  quantity: number;
  purchaseRate: number;

  retailPrice: number;
  wholesalePrice: number;
  saleRate: number;
  mrp: number;

  discountAmount: number;
  discountPercentage: number;
  inclusiveAmount: number;
  exclusiveAmount: number;

  gstPercentage: number | null;
  gstAmount: number;

  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;

  cessRate: number;
  cessAmount: number;

  taxableValue: number;
  isGSTInclusive: boolean;

  orderedQuantity: number;
  receivedQuantity: number;
  returnedQuantity: number;
  remainingQuantity: number;

  openingStock: number;
  reorderLevel: number;
  currentStock: number;

  color: string | null;
  size: string | null;
  weight: number;
  volume: number;
  material: string | null;
  finishType: string | null;
  shadeCode: string | null;
  capacity: string | null;
  modelNumber: string | null;

  expiryDate: string | Date | null;
  isService: boolean;

  statusName: string | null;

  totalAmount: number;
  taxAmount: number;
  grandTotal: number;

  remarks: string | null;

  isActive: boolean;

  createdByUserID: number;
  createdSystemName: string | null;
  createdAt: string | Date | null;

  updatedByUserID: number;
  updatedSystemName: string | null;
  updatedAt: string | Date | null;

  grnNumber: string | null;
  grnDate: string | Date | null;
  poid: number | null;
  poDetailID: number | null;

  grnRemarks: string | null;
  isGRNApproved: boolean;

  approvedByUserID: number;
  approvedAt: string | Date | null;

  paymentMode: string | null;
  paidDays: number;

  manufacturingDate: string | Date | null;

  taxType: string | null;

  secondaryUnitID: number;

  cancelledDate: string | Date | null;
  cancelledBy: string | null;
  cancelReason: string | null;

  accountingYear: string | null;

  totalGrossAmount: number;
  totalDiscAmount: number;
  totalTaxableAmount: number;
  totalGstAmount: number;
  totalCessAmount: number;
  totalNetAmount: number;
  totalInvoiceAmount: number;
  totalPaidAmount: number;
  totalBalanceAmount: number;
  totalRoundOff: number;
  quantityPurchased: number | null;
  quantitySold: number | null;
  quantityReturned: number | null;
  
}
