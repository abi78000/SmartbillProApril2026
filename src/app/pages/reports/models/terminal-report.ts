export interface TerminalReport {
  bills: never[];
  fromDate: string;
  toDate: string;

  companyID: number;
  branchID: number;
  terminalUser: string;

  totalBills: number;
  totalQuantity: number;

  grossSales: number;
  discountAmount: number;
  taxableAmount: number;

  cgst: number;
  sgst: number;
  igst: number;
  cess: number;

  totalGST: number;
  netSales: number;

  cashTotal: number;
  cardTotal: number;
  upiTotal: number;
  advanceTotal: number;
  totalPaid: number;
  balanceAmount: number;

  cancelledBills: number;
  cancelledAmount: number;
}
export interface GSTFiling {
  gstFileType: string;
  companyID: number;
  branchID?: number;

  recipientGSTIN?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  placeOfSupply?: string;

  hsnCode?: string;
  hsnDescription?: string;
  totalQuantity?: number;

  invoiceValue: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
}

export interface SalesReportCommon {

  /* ---------- Invoice ---------- */
  invoiceID?: number;
  invoiceNumber?: string;
  invoiceDate?: string;

  /* ---------- Customer ---------- */
  customerName?: string;
  customerGSTIN?: string;
  customerState?: string;

  /* ---------- Product (Detailed) ---------- */
  productCode?: string;
  productName?: string;
  quantity?: number;
  saleRate?: number;

  /* ---------- Tax ---------- */
  taxableAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  gstAmount?: number;

  /* ---------- Totals ---------- */
  totalQuantity?: number;
  grandTotal?: number;
  paidAmount?: number;
  balanceAmount?: number;

  /* ---------- Payment ---------- */
  billingMode?: string;
  cashAmount?: number;
  cardAmount?: number;
  upiAmount?: number;

  /* ---------- Aggregates ---------- */
  invoiceCount?: number;
  totalSalesAmount?: number;

  /* ---------- Status / Group ---------- */
  status?: string;
  area?: string;
}
export interface ProfitReport {
  // ITEM-wise
  productCode?: string;
  productName?: string;

  // INVOICE-wise
  invoiceNumber?: string;
  invoiceDate?: string;   // yyyy-MM-dd
  customerName?: string;

  // DAY-wise
  saleDate?: string;      // yyyy-MM-dd

  // COMMON
  soldQty: number;
  avgPurchaseRate?: number;   // only ITEM
  costAmount: number;
  salesAmount: number;
  profitAmount: number;
}
/* ================= CUSTOMER OUTSTANDING ================= */
export interface CustomerOutstandingReport {
  customerID?: number;
  customerName?: string;
  customerContact?: string;
  customerGSTIN?: string;
  area?: string;
  outstandingDate?: string;   // ISO Date

  invoiceCount: number;

  invoiceAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

/* ================= SUPPLIER OUTSTANDING ================= */
export interface SupplierOutstandingReport {
  supplierID?: number;
  supplierName?: string;
  area?: string;
  outstandingDate?: string;   // ISO Date

  purchaseCount: number;

  billAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}
export interface StockReport {
  productCode: string;
  productName: string;

  // ===== STOCK =====
  currentStock?: number;
  reorderLevel?: number;

  // ===== RATES / VALUE =====
  purchaseRate?: number;
  saleRate?: number;
  stockValue?: number;

  // ===== MOVEMENT =====
  soldQty?: number;

  // ===== LEDGER =====
  txnType?: 'OPENING' | 'PURCHASE' | 'SALE';
  quantity?: number;
  txnDate?: string;
}
