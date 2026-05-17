import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { CommonserviceService } from '../../../services/commonservice.service';

import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

@Component({
  selector: 'app-branch-master',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './branch-master.component.html',

  styleUrls: ['./branch-master.component.css'],
})
export class BranchMasterComponent implements OnInit {
  showForm = false;

  isEditMode = false;

  formTitle = 'New Branch';

  companies: any[] = [];

  branches: any[] = [];

  branchModel: any = {};

  /* ===================================
   TABS
=================================== */

  branchTabs = ['Details', 'Address', 'Settings'];

  /* ===================================
   TABLE
=================================== */

  branchColumns = [
    {
      field: 'branchName',
      header: 'Branch',
    },

    {
      field: 'companyName',
      header: 'Company',
    },

    {
      field: 'isActive',
      header: 'Status',
    },
  ];

  /* ===================================
   FIELDS
=================================== */

  branchFields = [
    {
      label: 'Company',
      model: 'companyID',
      type: 'select',
      required: true,
      tab: 'Details',
      options: [],
    },

    {
      label: 'Branch Name',
      model: 'branchName',
      type: 'text',
      required: true,
      tab: 'Details',
      restrictType: 'text',
      autoFocus: true,
    },

    {
      label: 'Branch Code',
      model: 'branchCode',
      type: 'text',
      tab: 'Details',
      readonly: true,
    },

    {
      label: 'Address',
      model: 'address',
      type: 'textarea',
      tab: 'Address',
    },

    {
      label: 'Is Active',
      model: 'isActive',
      type: 'checkbox',
      tab: 'Settings',
    },
  ];

  constructor(
    private commonservice: CommonserviceService,
    private swal: SweetAlertService,
  ) {}

  ngOnInit() {
    this.resetModel();

    this.loadCompanies();

    this.loadBranches();
  }

  /* ===================================
   LOAD COMPANIES
=================================== */

  loadCompanies() {
    this.commonservice.getCompanies().subscribe({
      next: (res: any) => {
        this.companies = res;

        const field = this.branchFields.find((x) => x.model === 'companyID');

        if (field) {
          field.options = res.map((company: any) => ({
            label: company.companyName,

            value: company.companyID,
          }));
        }
      },
    });
  }

  /* ===================================
   LOAD BRANCHES
=================================== */

  loadBranches() {
    this.commonservice.getBranches().subscribe({
      next: (res: any) => {
        this.branches = res.map((branch: any) => ({
          ...branch,

          companyName: this.getCompanyName(branch.companyID),

          statusText: branch.isActive ? 'Active' : 'Inactive',
        }));
      },
    });
  }

  /* ===================================
   ADD
=================================== */

  addBranch() {
    this.resetModel();

    this.formTitle = 'New Branch';

    this.isEditMode = false;

    this.showForm = true;
  }

  /* ===================================
   EDIT
=================================== */

  editBranch(row: any) {
    this.branchModel = { ...row };

    this.formTitle = 'Edit Branch';

    this.isEditMode = true;

    this.showForm = true;
  }

  /* ===================================
   SAVE
=================================== */

  saveBranch(data: any) {
    if (!data.companyID) {
      return this.swal.warning('Validation', 'Select Company');
    }

    if (!data.branchName) {
      return this.swal.warning('Validation', 'Branch Name Required');
    }

    const payload = {
      branchID: data.branchID || 0,

      companyID: Number(data.companyID),

      branchCode: data.branchCode || '',

      branchName: data.branchName,

      address: data.address || '',

      isActive: Boolean(data.isActive),

      createdByUserID: data.createdByUserID || 0,

      createdSystemName: 'AngularApp',

      createdAt: data.createdAt || new Date().toISOString(),

      updatedByUserID: 0,

      updatedSystemName: 'AngularApp',

      updatedAt: new Date().toISOString(),
    };

    this.commonservice.saveBranch(payload).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          this.isEditMode ? 'Branch Updated' : 'Branch Created',
        );

        this.loadBranches();

        this.cancelForm();
      },

      error: (err) => {
        console.log(err);

        this.swal.error('Error', 'Save Failed');
      },
    });
  }

  /* ===================================
   DELETE
=================================== */

  deleteBranch(row: any) {
    row.isActive = false;

    this.commonservice.saveBranch(row).subscribe({
      next: () => {
        this.swal.success('Success', 'Deleted Successfully');

        this.loadBranches();
      },
    });
  }

  /* ===================================
   REFRESH
=================================== */

  refresh() {
    this.cancelForm();

    this.loadBranches();
  }

  /* ===================================
   CANCEL
=================================== */

  cancelForm() {
    this.showForm = false;

    this.resetModel();
  }

  /* ===================================
   RESET
=================================== */

  resetModel() {
    this.branchModel = {
      branchID: 0,
      companyID: null,
      branchCode: '',
      branchName: '',
      address: '',
      isActive: true,
      createdByUserID: 0,
      createdSystemName: '',
      createdAt: '',
      updatedByUserID: 0,
      updatedSystemName: '',
      updatedAt: '',
    };
  }

  /* ===================================
   COMPANY NAME
=================================== */

  getCompanyName(companyID: number) {
    const company = this.companies.find((x) => x.companyID === companyID);

    return company ? company.companyName : '';
  }
}
