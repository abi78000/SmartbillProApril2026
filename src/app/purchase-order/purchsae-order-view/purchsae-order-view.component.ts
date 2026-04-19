import { Component, OnInit } from '@angular/core';
import { PurchaseOrderServiceService } from '../services/purchase-order-service.service';
import { CommonserviceService } from '../../services/commonservice.service';
import { MasterService } from '../../services/master.service';
import { PurchaseOrderEntry } from '../models/purchase-models';
import {
  Company,
  Branch,
} from '../../pages/models/common-models/companyMaster';
import { Supplier } from '../../pages/models/common-models/master-models/master';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewDatatableComponent } from '../../pages/components/view-datatable/view-datatable.component';

@Component({
  selector: 'app-purchsae-order-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewDatatableComponent],
  templateUrl: './purchsae-order-view.component.html',
  styleUrl: './purchsae-order-view.component.css',
})
export class PurchsaeOrderViewComponent implements OnInit {
  purchaseOrders: PurchaseOrderEntry[] = [];

  companies: Company[] = [];
  branches: Branch[] = [];
  suppliers: Supplier[] = [];

  // Filters (common)
  filters: any = {
    companyId: null,
    branchId: null,
    supplierId: null,
    poDate: null,
  };

  constructor(
    private purchaseOrderService: PurchaseOrderServiceService,
    private commonService: CommonserviceService,
    private masterService: MasterService
  ) {}

  ngOnInit(): void {
    this.loadMasterData();
    this.loadOrders(); // Load all initially
  }

  // -----------------------------
  // Load Master dropdown data
  // -----------------------------
  loadMasterData() {
    this.commonService
      .getCompanies()
      .subscribe((res) => (this.companies = res));
    this.masterService
      .getSuppliers()
      .subscribe((res) => (this.suppliers = res));
  }

  onFilterChange() {
    console.log('Filters changed:', this.filters);
    this.loadOrders();
  }
  tableColumns = [
    { field: 'poid', header: 'POID', width: 100, resizable: true },
    { field: 'poNumber', header: 'PO Number', width: 100, resizable: true },
    { field: 'companyName', header: 'Company', width: 100, resizable: true },
    { field: 'branchName', header: 'Branch', width: 100, resizable: true },
    { field: 'poDate', header: 'PO Date', width: 100, resizable: true },
    { field: 'supplierName', header: 'Supplier', width: 100, resizable: true },
    { field: 'productName', header: 'Product', width: 100, resizable: true },
    { field: 'poRate', header: 'Rate', width: 100, resizable: true },
    { field: 'orderedQty', header: 'Qty', width: 100, resizable: true },
    { field: 'totalAmount', header: 'Total', width: 100, resizable: true },
    { field: 'statusName', header: 'Status', width: 100, resizable: true },
  ];

  // -----------------------------
  // Company change (special: loads branches)
  // -----------------------------
  onCompanyChange() {
    console.log('Company changed:', this.filters.companyId);

    this.filters.branchId = null; // Reset Branch

    if (!this.filters.companyId) {
      this.branches = [];
      this.onFilterChange();
      return;
    }

    const start = performance.now();

    this.commonService.getBranchesByCompany(this.filters.companyId).subscribe({
      next: (res) => {
        this.branches = res;
        console.log(
          'Branches loaded:',
          res,
          'Time:',
          (performance.now() - start).toFixed(2),
          'ms'
        );

        this.onFilterChange();
      },
      error: (err) => console.log('Failed to load branches:', err),
    });
  }

  // -----------------------------
  // Load Purchase Orders (with filters)
  // -----------------------------
  loadOrders() {
    const params = Object.fromEntries(
      Object.entries(this.filters).filter(([_, v]) => v !== null && v !== '')
    );

    console.log('Loading orders with:', params);

    this.purchaseOrderService
      .getPurchaseOrders(params)
      .subscribe((res) => (this.purchaseOrders = res));
  }

  // -----------------------------
  // Reset All Filters
  // -----------------------------
  resetFilters() {
    this.filters = {
      companyId: null,
      branchId: null,
      supplierId: null,
      poDate: null,
    };

    this.branches = [];
    this.loadOrders();
  }









  
}
