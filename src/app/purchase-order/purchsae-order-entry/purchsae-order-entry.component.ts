import {
  Component,
  ViewChild,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';

import { InputDataGridComponent } from '../../pages/components/input-data-grid/input-data-grid.component';
import { SmallGridComponent } from '../../pages/components/small-grid/small-grid.component';

import {
  Company,
  Branch,
  ApiResponse,
} from '../../pages/models/common-models/companyMaster';

import {
  Category,
  Status,
  SubCategory,
  Brand,
  Unit,
  HSN,
  Tax,
  Cess,
  Supplier,
  Product,
} from '../../pages/models/common-models/master-models/master';

import { forkJoin, of } from 'rxjs';
import { PurchaseOrderEntry } from '../../purchase-order/models/purchase-models';
import { MasterService } from '../../services/master.service';
import { CommonserviceService } from '../../services/commonservice.service';
import { SweetAlertService } from '../../services/properties/sweet-alert.service';
import { PurchaseOrderServiceService } from '../services/purchase-order-service.service';
import { AuthService } from '../../authentication/auth-service.service';
import { FocusOnKeyDirective } from '../../directives/focus-on-key.directive';
@Component({
  selector: 'app-purchsae-order-entry',
  standalone: true,
  imports: [
    InputDataGridComponent,
    FormsModule,
    CommonModule,
    SmallGridComponent,
    FocusOnKeyDirective,
  ],
  templateUrl: './purchsae-order-entry.component.html',
  styleUrl: './purchsae-order-entry.component.css',
})
export class PurchsaeOrderEntryComponent {
  @ViewChild(InputDataGridComponent) grid!: InputDataGridComponent;
  @ViewChild(SmallGridComponent) smallGrid!: SmallGridComponent;

  // Master Lists
  companies: Company[] = [];
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  brands: Brand[] = [];
  units: Unit[] = [];
  hsnCodes: HSN[] = [];
  taxes: Tax[] = [];
  cesses: Cess[] = [];
  suppliers: Supplier[] = [];
  products: Product[] = [];
  branches: Branch[] = [];
  statuses: Status[] = [];
  purchaseOrderEntries: PurchaseOrderEntry[] = [];
  smallGridData: Product[] = [];

  // Flags
  smallGridVisible = false;

  // Header Selections
  selectedCompanyId: number | null = null;
  selectedBranchId: number | null = null;
  selectedSupplierId: number | null = null;
  selectedPoDate: string | null = null;
  selectedExpDeliveryDate: string | null = null;
  activeProductRow: number | null = null;
  accountingYear: any;
  validationLabel = '';

  // Column Definition
  columns = [
    {
      field: 'sno',
      header: 'S.NO',
      type: 'text',
      visible: true,
      readOnly: true,
    },

    {
      field: 'poNumber',
      header: 'PO NUMBER',
      type: 'text',
      visible: false,
      readOnly: true,
    },

    {
      field: 'poDate',
      header: 'PO DATE',
      type: 'date',
      visible: true,
      readOnly: true,
      requiredForNextRow: true,
    },

    {
      field: 'supplierID',
      header: 'SUPPLIER NAME',
      type: 'select',
      options: 'suppliers',
      optionLabel: 'supplierName',
      optionValue: 'supplierID',
      visible: true,
      readOnly: true,
      requiredForNextRow: true,
    },

    {
      field: 'productCode',
      header: 'PRODUCT CODE',
      type: 'text',
      visible: true,
      readOnly: true,
    },

    {
      field: 'productName',
      header: 'PRODUCT NAME',
      type: 'text',
      visible: true,
      requiredForNextRow: true,
      openSmallGrid: true,
    },

    {
      field: 'productCategoryId',
      header: 'CATEGORY',
      type: 'select',
      options: 'categories',
      optionLabel: 'categoryName',
      optionValue: 'categoryID',
      visible: true,
      readOnly: true,
    },

    {
      field: 'productSubCategory',
      header: 'SUB CATEGORY',
      type: 'select',
      options: 'subCategories',
      optionLabel: 'subCategoryName',
      optionValue: 'subCategoryID',
      visible: true,
      readOnly: true,
    },

    {
      field: 'poRate',
      header: 'RATE',
      type: 'number',
      visible: true,
      requiredForNextRow: true,
    },
    {
      field: 'orderedQty',
      header: 'ORDERED QTY',
      type: 'number',
      visible: true,
      requiredForNextRow: true,
    },

    {
      field: 'approvedQty',
      header: 'APPROVED QTY',
      type: 'number',
      visible: false,
      readOnly: true,
    },

    {
      field: 'totalAmount',
      header: 'TOTAL AMOUNT',
      type: 'number',
      visible: true,
      readOnly: true,
      requiredForNextRow: true,
    },

    {
      field: 'expectedDeliveryDate',
      header: 'EXP DELIVERY',
      type: 'date',
      visible: true,
      readOnly: true,
    },

    {
      field: 'productRemarks',
      header: 'REMARKS',
      type: 'text',
      visible: false,
    },

    {
      field: 'companyID',
      header: 'COMPANY',
      type: 'select',
      options: 'companies',
      optionLabel: 'companyName',
      optionValue: 'companyID',
      visible: false,
      readOnly: true,
    },

    {
      field: 'branchID',
      header: 'BRANCH',
      type: 'select',
      options: 'branches',
      optionLabel: 'branchName',
      optionValue: 'branchID',
      visible: false,
      readOnly: true,
    },

    {
      field: 'statusID',
      header: 'STATUS',
      type: 'select',
      options: 'statuses',
      optionLabel: 'statusName',
      optionValue: 'statusID',
      visible: true,
      readOnly: true,
    },

    {
      field: 'isActive',
      header: 'ACTIVE',
      type: 'boolean',
      visible: true,
      readOnly: true,
    },
    {
      field: 'poRemarks',
      header: 'PO REMARKS',
      type: 'text',
      visible: false,
      readOnly: true,
    },

    {
      field: 'accountingYear',
      header: 'AC YEAR',
      type: 'text',
      visible: false,
      readOnly: true,
    },
  ];

  get visibleColumns() {
    return this.columns.filter((c) => c.visible);
  }

  constructor(
    private masterService: MasterService,
    private commonService: CommonserviceService,
    private swall: SweetAlertService,
    private authService: AuthService,
    private purchaseOrderService: PurchaseOrderServiceService,
    private cd: ChangeDetectorRef
  ) {}

  // INIT
  ngOnInit(): void {
    this.selectedPoDate = new Date().toISOString().split('T')[0];
    this.loadDropdowns();

    const companyId = this.authService.companyId;
    if (companyId) {
      this.selectedCompanyId = companyId;
      this.loadProducts(companyId);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.grid && this.purchaseOrderEntries.length > 0) {
        this.grid.focusCell(0, 4);
      }
    }, 300);
  }

  savePurchaseOrder(): void {
    // 1️⃣ Validate headers
    if (!this.validateHeaderFields()) return;

    // 2️⃣ Ensure rows are present
    if (this.purchaseOrderEntries.length === 0) {
      this.swall.warning('Warning', 'No products to save!');
      return;
    }

    // 3️⃣ Validate rows
    const invalidRows = this.purchaseOrderEntries.filter(
      (r) =>
        !r.productID ||
        !r.productName ||
        !r.productCode ||
        !r.productCategoryId ||
        !r.productSubCategory ||
        !r.poRate ||
        Number(r.poRate) <= 0 ||
        !r.orderedQty ||
        Number(r.orderedQty) <= 0 ||
        !r.totalAmount ||
        Number(r.totalAmount) <= 0
    );

    if (invalidRows.length > 0) {
      this.swall.warning(
        'Validation',
        `Please fill required fields in ${invalidRows.length} row(s)`
      );
      return;
    }

    const userId = this.commonService.getCurrentUserId();
    let success = 0;
    let failed = 0;

    // 4️⃣ Loop through each row and send one request per row
    this.purchaseOrderEntries.forEach((r, idx) => {
      const po: any = {
        POID: 0,
        CompanyID: this.selectedCompanyId,
        BranchID: this.selectedBranchId,
        SupplierID: this.selectedSupplierId,
        PODate: this.selectedPoDate,
        ExpectedDeliveryDate: this.selectedExpDeliveryDate,
        StatusID: 3,
        AccountingYear: this.accountingYear,
        CreatedByUserID: userId,
        UpdatedByUserID: userId,
        CreatedSystemName: 'AngularApp',
        UpdatedSystemName: 'AngularApp',
        IsActive: true,

        // DETAIL LINES WITH PASCAL CASE
        ProductID: r.productID,
        ProductCode: r.productCode,
        ProductName: r.productName,
        ProductCategoryId: r.productCategoryId,
        ProductSubCategory: r.productSubCategory,

        PORate: Number(r.poRate) || 0,
        OrderedQty: Number(r.orderedQty) || 0,
        ApprovedQty: Number(r.approvedQty) || 0,
        TotalAmount: Number(r.totalAmount) || 0,

        ProductRemarks: r.productRemarks || null,
        PoRemarks: r.poRemarks || null,
      };

      // DEBUG — SHOW EXACT JSON SENT TO API
      console.log('ROW SENT TO API:', po);

      this.purchaseOrderService.savePurchaseOrder(po).subscribe({
        next: (res) => {
          console.log('API RESPONSE:', res);
          success++;
        },
        error: (err) => {
          console.error('API ERROR:', err);
          failed++;
        },
        complete: () => {
          // When all rows are processed
          if (success + failed === this.purchaseOrderEntries.length) {
            this.swall.success(
              'Save Completed',
              `${success} row(s) saved successfully, ${failed} failed.`
            );

            // Refresh or clear grid
            if (failed === 0) {
              this.purchaseOrderEntries = [];
            }
          }
        },
      });
    }); // end foreach
  }

  // LOAD MASTER DROPDOWNS
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

        this.applyTopSelectionsToGrid();
      });
  }

  // LOAD PRODUCTS
  loadProducts(companyId: number) {
    this.masterService.getProducts(companyId).subscribe((res) => {
      this.products = res ?? [];
      this.smallGridData = [...this.products];
      this.cd.detectChanges();
    });
  }

  // GRID HEADER UPDATE (TEMPLATE CALLS THIS)
  applyTopSelectionsToGrid() {
    this.purchaseOrderEntries.forEach((row) =>
      this.applyTopSelectionsToRow(row)
    );
  }

  // SMALL GRID COLUMNS (USED IN TEMPLATE)
  productGridColumns = [
    { field: 'productCode', header: 'Product Code' },
    { field: 'productName', header: 'Product Name' },
  ];

  // OPEN PRODUCT SMALL GRID
  showSmallGrid(rowIndex: number) {
    this.activeProductRow = rowIndex;

    this.smallGridData = [...this.products];
    this.smallGridVisible = true;

    this.cd.detectChanges();
  }

  private newProduct(): PurchaseOrderEntry {
    return {
      sno: this.purchaseOrderEntries.length + 1,

      poid: null,

      companyID: this.selectedCompanyId ?? null,
      companyName: null,

      branchID: this.selectedBranchId ?? null,
      branchName: null,

      poNumber: null,

      poDate: this.selectedPoDate ?? null,
      expectedDeliveryDate: this.selectedExpDeliveryDate ?? null,

      supplierID: this.selectedSupplierId ?? null,
      supplierName: null,

      statusID: 3,
      statusName: null,

      totalAmount: 0,
      poRemarks: null,

      productID: null,
      productCode: null,
      productName: null,

      productCategoryId: null,
      productCategoryName: null,

      productSubCategory: null,
      productSubCategoryName: null,

      poRate: 0,
      orderedQty: 0,
      approvedQty: 0,

      productRemarks: null,

      isActive: true,

      createdByUserID: null,
      createdSystemName: 'AngularApp',
      createdAt: new Date(),

      updatedByUserID: null,
      updatedSystemName: 'AngularApp',
      updatedAt: new Date(),

      cancelledDate: null,
      cancelledBy: null,
      cancelReason: null,

      accountingYear: this.accountingYear ?? null,
    };
  }

  // Add New Row
  addNewProduct(): void {
    const newProd = this.newProduct();
    this.purchaseOrderEntries.push(newProd);

    this.updateSerialNumbers();
    this.applyTopSelectionsToRow(newProd);
  }

  updateSerialNumbers() {
    this.purchaseOrderEntries.forEach((row, index) => {
      row.sno = index + 1;
    });
  }

  applyTopSelectionsToRow(row: PurchaseOrderEntry) {
    row.companyID = this.selectedCompanyId ?? null;
    row.branchID = this.selectedBranchId ?? null;
    row.supplierID = this.selectedSupplierId ?? null;
    row.poDate = this.selectedPoDate ?? null;
    row.expectedDeliveryDate = this.selectedExpDeliveryDate ?? null;
    row.accountingYear = this.accountingYear ?? null;
    row.statusID = 3;
    row.isActive = true;
  }

  validateRowForNext(row: any): boolean {
    if (!row) return false;

    if (!row.productName || !row.productCode) return false;

    if (!row.poRate || Number(row.poRate) <= 0) return false;

    if (!row.orderedQty || Number(row.orderedQty) <= 0) return false;

    if (!row.totalAmount || Number(row.totalAmount) <= 0) return false;

    if (!row.productCategoryId) return false;

    if (!row.productSubCategory) return false;

    return true;
  }

  validateRequired(label: string, value: any): boolean {
    if (value === null || value === undefined || value === '') {
      this.swall.warning('Validation', `${label} is required.`);
      return false;
    }
    return true;
  }
  onGridRowAdded(e: any) {
    const newRow = e; // because rowAdded emits only newRow

    this.applyTopSelectionsToRow(newRow);

    this.updateSerialNumbers();
  }

  validateHeaderFields(): boolean {
    if (!this.validateRequired('Company', this.selectedCompanyId)) return false;
    if (!this.validateRequired('Branch', this.selectedBranchId)) return false;
    if (!this.validateRequired('Supplier', this.selectedSupplierId))
      return false;
    if (!this.validateRequired('Accounting Year', this.accountingYear))
      return false;

    return true;
  }

  // PRODUCT SELECTED
  onProductSelected(product: Product) {
    if (this.activeProductRow !== null) {
      const row = this.purchaseOrderEntries[this.activeProductRow];
      row.productID = product.productID;
      row.productCode = product.productCode;
      row.productName = product.productName;
      row.productCategoryId = product.categoryID ?? null;
      row.productSubCategory = product.subCategoryID ?? null;
    }

    this.smallGridVisible = false;
    setTimeout(() => this.grid.focusCell(this.activeProductRow!, 7), 50);
  }

  onGridNumberChanged(event: any) {
    const { rowIndex } = event;
    const row = this.purchaseOrderEntries[rowIndex];

    row.totalAmount = Number(row.poRate || 0) * Number(row.orderedQty || 0);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyEvents(event: KeyboardEvent) {
    // ============================
    // 1) CLOSE SMALL GRID ON ESC
    // ============================
    if (event.key === 'Escape') {
      event.preventDefault();

      // If small grid is open → CLOSE IT
      if (this.smallGridVisible) {
        this.smallGridVisible = false;
      }
      // If small grid is closed → OPEN IT (toggle)
      else {
        if (this.activeProductRow !== null) {
          this.showSmallGrid(this.activeProductRow);
        }
      }

      return;
    }

    // ============================
    // 2) ADD ROW (Shift + N)
    // ============================
    if (event.shiftKey && event.key.toLowerCase() === 'n') {
      event.preventDefault();

      // 1) Validate HEADER before row creation
      if (!this.validateHeaderFields()) {
        return;
      }

      // 2) First row → allow
      if (this.purchaseOrderEntries.length === 0) {
        this.addNewProduct();
        return;
      }

      // 3) Validate last row
      const last = this.purchaseOrderEntries.length - 1;
      const row = this.purchaseOrderEntries[last];

      if (!this.validateRowForNext(row)) {
        this.swall.warning(
          'Validation',
          'Please fill Product, Rate, Qty & Amount before adding new row.'
        );
        return;
      }

      // 4) Add new row
      this.addNewProduct();
    }
  }
}
