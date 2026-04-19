import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';

import { AuthService } from '../../../authentication/auth-service.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { MasterService } from '../../../services/master.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { SmallGridComponent } from '../../components/small-grid/small-grid.component';
import { InputDataGridComponent } from '../../components/input-data-grid/input-data-grid.component';
import { IconsModule } from '../../../shared/icons.module';

import { Company, Branch } from '../../models/common-models/companyMaster';
import {
  Category, SubCategory, Brand, Unit,
  HSN, Tax, Cess, Supplier, PaymentMode,
  Status, Customer,
} from '../../models/common-models/master-models/master';

import { SalesService } from '../../sales/sales.service';
import {
  ProductStockPrice,
  BusinessType,
  GstTransactionType,
} from '../../sales/models/sales-model';

import {
  EstimationService,
  EstimationEntryMaster,
  EstimationRequest,
  EstimationInvoiceTotal,
} from '../../../services/estimation.service';

// ─── UI-only interfaces ───────────────────────────────────

export interface EstimationTab {
  id: number;
  name: string;
  estimationNumber: string;
  estimationDate: string;
  accountingYear: string;
  selectedCustomerId: number | null;
  customerGSTIN: string;
  items: EstimationEntryMaster[];
  totals: EstimationTotals;
}

export interface EstimationTotals {
  totalGrossAmount: number;
  totalDiscAmount: number;
  totalTaxableAmount: number;
  totalGstAmount: number;
  totalCessAmount: number;
  totalNetAmount: number;
  totalInvoiceAmount: number;
  totalRoundOff: number;
}

// ─── Component ────────────────────────────────────────────

@Component({
  selector: 'app-estimation-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SmallGridComponent,
    InputDataGridComponent,
    IconsModule,
  ],
  templateUrl: './estimation-entry.component.html',
  styleUrl: './estimation-entry.component.css',
})
export class EstimationEntryComponent implements OnInit {
  @ViewChild(InputDataGridComponent) grid!: InputDataGridComponent;
  @ViewChild(SmallGridComponent) smallGrid!: SmallGridComponent;

  // ── Auth / Context ──
  loggedInUser = 'SYSTEM';
  selectedCompanyId: number | null = null;
  selectedBranchId: number | null = null;
  accountingYear = '';

  // ── Dropdowns ──
  companies: Company[] = [];
  branches: Branch[] = [];
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  brands: Brand[] = [];
  units: Unit[] = [];
  hsnCodes: HSN[] = [];
  taxes: Tax[] = [];
  cesses: Cess[] = [];
  suppliers: Supplier[] = [];
  statuses: Status[] = [];
  paymentModes: PaymentMode[] = [];
  customers: Customer[] = [];

  // ── Products ──
  products: ProductStockPrice[] = [];
  filteredProducts: ProductStockPrice[] = [];
  smallGridData: ProductStockPrice[] = [];
  activeProductRow: number | null = null;
  smallGridVisible = false;
  selectedCategoryId: number | null = null;
  posSearchText = '';

  // ── Business / GST ──
  businessTypes: BusinessType[] = [];
  selectedBusinessType: BusinessType | null = null;
  gstTypesList: GstTransactionType[] = [];
  selectedGstType: GstTransactionType | null = null;

  // ── Header ──
  estimationNumber = '';
  selectedEstimationDate = '';
  selectedCustomerId: number | null = null;
  customerGSTIN = '';
  selectedCustomerName = 'Walk-in Customer';

  // ── Items ──
  estimationItems: EstimationEntryMaster[] = [];

  // ── Totals ──
  totalGrossAmount   = 0;
  totalDiscAmount    = 0;
  totalTaxableAmount = 0;
  totalGstAmount     = 0;
  totalCessAmount    = 0;
  totalNetAmount     = 0;
  totalInvoiceAmount = 0;
  totalRoundOff      = 0;

  // ── Tabs ──
  estimationTabs: EstimationTab[] = [];
  activeTabIndex = 0;

  // ── Mode ──
  billMode: 'POS' | 'HOTKEY' = 'HOTKEY';

  // ── Grid Columns ──
  columns = [
    { field: 'sno',                header: 'S.NO',    type: 'text',   visible: true,  readOnly: true },
    { field: 'productCode',        header: 'CODE',    type: 'text',   visible: true,  readOnly: true },
    { field: 'productName',        header: 'ITEM',    type: 'text',   visible: true,  openSmallGrid: true },
    { field: 'saleRate',           header: 'PRICE',   type: 'number', visible: true,  readOnly: true },
    { field: 'quantity',           header: 'QTY',     type: 'number', visible: true,  requiredForNextRow: true },
    { field: 'gstPercentage',      header: 'GST %',   type: 'number', visible: true,  readOnly: true },
    { field: 'gstAmount',          header: 'GST ₹',   type: 'number', visible: true,  readOnly: true },
    { field: 'discountPercentage', header: 'DISC%',   type: 'number', visible: true },
    { field: 'discountAmount',     header: 'DISC ₹',  type: 'number', visible: true },
    { field: 'netAmount',          header: 'NET AMT', type: 'number', visible: true,  readOnly: true },
    { field: 'remarks',            header: 'Remarks', type: 'text',   visible: false },
    // hidden
    { field: 'productID',    header: 'Product ID',  type: 'number', visible: false },
    { field: 'brandID',      header: 'Brand ID',    type: 'number', visible: false },
    { field: 'categoryID',   header: 'Category ID', type: 'number', visible: false },
    { field: 'hSNID',        header: 'HSN ID',      type: 'number', visible: false },
    { field: 'unitID',       header: 'Unit ID',     type: 'number', visible: false },
    { field: 'cGSTRate',     header: 'CGST %',      type: 'number', visible: false },
    { field: 'sGSTRate',     header: 'SGST %',      type: 'number', visible: false },
    { field: 'grossAmount',  header: 'Gross Amt',   type: 'number', visible: false },
    { field: 'taxableAmount',header: 'Taxable Amt', type: 'number', visible: false },
  ];

  productGridColumns = [
    { field: 'productCode',    header: 'Product Code',    visible: true },
    { field: 'productName',    header: 'Product Name',    visible: true },
    { field: 'retailPrice',    header: 'Retail Price',    visible: false },
    { field: 'wholesalePrice', header: 'Wholesale Price', visible: false },
    { field: 'currentStock',   header: 'Stock',           visible: true },
  ];

  constructor(
    private estimationService: EstimationService,
    private salesService: SalesService,
    private masterService: MasterService,
    private commonService: CommonserviceService,
    private authService: AuthService,
    private swall: SweetAlertService,
    private router: Router,
    private location: Location,
    private cd: ChangeDetectorRef
  ) {}

  // ─── Lifecycle ────────────────────────────────────────────

  ngOnInit(): void {
    this.loggedInUser           = this.authService.userName ?? 'SYSTEM';
    this.selectedCompanyId      = this.authService.companyId ?? null;
    this.selectedEstimationDate = this.getTodayDate();

    this.applyDeviceMode();
    this.loadDropdowns();
    this.loadBusinessTypes();
    this.loadGstTypes();
    this.loadCustomers();

    setTimeout(() => this.nextTab(), 100);
  }

  // ─── Utilities ────────────────────────────────────────────

  getTodayDate(): string {
    return new Date().toISOString().substring(0, 10);
  }

  goBack(): void {
    this.location.back();
  }

  private applyDeviceMode(): void {
    this.billMode = window.innerWidth <= 768 ? 'POS' : 'HOTKEY';
  }

  get visibleColumns() {
    return this.columns.filter((c) => c.visible);
  }

  // ─── Dropdown Loaders ─────────────────────────────────────

  loadDropdowns(): void {
    const companyId = this.authService.companyId;

    forkJoin({
      companies:     this.commonService.getCompanies(),
      branches:      companyId
                       ? this.commonService.getBranchesByCompany(companyId)
                       : of([]),
      categories:    this.masterService.getCategories(),
      subCategories: this.masterService.getSubCategories(),
      brands:        this.masterService.getBrands(),
      units:         this.masterService.getUnits(),
      hsnCodes:      this.masterService.getHSNCodes(),
      taxes:         this.masterService.getTaxes(),
      cesses:        this.masterService.getCesses(),
      suppliers:     this.masterService.getSuppliers(),
      statuses:      this.masterService.getStatuses(),
      paymentModes:  this.masterService.getPaymentModes(),
    }).subscribe((res) => {
      this.companies     = res.companies     ?? [];
      this.branches      = res.branches      ?? [];
      this.categories    = res.categories    ?? [];
      this.subCategories = res.subCategories ?? [];
      this.brands        = res.brands        ?? [];
      this.units         = res.units         ?? [];
      this.hsnCodes      = res.hsnCodes      ?? [];
      this.taxes         = res.taxes         ?? [];
      this.cesses        = res.cesses        ?? [];
      this.suppliers     = res.suppliers     ?? [];
      this.statuses      = res.statuses      ?? [];
      this.paymentModes  = res.paymentModes  ?? [];

      const comp = this.companies.find(
        (c) => c.companyID === this.authService.companyId
      );
      this.accountingYear = comp?.accountingYear ?? '';
    });
  }

  loadBusinessTypes(): void {
    this.salesService.getAllBusinessTypes().subscribe((res) => {
      if (res?.success) {
        this.businessTypes = res.data;
        const def = this.businessTypes.find((x) => x.businessTypeID === 1);
        if (def) {
          this.selectedBusinessType = def;
          this.loadProducts();
        }
      }
    });
  }

  loadGstTypes(): void {
    this.salesService.getAllGstTypes().subscribe((res) => {
      if (res?.success) {
        this.gstTypesList = res.data;
        const def = this.gstTypesList.find((x) => x.gstTransactionTypeID === 1);
        if (def) this.selectedGstType = def;
      }
    });
  }

  loadCustomers(): void {
    this.masterService.getCustomers().subscribe({
      next:  (res) => (this.customers = res ?? []),
      error: ()    => this.swall.error('Error', 'Failed to load customers!'),
    });
  }

  loadProducts(): void {
    if (!this.selectedCompanyId) return;

    this.salesService
      .getSalesProducts(
        this.selectedCompanyId,
        this.selectedBranchId   ?? undefined,
        this.selectedBusinessType?.businessTypeID ?? undefined
      )
      .subscribe((res) => {
        if (res?.success) {
          this.products = (res.data ?? []).map((p) => ({
            ...p,
            saleRate:
              this.selectedBusinessType?.businessTypeID === 2
                ? p.wholesalePrice
                : p.retailPrice,
          }));
          this.filteredProducts = [...this.products];
          this.smallGridData    = [...this.products];
        } else {
          this.products = this.filteredProducts = this.smallGridData = [];
        }
      });
  }

  // ─── Company / Customer ───────────────────────────────────

  onCompanyChange(companyId: number): void {
    this.selectedBranchId = null;
    this.branches = [];
    this.commonService
      .getBranchesByCompany(companyId)
      .subscribe((res: Branch[]) => (this.branches = res));
  }

  onCustomerChange(): void {
    const c = this.customers.find((c) => c.customerID === this.selectedCustomerId);
    this.selectedCustomerName = c?.customerName ?? 'Walk-in Customer';
  }

  // ─── Business / GST ──────────────────────────────────────

  selectBusinessType(typeId: number): void {
    this.selectedBusinessType =
      this.businessTypes.find((x) => x.businessTypeID === typeId) ?? null;
    this.loadProducts();
    this.adjustColumnsForBusinessType();
  }

  selectGstType(typeId: number): void {
    this.selectedGstType =
      this.gstTypesList.find((x) => x.gstTransactionTypeID === typeId) ?? null;
  }

  adjustColumnsForBusinessType(): void {
    const retail    = this.productGridColumns.find((c) => c.field === 'retailPrice');
    const wholesale = this.productGridColumns.find((c) => c.field === 'wholesalePrice');
    if (!retail || !wholesale) return;

    if (this.selectedBusinessType?.businessTypeID === 1) {
      retail.visible = true;  wholesale.visible = false;
    } else if (this.selectedBusinessType?.businessTypeID === 2) {
      retail.visible = false; wholesale.visible = true;
    } else {
      retail.visible = true;  wholesale.visible = true;
    }
    this.productGridColumns = [...this.productGridColumns];
  }

  // ─── POS / Product ───────────────────────────────────────

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.filteredProducts =
      categoryId === null
        ? [...this.products]
        : this.products.filter((p) => p.categoryID === categoryId);
  }

  applyPosSearch(): void {
    const text = this.posSearchText.toLowerCase().trim();
    this.filteredProducts = this.products.filter(
      (p) =>
        p.productName.toLowerCase().includes(text) ||
        p.productCode?.toLowerCase().includes(text)
    );
  }

  addProductToBill(product: ProductStockPrice): void {
    if (!product) return;

    const existingIndex = this.estimationItems.findIndex(
      (r) => r.productCode === product.productCode
    );

    if (existingIndex !== -1) {
      const row = this.estimationItems[existingIndex];
      row.quantity = Number(row.quantity || 0) + 1;
      this.calculateRowTotals(row, 'quantity');
      this.calculateOverallTotals();
      setTimeout(() => this.grid?.focusCell(existingIndex, 4), 50);
      return;
    }

    this.addNewRow();
    this.activeProductRow = this.estimationItems.length - 1;
    this.onProductSelected(product);
  }

  getProductQty(product: ProductStockPrice): number {
    const row = this.estimationItems.find(
      (r) => r.productCode === product.productCode
    );
    return row ? Number(row.quantity || 0) : 0;
  }

  increaseQty(product: ProductStockPrice, event: Event): void {
    event.stopPropagation();
    this.addProductToBill(product);
  }

  decreaseQty(product: ProductStockPrice, event: Event): void {
    event.stopPropagation();
    const index = this.estimationItems.findIndex(
      (r) => r.productCode === product.productCode
    );
    if (index === -1) return;

    const row = this.estimationItems[index];
    if (Number(row.quantity) > 1) {
      row.quantity = Number(row.quantity) - 1;
      this.calculateRowTotals(row, 'quantity');
    } else {
      this.estimationItems.splice(index, 1);
    }
    this.calculateOverallTotals();
  }

  showSmallGrid(rowIndex: number): void {
    this.activeProductRow = rowIndex;
    this.adjustColumnsForBusinessType();
    setTimeout(() => {
      this.smallGridData    = [...this.products];
      this.smallGridVisible = true;
    });
  }

  onProductSelected(product: ProductStockPrice): void {
    if (!product) return;

    // cast to any to handle any API casing variant
    const p = product as any;

    const existingIndex = this.estimationItems.findIndex(
      (r) => r.productCode === product.productCode
    );

    if (existingIndex !== -1) {
      const row = this.estimationItems[existingIndex];
      row.quantity = Number(row.quantity || 0) + 1;
      this.calculateRowTotals(row, 'quantity');
      this.calculateOverallTotals();
      this.smallGridVisible = false;
      setTimeout(() => this.grid.focusCell(existingIndex, 2), 50);
      return;
    }

    const row = this.estimationItems[this.activeProductRow!];
    if (!row) return;

    // ── Core ──
    row.productID      = p.productID      ?? p.productId      ?? null;
    row.productCode    = p.productCode    ?? '';
    row.productName    = p.productName    ?? '';
    row.barcode        = p.barcode        ?? '';

    // ── Pricing ──
    row.retailPrice    = p.retailPrice    ?? 0;
    row.wholesalePrice = p.wholesalePrice ?? 0;
    row.mRP            = p.mrp ?? p.mRP   ?? null;
    row.saleRate       =
      this.selectedBusinessType?.businessTypeID === 2
        ? (p.wholesalePrice ?? 0)
        : (p.retailPrice    ?? 0);

    // ── GST ──
    row.gstPercentage  = p.gstPercentage  ?? p.gstPercent ?? 0;

    // ── Classification — handle all casing variants ──
    row.brandID        = p.brandID        ?? p.brandId        ?? null;
    row.categoryID     = p.categoryID     ?? p.categoryId     ?? null;
    row.subCategoryID  = p.subCategoryID  ?? p.subCategoryId  ?? null;
    row.hSNID          = p.hsnid ?? p.hSNID ?? p.hsnID ?? p.HSNID ?? null;
    row.unitID         = p.unitID         ?? p.unitId         ?? null;

    // ── Quantity ──
    row.quantity = 1;

    this.calculateRowTotals(row, 'quantity');
    this.calculateOverallTotals();
    this.smallGridVisible = false;
    setTimeout(() => this.grid.focusCell(this.activeProductRow!, 4), 50);
  }

  // ─── Row Management ───────────────────────────────────────

  private newRow(): EstimationEntryMaster {
    const now = new Date().toISOString();
    return {
      invoiceID:          null,            // ✅ null — never send 0
      invoiceNumber:      this.estimationNumber        ?? '',
      invoiceDate:        this.selectedEstimationDate  ?? null,
      companyID:          this.selectedCompanyId       ?? 0,
      companyName:        '',
      branchID:           this.selectedBranchId        ?? 0,
      branchName:         '',
      customerID:         this.selectedCustomerId,
      customerName:       '',
      customerContact:    '',
      customerGSTIN:      this.customerGSTIN           ?? '',
      customerState:      '',
      companyState:       '',
      accountingYear:     this.accountingYear          ?? '',
      billingType:        this.selectedBusinessType?.businessTypeName ?? '',
      isGSTApplicable:    true,
      gSTType:            this.selectedGstType?.transactionTypeName  ?? '',
      productID:          null,
      barcode:            '',
      productCode:        '',
      productName:        '',
      brandID:            null,
      categoryID:         null,
      subCategoryID:      null,
      hSNID:              null,
      unitID:             null,
      secondaryUnitID:    null,
      color:              '',
      size:               '',
      weight:             null,
      volume:             null,
      material:           '',
      finishType:         '',
      shadeCode:          '',
      capacity:           '',
      modelNumber:        '',
      expiryDate:         null,
      manufacturingDate:  null,
      quantity:           0,
      productRate:        0,
      saleRate:           0,
      retailPrice:        0,
      wholesalePrice:     0,
      mRP:                null,
      discountPercentage: 0,
      discountAmount:     0,
      inclusiveAmount:    null,
      exclusiveAmount:    null,
      gstPercentage:      0,
      gstAmount:          0,
      cGSTRate:           0,
      cGSTAmount:         0,
      sGSTRate:           0,
      sGSTAmount:         0,
      iGSTRate:           0,
      iGSTAmount:         0,
      cESSRate:           0,
      cESSAmount:         0,
      grossAmount:        0,
      customerDiscount:   0,
      netAmount:          0,
      taxableAmount:      0,
      grandTotal:         0,
      billingMode:        'ESTIMATION',
      cashAmount:         null,
      cardAmount:         null,
      uPIAmount:          null,
      advanceAmount:      null,
      paidAmount:         null,
      balanceAmount:      null,
      status:             'ACTIVE',
      isActive:           true,
      isService:          false,
      remarks:            '',
      createdBy:          this.loggedInUser,
      createdDate:        now,
      updatedBy:          this.loggedInUser,
      updatedDate:        now,
    };
  }

  addNewRow(): void {
    const row = this.newRow();
    (row as any)['sno'] = this.estimationItems.length + 1;
    this.estimationItems.push(row);
    this.updateSerialNumbers();
    setTimeout(() => {
      this.grid?.focusCell(this.estimationItems.length - 1, 2);
    }, 50);
  }

  updateSerialNumbers(): void {
    this.estimationItems.forEach((row, i) => {
      (row as any)['sno'] = i + 1;
    });
  }

  onGridRowAdded(_row: any): void {
    this.updateSerialNumbers();
  }

  onGridNumberChanged(event: any): void {
    const { rowIndex, field } = event;
    const row = this.estimationItems[rowIndex];
    if (!row) return;
    this.calculateRowTotals(row, field);
    this.calculateOverallTotals();
  }

  validateRowForNext(row: EstimationEntryMaster): boolean {
    if (!row)                                            return false;
    if (!row.productCode || !row.productName)            return false;
    if (!row.saleRate  || Number(row.saleRate)  <= 0)    return false;
    if (!row.quantity  || Number(row.quantity)  <= 0)    return false;
    if (!row.netAmount || Number(row.netAmount) <= 0)    return false;
    return true;
  }

  hasValidRows(): boolean {
    return this.estimationItems.some(
      (r) =>
        r.productCode      &&
        Number(r.quantity) > 0 &&
        Number(r.saleRate) > 0 &&
        Number(r.netAmount)> 0
    );
  }

  // ─── Calculations ─────────────────────────────────────────

  calculateRowTotals(row: EstimationEntryMaster, changedField: string): void {
    const rate = Number(row.saleRate      || 0);
    const qty  = Number(row.quantity      || 0);
    const gst  = Number(row.gstPercentage || 0);
    let discPerc = Number(row.discountPercentage || 0);
    let discAmt  = Number(row.discountAmount     || 0);

    const base = rate * qty;

    if (changedField === 'discountPercentage') {
      discAmt = (base * discPerc) / 100;
      row.discountAmount = discAmt;
    }
    if (changedField === 'discountAmount') {
      discPerc = base > 0 ? (discAmt / base) * 100 : 0;
      row.discountPercentage = discPerc;
    }

    const taxable   = base - discAmt;
    const gstAmount = (taxable * gst) / 100;

    row.grossAmount   = base;
    row.taxableAmount = taxable;
    row.gstAmount     = gstAmount;
    row.cGSTRate      = gst / 2;
    row.sGSTRate      = gst / 2;
    row.cGSTAmount    = gstAmount / 2;
    row.sGSTAmount    = gstAmount / 2;
    row.netAmount     = taxable + gstAmount;
    row.productRate   = rate;
    row.grandTotal    = row.netAmount;
  }

  calculateOverallTotals(): void {
    this.totalGrossAmount   = 0;
    this.totalDiscAmount    = 0;
    this.totalTaxableAmount = 0;
    this.totalGstAmount     = 0;
    this.totalCessAmount    = 0;
    this.totalNetAmount     = 0;

    for (const row of this.estimationItems) {
      this.totalGrossAmount   += Number(row.grossAmount    || 0);
      this.totalDiscAmount    += Number(row.discountAmount || 0);
      this.totalTaxableAmount += Number(row.taxableAmount  || 0);
      this.totalGstAmount     += Number(row.gstAmount      || 0);
      this.totalCessAmount    += Number(row.cESSAmount     || 0);
      this.totalNetAmount     += Number(row.netAmount      || 0);
    }

    this.totalInvoiceAmount = this.totalNetAmount;

    if (!this.estimationTabs.length) return;
    const tab = this.estimationTabs[this.activeTabIndex];
    if (!tab) return;

    tab.totals = {
      totalGrossAmount:   this.totalGrossAmount,
      totalDiscAmount:    this.totalDiscAmount,
      totalTaxableAmount: this.totalTaxableAmount,
      totalGstAmount:     this.totalGstAmount,
      totalCessAmount:    this.totalCessAmount,
      totalNetAmount:     this.totalNetAmount,
      totalInvoiceAmount: this.totalInvoiceAmount,
      totalRoundOff:      this.totalRoundOff,
    };
  }

  // ─── Invoice Number ───────────────────────────────────────

  private loadNextEstimationNumber(): Promise<string> {
    return new Promise((resolve) => {
      if (!this.selectedCompanyId) { resolve('EST-0001'); return; }

      this.estimationService
        .getNextEstimationNumber(
          this.selectedCompanyId,
          this.selectedBranchId   // ✅ int | null — matches service & controller
        )
        .subscribe({
          next:  (res) => resolve(res.data ?? 'EST-0001'),
          error: ()    => resolve('EST-0001'),
        });
    });
  }

  // ─── Tab Management ───────────────────────────────────────

  async nextTab(): Promise<void> {
    const nextNumber = await this.loadNextEstimationNumber();
    const newIndex   = this.estimationTabs.length + 1;

    const newTab: EstimationTab = {
      id:                 newIndex,
      name:               `Est ${newIndex}`,
      estimationNumber:   nextNumber,
      estimationDate:     this.getTodayDate(),
      accountingYear:     this.accountingYear,
      selectedCustomerId: null,
      customerGSTIN:      '',
      items: [],
      totals: {
        totalGrossAmount:   0,
        totalDiscAmount:    0,
        totalTaxableAmount: 0,
        totalGstAmount:     0,
        totalCessAmount:    0,
        totalNetAmount:     0,
        totalInvoiceAmount: 0,
        totalRoundOff:      0,
      },
    };

    this.estimationTabs.push(newTab);
    this.activeTabIndex = this.estimationTabs.length - 1;
    this.loadTabToScreen(this.activeTabIndex);
    this.refreshTabNames();
  }

  switchTab(i: number): void {
    this.saveScreenToTab();
    this.activeTabIndex = i;
    this.loadTabToScreen(i);
  }

  removeTab(index: number, event: Event): void {
    event.stopPropagation();
    this.estimationTabs.splice(index, 1);

    if (this.estimationTabs.length === 0) { this.nextTab(); return; }

    if (index === this.activeTabIndex) {
      this.activeTabIndex = Math.min(index, this.estimationTabs.length - 1);
      this.loadTabToScreen(this.activeTabIndex);
      return;
    }

    if (index < this.activeTabIndex) this.activeTabIndex--;
  }

  private refreshTabNames(): void {
    this.estimationTabs.forEach((tab, i) => {
      tab.id   = i + 1;
      tab.name = `Est ${i + 1}`;
    });
  }

  loadTabToScreen(index: number): void {
    const tab = this.estimationTabs[index];
    if (!tab) return;

    this.estimationNumber       = tab.estimationNumber;
    this.selectedEstimationDate = tab.estimationDate;
    this.accountingYear         = tab.accountingYear;
    this.selectedCustomerId     = tab.selectedCustomerId;
    this.customerGSTIN          = tab.customerGSTIN;
    this.estimationItems        = [...tab.items];

    const t = tab.totals;
    this.totalGrossAmount   = t.totalGrossAmount;
    this.totalDiscAmount    = t.totalDiscAmount;
    this.totalTaxableAmount = t.totalTaxableAmount;
    this.totalGstAmount     = t.totalGstAmount;
    this.totalCessAmount    = t.totalCessAmount;
    this.totalNetAmount     = t.totalNetAmount;
    this.totalInvoiceAmount = t.totalInvoiceAmount;
    this.totalRoundOff      = t.totalRoundOff;
  }

  saveScreenToTab(): void {
    const tab = this.estimationTabs[this.activeTabIndex];
    if (!tab) return;

    tab.estimationNumber   = this.estimationNumber;
    tab.estimationDate     = this.selectedEstimationDate;
    tab.accountingYear     = this.accountingYear;
    tab.selectedCustomerId = this.selectedCustomerId;
    tab.customerGSTIN      = this.customerGSTIN;
    tab.items              = [...this.estimationItems];

    tab.totals = {
      totalGrossAmount:   this.totalGrossAmount,
      totalDiscAmount:    this.totalDiscAmount,
      totalTaxableAmount: this.totalTaxableAmount,
      totalGstAmount:     this.totalGstAmount,
      totalCessAmount:    this.totalCessAmount,
      totalNetAmount:     this.totalNetAmount,
      totalInvoiceAmount: this.totalInvoiceAmount,
      totalRoundOff:      this.totalRoundOff,
    };
  }

  // ─── Validation ───────────────────────────────────────────

  validateRequired(label: string, value: any): boolean {
    if (value === null || value === undefined || value === '') {
      this.swall.warning('Validation', `${label} is required.`);
      return false;
    }
    return true;
  }

  validateHeaderFields(): boolean {
    if (!this.validateRequired('Company',       this.selectedCompanyId))                      return false;
    if (!this.validateRequired('Business Type', this.selectedBusinessType?.businessTypeID))   return false;
    if (!this.validateRequired('GST Type',      this.selectedGstType?.gstTransactionTypeID)) return false;
    return true;
  }

  // ─── Save ─────────────────────────────────────────────────

  saveEstimation(): void {
    this.saveScreenToTab();
    if (!this.validateHeaderFields()) return;

    const cleanedRows = this.estimationItems.filter(
      (r) =>
        r.productCode?.trim() &&
        r.productName?.trim() &&
        Number(r.quantity)  > 0 &&
        Number(r.saleRate)  > 0 &&
        Number(r.netAmount) > 0
    );

    if (cleanedRows.length === 0) {
      this.swall.warning('Validation Failed', 'Please add at least one valid product.');
      return;
    }

    const num = (v: any): number =>
      v === null || v === undefined || v === '' || isNaN(Number(v)) ? 0 : Number(v);

    const company  = this.companies.find( (c) => c.companyID  === this.selectedCompanyId)  ?? null;
    const branch   = this.branches.find(  (b) => b.branchID   === this.selectedBranchId)   ?? null;
    const customer = this.customers.find( (c) => c.customerID === this.selectedCustomerId) ?? null;
    const now      = new Date().toISOString();

    // ── Header ────────────────────────────────────────────────
    const header: EstimationInvoiceTotal = {
      invoiceID:           null,           // ✅ null — DB generates identity
      invoiceNumber:       this.estimationNumber,
      invoiceDate:         new Date(this.selectedEstimationDate).toISOString(),
      companyID:           this.selectedCompanyId!,
      companyName:         company?.companyName  ?? '',
      branchID:            this.selectedBranchId ?? 0,
      branchName:          branch?.branchName    ?? '',
      customerID:          this.selectedCustomerId,
      customerName:        customer?.customerName ?? 'Walk-in Customer',
      customerContact:     '',
      customerGSTIN:       this.customerGSTIN    ?? '',
      customerState:       '',
      companyState:        company?.state         ?? '',
      accountingYear:      this.accountingYear,
      billingType:         this.selectedBusinessType?.businessTypeName ?? '',
      isGSTApplicable:     true,
      gSTType:             this.selectedGstType?.transactionTypeName  ?? '',
      totalQuantity:       cleanedRows.reduce((s, r) => s + num(r.quantity),   0),
      totalSaleRate:       cleanedRows.reduce((s, r) => s + num(r.saleRate),   0),
      totalDiscountAmount: num(this.totalDiscAmount),
      totalCGSTAmount:     cleanedRows.reduce((s, r) => s + num(r.cGSTAmount), 0),
      totalSGSTAmount:     cleanedRows.reduce((s, r) => s + num(r.sGSTAmount), 0),
      totalIGSTAmount:     cleanedRows.reduce((s, r) => s + num(r.iGSTAmount), 0),
      totalCESSAmount:     cleanedRows.reduce((s, r) => s + num(r.cESSAmount), 0),
      totalGrossAmount:    num(this.totalGrossAmount),
      totalTaxableAmount:  num(this.totalTaxableAmount),
      grandTotal:          num(this.totalInvoiceAmount),
      billingMode:         'ESTIMATION',
      cashAmount:          null,
      cardAmount:          null,
      uPIAmount:           null,
      advanceAmount:       null,
      paidAmount:          null,
      balanceAmount:       null,
      status:              'ACTIVE',
      isActive:            true,
      isService:           false,
      remarks:             '',
      createdBy:           this.loggedInUser,
      createdDate:         now,
      updatedBy:           this.loggedInUser,
      updatedDate:         now,
      stockMode:           'WARN_ONLY',
    };

    // ── Items ─────────────────────────────────────────────────
    const items: EstimationEntryMaster[] = cleanedRows.map((row) => ({
      invoiceID:          null,            // ✅ null — set by repo after header insert
      invoiceNumber:      this.estimationNumber,
      invoiceDate:        new Date(this.selectedEstimationDate).toISOString(),
      companyID:          this.selectedCompanyId!,
      companyName:        company?.companyName  ?? '',
      branchID:           this.selectedBranchId ?? 0,
      branchName:         branch?.branchName    ?? '',
      customerID:         this.selectedCustomerId,
      customerName:       customer?.customerName ?? 'Walk-in Customer',
      customerContact:    '',
      customerGSTIN:      this.customerGSTIN    ?? '',
      customerState:      '',
      companyState:       company?.state         ?? '',
      accountingYear:     this.accountingYear,
      billingType:        this.selectedBusinessType?.businessTypeName ?? '',
      isGSTApplicable:    true,
      gSTType:            this.selectedGstType?.transactionTypeName  ?? '',
      productID:          num(row.productID),
      barcode:            row.barcode           ?? '',
      productCode:        row.productCode       ?? '',
      productName:        row.productName       ?? '',
      brandID:            row.brandID           ?? null,
      categoryID:         row.categoryID        ?? null,
      subCategoryID:      row.subCategoryID     ?? null,
      hSNID:              row.hSNID             ?? null,
      unitID:             row.unitID            ?? null,
      secondaryUnitID:    row.secondaryUnitID   ?? null,
      color:              '',
      size:               '',
      weight:             null,
      volume:             null,
      material:           '',
      finishType:         '',
      shadeCode:          '',
      capacity:           '',
      modelNumber:        '',
      expiryDate:         null,
      manufacturingDate:  null,
      quantity:           num(row.quantity),
      productRate:        num(row.saleRate),
      saleRate:           num(row.saleRate),
      retailPrice:        num(row.retailPrice),
      wholesalePrice:     num(row.wholesalePrice),
      mRP:                num(row.mRP),
      discountPercentage: num(row.discountPercentage),
      discountAmount:     num(row.discountAmount),
      inclusiveAmount:    null,
      exclusiveAmount:    null,
      gstPercentage:      num(row.gstPercentage),
      gstAmount:          num(row.gstAmount),
      cGSTRate:           num(row.cGSTRate),
      cGSTAmount:         num(row.cGSTAmount),
      sGSTRate:           num(row.sGSTRate),
      sGSTAmount:         num(row.sGSTAmount),
      iGSTRate:           num(row.iGSTRate),
      iGSTAmount:         num(row.iGSTAmount),
      cESSRate:           num(row.cESSRate),
      cESSAmount:         num(row.cESSAmount),
      grossAmount:        num(row.grossAmount),
      customerDiscount:   0,
      netAmount:          num(row.netAmount),
      taxableAmount:      num(row.taxableAmount),
      grandTotal:         num(this.totalInvoiceAmount),
      billingMode:        'ESTIMATION',
      cashAmount:         null,
      cardAmount:         null,
      uPIAmount:          null,
      advanceAmount:      null,
      paidAmount:         null,
      balanceAmount:      null,
      status:             'ACTIVE',
      isActive:           true,
      isService:          false,
      remarks:            row.remarks ?? '',
      createdBy:          this.loggedInUser,
      createdDate:        now,
      updatedBy:          this.loggedInUser,
      updatedDate:        now,
    }));

    const payload: EstimationRequest = { header, items };

    console.group('📦 ESTIMATION SAVE — PRE-FLIGHT');
    console.log('Invoice No:',  this.estimationNumber);
    console.log('Company ID:',  this.selectedCompanyId);
    console.log('Branch ID:',   this.selectedBranchId);
    console.log('Customer ID:', this.selectedCustomerId);
    console.log('Row count:',   items.length);
    console.log('Grand Total:', header.grandTotal);
    console.groupEnd();

    this.estimationService.saveEstimation(payload).subscribe({
      next: (res) => {
        console.group('✅ ESTIMATION SAVE — SUCCESS');
        console.log('success:',       res.success);
        console.log('message:',       res.message);
        console.log('invoiceID:',     res.data?.invoiceID);
        console.log('Full response:', JSON.stringify(res, null, 2));
        console.groupEnd();

        if (res.success) {
          this.swall
            .confirm(
              '✅ Estimation Saved!',
              `Est No: ${this.estimationNumber}\nInvoice ID: ${res.data?.invoiceID}\nCreate another?`
            )
            .then((result: any) => {
              if (result.isConfirmed) this.nextTab();
            });
        } else {
          console.warn('⚠️ Backend returned success: false →', res.message);
          this.swall.error('Save Failed', res.message);
        }
      },

      error: (err) => {
        console.group('🔴 ESTIMATION SAVE — FAILED');
        console.error('HTTP Status:', err.status);
        console.error('Error Title:', err.error?.title);

        const errors = err.error?.errors;
        if (errors && Object.keys(errors).length > 0) {
          console.error('❌ Validation Errors:');
          Object.entries(errors).forEach(([field, messages]) => {
            console.error(`   ${field}:`, messages);
          });
          console.table(errors);
        } else {
          console.error('Raw error:', JSON.stringify(err.error, null, 2));
        }
        console.groupEnd();

        const errorFields = errors
          ? Object.keys(errors).map((f) => `• ${f}`).join('\n')
          : err.message;

        this.swall.error(
          `Server Error (${err.status})`,
          errors
            ? `Validation failed:\n${errorFields}`
            : 'Could not save estimation. Check console for details.'
        );
      },
    });
  }

  // ─── Convert to Sales ─────────────────────────────────────

  convertToSales(estimationId: number): void {
    this.estimationService.convertToSales(estimationId).subscribe({
      next: (res) => {
        if (res.success) {
          this.swall.success('Converted!', `Sales Invoice ID: ${res.data.salesInvoiceID}`);
          const url = this.router.serializeUrl(
            this.router.createUrlTree(['/Sales/SalesView', res.data.salesInvoiceID])
          );
          window.open(url, '_blank');
        } else {
          this.swall.error('Conversion Failed', res.message);
        }
      },
      error: () => this.swall.error('Server Error', 'Conversion failed.'),
    });
  }

  // ─── Keyboard Shortcuts ───────────────────────────────────

  @HostListener('document:keydown', ['$event'])
  handleKeyEvents(event: KeyboardEvent): void {
    if (event.shiftKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.saveEstimation();
      return;
    }

    if (event.shiftKey && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      if (!this.validateHeaderFields()) return;

      if (this.estimationItems.length === 0) {
        this.addNewRow();
        setTimeout(() => this.grid.focusCell(0, 2), 50);
        return;
      }

      const lastRow = this.estimationItems[this.estimationItems.length - 1];
      if (!this.validateRowForNext(lastRow)) {
        this.swall.warning(
          'Validation Required',
          'Complete the current row before adding a new one.'
        );
        return;
      }

      this.addNewRow();
      setTimeout(() => this.grid.focusCell(this.estimationItems.length - 1, 2), 50);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.smallGridVisible) {
        this.smallGridVisible = false;
      } else if (this.activeProductRow !== null) {
        this.showSmallGrid(this.activeProductRow);
      }
    }
  }
}