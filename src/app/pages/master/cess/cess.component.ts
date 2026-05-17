import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { MasterService } from '../../../services/master.service';

import { ValidationService } from '../../../services/properties/validation.service';

import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

@Component({
  selector: 'app-cess',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './cess.component.html',

  styleUrls: ['./cess.component.css'],
})
export class CessComponent implements OnInit {
  showForm = false;

  duplicateError = false;

  isEditMode = false;

  formTitle = 'New Cess';

  cesses: any[] = [];

  cess: any = {};

  /*================ TABS =================*/

  cessTabs = ['Details', 'Settings'];

  /*================ TABLE =================*/

  cessColumns = [
    {
      field: 'cessName',
      header: 'Name',
    },

    {
      field: 'cessRate',
      header: 'Rate (%)',
    },

    {
      field: 'description',
      header: 'Description',
    },

    {
      field: 'isActive',
      header: 'Status',
    },
  ];

  /*================ FIELDS =================*/

  cessFields = [
    {
      label: 'Cess Name',

      model: 'cessName',

      type: 'text',

      required: true,

      tab: 'Details',

      autoFocus: true,
    },

    {
      label: 'Rate',

      model: 'cessRate',

      type: 'number',

      required: true,

      tab: 'Details',
    },

    {
      label: 'Description',

      model: 'description',

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

    private validationService: ValidationService,

    private swal: SweetAlertService,
  ) {}

  ngOnInit() {
    this.resetCess();

    this.loadCesses();
  }

  /*================ LOAD =================*/

  loadCesses() {
    this.masterService.getCesses().subscribe({
      next: (res: any) => {
        this.cesses = res.map((x: any) => ({
          ...x,

          statusText: x.isActive ? 'Active' : 'Inactive',
        }));
      },

      error: () => {
        this.swal.error('Error', 'Load Failed');
      },
    });
  }

  /*================ ADD =================*/

  newCess() {
    this.resetCess();

    this.showForm = true;

    this.formTitle = 'New Cess';

    this.isEditMode = false;
  }

  /*================ EDIT =================*/

  editCess(row: any) {
    this.cess = {
      ...row,
    };

    this.showForm = true;

    this.formTitle = 'Edit Cess';

    this.isEditMode = true;
  }

  /*================ FIELD CHANGE =================*/

  onFieldChange(event: any) {
    if (event.field === 'cessName') {
      this.checkDuplicate();
    }
  }

  /*================ DUPLICATE =================*/

  checkDuplicate() {
    this.duplicateError = this.validationService.isDuplicate(
      this.cess.cessName,

      this.cesses,

      'cessName',

      this.cess.cessID,
    );
  }

  /*================ SAVE =================*/

  saveOrUpdateCess() {
    this.checkDuplicate();

    if (!this.cess.cessName) {
      return this.swal.warning('Validation', 'Cess Name Required');
    }

    if (this.duplicateError) {
      return this.swal.warning('Validation', 'Cess Already Exists');
    }

    this.masterService.saveCess(this.cess).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          this.isEditMode ? 'Updated' : 'Saved',
        );

        this.loadCesses();

        this.cancelForm();
      },

      error: () => {
        this.swal.error(
          'Error',

          'Save Failed',
        );
      },
    });
  }

  /*================ DELETE =================*/

  deleteCess(row: any) {
    row.isActive = false;

    this.masterService.saveCess(row).subscribe({
      next: () => {
        this.swal.success('Success', 'Deleted');

        this.loadCesses();
      },
    });
  }

  /*================ REFRESH =================*/

  refreshCesses() {
    this.cancelForm();

    this.loadCesses();
  }

  /*================ CANCEL =================*/

  cancelForm() {
    this.showForm = false;

    this.resetCess();
  }

  /*================ RESET =================*/

  resetCess() {
    this.cess = {
      cessID: 0,

      cessName: '',

      cessRate: 0,

      description: '',

      isActive: true,
    };
  }
}
