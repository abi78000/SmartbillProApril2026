import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PurchaseOrderServiceService } from '../services/purchase-order-service.service';
import { CommonserviceService } from '../../services/commonservice.service';
import { MasterService } from '../../services/master.service';


import { PurchaseOrderEntry,GRNEntry}from '../models/purchase-models';

import { Company, Branch } from '../../pages/models/common-models/companyMaster';
import {
  Supplier,
  Category,
  SubCategory,
  Status
} from '../../pages/models/common-models/master-models/master';

import { InputDataGridComponent } from '../../pages/components/input-data-grid/input-data-grid.component';
import { forkJoin } from 'rxjs';
import { FocusOnKeyDirective } from '../../directives/focus-on-key.directive';
@Component({
  selector: 'app-grn-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, InputDataGridComponent, FocusOnKeyDirective],
  templateUrl: './grn-entry.component.html',
  styleUrls: ['./grn-entry.component.css'],
})
export class GrnEntryComponent implements OnInit {

  filters = {
    companyId: null as number | null,
    branchId: null as number | null,
    supplierId: null as number | null,
    poDate: null as string | null,
    poNumber: null as string | null
  };

  grnDate: string = '';
  invoiceNumber: string = '';
  invoiceDate: string = '';
  transportName: string = '';
  vehicleNumber: string = '';

  companies: Company[] = [];
  branches: Branch[] = [];
  suppliers: Supplier[] = [];
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  statuses: Status[] = [];
  poNumbers: { poNumber: string }[] = [];

  purchaseOrderEntries: PurchaseOrderEntry[] = [];

  columns = [
    { field: 'sno', header: 'S.NO', type: 'text', visible: true, readOnly: true },
    { field: 'poDate', header: 'PO DATE', type: 'date', visible: true, readOnly: true },
    { field: 'productCode', header: 'PRODUCT CODE', type: 'text', visible: true, readOnly: true },
    { field: 'productName', header: 'PRODUCT NAME', type: 'text', visible: true, readOnly: true },
    {
      field: 'productCategoryId',
      header: 'CATEGORY',
      type: 'select',
      options: 'categories',
      optionLabel: 'categoryName',
      optionValue: 'categoryID',
      visible: true,
      readOnly: true
    },
    {
      field: 'productSubCategory',
      header: 'SUB CATEGORY',
      type: 'select',
      options: 'subCategories',
      optionLabel: 'subCategoryName',
      optionValue: 'subCategoryID',
      visible: true,
      readOnly: true
    },
    { field: 'poRate', header: 'RATE', type: 'number', visible: true, readOnly: true },
    { field: 'orderedQty', header: 'ORDERED QTY', type: 'number', visible: true, readOnly: true },
    { field: 'receivedQty', header: 'RECEIVED QTY', type: 'number', visible: true },
    { field: 'totalAmount', header: 'TOTAL AMOUNT', type: 'number', visible: true, readOnly: true },
    { field: 'statusName', header: 'STATUS', type: 'text', visible: true, readOnly: true }
  ];

  get visibleColumns() {
    return this.columns.filter(c => c.visible);
  }

  constructor(
    private purchaseOrderService: PurchaseOrderServiceService,
    private commonService: CommonserviceService,
    private masterService: MasterService
  ) {}

  // ----------------------------------
  // INIT
  // ----------------------------------
  ngOnInit(): void {
    this.loadMasterData();
  }

  // ----------------------------------
  // LOAD MASTER DATA
  // ----------------------------------
  loadMasterData(): void {
    forkJoin({
      companies: this.commonService.getCompanies(),
      suppliers: this.masterService.getSuppliers(),
      categories: this.masterService.getCategories(),
      subCategories: this.masterService.getSubCategories(),
      statuses: this.masterService.getStatuses(),
    }).subscribe({
      next: res => {
        this.companies = res.companies;
        this.suppliers = res.suppliers;
        this.categories = res.categories;
        this.subCategories = res.subCategories;
        this.statuses = res.statuses;
      },
      error: err => console.error("MASTER LOAD ERROR:", err)
    });
  }

  // ----------------------------------
  // COMPANY CHANGE
  // ----------------------------------
  onCompanyChange(): void {
    this.filters.branchId = null;
    this.filters.poNumber = null;
    this.branches = [];
    this.poNumbers = [];
    this.purchaseOrderEntries = [];

    if (this.filters.companyId) {
      this.commonService.getBranchesByCompany(this.filters.companyId).subscribe({
        next: res => this.branches = res,
        error: err => console.error("BRANCH LOAD ERROR:", err)
      });
    }
  }

  // ----------------------------------
  // BRANCH CHANGE
  // ----------------------------------
  onBranchChange(): void {
    this.filters.supplierId = null;
    this.poNumbers = [];
    this.purchaseOrderEntries = [];
  }

  // ----------------------------------
  // SUPPLIER CHANGE
  // ----------------------------------
  onSupplierChange(): void {
    this.poNumbers = [];
    this.purchaseOrderEntries = [];
    this.loadPoNumbers();
  }

  // ----------------------------------
  // LOAD PO NUMBERS
  // ----------------------------------
  loadPoNumbers(): void {
    if (!this.filters.companyId || !this.filters.branchId || !this.filters.supplierId) {
      this.poNumbers = [];
      return;
    }

    const params = {
      companyId: this.filters.companyId,
      branchId: this.filters.branchId,
      supplierId: this.filters.supplierId
    };

    this.purchaseOrderService.getPurchaseOrders(params).subscribe({
      next: res => {
        this.poNumbers = [
          ...new Map(res.map(x => [x.poNumber, { poNumber: x.poNumber! }])).values()
        ];
      },
      error: err => console.error("PO NUMBER LOAD ERROR:", err)
    });
  }

  // ----------------------------------
  // PO NUMBER CHANGE → LOAD PO LINES
  // ----------------------------------
  onPoNumberChange(): void {
    if (!this.filters.poNumber) {
      this.purchaseOrderEntries = [];
      return;
    }

    const params = {
      companyId: this.filters.companyId,
      branchId: this.filters.branchId,
      supplierId: this.filters.supplierId,
      poNumber: this.filters.poNumber
    };

    this.purchaseOrderService.getPurchaseOrders(params).subscribe({
      next: res => {
        this.purchaseOrderEntries = res.map((row, index) => ({
          ...row,
          sno: index + 1,
          receivedQty: row.orderedQty ?? 0,
          totalAmount: (row.orderedQty ?? 0) * (row.poRate ?? 0)
        }));
      },
      error: err => console.error("PO LOAD ERROR:", err)
    });
  }

  // ----------------------------------
  // GRID VALIDATION
  // ----------------------------------
  validateGrid(): boolean {
    for (let row of this.purchaseOrderEntries) {
      if (!row.receivedQty || row.receivedQty <= 0) {
        alert(`Received Qty must be > 0`);
        return false;
      }
      if (row.receivedQty > row.orderedQty!) {
        alert(`Received Qty cannot exceed Ordered Qty for ${row.productName}`);
        return false;
      }
    }
    return true;
  }

  // ----------------------------------
  // SAVE GRN (FINAL VERSION)
  // ----------------------------------
  saveGrn(): void {

    if (!this.validateGrid()) return;

    const userId = String(this.commonService.getCurrentUserId());

    this.purchaseOrderEntries.forEach((row: PurchaseOrderEntry) => {

      const payload: GRNEntry = {
        grnEntryID: 0,
        grnNumber: "",
        grnDate: new Date(this.grnDate),

        poid: row.poid ?? 0,
        poDetailID: 0,
        purchaseID: 0,

        supplierID: row.supplierID ?? this.filters.supplierId!,
        supplierName: row.supplierName ?? "",

        companyID: row.companyID ?? this.filters.companyId!,
        branchID: row.branchID ?? this.filters.branchId!,

        invoiceNumber: this.invoiceNumber,
        invoiceDate: this.invoiceDate ? new Date(this.invoiceDate) : null,
        transportName: this.transportName,
        vehicleNumber: this.vehicleNumber,

        receivedBy: userId,

        productID: row.productID ?? 0,
        productCode: row.productCode ?? "",
        productName: row.productName ?? "",
        unitID: 0,

        orderedQty: row.orderedQty ?? 0,
        receivedQty: row.receivedQty ?? 0,
        acceptedQty: row.receivedQty ?? 0,
        rejectedQty: 0,

        purchaseRate: row.poRate ?? 0,

        taxPercentage: 0,
        taxAmount: 0,

        totalAmount: (row.receivedQty ?? 0) * (row.poRate ?? 0),

        remarks: "",

        isApproved: true,
        statusID: row.statusID ?? 0,
        statusName: row.statusName ?? "",

        approvedBy: 0,
        approvedAt: new Date(),

        isActive: true,
        createdBy: userId,
        createdAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date()
      };

      console.log("GRN INSERT PAYLOAD:", payload);

      this.purchaseOrderService.saveGRN(payload).subscribe({
        next: (res) => console.log("GRN SAVED:", res),
        error: (err) => console.error("GRN SAVE ERROR:", err)
      });

    });

    alert("GRN Saved Successfully!");
    this.resetForm();
  }

  // ----------------------------------
  // RESET FORMS
  // ----------------------------------
  resetFilters(): void {
    this.filters = {
      companyId: null,
      branchId: null,
      supplierId: null,
      poDate: null,
      poNumber: null
    };
    this.branches = [];
    this.poNumbers = [];
    this.purchaseOrderEntries = [];
  }

onGridNumberChanged(event: any) {
  const { rowIndex, field, value } = event;

  // Only recalc when RECEIVED QTY changes
  if (field === 'receivedQty') {
    const row = this.purchaseOrderEntries[rowIndex];

    row.receivedQty = Number(value) || 0;

    row.totalAmount = (row.poRate || 0) * row.receivedQty;
  }
}



  resetForm(): void {
    this.resetFilters();
    this.grnDate = '';
    this.invoiceNumber = '';
    this.invoiceDate = '';
    this.transportName = '';
    this.vehicleNumber = '';
  }
}
