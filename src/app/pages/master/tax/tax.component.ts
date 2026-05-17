import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../../shared/shared.module';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { CommonserviceService } from '../../../services/commonservice.service';

@Component({
  selector: 'app-tax',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './tax.component.html',

  styleUrls: ['./tax.component.css'],
})
export class TaxComponent implements OnInit {
  showForm = false;

  duplicateError = false;

  isEditMode = false;

  formTitle = 'New Tax';

  taxes: any[] = [];

  tax: any = {};

  /*================ TABS =================*/

  taxTabs = ['Details', 'Settings'];

  /*================ TABLE =================*/

  taxColumns = [
    {
      field: 'taxName',
      header: 'Tax Name',
    },

    {
      field: 'taxRate',
      header: 'Tax Rate (%)',
    },

    {
      field: 'cessRate',
      header: 'Cess Rate (%)',
    },

    {
      field: 'isActive',
      header: 'Status',
    },
  ];

  /*================ FIELDS =================*/

  taxFields: any[] = [
    {
      label: 'Tax Name',

      model: 'taxName',

      type: 'text',

      required: true,

      tab: 'Details',
    },

    {
      label: 'Tax Rate',

      model: 'taxRate',

      type: 'number',

      tab: 'Details',
    },

    {
      label: 'Cess Rate',

      model: 'cessRate',

      type: 'number',

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

    private commonService: CommonserviceService,

    private validationService: ValidationService,

    private swall: SweetAlertService,
  ) {}

  ngOnInit() {
    this.resetTax();

    this.loadTaxes();
  }

  /*================ LOAD =================*/

  loadTaxes() {
    this.masterService.getTaxes().subscribe({
      next: (res: any) => {
        this.taxes = (res || []).map((x: any) => ({
          ...x,

          statusText: x.isActive ? 'Active' : 'Inactive',
        }));
      },

      error: () => {
        this.swall.error('Error', 'Failed to load taxes');
      },
    });
  }

  /*================ ADD =================*/

  newTax() {
    this.resetTax();

    this.showForm = true;

    this.isEditMode = false;

    this.formTitle = 'New Tax';
  }

  /*================ EDIT =================*/

  editTax(row: any) {
    this.tax = {
      ...row,
    };

    this.showForm = true;

    this.isEditMode = true;

    this.formTitle = 'Edit Tax';
  }

  /*================ FIELD =================*/

  onFieldChange(event: any) {
    this.tax[event.field] = event.value;

    if (event.field === 'taxName') {
      this.checkDuplicate();
    }
  }

  /*================ DUPLICATE =================*/

  checkDuplicate() {
    this.duplicateError = this.validationService.isDuplicate(
      this.tax.taxName,

      this.taxes,

      'taxName',

      this.tax.taxID,
    );
  }

  /*================ SAVE =================*/

  saveOrUpdateTax() {
    this.checkDuplicate();

    if (!this.tax.taxName) {
      return this.swall.warning('Validation', 'Tax Name Required');
    }

    if (this.duplicateError) {
      return this.swall.warning('Validation', 'Tax Already Exists');
    }

    const userId = this.commonService.getCurrentUserId();

    const now = new Date().toISOString();

    if (this.tax.taxID === 0) {
      this.tax.createdByUserID = userId;

      this.tax.createdAt = now;
    }

    this.tax.updatedByUserID = userId;

    this.tax.updatedAt = now;

    this.masterService.saveTax(this.tax).subscribe({
      next: () => {
        this.swall.success(
          'Success',

          this.isEditMode ? 'Updated' : 'Saved',
        );

        this.loadTaxes();

        this.cancelForm();
      },
    });
  }

  /*================ DELETE =================*/

  deleteTax(row: any) {
    row.isActive = false;

    this.masterService.saveTax(row).subscribe({
      next: () => {
        this.swall.success('Success', 'Deleted');

        this.loadTaxes();
      },
    });
  }

  /*================ CANCEL =================*/

  cancelForm() {
    this.showForm = false;

    this.resetTax();
  }

  /*================ REFRESH =================*/

  refreshTaxes() {
    this.cancelForm();

    this.loadTaxes();
  }

  /*================ RESET =================*/

  resetTax() {
    this.tax = {
      taxID: 0,

      taxName: '',

      taxRate: 0,

      cessRate: 0,

      isActive: true,
    };
  }
}
