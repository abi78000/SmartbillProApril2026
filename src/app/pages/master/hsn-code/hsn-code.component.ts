import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { MasterService } from '../../../services/master.service';

import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

@Component({
  selector: 'app-hsn-code',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './hsn-code.component.html',

  styleUrls: ['./hsn-code.component.css'],
})
export class HsnCodeComponent implements OnInit {
  showForm = false;

  isEditMode = false;

  formTitle = 'New HSN';

  hsns: any[] = [];

  hsn: any = {};

  taxes: any[] = [];

  /*================ TABS =================*/

  hsnTabs = ['Details', 'Settings'];

  /*================ TABLE =================*/

  hsnColumns = [
    {
      field: 'hsnCode',
      header: 'HSN Code',
    },

    {
      field: 'description',
      header: 'Description',
    },

    {
      field: 'taxName',
      header: 'Tax',
    },

    {
      field: 'isActive',
      header: 'Status',
    },
  ];

  /*================ FIELDS =================*/

  hsnFields = [
    {
      label: 'Tax',

      model: 'taxID',

      type: 'select',

      required: true,

      tab: 'Details',

      options: [],
    },

    {
      label: 'HSN Code',

      model: 'hsnCode',

      type: 'text',

      required: true,

      tab: 'Details',
    },

    {
      label: 'Description',

      model: 'description',

      type: 'text',

      required: true,

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

    private swal: SweetAlertService,
  ) {}

  ngOnInit() {
    this.resetHSN();

    this.loadHSNCodes();

    this.loadTaxes();
  }

  /*================ LOAD TAXES =================*/

  loadTaxes() {
    this.masterService.getTaxes().subscribe({
      next: (res: any) => {
        this.taxes = res;

        const field = this.hsnFields.find((x: any) => x.model === 'taxID');

        if (field) {
          field.options = res.map((x: any) => ({
            label: x.taxName + ' (' + x.taxRate + '%)',

            value: x.taxID,
          }));
        }
      },
    });
  }

  /*================ LOAD =================*/

  loadHSNCodes() {
    this.masterService.getHSNCodes().subscribe({
      next: (res: any) => {
        this.hsns = res.map((x: any) => ({
          ...x,

          taxName: this.getTaxName(x.taxID),

          statusText: x.isActive ? 'Active' : 'Inactive',
        }));
      },

      error: () => {
        this.swal.error('Error', 'Load Failed');
      },
    });
  }

  /*================ ADD =================*/

  newHSN() {
    this.resetHSN();

    this.showForm = true;

    this.formTitle = 'New HSN';

    this.isEditMode = false;
  }

  /*================ EDIT =================*/

  editHSN(row: any) {
    this.hsn = {
      ...row,
    };

    this.showForm = true;

    this.formTitle = 'Edit HSN';

    this.isEditMode = true;
  }

  /*================ FIELD CHANGE =================*/

  onFieldChange(event: any) {
    this.hsn[event.field] = event.value;
  }

  /*================ SAVE =================*/

  saveOrUpdateHSN() {
    if (!this.hsn.hsnCode) {
      return this.swal.warning('Validation', 'HSN Required');
    }

    if (!this.hsn.taxID) {
      return this.swal.warning('Validation', 'Select Tax');
    }

    this.masterService.saveHSNCode(this.hsn).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          this.isEditMode ? 'Updated' : 'Saved',
        );

        this.loadHSNCodes();

        this.cancelForm();
      },

      error: () => {
        this.swal.error('Error', 'Save Failed');
      },
    });
  }

  /*================ DELETE =================*/

  deleteHSN(row: any) {
    row.isActive = false;

    this.masterService.saveHSNCode(row).subscribe({
      next: () => {
        this.swal.success('Success', 'Deleted');

        this.loadHSNCodes();
      },
    });
  }

  /*================ REFRESH =================*/

  refreshHSN() {
    this.cancelForm();

    this.loadHSNCodes();
  }

  /*================ CANCEL =================*/

  cancelForm() {
    this.showForm = false;

    this.resetHSN();
  }

  /*================ RESET =================*/

  resetHSN() {
    this.hsn = {
      hsnid: 0,

      hsnCode: '',

      description: '',

      taxID: null,

      isActive: true,
    };
  }

  /*================ TAX NAME =================*/

  getTaxName(taxID: number) {
    const tax = this.taxes.find((t: any) => t.taxID === taxID);

    return tax ? tax.taxName : '-';
  }
}
