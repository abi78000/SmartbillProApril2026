import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MasterService } from '../../../services/master.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

import { Company, Branch } from '../../models/common-models/companyMaster';
import { PriceListMaster } from '../../models/common-models/master-models/master';

import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-price-list-master-items-mapping',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './price-list-master-items-mapping.component.html',
  styleUrl: './price-list-master-items-mapping.component.css',
})
export class PriceListMasterItemsMappingComponent implements OnInit {

  companies: Company[] = [];
  branches: Branch[] = [];
  priceLists: PriceListMaster[] = [];
  products: any[] = [];

  selectedCompanyId: number = 0;
  selectedBranchId: number | null = null;
  selectedPriceListId: number = 0;

  isGridEnabled: boolean = false;

  constructor(
    private masterService: MasterService,
    private commonService: CommonserviceService,
    private swal: SweetAlertService
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadCompanies();

    const companyId = this.masterService.getCurrentCompanyId();

    if (companyId) {
      this.selectedCompanyId = companyId;
      this.onCompanyChange(companyId);
    }
  }

  // ================= COMPANY =================
  loadCompanies() {
    this.commonService.getCompanies().subscribe({
      next: (res) => this.companies = res,
      error: () => this.swal.error('Error', 'Failed to load companies')
    });
  }

  onCompanyChange(companyId: number) {

    this.selectedCompanyId = companyId;

    // reset
    this.selectedBranchId = null;
    this.selectedPriceListId = 0;
    this.priceLists = [];
    this.isGridEnabled = false;

    if (!companyId) return;

    // load branches
    this.commonService.getBranchesByCompany(companyId).subscribe({
      next: (res) => {
        this.branches = res;

        if (this.branches.length > 0) {
          this.selectedBranchId = this.branches[0].branchID;
          this.onBranchChange(this.selectedBranchId);
        }
      },
      error: () => this.swal.error('Error', 'Failed to load branches')
    });

    // load products
    this.masterService.getProducts(companyId).subscribe({
      next: (res) => {
        this.products = res.map(p => ({
          ...p,
          price: 0,
          isExisting: false,
          isEditable: true
        }));
      },
      error: () => this.swal.error('Error', 'Failed to load products')
    });
  }

  // ================= BRANCH =================
  onBranchChange(branchId: number | null) {

    this.selectedBranchId = branchId;

    this.selectedPriceListId = 0;
    this.priceLists = [];
    this.isGridEnabled = false;

    if (!branchId) return;

    this.masterService
      .getPriceLists(this.selectedCompanyId, branchId)
      .subscribe({
        next: (res: any) => {
          this.priceLists = res?.data || res || [];
        },
        error: () => this.swal.error('Error', 'Failed to load price lists')
      });
  }

  // ================= PRICE LIST =================
  onPriceListChange() {

    if (!this.selectedPriceListId) {
      this.isGridEnabled = false;
      return;
    }

    if (!this.selectedBranchId) {
      this.swal.warning('Warning', 'Select Branch');
      return;
    }

    this.isGridEnabled = true;

    // reset grid
    this.products.forEach(p => {
      p.price = 0;
      p.isExisting = false;
      p.isEditable = true;
    });

    this.masterService
      .getPriceListItems(
        this.selectedCompanyId,
        this.selectedPriceListId,
        this.selectedBranchId
      )
      .subscribe({
        next: (res: any) => {

          const data = res?.data || res || [];
          const map = new Map<number, number>();

          data.forEach((item: any) => {
            map.set(item.productID, item.price);
          });

          this.products.forEach(p => {
            const price = map.get(p.productID);

            if (price && price > 0) {
              p.price = price;
              p.isExisting = true;
              p.isEditable = false;
            }
          });
        },
        error: () => this.swal.error('Error', 'Failed to load prices')
      });
  }

  // ================= EDIT =================
  enableEdit(p: any) {
    p.isEditable = true;
  }

  // ================= DELETE =================
  deletePrice(p: any) {
    if (!confirm('Delete this price?')) return;

    p.price = 0;
    p.isEditable = true;
    p.isExisting = false;
  }

  // ================= SAVE =================
  savePrices() {

    if (!this.selectedCompanyId) {
      this.swal.warning('Warning', 'Select Company');
      return;
    }

    if (!this.selectedBranchId) {
      this.swal.warning('Warning', 'Select Branch');
      return;
    }

    if (!this.selectedPriceListId) {
      this.swal.warning('Warning', 'Select Price List');
      return;
    }

    const items = this.products
      .filter(p => p.price > 0)
      .map(p => ({
        companyID: this.selectedCompanyId,
        branchID: this.selectedBranchId,
        productID: p.productID,
        price: p.price
      }));

    if (items.length === 0) {
      this.swal.warning('Warning', 'Enter at least one price');
      return;
    }

    this.masterService
      .addPriceListItems(this.selectedPriceListId, items)
      .subscribe({
        next: () => {
          this.swal.success('Success', 'Saved successfully');
          this.onPriceListChange();
        },
        error: () => {
          this.swal.error('Error', 'Save failed');
        }
      });
  }
}