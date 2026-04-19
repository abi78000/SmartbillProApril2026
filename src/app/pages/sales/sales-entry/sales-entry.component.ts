import {
  ChangeDetectorRef,
  HostListener,
  ViewChild,
  Component,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FormsModule } from '@angular/forms';
import { Company, Branch } from '../../models/common-models/companyMaster';
import { CommonserviceService } from '../../../services/commonservice.service';
import { MasterService } from '../../../services/master.service';
import { AuthService } from '../../../authentication/auth-service.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { Router } from '@angular/router';
import { ProductStockPrice, SalesInvoice } from '../models/sales-model';
import {
  SubCategory,
  Category,
  Status,
  Brand,
  Unit,
  HSN,
  Tax,
  Cess,
  Supplier,
  PaymentMode,
} from '../../models/common-models/master-models/master';
import { Customer } from '../../models/common-models/master-models/master';
import { BusinessType, GstTransactionType } from '../models/sales-model';
import { forkJoin, of } from 'rxjs';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { SalesService } from '../sales.service';
import { SmallGridComponent } from '../../components/small-grid/small-grid.component';
import { InputDataGridComponent } from '../../components/input-data-grid/input-data-grid.component';
import { IconsModule } from '../../../shared/icons.module';
import { Location } from '@angular/common';

export interface BillTab {
  id: number; // Unique internal tab ID
  name: string; // Tab name: "Bill 1", "Bill 2"

  // ===== BILL INFO =====
  billNumber: string;
  invoiceDate: Date | string;
  accountingYear: string;

  // ===== CUSTOMER INFO =====
  selectedCustomerId: number | null;
  customerGSTIN: string;

  // ===== PAYMENT INFO =====
  selectedPayment: 'CASH' | 'CARD' | 'UPI' | 'MIXED';

  cashAmount: number;
  cardAmount: number;
  upiAmount: number;
  upiRef: string;

  // ===== SALES ROWS =====
  salesEntries: SalesInvoice[];

  // ===== STORED TOTALS =====
  totals: BillTotals;
}

export interface BillTotals {
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
}

@Component({
  selector: 'app-sales-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SmallGridComponent,
    InputDataGridComponent,
    IconsModule,
    FocusOnKeyDirective,
  ],
  templateUrl: './sales-entry.component.html',
  styleUrls: ['./sales-entry.component.css'],
})
export class SalesEntryComponent {
  @ViewChild(InputDataGridComponent) grid!: InputDataGridComponent;
  @ViewChild(SmallGridComponent) smallGrid!: SmallGridComponent;

  selectedCompanyId: number | null = null;
  selectedBranchId: number | null = null;
  filteredProducts: any[] = [];
  selectedCategoryId: number | null = null;

  posSearchText = '';

  companies: Company[] = [];
  branches: Branch[] = [];
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  brands: Brand[] = [];
  units: Unit[] = [];
  hsnCodes: HSN[] = [];
  taxes: Tax[] = [];
  cesses: Cess[] = [];
  paymentModes: PaymentMode[] = [];
  suppliers: Supplier[] = [];
  statuses: Status[] = [];
  accountingYear: any;
  products: ProductStockPrice[] = [];
  productList: ProductStockPrice[] = [];
  activeProductRow: number | null = null;
  billNumber: string = '';
  // Flags
  smallGridVisible = false;
  salesEntries: SalesInvoice[] = [];
  filterByCategory(categoryId: number | null) {
    this.selectedCategoryId = categoryId;

    if (categoryId === null) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        (p) => p.categoryID === categoryId
      );
    }
  }

  applyPosSearch() {
    const text = this.posSearchText.toLowerCase().trim();

    this.filteredProducts = this.products.filter(
      (p) =>
        p.productName.toLowerCase().includes(text) ||
        p.productCode?.toLowerCase().includes(text)
    );
  }
  addProductToBill(product: ProductStockPrice) {
    if (!product) return;

    const existingIndex = this.salesEntries.findIndex(
      (r) => r.productCode === product.productCode
    );

    if (existingIndex !== -1) {
      const row = this.salesEntries[existingIndex];
      row.quantity = Number(row.quantity || 0) + 1;

      this.calculateRowTotals(row, 'quantity');
      this.calculateOverallTotals();

      setTimeout(() => {
        this.grid?.focusCell(existingIndex, 4); // QTY column index
      }, 50);

      return;
    }

    this.addNewProduct();

    const rowIndex = this.salesEntries.length - 1;
    this.activeProductRow = rowIndex;

    this.onProductSelected(product);
  }

  // CUSTOMER INFO
  selectedCustomerId: number | null = null;
  customerGSTIN: string = '';

  customers: Customer[] = [];

  smallGridData: ProductStockPrice[] = [];

  totalGrossAmount: number = 0;
  totalDiscAmount: number = 0;
  totalTaxableAmount: number = 0;
  totalGstAmount: number = 0;
  totalCessAmount: number = 0;
  totalNetAmount: number = 0;
  totalInvoiceAmount: number = 0;
  totalPaidAmount: number = 0;
  totalBalanceAmount: number = 0;
  totalRoundOff: number = 0;
  selectedCustomerName: string = 'Walk-in Customer';

  businessTypes: BusinessType[] = [];

  gstTypesList: GstTransactionType[] = [];
  selectedInvoiceDate: any;

  billMode: 'POS' | 'HOTKEY' = 'HOTKEY'; // default
  selectedPaymentMode: any;

  selectedBusinessType: BusinessType | null = null;
  selectedGstType: GstTransactionType | null = null;
  invoiceNo: any;
  // TOTALS
  grossAmount = 0;
  discountAmount = 0;
  taxableAmount = 0;
  gstAmount = 0;
  invoiceTotal = 0;
  columns = [
    {
      field: 'sno',
      header: 'S.NO',
      type: 'text',
      visible: true,
      readOnly: true,
    },

    {
      field: 'invoiceID',
      header: 'Invoice ID',
      type: 'number',
      visible: false,
      readOnly: true,
    },
    {
      field: 'invoiceNumber',
      header: 'Invoice Number',
      type: 'text',
      visible: false,
    },
    {
      field: 'invoiceDate',
      header: 'Invoice Date',
      type: 'date',
      visible: false,
    },

    {
      field: 'companyID',
      header: 'Company ID',
      type: 'number',
      visible: false,
    },
    { field: 'companyName', header: 'Company', type: 'text', visible: false },
    { field: 'branchID', header: 'Branch ID', type: 'number', visible: false },
    { field: 'branchName', header: 'Branch', type: 'text', visible: false },

    {
      field: 'customerID',
      header: 'Customer ID',
      type: 'number',
      visible: false,
    },
    {
      field: 'customerName',
      header: 'Customer Name',
      type: 'text',
      visible: false,
    },

    { field: 'barcode', header: 'Barcode', type: 'text', visible: false },
    { field: 'brandID', header: 'Brand ID', type: 'number', visible: false },
    {
      field: 'categoryID',
      header: 'Category ID',
      type: 'number',
      visible: false,
    },
    { field: 'hsnid', header: 'HSN ID', type: 'number', visible: false },
    { field: 'unitID', header: 'Unit ID', type: 'number', visible: false },

    {
      field: 'productCode',
      header: 'CODE',
      type: 'text',
      visible: true,
      readOnly: true,
    },
    {
      field: 'productName',
      header: 'ITEM',
      type: 'text',
      visible: true,
      openSmallGrid: true,
    },

    {
      field: 'retailPrice',
      header: 'Retail Price',
      type: 'number',
      visible: false,
    },
    {
      field: 'saleRate',
      header: 'PRICE',
      type: 'number',
      visible: true,
      readonly: true,
    },
    { field: 'mrp', header: 'MRP', type: 'number', visible: false },
    {
      field: 'quantity',
      header: 'QTY',
      type: 'number',
      visible: true,
      requiredForNextRow: true,
    },
    {
      field: 'gstPercentage',
      header: 'GST %',
      type: 'number',
      visible: true,
      readOnly: true,
    },
    {
      field: 'gstAmount',
      header: 'GST ₹',
      type: 'number',
      visible: true,
      readOnly: true,
    },
    { field: 'cgstRate', header: 'CGST %', type: 'number', visible: false },
    { field: 'sgstRate', header: 'SGST %', type: 'number', visible: false },
    { field: 'igstRate', header: 'IGST %', type: 'number', visible: false },

    {
      field: 'discountPercentage',
      header: 'DISC%',
      type: 'number',
      visible: true,
    },
    {
      field: 'discountAmount',
      header: 'DISC ₹',
      type: 'number',
      visible: true,
    },
    {
      field: 'netAmount',
      header: 'NET AMT',
      type: 'number',
      visible: true,
      readOnly: true,
    },
    {
      field: 'grossAmount',
      header: 'Gross Amount',
      type: 'number',
      visible: false,
      readOnly: false,
    },

    {
      field: 'grandTotal',
      header: 'Grand Total',
      type: 'number',
      visible: false,
    },
    { field: 'remarks', header: 'Remarks', type: 'text', visible: false },
  ];

  // SMALL GRID COLUMNS (USED IN TEMPLATE)
  productGridColumns = [
    { field: 'productCode', header: 'Product Code', visible: true },
    { field: 'productName', header: 'Product Name', visible: true },
    { field: 'retailPrice', header: 'Retail Price', visible: false },
    { field: 'wholesalePrice', header: 'Wholesale Price', visible: false },
    { field: 'currentStock', header: 'Stock', visible: true },
  ];
  billTabs: any;
  activeBillIndex: number | undefined;
  loggedInUser: string = 'SYSTEM';

  constructor(
    private masterService: MasterService,
    private commonService: CommonserviceService,
    private salesservice: SalesService,
    private swall: SweetAlertService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.authService.userName ?? 'SYSTEM';
    this.applyDeviceMode();

    this.selectedInvoiceDate = this.getTodayDate();
    this.loadDropdowns();
    this.loadBusinessTypes();
    this.loadGstTypes();
    this.loadCustomers();

    const companyId = this.authService.companyId;

    if (companyId) {
      this.selectedCompanyId = companyId;
    }
    setTimeout(() => {
      this.nextBill();
    }, 100);

    console.log(this.loggedInUser);
  }
  getTodayDate() {
    return new Date().toISOString().substring(0, 10);
  }

  onBusinessTypeChanged() {
    this.loadProducts();
  }
  onProductSelected(product: ProductStockPrice) {
    if (!product) return;

    const lastEmptyIndex = this.salesEntries.length - 1;

    const existingIndex = this.salesEntries.findIndex(
      (r) => r.productCode === product.productCode
    );

    if (existingIndex !== -1) {
      const row = this.salesEntries[existingIndex];
      row.quantity = Number(row.quantity || 0) + 1;

      this.calculateRowTotals(row, 'quantity');
      this.calculateOverallTotals();
      this.smallGridVisible = false;

      setTimeout(() => this.grid.focusCell(lastEmptyIndex, 2), 50);
      return;
    }

    const row = this.salesEntries[this.activeProductRow!];

    row.productID = product.productID;

    row.productCode = product.productCode;
    row.productName = product.productName;
    row.retailPrice = product.retailPrice;
    row.wholesalePrice = product.wholesalePrice;
    row.gstPercentage = product.gstPercentage;

    row.saleRate =
      this.selectedBusinessType?.businessTypeID === 2
        ? product.wholesalePrice
        : product.retailPrice;

    row.quantity = 1;

    this.calculateRowTotals(row, 'quantity');
    this.calculateOverallTotals();

    this.smallGridVisible = false;

    setTimeout(() => this.grid.focusCell(this.activeProductRow!, 4), 50);
  }

  private applyDeviceMode() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      this.billMode = 'POS'; // 🔒 FORCE POS
    } else {
      this.billMode = 'HOTKEY'; // 🖥 Desktop default
    }
  }

  loadBusinessTypes() {
    this.salesservice.getAllBusinessTypes().subscribe((res) => {
      if (res && res.success) {
        this.businessTypes = res.data;

        const defaultBT = this.businessTypes.find(
          (x) => x.businessTypeID === 1
        );

        if (defaultBT) {
          this.selectedBusinessType = defaultBT;

          this.loadProducts();
        }
      }
    });
  }

  loadGstTypes() {
    this.salesservice.getAllGstTypes().subscribe((res) => {
      if (res && res.success) {
        this.gstTypesList = res.data;

        const defaultGst = this.gstTypesList.find(
          (x) => x.gstTransactionTypeID === 1
        );

        if (defaultGst) {
          this.selectedGstType = defaultGst;
        }
      }
    });
  }

  loadCustomers() {
    this.masterService.getCustomers().subscribe({
      next: (res) => {
        this.customers = res ?? [];
        console.log('Customers loaded:', this.customers);
      },
      error: () => this.swall.error('Error', 'Failed to load customers!'),
    });
  }
  onCustomerChange() {
    const customer = this.customers.find(
      (c) => c.customerID === this.selectedCustomerId
    );

    this.selectedCustomerName = customer?.customerName ?? 'Walk-in Customer';

    console.log('Customer selected:', this.selectedCustomerName);
  }

  loadDropdowns(): void {
    const companyId = this.authService.companyId;

    forkJoin({
      companies: this.commonService.getCompanies(),
      branches: companyId
        ? this.commonService.getBranchesByCompany(companyId)
        : of([]),
      categories: this.masterService.getCategories(),
      subCategories: this.masterService.getSubCategories(),
      brands: this.masterService.getBrands(),
      units: this.masterService.getUnits(),
      hsnCodes: this.masterService.getHSNCodes(),
      taxes: this.masterService.getTaxes(),
      cesses: this.masterService.getCesses(),
      suppliers: this.masterService.getSuppliers(),
      statuses: this.masterService.getStatuses(),
      paymentModes: this.masterService.getPaymentModes(),
    }).subscribe((res) => {
      this.companies = res.companies ?? [];
      this.branches = res.branches ?? [];
      this.categories = res.categories ?? [];
      this.subCategories = res.subCategories ?? [];
      this.brands = res.brands ?? [];
      this.units = res.units ?? [];
      this.hsnCodes = res.hsnCodes ?? [];
      this.taxes = res.taxes ?? [];
      this.cesses = res.cesses ?? [];
      this.suppliers = res.suppliers ?? [];
      this.statuses = res.statuses ?? [];
      this.paymentModes = res.paymentModes ?? [];

      const comp = this.companies.find((c) => c.companyID === companyId);
      this.accountingYear = comp?.accountingYear || '';
    });
  }
  onCompanyChange(companyId: number) {
    this.selectedBranchId = null;
    this.branches = [];

    this.commonService
      .getBranchesByCompany(companyId)
      .subscribe((res: Branch[]) => {
        this.branches = res;
      });
  }
  adjustColumnsForBusinessType() {
    const retail = this.productGridColumns.find(
      (c) => c.field === 'retailPrice'
    );
    const wholesale = this.productGridColumns.find(
      (c) => c.field === 'wholesalePrice'
    );

    if (!retail || !wholesale) return;

    if (this.selectedBusinessType?.businessTypeID === 1) {
      retail.visible = true;
      wholesale.visible = false;
    } else if (this.selectedBusinessType?.businessTypeID === 2) {
      retail.visible = false;
      wholesale.visible = true;
    } else {
      retail.visible = true;
      wholesale.visible = true;
    }

    this.productGridColumns = [...this.productGridColumns];
    this.productGridColumns = [...this.productGridColumns];
  }

  goBack() {
    this.location.back(); // browser history back
  }

  loadProducts() {
    const companyId = this.selectedCompanyId;
    const branchId = this.selectedBranchId;
    const businessTypeId = this.selectedBusinessType?.businessTypeID;

    if (!companyId) return;

    this.salesservice
      .getSalesProducts(
        companyId,
        branchId ?? undefined,
        businessTypeId ?? undefined
      )
      .subscribe((res) => {
        if (res && res.success) {
          // 🔥 CRITICAL FIX: map saleRate for POS
          this.products = (res.data ?? []).map((p: ProductStockPrice) => ({
            ...p,
            saleRate:
              this.selectedBusinessType?.businessTypeID === 2
                ? p.wholesalePrice
                : p.retailPrice,
          }));

          this.filteredProducts = [...this.products];
          this.smallGridData = [...this.products];
        } else {
          this.products = [];
          this.filteredProducts = [];
          this.smallGridData = [];
        }
      });
  }

  get visibleColumns() {
    return this.columns.filter((c) => c.visible);
  }

  showSmallGrid(rowIndex: number) {
    this.activeProductRow = rowIndex;
    this.adjustColumnsForBusinessType();
    setTimeout(() => {
      this.smallGridData = [...this.products];
      this.smallGridVisible = true;
    });
  }

  onGridRowAdded(e: any) {
    const newRow = e;

    this.applyTopSelectionsToRow(newRow);

    this.updateSerialNumbers();
  }
getProductQty(product: ProductStockPrice): number {
  if (!product || !this.salesEntries || this.salesEntries.length === 0) {
    return 0;
  }

  const row = this.salesEntries.find(
    r => r.productCode === product.productCode
  );

  return row ? Number(row.quantity || 0) : 0;
}

increaseQty(product: ProductStockPrice, event: Event) {
  event.stopPropagation(); 
  this.addProductToBill(product);
}

decreaseQty(product: ProductStockPrice, event: Event) {
  event.stopPropagation(); 

  const index = this.salesEntries.findIndex(
    r => r.productCode === product.productCode
  );

  if (index === -1) return;

  const row = this.salesEntries[index];

  if (row.quantity > 1) {
    row.quantity -= 1;
  } else {
    // qty = 1 → remove item
    this.salesEntries.splice(index, 1);
  }
}


  applyTopSelectionsToRow(row: SalesInvoice) {
    row.companyID = this.selectedCompanyId ?? null;
    row.branchID = this.selectedBranchId ?? null;
    row.accountingYear = this.accountingYear ?? null;
    row.statusID = 3;
  }
  updateSerialNumbers() {
    this.salesEntries.forEach((row, index) => {
      row.sno = index + 1;
    });
  }
  onGridNumberChanged(event: any) {
    const { rowIndex, field } = event;
    const row = this.salesEntries[rowIndex];
    if (!row) return;

    this.calculateRowTotals(row, field); // pass field name
    this.calculateOverallTotals();
  }

  loadNextInvoiceNo(): Promise<string> {
    return new Promise((resolve) => {
      const companyId = this.selectedCompanyId ?? 0;
      const branchId = this.selectedBranchId
        ? String(this.selectedBranchId)
        : '';

      this.salesservice.getNextInvoiceNumber(companyId, branchId).subscribe({
        next: (invoiceNo: string) => {
          resolve(invoiceNo ?? 'INV-0001');
        },
        error: () => {
          resolve('INV-0001');
        },
      });
    });
  }

  calculateRowTotals(row: SalesInvoice, changedField: string) {
    const rate = Number(row.saleRate || 0);
    const qty = Number(row.quantity || 0);
    const gst = Number(row.gstPercentage || 0);
    let discPerc = Number(row.discountPercentage || 0);
    let discAmt = Number(row.discountAmount || 0);
    const baseAmount = rate * qty;
    if (changedField === 'discountPercentage') {
      discAmt = (baseAmount * discPerc) / 100;
      row.discountAmount = discAmt;
    }

    if (changedField === 'discountAmount') {
      discPerc = baseAmount > 0 ? (discAmt / baseAmount) * 100 : 0;
      row.discountPercentage = discPerc;
    }

    const taxableAmount = baseAmount - discAmt;
    row.taxableAmount = taxableAmount;

    const gstAmount = (taxableAmount * gst) / 100;
    row.gstAmount = gstAmount;

    row.cgstRate = gst / 2;
    row.sgstRate = gst / 2;
    row.cgstAmount = gstAmount / 2;
    row.sgstAmount = gstAmount / 2;

    row.netAmount = taxableAmount + gstAmount;

    row.grossAmount = baseAmount;
  }

  hasValidSalesRows(): boolean {
    if (!this.salesEntries || this.salesEntries.length === 0) return false;

    return this.salesEntries.some(
      (row) =>
        row.productCode &&
        Number(row.quantity) > 0 &&
        Number(row.saleRate) > 0 &&
        Number(row.netAmount) > 0
    );
  }
  isPaymentComplete(): boolean {
    const paid = this.getPaidAmount();
    return paid >= Number(this.totalInvoiceAmount || 0);
  }

  calculateOverallTotals() {
    this.totalGrossAmount = 0;
    this.totalDiscAmount = 0;
    this.totalTaxableAmount = 0;
    this.totalGstAmount = 0;
    this.totalCessAmount = 0;
    this.totalNetAmount = 0;
    this.totalInvoiceAmount = 0;

    for (const row of this.salesEntries) {
      this.totalGrossAmount += Number(row.grossAmount || 0);
      this.totalDiscAmount += Number(row.discountAmount || 0);
      this.totalTaxableAmount += Number(row.taxableAmount || 0);
      this.totalGstAmount += Number(row.gstAmount || 0);
      this.totalCessAmount += Number(row.cessAmount || 0);
      this.totalNetAmount += Number(row.netAmount || 0);
    }

    this.totalInvoiceAmount = this.totalNetAmount;
    this.totalPaidAmount = this.cashAmount + this.cardAmount + this.upiAmount;
    this.totalBalanceAmount = this.totalInvoiceAmount - this.totalPaidAmount;

    if (!this.billTabs || this.billTabs.length === 0) return;

    const index = this.activeBillIndex ?? 0;

    if (index < 0 || index >= this.billTabs.length) return;

    const tab = this.billTabs[index];

    tab.totals.totalGrossAmount = this.totalGrossAmount;
    tab.totals.totalDiscAmount = this.totalDiscAmount;
    tab.totals.totalTaxableAmount = this.totalTaxableAmount;
    tab.totals.totalGstAmount = this.totalGstAmount;
    tab.totals.totalCessAmount = this.totalCessAmount;
    tab.totals.totalNetAmount = this.totalNetAmount;
    tab.totals.totalInvoiceAmount = this.totalInvoiceAmount;
    tab.totals.totalPaidAmount = this.totalPaidAmount;
    tab.totals.totalBalanceAmount = this.totalBalanceAmount;
    tab.totals.totalRoundOff = this.totalRoundOff;
  }

  private newProduct(): SalesInvoice {
    return {
      sno: 0,

      invoiceID: 0,
      invoiceNumber: '',
      invoiceDate: this.selectedInvoiceDate ?? '',

      companyID: this.selectedCompanyId ?? null,
      companyName: '',

      branchID: this.selectedBranchId ?? null,
      branchName: '',

      customerID: 0,
      customerName: '',
      customerContact: '',
      customerGSTIN: '',
      customerState: '',
      companyState: '',

      accountingYear: this.accountingYear ?? '',
      billingType: '',
      isGSTApplicable: false,
      gstType: '',

      productID: 0,
      barcode: '',
      productCode: '',
      productName: '',

      brandID: 0,
      categoryID: 0,
      subCategoryID: 0,
      hsnid: 0,
      unitID: 0,
      secondaryUnitID: 0,
      statusID: null,

      color: '',
      size: '',
      weight: 0,
      volume: 0,
      material: '',
      finishType: '',
      shadeCode: '',
      capacity: '',
      modelNumber: '',

      expiryDate: '',
      manufacturingDate: '',

      quantity: 0,
      productRate: 0,
      saleRate: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      mrp: 0,

      discountPercentage: 0,
      discountAmount: 0,

      inclusiveAmount: 0,
      exclusiveAmount: 0,

      gstPercentage: 0,
      gstAmount: 0,

      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: 0,
      igstAmount: 0,
      cessRate: 0,
      cessAmount: 0,

      grossAmount: 0,
      customerDiscount: 0,
      netAmount: 0,
      taxableAmount: 0,
      grandTotal: 0,

      billingMode: '',
      cashAmount: 0,
      cardAmount: 0,
      upiAmount: 0,
      advanceAmount: 0,
      paidAmount: 0,
      balanceAmount: 0,

      status: '',
      isActive: true,
      isService: false,
      remarks: '',

      createdBy: this.loggedInUser,
      updatedBy: this.loggedInUser,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      cancelledDate: '',
      cancelledBy: '',
      cancelReason: '',

      totalSaleRate: 0,
      totalDiscountAmount: 0,
      totalCGSTAmount: 0,
      totalSGSTAmount: 0,
      totalIGSTAmount: 0,
      totalCESSAmount: 0,

      totalGrossAmount: 0,
      totalDiscAmount: 0,
      totalTaxableAmount: 0,
      totalGstAmount: 0,
      totalNetAmount: 0,
      totalInvoiceAmount: 0,
      totalPaidAmount: 0,
      totalBalanceAmount: 0,
      totalRoundOff: 0,
      totalQuantity: 0,
    };
  }
  validateRequired(label: string, value: any): boolean {
    if (value === null || value === undefined || value === '') {
      this.swall.warning('Validation', `${label} is required.`);
      return false;
    }
    return true;
  }
  validateHeaderFields(): boolean {
    if (!this.validateRequired('Company', this.selectedCompanyId)) return false;

    if (
      !this.validateRequired(
        'Business Type',
        this.selectedBusinessType?.businessTypeID
      )
    )
      return false;

    // GST TYPE
    if (
      !this.validateRequired(
        'GST Type',
        this.selectedGstType?.gstTransactionTypeID
      )
    )
      return false;

    return true;
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyEvents(event: KeyboardEvent) {
    // ============================
    // SAVE SALES ENTRY (Shift + S)
    // ============================
    if (event.shiftKey && event.key.toLowerCase() === 's') {
      event.preventDefault();

      if (!this.validateHeaderFields()) return;

      if (!this.salesEntries || this.salesEntries.length === 0) {
        this.swall.warning('No Items', 'Please add at least one product.');
        return;
      }

      this.saveSalesEntry();
      return;
    }

    // ============================
    // FOCUS PAID AMOUNT (Shift + T)
    // ============================
    if (event.shiftKey && event.key.toLowerCase() === 't') {
      event.preventDefault();

      const paidInput = document.getElementById(
        'paidAmountInput'
      ) as HTMLInputElement;

      if (paidInput) {
        paidInput.focus();
        paidInput.select();
      }
      return;
    }

    // ============================
    // 1) CLOSE / TOGGLE SMALL GRID (ESC)
    // ============================
    if (event.key === 'Escape') {
      event.preventDefault();

      if (this.smallGridVisible) {
        this.smallGridVisible = false; // Close
      } else {
        if (this.activeProductRow !== null) {
          this.showSmallGrid(this.activeProductRow); // Open again
        }
      }
      return;
    }

    // ============================
    // ADD NEW PRODUCT ROW (Shift + N)
    // ============================
    if (event.shiftKey && event.key.toLowerCase() === 'n') {
      event.preventDefault();

      if (!this.validateHeaderFields()) return;

      if (this.salesEntries.length === 0) {
        this.addNewProduct();
        setTimeout(() => {
          this.grid.focusCell(0, 2);
        }, 50);
        return;
      }

      const lastIndex = this.salesEntries.length - 1;
      const lastRow = this.salesEntries[lastIndex];

      if (!this.validateRowForNext(lastRow)) {
        this.swall.warning(
          'Validation Required',
          'Please fill Product, Category, Subcategory, Purchase Rate, Retail Price, Quantity & Amount before adding a new row.'
        );
        return;
      }

      this.addNewProduct();

      const newIndex = this.salesEntries.length - 1;
      setTimeout(() => {
        this.grid.focusCell(newIndex, 2);
      }, 50);
    }
  }

  addNewProduct(): void {
    const newProd = this.newProduct();
    this.salesEntries.push(newProd);
    this.updateSerialNumbers();

    setTimeout(() => {
      if (this.grid?.focusCell) {
        const index = this.salesEntries.length - 1;
        this.grid.focusCell(index, 2); // Product Name column
      }
    }, 50);
  }

  validateRowForNext(row: SalesInvoice): boolean {
    if (!row) return false;

    if (!row.productName || !row.productCode) return false;
    if (!row.productName || !row.productName) return false;
    if (!row.saleRate || Number(row.saleRate) <= 0) return false;
    if (!row.quantity || Number(row.quantity) <= 0) return false;
    if (!row.netAmount || Number(row.netAmount) <= 0) return false;
    return true;
  }

  dummyProducts = [
    {
      name: 'Apple',
      price: 50,
      image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce',
    },
    {
      name: 'Banana',
      price: 10,
      image: 'https://images.unsplash.com/photo-1574226516831-e1dff420e42e',
    },
    {
      name: 'Milk (1L)',
      price: 30,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
    },
    {
      name: 'Eggs (dozen)',
      price: 60,
      image: 'https://images.unsplash.com/photo-1518806118471-f28b20a1d79d',
    },
  ];
  dummyHotkeys = [
    { key: 'F1', label: 'Add Product' },
    { key: 'F2', label: 'Search Item' },
    { key: 'F3', label: 'Customer' },
    { key: 'F4', label: 'Payment' },
    { key: 'F5', label: 'Quantity' },
    { key: 'F6', label: 'Discount' },
  ];
  selectBusinessType(typeId: number) {
    this.selectedBusinessType =
      this.businessTypes.find((x) => x.businessTypeID === typeId) || null;

    this.onBusinessTypeChanged(); // refresh product rates
  }
  selectGstType(typeId: number) {
    this.selectedGstType =
      this.gstTypesList.find((x) => x.gstTransactionTypeID === typeId) || null;
  }

  selectedPayment: string = 'CASH';

  cashAmount = 0;
  cardAmount = 0;
  upiAmount = 0;
  upiRef = '';

  getPaidAmount() {
    return (
      (this.cashAmount || 0) + (this.cardAmount || 0) + (this.upiAmount || 0)
    );
  }

  getBalanceAmount() {
    return Number(this.totalInvoiceAmount) - Number(this.getPaidAmount());
  }
  removeBill(index: number, event: Event) {
    event.stopPropagation();

    this.billTabs.splice(index, 1);

    // No tabs left → create a fresh bill
    if (this.billTabs.length === 0) {
      this.nextBill();
      return;
    }

    // If removed tab is the active one → switch to previous tab
    if (index === this.activeBillIndex) {
      this.activeBillIndex = Math.min(index, this.billTabs.length - 1);
      this.loadBillToScreen(this.activeBillIndex);
      return;
    }

    // If removed before active index → shift active index left
    if (this.activeBillIndex !== undefined && index < this.activeBillIndex) {
      this.activeBillIndex--;
    }
  }
  private refreshBillTabNames() {
    this.billTabs.forEach((tab: BillTab, index: number) => {
      tab.id = index + 1;
      tab.name = `Bill ${index + 1}`;
    });
  }

  async nextBill() {
    if (!this.billTabs) {
      this.billTabs = [];
    }

    const nextInvoiceNo = await this.loadNextInvoiceNo();

    const newBillNo = (this.billTabs?.length || 0) + 1;

    const newTab: BillTab = {
      id: newBillNo,
      name: `Bill ${newBillNo}`,

      billNumber: nextInvoiceNo,

      invoiceDate: this.getTodayDate(),
      accountingYear: this.accountingYear,

      selectedCustomerId: null,
      customerGSTIN: '',

      selectedPayment: 'CASH',
      cashAmount: 0,
      cardAmount: 0,
      upiAmount: 0,
      upiRef: '',

      salesEntries: [],

      totals: {
        totalGrossAmount: 0,
        totalDiscAmount: 0,
        totalTaxableAmount: 0,
        totalGstAmount: 0,
        totalCessAmount: 0,
        totalNetAmount: 0,
        totalInvoiceAmount: 0,
        totalPaidAmount: 0,
        totalBalanceAmount: 0,
        totalRoundOff: 0,
      },
    };

    this.billTabs.push(newTab);

    // Activate new tab
    this.activeBillIndex = this.billTabs.length - 1;

    // Load values into UI
    this.loadBillToScreen(this.activeBillIndex);

    // Ensure tab names stay correct after deletes
    this.refreshBillTabNames();
  }

  switchBill(i: number) {
    this.saveBillFromScreen();
    this.activeBillIndex = i;
    this.loadBillToScreen(i);
  }

  loadBillToScreen(index: number) {
    const tab = this.billTabs[index];

    if (!tab) return;

    // BILL INFO
    this.billNumber = tab.billNumber;
    this.selectedInvoiceDate = tab.invoiceDate;
    this.accountingYear = tab.accountingYear;

    // CUSTOMER
    this.selectedCustomerId = tab.selectedCustomerId;
    this.customerGSTIN = tab.customerGSTIN;

    // PAYMENT INFO
    this.selectedPayment = tab.selectedPayment;
    this.cashAmount = tab.cashAmount;
    this.cardAmount = tab.cardAmount;
    this.upiAmount = tab.upiAmount;
    this.upiRef = tab.upiRef;

    // SALES ENTRIES
    this.salesEntries = [...tab.salesEntries];

    // TOTALS
    const t = tab.totals;
    this.totalGrossAmount = t.totalGrossAmount;
    this.totalDiscAmount = t.totalDiscAmount;
    this.totalTaxableAmount = t.totalTaxableAmount;
    this.totalGstAmount = t.totalGstAmount;
    this.totalCessAmount = t.totalCessAmount;
    this.totalNetAmount = t.totalNetAmount;
    this.totalInvoiceAmount = t.totalInvoiceAmount;
    this.totalPaidAmount = t.totalPaidAmount;
    this.totalBalanceAmount = t.totalBalanceAmount;
    this.totalRoundOff = t.totalRoundOff;
  }

  saveBillFromScreen() {
    if (this.activeBillIndex == null) return;

    const tab = this.billTabs[this.activeBillIndex];

    // BILL INFO
    tab.billNumber = this.billNumber;
    tab.invoiceDate = this.selectedInvoiceDate;
    tab.accountingYear = this.accountingYear;

    // CUSTOMER
    tab.selectedCustomerId = this.selectedCustomerId;
    tab.customerGSTIN = this.customerGSTIN;

    // PAYMENT INFO
    tab.selectedPayment = this.selectedPayment;
    tab.cashAmount = this.cashAmount;
    tab.cardAmount = this.cardAmount;
    tab.upiAmount = this.upiAmount;
    tab.upiRef = this.upiRef;

    // SALES ROWS
    tab.salesEntries = [...this.salesEntries];

    // TOTALS
    tab.totals = {
      totalGrossAmount: this.totalGrossAmount,
      totalDiscAmount: this.totalDiscAmount,
      totalTaxableAmount: this.totalTaxableAmount,
      totalGstAmount: this.totalGstAmount,
      totalCessAmount: this.totalCessAmount,
      totalNetAmount: this.totalNetAmount,
      totalInvoiceAmount: this.totalInvoiceAmount,
      totalPaidAmount: this.totalPaidAmount,
      totalBalanceAmount: this.totalBalanceAmount,
      totalRoundOff: this.totalRoundOff,
    };
  }
  saveSalesEntry() {
    // POS payment safety check
    if (this.billMode === 'POS' && !this.isPaymentComplete()) {
      this.swall.warning(
        'Payment Incomplete',
        'Please complete payment before saving.'
      );
      if (!this.validateHeaderFields()) return;

      return;
    }

    const cleanedRows = this.salesEntries.filter(
      (r) =>
        r.productName?.trim() !== '' &&
        r.productCode?.trim() !== '' &&
        Number(r.quantity) > 0 &&
        Number(r.saleRate) > 0 &&
        Number(r.netAmount) > 0
    );

    if (cleanedRows.length === 0) {
      this.swall.warning(
        'Validation Failed',
        'Please add at least one valid product.'
      );
      return;
    }

    const num = (v: any) =>
      v === null || v === undefined || v === '' || isNaN(v) ? 0 : Number(v);

    const company =
      this.companies.find((c) => c.companyID === this.selectedCompanyId) ||
      null;
    const branch =
      this.branches.find((b) => b.branchID === this.selectedBranchId) || null;
    const customer =
      this.customers.find((c) => c.customerID === this.selectedCustomerId) ||
      null;

    console.log('CLEANED ROWS:', cleanedRows);

    const payload = cleanedRows.map((row) => ({
      invoiceID: num(row.invoiceID),
      invoiceNumber: this.billNumber,
      invoiceDate: new Date(this.selectedInvoiceDate).toISOString(),

      companyID: this.selectedCompanyId,
      companyName: company?.companyName ?? '',

      branchID: num(this.selectedBranchId),
      branchName: branch?.branchName ?? '',

      customerID: num(this.selectedCustomerId),
      customerName: customer?.customerName,
      customerGSTIN: this.customerGSTIN ?? '',
      customerState: customer?.state ?? '',
      companyState: company?.state ?? '',

      accountingYear: this.accountingYear,
      billingType: this.selectedBusinessType?.businessTypeName ?? '',
      isGSTApplicable: true,
      gstType: this.selectedGstType?.transactionTypeName ?? '',

      // PRODUCT FIELDS
      productID: num(row.productID),
      barcode: row.barcode ?? '',
      productCode: row.productCode ?? '',
      productName: row.productName ?? '',
      brandID: num(row.brandID),
      categoryID: num(row.categoryID),
      subCategoryID: num(row.subCategoryID),

      // FIX: Backend expects HSNID
      HSNID: num(row.hsnid),

      unitID: num(row.unitID),
      secondaryUnitID: num(row.secondaryUnitID),

      quantity: num(row.quantity),
      saleRate: num(row.saleRate),
      productRate: num(row.saleRate),
      retailPrice: num(row.retailPrice),
      wholesalePrice: num(row.wholesalePrice),
      mrp: num(row.mrp),

      discountPercentage: num(row.discountPercentage),
      discountAmount: num(row.discountAmount),

      inclusiveAmount: num(row.inclusiveAmount),
      exclusiveAmount: num(row.exclusiveAmount),

      gstPercentage: num(row.gstPercentage),
      gstAmount: num(row.gstAmount),
      cgstRate: num(row.cgstRate),
      cgstAmount: num(row.cgstAmount),
      sgstRate: num(row.sgstRate),
      sgstAmount: num(row.sgstAmount),
      igstRate: num(row.igstRate),
      igstAmount: num(row.igstAmount),
      cessRate: num(row.cessRate),
      cessAmount: num(row.cessAmount),

      grossAmount: num(row.grossAmount),
      taxableAmount: num(row.taxableAmount),
      netAmount: num(row.netAmount),

      grandTotal: num(this.totalInvoiceAmount),

      billingMode: this.billMode,
      cashAmount: num(this.cashAmount),
      cardAmount: num(this.cardAmount),
      upiAmount: num(this.upiAmount),
      paidAmount: num(this.getPaidAmount()),
      balanceAmount: num(this.getBalanceAmount()),

      status: 'ACTIVE',
      remarks: row.remarks ?? '',
      createdBy: this.loggedInUser,
      updatedBy: this.loggedInUser,

      // TOTALS
      totalSaleRate: cleanedRows.reduce((s, r) => s + num(r.saleRate), 0),
      totalDiscountAmount: num(this.totalDiscAmount),
      totalCGSTAmount: cleanedRows.reduce((s, r) => s + num(r.cgstAmount), 0),
      totalSGSTAmount: cleanedRows.reduce((s, r) => s + num(r.sgstAmount), 0),
      totalIGSTAmount: cleanedRows.reduce((s, r) => s + num(r.igstAmount), 0),
      totalCESSAmount: cleanedRows.reduce((s, r) => s + num(r.cessAmount), 0),

      totalGrossAmount: num(this.totalGrossAmount),
      totalDiscAmount: num(this.totalDiscAmount),
      totalTaxableAmount: num(this.totalTaxableAmount),
      totalGstAmount: num(this.totalGstAmount),
      totalNetAmount: num(this.totalNetAmount),
      totalInvoiceAmount: num(this.totalInvoiceAmount),
      totalPaidAmount: num(this.totalPaidAmount),
      totalBalanceAmount: num(this.totalBalanceAmount),
      totalRoundOff: num(this.totalRoundOff),

      totalQuantity: cleanedRows.reduce((s, r) => s + num(r.quantity), 0),
    }));

    console.log(' FINAL PAYLOAD SENT TO API:', payload);

    this.salesservice.saveSalesEntry(payload).subscribe({
      next: (res) => {
        console.log(' SERVER RESPONSE:', res);
        if (res.success) {
          const invoiceNo = res.data.lastInvoiceNumber;

          this.swall
            .confirm(
              'Invoice Saved!',
              `Invoice No: ${invoiceNo}\nDo you want to view the invoice?`
            )
            .then((result: any) => {
              if (result.isConfirmed) {
                const url = this.router.serializeUrl(
                  this.router.createUrlTree(['/Sales/SalesView', invoiceNo])
                );
                window.open(url, '_blank');
              }

              this.nextBill();
            });
        }
      },
      error: (err) => {
        console.error(' SAVE ERROR:', err);
        console.table(err.error?.errors || {});
        this.swall.error('Server Error', 'Could not save invoice.');
      },
    });
  }

  updatePaidAndBalance() {
    const paid =
      Number(this.cashAmount || 0) +
      Number(this.cardAmount || 0) +
      Number(this.upiAmount || 0);

    this.totalPaidAmount = paid;
    this.totalBalanceAmount = Number(this.totalInvoiceAmount || 0) - paid;

    // update active bill tab totals also
    if (this.billTabs && this.activeBillIndex != null) {
      const tab = this.billTabs[this.activeBillIndex];
      tab.totals.totalPaidAmount = this.totalPaidAmount;
      tab.totals.totalBalanceAmount = this.totalBalanceAmount;
    }
  }
}
