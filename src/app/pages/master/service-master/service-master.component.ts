import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../../shared/shared.module';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { MasterService } from '../../../services/master.service';

import { ValidationService } from '../../../services/properties/validation.service';

import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

@Component({
  selector: 'app-service-master',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './service-master.component.html',
  styleUrls: ['./service-master.component.css'],
})
export class ServiceMasterComponent implements OnInit {
  showForm = false;

  duplicateError = false;

  isEditMode = false;

  formTitle = 'New Service';

  services: any[] = [];

  categories: any[] = [];

  hsnCodes: any[] = [];

  taxes: any[] = [];

  cesses: any[] = [];

  service: any = {};

  /*================ TABS =================*/

  serviceTabs = ['Details', 'Tax Details', 'Settings'];

  /*================ TABLE =================*/

  serviceColumns = [
    {
      field: 'serviceName',
      header: 'Service',
    },

    {
      field: 'serviceCharge',
      header: 'Charge',
    },

    {
      field: 'categoryName',
      header: 'Category',
    },

    {
      field: 'isActive',
      header: 'Status',
    },
  ];

  /*================ FIELDS =================*/

  serviceFields: any[] = [
    {
      label: 'Service Name',

      model: 'serviceName',

      type: 'text',

      required: true,

      tab: 'Details',

      autoFocus: true,
    },

    {
      label: 'Service Charge',

      model: 'serviceCharge',

      type: 'number',

      tab: 'Details',
    },

    {
      label: 'Category',

      model: 'categoryID',

      type: 'select',

      tab: 'Details',

      options: [] as any[],
    },

    {
      label: 'HSN',

      model: 'hsnid',

      type: 'select',

      tab: 'Tax Details',

      options: [] as any[],
    },

    {
      label: 'Tax',

      model: 'taxID',

      type: 'select',

      tab: 'Tax Details',

      options: [] as any[],
    },

    {
      label: 'Cess',

      model: 'cessID',

      type: 'select',

      tab: 'Tax Details',

      options: [] as any[],
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
    this.resetService();

    this.loadDropdowns();

    this.loadServices();
  }

  /*================ LOAD DROPDOWNS =================*/

  loadDropdowns() {
    /* CATEGORY */

    this.masterService.getCategories().subscribe((res: any) => {
      this.categories = res || [];

      const field = this.serviceFields.find(
        (x: any) => x.model === 'categoryID',
      );

      if (field) {
        field.options = this.categories.map((x: any) => ({
          label: x.categoryName,
          value: x.categoryID,
        }));
      }
    });

    /* HSN */

    this.masterService.getHSNCodes().subscribe((res: any) => {
      this.hsnCodes = res || [];

      const field = this.serviceFields.find((x: any) => x.model === 'hsnid');

      if (field) {
        field.options = this.hsnCodes.map((x: any) => ({
          label: x.hsnCode,
          value: x.hsnid,
        }));
      }
    });

    /* TAX */

    this.masterService.getTaxes().subscribe((res: any) => {
      this.taxes = res || [];

      const field = this.serviceFields.find((x: any) => x.model === 'taxID');

      if (field) {
        field.options = this.taxes.map((x: any) => ({
          label: x.taxName,
          value: x.taxID,
        }));
      }
    });

    /* CESS */

    this.masterService.getCesses().subscribe((res: any) => {
      this.cesses = res || [];

      const field = this.serviceFields.find((x: any) => x.model === 'cessID');

      if (field) {
        field.options = this.cesses.map((x: any) => ({
          label: x.cessName,
          value: x.cessID,
        }));
      }
    });
  }

  /*================ LOAD SERVICES =================*/

  loadServices() {
    this.masterService.getServices().subscribe({
      next: (res: any) => {
        this.services = (res || []).map((x: any) => ({
          ...x,

          categoryName:
            this.categories.find((c: any) => c.categoryID === x.categoryID)
              ?.categoryName || '',

          statusText: x.isActive ? 'Active' : 'Inactive',
        }));
      },

      error: () => {
        this.swal.error('Error', 'Load Failed');
      },
    });
  }

  /*================ ADD =================*/

  newService() {
    this.resetService();

    this.showForm = true;

    this.isEditMode = false;

    this.formTitle = 'New Service';
  }

  /*================ EDIT =================*/

  editService(row: any) {
    this.service = { ...row };

    this.showForm = true;

    this.isEditMode = true;

    this.formTitle = 'Edit Service';
  }

  /*================ FIELD CHANGE =================*/

  onFieldChange(event: any) {
    this.service[event.field] = event.value;

    if (event.field === 'serviceName') {
      this.checkDuplicate();
    }
  }

  /*================ DUPLICATE =================*/

  checkDuplicate() {
    this.duplicateError = this.validationService.isDuplicate(
      this.service.serviceName,

      this.services,

      'serviceName',

      this.service.serviceID,
    );
  }

  /*================ SAVE =================*/

  saveOrUpdateService() {
    this.checkDuplicate();

    if (!this.service.serviceName) {
      return this.swal.warning('Validation', 'Service Name Required');
    }

    if (this.duplicateError) {
      return this.swal.warning('Validation', 'Service Already Exists');
    }

    this.masterService.saveService(this.service).subscribe({
      next: () => {
        this.swal.success('Success', this.isEditMode ? 'Updated' : 'Saved');

        this.loadServices();

        this.cancelForm();
      },
    });
  }

  /*================ DELETE =================*/

  deleteService(row: any) {
    row.isActive = false;

    this.masterService.saveService(row).subscribe({
      next: () => {
        this.swal.success('Success', 'Deleted');

        this.loadServices();
      },
    });
  }

  /*================ CANCEL =================*/

  cancelForm() {
    this.showForm = false;

    this.resetService();
  }

  /*================ REFRESH =================*/

  refreshServices() {
    this.cancelForm();

    this.loadServices();
  }

  /*================ RESET =================*/

  resetService() {
    this.service = {
      serviceID: 0,

      serviceCode: '',

      serviceName: '',

      serviceCharge: 0,

      categoryID: 0,

      hsnid: 0,

      taxID: 0,

      cessID: 0,

      isActive: true,
    };
  }
}
