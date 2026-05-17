import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';
import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { MasterService } from '../../../services/master.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

@Component({
  selector: 'app-branch-counter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],
  templateUrl: './branch-counter.component.html',
  styleUrls: ['./branch-counter.component.css'],
})
export class BranchCounterComponent implements OnInit {
  showForm = false;
  isEditMode = false;
  formTitle = 'New Counter';

  companies: any[] = [];
  branches: any[] = [];
  counters: any[] = [];

  counterModel: any = {};

  /* ================= TABS ================= */

  counterTabs = ['Details', 'Settings'];

  /* ================= TABLE ================= */

  counterColumns = [
    {
      field: 'counterName',
      header: 'Counter',
    },

    {
      field: 'branchName',
      header: 'Branch',
    },

    {
      field: 'invoicePrefix',
      header: 'Invoice Prefix',
    },

    {
      field: 'statusText',
      header: 'Status',
    },
  ];

  /* ================= FIELDS ================= */

  counterFields: any[] = [
    {
      label: 'Company',
      model: 'companyID',
      type: 'select',
      required: true,
      tab: 'Details',
      options: [],
    },

    {
      label: 'Branch',
      model: 'branchID',
      type: 'select',
      required: true,
      tab: 'Details',
      options: [],
    },

    {
      label: 'Counter Name',
      model: 'counterName',
      type: 'text',
      required: true,
      tab: 'Details',
      autoFocus: true,
    },

    {
      label: 'Invoice Prefix',
      model: 'invoicePrefix',
      type: 'text',
      tab: 'Details',
    },

    {
      label: 'Is Active',
      model: 'isActive',
      type: 'checkbox',
      tab: 'Settings',
    },
  ];

  constructor(
    private masterService: MasterService,
    private commonservice: CommonserviceService,
    private swal: SweetAlertService,
  ) {}

  ngOnInit() {
    this.resetModel();

    this.loadCompanies();
  }

  /* ================= LOAD COMPANIES ================= */

  loadCompanies() {
    this.commonservice.getCompanies().subscribe({
      next: (res: any) => {
        this.companies = res;

        const companyField = this.counterFields.find(
          (x) => x.model === 'companyID',
        );

        if (companyField) {
          companyField.options = res.map((x: any) => ({
            label: x.companyName,
            value: x.companyID,
          }));
        }

        const companyId = this.masterService.getCurrentCompanyId();

        if (companyId) {
          this.counterModel.companyID = Number(companyId);

          this.loadBranches(Number(companyId));
        }
      },

      error: () => {
        this.swal.error('Error', 'Failed to load companies');
      },
    });
  }

  /* ================= LOAD BRANCHES ================= */

  loadBranches(
    companyID: number,

    selectedBranchID: any = null,
  ) {
    if (!companyID) return;

    this.commonservice.getBranchesByCompany(companyID).subscribe({
      next: (res: any) => {
        this.branches = res;

        const branchField = this.counterFields.find(
          (x) => x.model === 'branchID',
        );

        if (branchField) {
          branchField.options = res.map((x: any) => ({
            label: x.branchName,
            value: x.branchID,
          }));
        }

        /* EDIT MODE */

        if (selectedBranchID) {
          this.counterModel.branchID = Number(selectedBranchID);
        } else if (res.length > 0) {

        /* NEW MODE */
          this.counterModel.branchID = res[0].branchID;
        }

        /* AUTO LOAD COUNTERS */

        if (this.counterModel.branchID) {
          this.loadCounters(Number(this.counterModel.branchID));
        }
      },

      error: () => {
        this.swal.error('Error', 'Failed to load branches');
      },
    });
  }

  /* ================= LOAD COUNTERS ================= */

  loadCounters(branchID: number) {
    if (!branchID) return;

    this.masterService.getCountersByBranch(branchID).subscribe({
      next: (res: any) => {
        this.counters = res.map((x: any) => ({
          ...x,

          branchName:
            this.branches.find((b) => b.branchID === x.branchID)?.branchName ||
            '',

          statusText: x.isActive ? 'Active' : 'Inactive',
        }));
      },

      error: () => {
        this.swal.error('Error', 'Failed to load counters');
      },
    });
  }

  /* ================= DROPDOWN CHANGE ================= */

  onFieldChange(event: any) {
    if (event.field === 'companyID') {
      this.counterModel.companyID = Number(event.value);

      this.counterModel.branchID = null;

      this.branches = [];

      this.counters = [];

      this.loadBranches(Number(event.value));
    }

    if (event.field === 'branchID') {
      this.counterModel.branchID = Number(event.value);

      this.loadCounters(Number(event.value));
    }
  }

  /* ================= ADD ================= */

  addCounter() {
    this.resetModel();

    this.showForm = true;

    this.formTitle = 'New Counter';

    this.isEditMode = false;
  }

  /* ================= EDIT ================= */

  editCounter(row: any) {
    this.counterModel = {
      ...row,
    };

    this.showForm = true;

    this.isEditMode = true;

    this.formTitle = 'Edit Counter';

    this.loadBranches(
      Number(row.companyID),

      Number(row.branchID),
    );
  }

  /* ================= SAVE ================= */

  saveCounter(data: any) {
    if (!data.companyID) {
      return this.swal.warning('Validation', 'Select Company');
    }

    if (!data.branchID) {
      return this.swal.warning('Validation', 'Select Branch');
    }

    if (!data.counterName) {
      return this.swal.warning('Validation', 'Counter Name Required');
    }

    this.masterService.saveBranchCounter(data).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          this.isEditMode ? 'Counter Updated' : 'Counter Created',
        );

        this.loadCounters(data.branchID);

        this.cancelForm();
      },

      error: (err) => {
        console.log(err);

        this.swal.error('Error', 'Save Failed');
      },
    });
  }

  /* ================= DELETE ================= */

  deleteCounter(row: any) {
    row.isActive = false;

    this.masterService.saveBranchCounter(row).subscribe({
      next: () => {
        this.swal.success('Success', 'Deleted Successfully');

        this.loadCounters(row.branchID);
      },
    });
  }

  /* ================= REFRESH ================= */

  refresh() {
    this.cancelForm();

    if (this.counterModel.branchID) {
      this.loadCounters(this.counterModel.branchID);
    }
  }

  /* ================= CANCEL ================= */

  cancelForm() {
    this.showForm = false;

    this.resetModel();
  }

  /* ================= RESET ================= */

  resetModel() {
    this.counterModel = {
      counterID: 0,
      companyID: null,
      branchID: null,
      counterName: '',
      invoicePrefix: '',
      isActive: true,
    };
  }
}
