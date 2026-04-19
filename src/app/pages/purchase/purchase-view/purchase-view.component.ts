import { Component, OnInit } from '@angular/core';
import { ViewDatatableComponent } from '../../components/view-datatable/view-datatable.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseOrderServiceService } from '../../../purchase-order/services/purchase-order-service.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { MasterService } from '../../../services/master.service';
import { Supplier } from '../../models/common-models/master-models/master';
import { Company, Branch } from '../../models/common-models/companyMaster';
import { PurchaseEntry } from '../../../purchase-order/models/purchase-models';

@Component({
  selector: 'app-purchase-view',
  imports: [CommonModule, FormsModule, ViewDatatableComponent],
  templateUrl: './purchase-view.component.html',
  styleUrl: './purchase-view.component.css',
})
export class PurchaseViewComponent {
  purchaseEntry: PurchaseEntry[] = [];

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
    { field: 'companyName', header: 'Company', width: 100, resizable: true },
    { field: 'productCode', header: 'Product Code', width: 100, resizable: true },

    { field: 'productName', header: 'Product', width: 100, resizable: true },

    { field: 'quantityPurchased', header: 'Pur Qty', width: 100, resizable: true },
    { field: 'quantitySold', header: 'Sold Qty', width: 100, resizable: true },
    
    

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
      .getPurchaseStock(params)
      .subscribe((res) => (this.purchaseEntry = res));
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
