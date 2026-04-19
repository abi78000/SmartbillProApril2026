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
import { InputDataGridComponent } from '../../components/input-data-grid/input-data-grid.component';
import { SmallGridComponent } from '../../components/small-grid/small-grid.component';
GroupBoxComponent;
import {
  Company,
  Branch,
  ApiResponse,
} from '../../models/common-models/companyMaster';
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
  PaymentMode,
} from '../../models/common-models/master-models/master';
Router;
import { forkJoin, of } from 'rxjs';
import { MasterService } from '../../../services/master.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { AuthService } from '../../../authentication/auth-service.service';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import {
  PurchaseEntry,
  PurchaseOrderEntry,
} from '../../../purchase-order/models/purchase-models';
import { CommonserviceService } from '../../../services/commonservice.service';
import { GroupBoxComponent } from '../../../shared/group-box/group-box.component';
import { Router } from '@angular/router';
import { PurchaseOrderServiceService } from '../../../purchase-order/services/purchase-order-service.service';
import { SharedModule } from '../../../shared/shared.module';
@Component({
  selector: 'app-purchase-entry',
  imports: [
    InputDataGridComponent,
    FormsModule,
    CommonModule,
    SmallGridComponent,
    FocusOnKeyDirective,
    SharedModule,
  ],
  templateUrl: './purchase-entry.component.html',
  styleUrl: './purchase-entry.component.css',
})
export class PurchaseEntryComponent {
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
  paymentModes: PaymentMode[] = [];
  suppliers: Supplier[] = [];
  products: Product[] = [];
  branches: Branch[] = [];
  statuses: Status[] = [];
  purchaseOrderEntries: PurchaseOrderEntry[] = [];
  purchaseEntries: PurchaseEntry[] = [];

  smallGridData: Product[] = [];
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

  // Flags
  smallGridVisible = false;

  // Header Selections
  selectedCompanyId: number | null = null;
  selectedBranchId: number | null = null;
  selectedSupplierId: number | null = null;
  selectedPurchaseDate: string | null = null;
  selectedExpDeliveryDate: string | null = null;
  activeProductRow: number | null = null;
  accountingYear: any;
  validationLabel = '';
  columns = [
    {
      field: 'sno',
      header: 'S.NO',
      type: 'text',
      visible: true,
      readOnly: true,
    },

    {
      field: 'purchaseID',
      header: 'Purchase ID',
      type: 'number',
      visible: false,
      readOnly: true,
    },
    {
      field: 'poNumber',
      header: 'PO Number',
      type: 'text',
      visible: false,
      readOnly: true,
    },

    {
      field: 'purchaseDate',
      header: 'Purchase Date',
      type: 'date',
      visible: false,
    },
    {
      field: 'companyID',
      header: 'Company ID',
      type: 'number',
      visible: false,
    },
    {
      field: 'companyName',
      header: 'Company',
      type: 'text',
      visible: false,
      readOnly: true,
    },

    { field: 'branchID', header: 'Branch ID', type: 'number', visible: false },
    {
      field: 'branchName',
      header: 'Branch',
      type: 'text',
      visible: false,
      readOnly: true,
    },

    {
      field: 'supplierID',
      header: 'Supplier ID',
      type: 'number',
      visible: false,
    },
    {
      field: 'supplierName',
      header: 'Supplier',
      type: 'text',
      visible: false,
      readOnly: true,
    },

    { field: 'statusID', header: 'Status ID', type: 'number', visible: false },
    {
      field: 'statusName',
      header: 'Status',
      type: 'select',
      options: 'statuses',
      optionLabel: 'statusName',
      optionValue: 'statusID',
      visible: false,
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
      field: 'supplierInvoiceNumber',
      header: 'Supplier Invoice No',
      type: 'text',
      visible: false,
    },
    {
      field: 'supplierInvoiceDate',
      header: 'Supplier Invoice Date',
      type: 'date',
      visible: false,
    },

    { field: 'brandID', header: 'Brand ID', type: 'number', visible: false },
    { field: 'unitID', header: 'Unit ID', type: 'number', visible: false },
    { field: 'hsnid', header: 'HSN ID', type: 'number', visible: false },

    {
      field: 'categoryID',
      header: 'Category',
      type: 'select',
      options: 'categories',
      optionLabel: 'categoryName',
      optionValue: 'categoryID',
      visible: false,
    },

    {
      field: 'subCategoryID',
      header: 'Sub Category',
      type: 'select',
      options: 'subCategories',
      optionLabel: 'subCategoryName',
      optionValue: 'subCategoryID',
      visible: false,
    },

    { field: 'barcode', header: 'Barcode', type: 'text', visible: false },
    {
      field: 'productCode',
      header: 'P CODE',
      type: 'text',
      visible: true,
      readOnly: true,
    },

    {
      field: 'productName',
      header: 'P NAME',
      type: 'text',
      openSmallGrid: true,
      requiredForNextRow: true,
      visible: true,
    },

    {
      field: 'productRate',
      header: 'PRATE',
      type: 'number',
      visible: false,
    },

    {
      field: 'purchaseRate',
      header: 'P RATE',
      type: 'number',
      visible: true,
      requiredForNextRow: true,
    },
    {
      field: 'retailPrice',
      header: 'R RATE',
      type: 'number',
      visible: true,
      requiredForNextRow: true,
    },
    {
      field: 'wholesalePrice',
      header: 'WH RATE',
      type: 'number',
      visible: true,
    },
    {
      field: 'quantity',
      header: 'QTY',
      type: 'number',
      visible: true,

      requiredForNextRow: true,
    },

    { field: 'saleRate', header: 'Sale Rate', type: 'number', visible: false },
    { field: 'mrp', header: 'MRP', type: 'number', visible: true },

    {
      field: 'discountAmount',
      header: 'DISC AMT',
      type: 'number',
      visible: true,
    },
    {
      field: 'discountPercentage',
      header: 'DISC %',
      type: 'number',
      visible: true,
    },
    {
      field: 'inclusiveAmount',
      header: 'Inclusive Amount',
      type: 'number',
      visible: false,
    },
    {
      field: 'exclusiveAmount',
      header: 'Exclusive Amount',
      type: 'number',
      visible: false,
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
      header: 'GST AMT',
      type: 'number',
      visible: true,
      readOnly: true,
    },

    { field: 'cgstRate', header: 'CGST %', type: 'number', visible: false },
    {
      field: 'cgstAmount',
      header: 'CGST Amount',
      type: 'number',
      visible: false,
    },

    { field: 'sgstRate', header: 'SGST %', type: 'number', visible: false },
    {
      field: 'sgstAmount',
      header: 'SGST Amount',
      type: 'number',
      visible: false,
    },

    { field: 'igstRate', header: 'IGST %', type: 'number', visible: false },
    {
      field: 'igstAmount',
      header: 'IGST Amount',
      type: 'number',
      visible: false,
    },

    { field: 'cessRate', header: 'CESS %', type: 'number', visible: false },
    {
      field: 'cessAmount',
      header: 'CESS Amount',
      type: 'number',
      visible: false,
    },

    {
      field: 'taxableValue',
      header: 'Taxable Value',
      type: 'number',
      visible: false,
    },
    {
      field: 'isGSTInclusive',
      header: 'GST Inclusive?',
      type: 'boolean',
      visible: false,
    },

    {
      field: 'orderedQuantity',
      header: 'Ordered Qty',
      type: 'number',
      visible: false,
    },
    {
      field: 'receivedQuantity',
      header: 'Received Qty',
      type: 'number',
      visible: false,
    },
    {
      field: 'returnedQuantity',
      header: 'Returned Qty',
      type: 'number',
      visible: false,
    },
    {
      field: 'remainingQuantity',
      header: 'Remaining Qty',
      type: 'number',
      visible: false,
    },

    {
      field: 'openingStock',
      header: 'Opening Stock',
      type: 'number',
      visible: false,
    },
    {
      field: 'reorderLevel',
      header: 'Reorder Level',
      type: 'number',
      visible: false,
    },
    {
      field: 'currentStock',
      header: 'Current Stock',
      type: 'number',
      visible: false,
    },

    { field: 'color', header: 'Color', type: 'text', visible: false },
    { field: 'size', header: 'Size', type: 'text', visible: false },
    { field: 'weight', header: 'Weight', type: 'number', visible: false },
    { field: 'volume', header: 'Volume', type: 'number', visible: false },
    { field: 'material', header: 'Material', type: 'text', visible: false },
    {
      field: 'finishType',
      header: 'Finish Type',
      type: 'text',
      visible: false,
    },
    { field: 'shadeCode', header: 'Shade Code', type: 'text', visible: false },
    { field: 'capacity', header: 'Capacity', type: 'text', visible: false },
    {
      field: 'modelNumber',
      header: 'Model Number',
      type: 'text',
      visible: false,
    },

    {
      field: 'expiryDate',
      header: 'Expiry Date',
      type: 'date',
      visible: false,
    },
    {
      field: 'isService',
      header: 'Is Service?',
      type: 'boolean',
      visible: false,
    },

    {
      field: 'totalAmount',
      header: 'TOTAL AMT',
      type: 'number',
      visible: true,
    },
    {
      field: 'taxAmount',
      header: 'Tax Amount',
      type: 'number',
      visible: false,
    },
    {
      field: 'grandTotal',
      header: 'Grand Total',
      type: 'number',
      visible: false,
    },

    { field: 'remarks', header: 'Remarks', type: 'text', visible: false },
    { field: 'isActive', header: 'Active', type: 'boolean', visible: false },

    {
      field: 'createdByUserID',
      header: 'Created By',
      type: 'number',
      visible: false,
    },
    {
      field: 'createdSystemName',
      header: 'Created From',
      type: 'text',
      visible: false,
    },
    { field: 'createdAt', header: 'Created At', type: 'date', visible: false },

    {
      field: 'updatedByUserID',
      header: 'Updated By',
      type: 'number',
      visible: false,
    },
    {
      field: 'updatedSystemName',
      header: 'Updated System',
      type: 'text',
      visible: false,
    },
    { field: 'updatedAt', header: 'Updated At', type: 'date', visible: false },

    { field: 'grnNumber', header: 'GRN Number', type: 'text', visible: false },
    { field: 'grnDate', header: 'GRN Date', type: 'date', visible: false },

    { field: 'poid', header: 'POID', type: 'number', visible: false },
    {
      field: 'poDetailID',
      header: 'PO Detail ID',
      type: 'number',
      visible: false,
    },

    {
      field: 'grnRemarks',
      header: 'GRN Remarks',
      type: 'text',
      visible: false,
    },
    {
      field: 'isGRNApproved',
      header: 'GRN Approved?',
      type: 'boolean',
      visible: false,
    },

    {
      field: 'approvedByUserID',
      header: 'Approved By',
      type: 'number',
      visible: false,
    },
    {
      field: 'approvedAt',
      header: 'Approved At',
      type: 'date',
      visible: false,
    },

    {
      field: 'paymentMode',
      header: 'Payment Mode',
      type: 'text',
      visible: false,
    },
    { field: 'paidDays', header: 'Paid Days', type: 'number', visible: false },

    {
      field: 'manufacturingDate',
      header: 'Mfg Date',
      type: 'date',
      visible: false,
    },

    { field: 'taxType', header: 'Tax Type', type: 'text', visible: false },
    {
      field: 'secondaryUnitID',
      header: 'Secondary Unit ID',
      type: 'number',
      visible: false,
    },

    {
      field: 'cancelledDate',
      header: 'Cancelled Date',
      type: 'date',
      visible: false,
    },
    {
      field: 'cancelledBy',
      header: 'Cancelled By',
      type: 'text',
      visible: false,
    },
    {
      field: 'cancelReason',
      header: 'Cancel Reason',
      type: 'text',
      visible: false,
    },

    {
      field: 'accountingYear',
      header: 'Accounting Year',
      type: 'text',
      visible: false,
    },
  ];

  // SMALL GRID COLUMNS (USED IN TEMPLATE)
  productGridColumns = [
    { field: 'productCode', header: 'Product Code', visible: true },
    { field: 'productName', header: 'Product Name', visible: true },
  ];
  selectedPaymentMode: any;
  invoiceNo: any;
  supplierInvoiceNo: any;
  selectedInvoiceDate: any;

  get visibleColumns() {
    return this.columns.filter((c) => c.visible);
  }

  constructor(
    private masterService: MasterService,
    private commonService: CommonserviceService,
    private purchaseOrderService: PurchaseOrderServiceService,
    private swall: SweetAlertService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  // INIT
  ngOnInit(): void {
    this.selectedPurchaseDate = new Date().toISOString().split('T')[0];
    this.loadDropdowns();

    const companyId = this.authService.companyId;
    if (companyId) {
      this.selectedCompanyId = companyId;
      this.loadProducts(companyId);
      this.loadNextInvoiceNo();
    }
  }

  // LOAD PRODUCTS
  loadProducts(companyId: number) {
    this.masterService.getProducts(companyId).subscribe((res) => {
      setTimeout(() => {
        this.products = res ?? [];
        this.smallGridData = [...this.products];
      });
    });
  }

  goBack() {
    this.router.navigate(['/Purchase/PurchaseView']);
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

  // GRID HEADER UPDATE (TEMPLATE CALLS THIS)
  applyTopSelectionsToGrid() {
    this.loadNextInvoiceNo();
    this.purchaseOrderEntries.forEach((row) =>
      this.applyTopSelectionsToRow(row)
    );
  }

  applyTopSelectionsToRow(row: PurchaseOrderEntry) {
    row.companyID = this.selectedCompanyId ?? null;
    row.branchID = this.selectedBranchId ?? null;
    row.supplierID = this.selectedSupplierId ?? null;
    row.poDate = this.selectedPurchaseDate ?? null;
    row.expectedDeliveryDate = this.selectedExpDeliveryDate ?? null;
    row.accountingYear = this.accountingYear ?? null;
    row.statusID = 3;
    row.isActive = true;
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

  loadNextInvoiceNo() {
    const companyId = this.selectedCompanyId ?? 0;
    const branchId = this.selectedBranchId ? String(this.selectedBranchId) : '';

    this.purchaseOrderService.getNextPONumber(companyId, branchId).subscribe({
      next: (poNumber: string) => {
        console.log('API Returned:', poNumber);
        this.invoiceNo = poNumber;
      },
      error: (err) => {
        console.error('PO Number API Error:', err);
      },
    });
  }

  // PRODUCT SELECTED
  onProductSelected(product: Product) {
    if (this.activeProductRow !== null) {
      const row = this.purchaseEntries[this.activeProductRow];
      row.productCode = product.productCode;
      row.productName = product.productName;
      row.categoryID = product.categoryID ?? null;
      row.subCategoryID = product.subCategoryID ?? null;
      row.gstPercentage = product.taxableValue ?? null;
    }

    this.smallGridVisible = false;
    setTimeout(() => this.grid.focusCell(this.activeProductRow!, 3), 50);
  }
  fillMasterNames(row: PurchaseEntry): PurchaseEntry {
    return {
      ...row,

      companyName:
        this.companies.find((c) => c.companyID === row.companyID)
          ?.companyName ?? null,

      branchName:
        this.branches.find((b) => b.branchID === row.branchID)?.branchName ??
        null,

      supplierName:
        this.suppliers.find((s) => s.supplierID === row.supplierID)
          ?.supplierName ?? null,
    };
  }

  onGridNumberChanged(event: any) {
    const { rowIndex, field } = event;
    const row = this.purchaseEntries[rowIndex];
    if (!row) return;

    if (['purchaseRate', 'quantity', 'gstPercentage'].includes(field)) {
      this.calculateRowTotals(row);
      this.calculateOverallTotals(); // <—— ADD THIS
    }
  }

  onGridRowAdded(e: any) {
    const newRow = e;

    this.applyTopSelectionsToRow(newRow);

    this.updateSerialNumbers();
  }
  updateSerialNumbers() {
    this.purchaseEntries.forEach((row, index) => {
      row.sno = index + 1;
    });
  }
  validateRowForNext(row: PurchaseEntry): boolean {
    if (!row) return false;

    if (!row.productName || !row.productCode) return false;

    if (!row.categoryID || row.categoryID === 0) return false;
    if (!row.subCategoryID || row.subCategoryID === 0) return false;

    if (!row.purchaseRate || Number(row.purchaseRate) <= 0) return false;
    if (!row.retailPrice || Number(row.retailPrice) <= 0) return false;
    if (!row.quantity || Number(row.quantity) <= 0) return false;
    if (!row.totalAmount || Number(row.totalAmount) <= 0) return false;

    return true;
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
    if (!this.validateRequired('Branch', this.selectedBranchId)) return false;
    if (!this.validateRequired('Supplier', this.selectedSupplierId))
      return false;
    if (!this.validateRequired('Accounting Year', this.accountingYear))
      return false;
    if (!this.validateRequired('Invoice Date ', this.selectedInvoiceDate))
      return false;
    if (!this.validateRequired('Supplier Invoice No ', this.supplierInvoiceNo))
      return false;
    if (!this.validateRequired('Invoice No ', this.invoiceNo)) return false;
    if (!this.validateRequired('PayMode ', this.selectedPaymentMode))
      return false;

    return true;
  }

  private newProduct(): PurchaseEntry {
    return {
      sno: 0,
      purchaseID: 0,

      poNumber: null,
      purchaseDate: this.selectedInvoiceDate ?? null,

      companyID: this.selectedCompanyId ?? 0,
      companyName: null,

      branchID: this.selectedBranchId ?? 0,
      branchName: null,

      supplierID: this.selectedSupplierId ?? 0,
      supplierName: null,

      statusID: 3, // Default status
      invoiceNumber: null,
      invoiceDate: null,

      supplierInvoiceNumber: this.supplierInvoiceNo ?? null,
      supplierInvoiceDate: null,

      brandID: 0,
      unitID: 0,
      hsnid: 0,

      categoryID: 0,
      subCategoryID: 0,

      barcode: null,
      productCode: null,
      productName: null,

      productRate: 0,
      quantity: 0,
      purchaseRate: 0,

      retailPrice: 0,
      wholesalePrice: 0,
      saleRate: 0,
      mrp: 0,

      discountAmount: 0,
      discountPercentage: 0,
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

      taxableValue: 0,
      isGSTInclusive: false,

      orderedQuantity: 0,
      receivedQuantity: 0,
      returnedQuantity: 0,
      remainingQuantity: 0,

      openingStock: 0,
      reorderLevel: 0,
      currentStock: 0,

      color: null,
      size: null,
      weight: 0,
      volume: 0,
      material: null,
      finishType: null,
      shadeCode: null,
      capacity: null,
      modelNumber: null,

      expiryDate: null,
      isService: false,

      statusName: null,

      totalAmount: 0,
      taxAmount: 0,
      grandTotal: 0,

      remarks: null,

      isActive: true,

      createdByUserID: 0,
      createdSystemName: 'AngularApp',
      createdAt: new Date(),

      updatedByUserID: 0,
      updatedSystemName: 'AngularApp',
      updatedAt: new Date(),

      grnNumber: null,
      grnDate: null,

      poid: null,
      poDetailID: null,

      grnRemarks: null,
      isGRNApproved: false,

      approvedByUserID: 0,
      approvedAt: null,

      paymentMode: null,
      paidDays: 0,

      manufacturingDate: null,

      taxType: null,

      secondaryUnitID: 0,

      cancelledDate: null,
      cancelledBy: null,
      cancelReason: null,

      accountingYear: this.accountingYear ?? null,
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

      quantityPurchased: 0,
      quantitySold: 0,
      quantityReturned: 0,
    };
  }

  // Add New Row
  addNewProduct(): void {
    const newProd = this.newProduct();
    this.purchaseEntries.push(newProd);

    this.updateSerialNumbers();
    this.grid.focusCell(0, 2);
  }
  cleanNumericFields(row: any) {
    const numericFields = [
      'purchaseRate',
      'retailPrice',
      'wholesalePrice',
      'saleRate',
      'mrp',
      'quantity',
      'gstPercentage',
      'gstAmount',
      'cgstRate',
      'cgstAmount',
      'sgstRate',
      'sgstAmount',
      'taxableValue',
      'totalAmount',
      'totalGstAmount',
      'totalNetAmount',
      'totalInvoiceAmount',
    ];

    numericFields.forEach((f) => {
      const v = row[f];
      row[f] =
        v === null || v === undefined || v === '' || isNaN(v) ? 0 : Number(v);
    });
  }

  buildSavePayload(): PurchaseEntry[] {
    return this.purchaseEntries.map((row) => {
      const cleaned = { ...row };
      this.cleanNumericFields(cleaned);

      const named = this.fillMasterNames(cleaned);

      return {
        ...named,

        poNumber: this.invoiceNo || null,

        purchaseDate: this.selectedInvoiceDate ?? null,
        companyID: this.selectedCompanyId ?? 0,

        branchID: this.selectedBranchId ?? 0,
        supplierID: this.selectedSupplierId ?? 0,

        invoiceNumber: this.invoiceNo ?? null,
        supplierInvoiceNumber: this.supplierInvoiceNo ?? null,
        accountingYear: this.accountingYear,
        paymentMode: this.selectedPaymentMode ?? null,

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
    });
  }

  savePurchase() {
    // Basic validation
    if (!this.validateHeaderFields()) return;

    if (this.purchaseEntries.length === 0) {
      this.swall.warning(
        'Validation',
        'Please add at least one row in the grid.'
      );
      return;
    }

    // Build API payload
    const payload = this.buildSavePayload();

    // Call API
    this.purchaseOrderService.savePurchaseEntry(payload).subscribe({
      next: (res) => {
        console.log('API RESPONSE:', res);

        if (res.success) {
          this.swall.success('Success', 'Purchase Entry Saved Successfully!');
          this.resetForm();
        } else {
          this.swall.error('WARNING', res.message || 'Error saving purchase.');
        }
      },
      error: (err) => {
        console.error(' API ERROR:', err);

        this.swall.error('Error', 'Failed to save purchase entry.');
      },
    });
  }
  resetForm() {
    // Clear header
    this.invoiceNo = '';
    this.supplierInvoiceNo = '';
    this.selectedInvoiceDate = null;
    this.selectedSupplierId = null;
    this.selectedBranchId = null;
    this.selectedPaymentMode = null;

    this.totalBalanceAmount = 0;
    this.totalPaidAmount = 0;
    this.totalTaxableAmount = 0;
    this.totalGrossAmount = 0;
    this.totalDiscAmount = 0;
    this.totalTaxableAmount = 0;
    this.totalGstAmount = 0;
    this.totalCessAmount = 0;
    this.totalNetAmount = 0;
    this.totalInvoiceAmount = 0;

    // Clear grid
    this.purchaseEntries = [];
    this.loadNextInvoiceNo();
    // Force UI refresh
    this.cd.detectChanges();
  }

  // OPEN PRODUCT SMALL GRID
  showSmallGrid(rowIndex: number) {
    this.activeProductRow = rowIndex;

    setTimeout(() => {
      this.smallGridData = [...this.products];
      this.smallGridVisible = true;
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyEvents(event: KeyboardEvent) {
    // ============================
    // SAVE PURCHASE (Shift + S)
    // ============================
    if (event.shiftKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.savePurchase();
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
    // 2) ADD ROW (Shift + N)
    // ============================
    if (event.shiftKey && event.key.toLowerCase() === 'n') {
      event.preventDefault();

      // (1) Validate header before allowing row add
      if (!this.validateHeaderFields()) {
        return;
      }

      // (2) If no rows exist, just add a new one
      if (this.purchaseEntries.length === 0) {
        this.addNewProduct();
        setTimeout(() => {
          this.grid.focusCell(0, 2);
        }, 50);
        return;
      }

      // (3) Validate last row before allowing new row
      const lastIndex = this.purchaseEntries.length - 1;
      const lastRow = this.purchaseEntries[lastIndex];

      if (!this.validateRowForNext(lastRow)) {
        this.swall.warning(
          'Validation Required',
          'Please fill Product, Category, Subcategory, Purchase Rate, Retail Price, Quantity & Amount before adding a new row.'
        );
        return;
      }

      // (4) Add new row
      this.addNewProduct();

      // (5) Auto focus first editable column in new row
      const newIndex = this.purchaseEntries.length - 1;
      setTimeout(() => {
        this.grid.focusCell(newIndex, 2); // Product Name column
      }, 50);
    }
  }

  calculateRowTotals(row: PurchaseEntry) {
    const rate = Number(row.purchaseRate || 0);
    const qty = Number(row.quantity || 0);
    const gst = Number(row.gstPercentage || 0);

    // Base value
    row.taxableValue = rate * qty;

    // GST amount
    row.gstAmount = (row.taxableValue * gst) / 100;

    // CGST / SGST split
    row.cgstRate = gst / 2;
    row.sgstRate = gst / 2;
    row.igstRate = 0;

    row.cgstAmount = (row.taxableValue * row.cgstRate) / 100;
    row.sgstAmount = (row.taxableValue * row.sgstRate) / 100;

    // Total including GST
    row.totalAmount = row.taxableValue + row.gstAmount;
  }
  calculateOverallTotals() {
    this.totalGrossAmount = 0;
    this.totalDiscAmount = 0;
    this.totalTaxableAmount = 0;
    this.totalGstAmount = 0;
    this.totalCessAmount = 0;
    this.totalNetAmount = 0;
    this.totalInvoiceAmount = 0;
    this.totalPaidAmount = 0;
    this.totalBalanceAmount = 0;

    for (const row of this.purchaseEntries) {
      this.totalGrossAmount += Number(row.taxableValue || 0);
      this.totalDiscAmount += Number(row.discountAmount || 0);
      this.totalTaxableAmount += Number(row.taxableValue || 0);
      this.totalGstAmount += Number(row.gstAmount || 0);
      this.totalCessAmount += Number(row.cessAmount || 0);
      this.totalNetAmount += Number(row.totalAmount || 0);
      this.totalInvoiceAmount += Number(row.totalAmount || 0);
      this.totalBalanceAmount += Number(row.totalAmount || 0);

      this.totalPaidAmount = Number(this.totalPaidAmount || 0);
    }
    this.totalBalanceAmount =
      this.totalInvoiceAmount - (this.totalPaidAmount || 0);
  }
  onPaidAmountChanged() {
    this.totalPaidAmount = Number(this.totalPaidAmount || 0);

    // Correct Balance Calculation:
    this.totalBalanceAmount = this.totalInvoiceAmount - this.totalPaidAmount;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.grid && this.purchaseEntries.length > 0) {
        this.grid.focusCell(0, 2);
      }
    }, 300);
  }
}
