import { Component, OnInit } from '@angular/core';
import { MasterService } from '../../../services/master.service';
import { CommonserviceService } from '../../../services/commonservice.service';

import { Company, Branch } from '../../models/common-models/companyMaster';
import { PriceListMaster } from '../../models/common-models/master-models/master';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';
import { InputRestrictDirective } from '../../../directives/input-restrict.directive';

@Component({
  selector: 'app-price-list-master',
  standalone: true,
  imports: [CommonModule, FormsModule, MasterTableViewComponent, SharedModule,InputRestrictDirective],
  templateUrl: './price-list-master.component.html',
  styleUrls: ['./price-list-master.component.css'],
})
export class PriceListMasterComponent implements OnInit {

  companies: Company[] = [];
  branches: Branch[] = [];
  priceLists: PriceListMaster[] = [];

  isEditMode = false;
  isFormEnabled = false;

  priceList!: PriceListMaster;

  constructor(
    private masterService: MasterService,
    private commonService: CommonserviceService,
    private swal: SweetAlertService
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.initForm();
    this.loadCompanies();

    const companyId = this.masterService.getCurrentCompanyId();

    if (companyId) {
      this.priceList.companyID = companyId;

      this.loadBranchesAndPriceLists(companyId);
    }
  }

  initForm() {
    this.priceList = this.getEmpty();
  }

  // ================= TABLE =================
  columns = [
    { field: 'priceListName', header: 'Price List Name' },
    { field: 'isActive', header: 'Active' },
  ];

  // ================= LOAD =================

  loadCompanies() {
    this.commonService.getCompanies().subscribe({
      next: (res) => (this.companies = res),
      error: () => this.swal.error('Error', 'Failed to load companies'),
    });
  }

  // ================= LOAD BRANCH + PRICELIST =================
  loadBranchesAndPriceLists(companyId: number) {

    this.commonService.getBranchesByCompany(companyId).subscribe({
      next: (res) => {
        this.branches = res;

        if (this.branches.length > 0) {
          const defaultBranch = this.branches[0].branchID;

          this.priceList.branchID = defaultBranch;

          this.loadPriceLists(companyId, defaultBranch);
        }
      },
      error: () => this.swal.error('Error', 'Failed to load branches'),
    });
  }

  // ================= COMPANY =================
  onCompanyChange(companyId: number) {

    if (!companyId) return;

    this.priceList.companyID = companyId;
    this.priceList.branchID = null;
    this.priceLists = [];

    this.loadBranchesAndPriceLists(companyId);
  }

  // ================= BRANCH =================
  onBranchChange(branchId: number | null) {

    this.priceList.branchID = branchId;
    this.priceLists = [];

    if (!branchId) return;

    this.loadPriceLists(this.priceList.companyID, branchId);
  }

  // ================= LOAD PRICELISTS =================
  loadPriceLists(companyId: number, branchId: number) {

    if (!companyId || !branchId) return;

    this.masterService.getPriceLists(companyId, branchId).subscribe({
      next: (res: any) => {
        this.priceLists = res?.data || res || [];
      },
      error: (err) => {
        this.swal.error('Error', err?.error?.message || 'Failed to load price lists');
      }
    });
  }

  // ================= FORM =================

  getEmpty(): PriceListMaster {
    return {
      priceListID: 0,
      companyID: this.masterService.getCurrentCompanyId() ?? 0,
      branchID: null,
      priceListName: '',
      isActive: true,
      createdByUserID: this.masterService.getCurrentUserId(),
      createdSystemName: 'AngularApp',
      createdAt: new Date(),
      updatedByUserID: null,
      updatedSystemName: null,
      updatedAt: null,
    };
  }

  newPriceList() {
    this.initForm();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }

  reset() {
    this.initForm();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }

  // ================= SAVE =================

  save() {

    if (!this.priceList.companyID || !this.priceList.branchID || !this.priceList.priceListName) {
      this.swal.warning('Warning', 'Company, Branch & Price List Name required');
      return;
    }

    this.priceList.updatedByUserID = this.masterService.getCurrentUserId();
    this.priceList.updatedSystemName = 'AngularApp';
    this.priceList.updatedAt = new Date();

    this.masterService.savePriceList(this.priceList).subscribe({
      next: () => {
        this.swal.success('Success', 'Saved successfully');
        this.loadPriceLists(this.priceList.companyID, this.priceList.branchID!);
        this.reset();
      },
      error: (err) => {
        this.swal.error('Error', err?.error?.message || 'Save failed');
      }
    });
  }

  // ================= EDIT =================

  edit(row: PriceListMaster) {

    this.priceList = { ...row };
    this.isEditMode = true;
    this.isFormEnabled = true;

    this.loadBranchesAndPriceLists(row.companyID);

    setTimeout(() => {
      this.priceList.branchID = row.branchID;
      this.loadPriceLists(row.companyID, row.branchID!);
    }, 300);
  }

  // ================= DELETE =================

  delete(row: PriceListMaster) {

    if (!confirm(`Delete ${row.priceListName}?`)) return;

    const payload = {
      ...row,
      isActive: false
    };

    this.masterService.savePriceList(payload).subscribe({
      next: () => {
        this.swal.success('Deleted', 'Price List deleted');
        this.loadPriceLists(row.companyID, row.branchID!);
      },
      error: (err) => {
        this.swal.error('Error', err?.error?.message || 'Delete failed');
      }
    });
  }
}