import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { MasterService } from '../../../services/master.service';

import { ValidationService } from '../../../services/properties/validation.service';

import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

import { CommonserviceService } from '../../../services/commonservice.service';

@Component({
  selector: 'app-customer',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './customer.component.html',

  styleUrls: ['./customer.component.css'],
})
export class CustomerComponent implements OnInit {
  showForm = false;

  duplicateError = false;

  isEditMode = false;

  formTitle = 'New Customer';

  customers: any[] = [];

  customer: any = {};

  /*================ TABS =================*/

  customerTabs = ['Details', 'Address', 'Settings'];

  /*================ TABLE =================*/

  customerColumns = [
    {
      field: 'customerName',
      header: 'Customer',
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

  customerFields = [
    {
      label: 'Customer Name',
      model: 'customerName',
      type: 'text',
      required: true,
      tab: 'Details',
      autoFocus: true,
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

    private swal: SweetAlertService,
  ) {}

  ngOnInit() {
    this.resetCustomer();

    this.loadCustomers();
  }

  /*================ LOAD =================*/

  loadCustomers() {
    this.masterService.getCustomers().subscribe({
      next: (res: any) => {
        this.customers = res.map((x: any) => ({
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

  newCustomer() {
    this.resetCustomer();

    this.showForm = true;

    this.isEditMode = false;

    this.formTitle = 'New Customer';
  }

  /*================ EDIT =================*/

  editCustomer(row: any) {
    this.customer = {
      ...row,
    };

    this.showForm = true;

    this.isEditMode = true;

    this.formTitle = 'Edit Customer';
  }

  /*================ FIELD =================*/

  onFieldChange(event: any) {
    if (event.field === 'customerName') {
      this.checkDuplicate();
    }
  }

  /*================ DUPLICATE =================*/

  checkDuplicate() {
    this.duplicateError = this.validationService.isDuplicate(
      this.customer.customerName,

      this.customers,

      'customerName',

      this.customer.customerID,
    );
  }

  /*================ SAVE =================*/

  saveOrUpdateCustomer() {
    this.checkDuplicate();

    if (!this.customer.customerName) {
      return this.swal.warning('Validation', 'Customer Required');
    }

    if (this.duplicateError) {
      return this.swal.warning('Validation', 'Customer Exists');
    }

    this.masterService.saveCustomer(this.customer).subscribe({
      next: () => {
        this.swal.success('Success', this.isEditMode ? 'Updated' : 'Saved');

        this.loadCustomers();

        this.cancelForm();
      },

      error: () => {
        this.swal.error('Error', 'Save Failed');
      },
    });
  }

  /*================ DELETE =================*/

  deleteCustomer(row: any) {
    row.isActive = false;

    this.masterService.saveCustomer(row).subscribe({
      next: () => {
        this.swal.success('Success', 'Deleted');

        this.loadCustomers();
      },
    });
  }

  /*================ REFRESH =================*/

  refreshCustomers() {
    this.cancelForm();

    this.loadCustomers();
  }

  /*================ CANCEL =================*/

  cancelForm() {
    this.showForm = false;

    this.resetCustomer();
  }

  /*================ RESET =================*/

  resetCustomer() {
    this.customer = {
      customerID: 0,

      customerCode: '',

      customerName: '',

      phone: '',

      alternatePhone: '',

      email: '',

      addressLine1: '',

      addressLine2: '',

      city: '',

      state: '',

      country: '',

      postalCode: '',

      isActive: true,
    };
  }
}
