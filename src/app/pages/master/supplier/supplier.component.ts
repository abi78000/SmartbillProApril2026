import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../../shared/shared.module';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { MasterService } from '../../../services/master.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { CommonserviceService } from '../../../services/commonservice.service';

@Component({
  selector: 'app-supplier',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './supplier.component.html',

  styleUrls: ['./supplier.component.css'],
})
export class SupplierComponent implements OnInit {
  showForm = false;

  duplicateError = false;

  isEditMode = false;

  formTitle = 'New Supplier';

  suppliers: any[] = [];

  supplier: any = {};

  /*================ TABS =================*/

  supplierTabs = ['Details', 'Address', 'Settings'];

  /*================ TABLE =================*/

  supplierColumns = [
    {
      field: 'supplierName',
      header: 'Supplier',
    },

    {
      field: 'phone',
      header: 'Phone',
    },

    {
      field: 'email',
      header: 'Email',
    },

    {
      field: 'isActive',
      header: 'Status',
    },
  ];

  /*================ FIELDS =================*/

  supplierFields: any[] = [
    {
      label: 'Supplier Name',
      model: 'supplierName',
      type: 'text',
      required: true,
      tab: 'Details',
    },

    {
      label: 'Phone',
      model: 'phone',
      type: 'text',
      tab: 'Details',
    },

    {
      label: 'Alternate Phone',
      model: 'alternatePhone',
      type: 'text',
      tab: 'Details',
    },

    {
      label: 'Email',
      model: 'email',
      type: 'email',
      tab: 'Details',
    },

    {
      label: 'GST Number',
      model: 'gstNumber',
      type: 'text',
      tab: 'Details',
    },

    {
      label: 'Postal Code',
      model: 'postalCode',
      type: 'text',
      tab: 'Details',
    },

    {
      label: 'Address Line1',
      model: 'addressLine1',
      type: 'text',
      tab: 'Address',
    },

    {
      label: 'Address Line2',
      model: 'addressLine2',
      type: 'text',
      tab: 'Address',
    },

    {
      label: 'City',
      model: 'city',
      type: 'text',
      tab: 'Address',
    },

    {
      label: 'State',
      model: 'state',
      type: 'text',
      tab: 'Address',
    },

    {
      label: 'Country',
      model: 'country',
      type: 'text',
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
    private masterService: MasterService,

    private validationService: ValidationService,

    private commonService: CommonserviceService,

    private swall: SweetAlertService,
  ) {}

  ngOnInit() {
    this.resetSupplier();

    this.loadSuppliers();
  }

  /*================ LOAD =================*/

  loadSuppliers() {
    this.masterService.getSuppliers().subscribe({
      next: (res: any) => {
        this.suppliers = (res || []).map((x: any) => ({
          ...x,

          statusText: x.isActive ? 'Active' : 'Inactive',
        }));
      },
    });
  }

  /*================ ADD =================*/

  newSupplier() {
    this.resetSupplier();

    this.showForm = true;

    this.isEditMode = false;

    this.formTitle = 'New Supplier';
  }

  /*================ EDIT =================*/

  editSupplier(row: any) {
    this.supplier = {
      ...row,
    };

    this.showForm = true;

    this.isEditMode = true;

    this.formTitle = 'Edit Supplier';
  }

  /*================ FIELD =================*/

  onFieldChange(event: any) {
    this.supplier[event.field] = event.value;

    if (event.field === 'supplierName') {
      this.checkDuplicate();
    }
  }

  /*================ DUPLICATE =================*/

  checkDuplicate() {
    this.duplicateError = this.validationService.isDuplicate(
      this.supplier.supplierName,

      this.suppliers,

      'supplierName',

      this.supplier.supplierID,
    );
  }

  /*================ SAVE =================*/

  saveOrUpdateSupplier() {
    this.checkDuplicate();

    if (!this.supplier.supplierName) {
      return this.swall.warning('Validation', 'Supplier Required');
    }

    if (this.duplicateError) {
      return this.swall.warning('Validation', 'Supplier Exists');
    }

    this.masterService.saveSupplier(this.supplier).subscribe({
      next: () => {
        this.swall.success('Success', this.isEditMode ? 'Updated' : 'Saved');

        this.loadSuppliers();

        this.cancelForm();
      },
    });
  }

  /*================ DELETE =================*/

  deleteSupplier(row: any) {
    row.isActive = false;

    this.masterService.saveSupplier(row).subscribe({
      next: () => {
        this.swall.success('Success', 'Deleted');

        this.loadSuppliers();
      },
    });
  }

  /*================ CANCEL =================*/

  cancelForm() {
    this.showForm = false;

    this.resetSupplier();
  }

  /*================ REFRESH =================*/

  refreshSuppliers() {
    this.cancelForm();

    this.loadSuppliers();
  }

  /*================ RESET =================*/

  resetSupplier() {
    this.supplier = {
      supplierID: 0,

      supplierCode: '',

      supplierName: '',

      phone: '',

      alternatePhone: '',

      email: '',

      addressLine1: '',

      addressLine2: '',

      city: '',

      state: '',

      country: '',

      postalCode: '',

      gstNumber: '',

      isActive: true,
    };
  }
}
