import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { MasterService } from '../../../services/master.service';

import { ValidationService } from '../../../services/properties/validation.service';

import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

@Component({
  selector: 'app-brand',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './brand.component.html',

  styleUrls: ['./brand.component.css'],
})
export class BrandComponent implements OnInit {
  showForm = false;

  duplicateError = false;

  isEditMode = false;

  formTitle = 'New Brand';

  brands: any[] = [];

  brand: any = {};

  /*================ TABS =================*/

  brandTabs = ['Details', 'Settings'];

  /*================ TABLE =================*/

  brandColumns = [
    {
      field: 'brandName',
      header: 'Brand Name',
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

  brandFields = [
    {
      label: 'Brand Name',

      model: 'brandName',

      type: 'text',

      required: true,

      tab: 'Details',

      autoFocus: true,
    },

    {
      label: 'Description',

      model: 'description',

      type: 'textarea',

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
    this.resetBrand();

    this.loadBrands();
  }

  /*================ LOAD =================*/

  loadBrands() {
    this.masterService.getBrands().subscribe({
      next: (res: any) => {
        this.brands = res.map((x: any) => ({
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

  newBrand() {
    this.resetBrand();

    this.showForm = true;

    this.isEditMode = false;

    this.formTitle = 'New Brand';
  }

  /*================ EDIT =================*/

  editBrand(row: any) {
    this.brand = {
      ...row,
    };

    this.showForm = true;

    this.isEditMode = true;

    this.formTitle = 'Edit Brand';
  }

  /*================ FIELD CHANGE =================*/

  onFieldChange(event: any) {
    if (event.field === 'brandName') {
      this.checkDuplicate();
    }
  }

  /*================ DUPLICATE =================*/

  checkDuplicate() {
    this.duplicateError = this.validationService.isDuplicate(
      this.brand.brandName,

      this.brands,

      'brandName',

      this.brand.brandID,
    );
  }

  /*================ SAVE =================*/

  saveOrUpdateBrand() {
    this.checkDuplicate();

    if (!this.brand.brandName) {
      return this.swal.warning(
        'Validation',

        'Brand Name Required',
      );
    }

    if (this.duplicateError) {
      return this.swal.warning(
        'Validation',

        'Brand Already Exists',
      );
    }

    this.masterService.saveBrand(this.brand).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          this.isEditMode ? 'Updated' : 'Saved',
        );

        this.loadBrands();

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

  deleteBrand(row: any) {
    row.isActive = false;

    this.masterService.saveBrand(row).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          'Deleted',
        );

        this.loadBrands();
      },
    });
  }

  /*================ REFRESH =================*/

  refreshBrands() {
    this.cancelForm();

    this.loadBrands();
  }

  /*================ CANCEL =================*/

  cancelForm() {
    this.showForm = false;

    this.resetBrand();
  }

  /*================ RESET =================*/

  resetBrand() {
    this.brand = {
      brandID: 0,

      brandName: '',

      description: '',

      isActive: true,
    };
  }
}
