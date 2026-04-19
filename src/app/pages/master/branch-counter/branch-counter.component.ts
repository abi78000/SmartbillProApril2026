import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MasterService } from '../../../services/master.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-branch-counter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MasterTableViewComponent,
    SharedModule
  ],
  templateUrl: './branch-counter.component.html',
  styleUrls: ['./branch-counter.component.css']
})
export class BranchCounterComponent implements OnInit {

  companies: any[] = [];
  branches: any[] = [];
  counters: any[] = [];

  isEditMode = false;
  isFormEnabled = false;

  counter: any;

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
      this.counter.companyID = companyId;
      this.loadBranches(companyId);
    }
  }

  // ================= TABLE =================
  columns = [
    { field: 'counterName', header: 'Counter Name' },
    { field: 'invoicePrefix', header: 'Prefix' },
    { field: 'isActive', header: 'Active' }
  ];

  // ================= INIT FORM =================
  initForm() {
    this.counter = this.getEmpty();
  }

  getEmpty() {
    return {
      counterID: 0,
      companyID: this.masterService.getCurrentCompanyId() ?? 0,
      branchID: null,
      counterName: '',
      invoicePrefix: '',
      isActive: true,

      createdByUserID: this.masterService.getCurrentUserId(),
      createdSystemName: 'AngularApp',
      createdAt: new Date(),

      updatedByUserID: null,
      updatedSystemName: null,
      updatedAt: null
    };
  }

  // ================= LOAD =================
  loadCompanies() {
    this.commonService.getCompanies().subscribe({
      next: (res) => this.companies = res,
      error: () => this.swal.error('Error', 'Failed to load companies')
    });
  }

  loadBranches(companyId: number) {
    this.commonService.getBranchesByCompany(companyId).subscribe({
      next: (res) => this.branches = res,
      error: () => this.swal.error('Error', 'Failed to load branches')
    });
  }

  loadCounters(branchId: number) {
    this.masterService.getCountersByBranch(branchId).subscribe({
      next: (res) => this.counters = res,
      error: () => this.swal.error('Error', 'Failed to load counters')
    });
  }

  // ================= EVENTS =================
  onCompanyChange(companyId: number) {
    if (!companyId) return;

    this.counter.branchID = null;
    this.branches = [];
    this.counters = [];

    this.loadBranches(companyId);
  }

  onBranchChange(branchId: number) {
    if (!branchId) return;

    this.loadCounters(branchId);
  }

  // ================= FORM =================
  newCounter() {
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

    if (!this.counter.companyID || !this.counter.branchID || !this.counter.counterName) {
      this.swal.warning('Warning', 'Company, Branch & Counter Name required');
      return;
    }

    this.counter.updatedByUserID = this.masterService.getCurrentUserId();
    this.counter.updatedSystemName = 'AngularApp';
    this.counter.updatedAt = new Date();

    this.masterService.saveBranchCounter(this.counter).subscribe({
      next: () => {
        this.swal.success('Success', 'Saved successfully');
        this.loadCounters(this.counter.branchID);
        this.reset();
      },
      error: (err) => {
        this.swal.error('Error', err?.error?.message || 'Save failed');
      }
    });
  }

  // ================= EDIT =================
  edit(row: any) {
    this.counter = { ...row };
    this.isEditMode = true;
    this.isFormEnabled = true;

    this.loadBranches(row.companyID);

    setTimeout(() => {
      this.loadCounters(row.branchID);
    }, 200);
  }

  // ================= DELETE =================
  delete(row: any) {

    if (!confirm(`Delete ${row.counterName}?`)) return;

    const payload = {
      ...row,
      isActive: false
    };

    this.masterService.saveBranchCounter(payload).subscribe({
      next: () => {
        this.swal.success('Deleted', 'Counter deleted');
        this.loadCounters(row.branchID);
      },
      error: (err) => {
        this.swal.error('Error', err?.error?.message || 'Delete failed');
      }
    });
  }
}