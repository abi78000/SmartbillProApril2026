import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { InputRestrictDirective } from '../../../directives/input-restrict.directive';
import { CommonserviceService } from '../../../services/commonservice.service';
import { Observable } from 'rxjs';

import {
  Brand,
  Category,
  Customer,
  Cess,
  Product,
  Supplier,
  Tax,
  Unit,
  HSN,
  Service,
} from '../../models/common-models/master-models/master';
import { AuthService } from '../../../authentication/auth-service.service';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';

interface ApiResponse {
  success: boolean;
  message?: string;
}
@Component({
  selector: 'app-service-master',
  imports: [
    FormsModule,
    CommonModule,
    InputRestrictDirective,
    FocusOnKeyDirective,
    SharedModule,
    MasterTableViewComponent,
  ],
  templateUrl: './service-master.component.html',
  styleUrl: './service-master.component.css',
})
export class ServiceMasterComponent {
  serviceColumns = [
    { field: 'serviceName', header: 'SERVICE Name' },
    { field: 'isActive', header: 'Active' },
  ];
  services: Service[] = [];
  service!: Service;
  duplicateError = false;
  cesses: Cess[] = [];
  categories: Category[] = [];
  hsnCodes: HSN[] = [];
  taxes: Tax[] = [];
  isEditMode = false;
  isFormEnabled = false;

  constructor(
    private readonly masterService: MasterService,
    private readonly validationService: ValidationService,
    private readonly commonService: CommonserviceService,
    private readonly swall: SweetAlertService,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.resetService();
    this.loadServices();
    this.loadDropdowns();
    this.isFormEnabled = false;
  }

  newServiceCreate() {
    this.resetService();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }
  refreshServices() {
    this.resetService();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }
  private newService(): Service {
    const now = new Date().toISOString();
    return {
      serviceID: 0,
      serviceName: '',
      serviceCode: '',
      categoryID: 0,
      hsnid: 0,
      taxID: 0,
      cessID: 0,
      serviceCharge: 0,
      isActive: true,

      createdByUserID: this.commonService.getCurrentUserId(),
      createdSystemName: this.authService.userName || 'admin',
      createdAt: now,
      updatedByUserID: this.commonService.getCurrentUserId(),
      updatedSystemName: this.authService.userName || 'admin',
      updatedAt: now,
    };
  }

  private focusService(targetId: string = 'serviceName') {
    setTimeout(() => {
      const el = document.getElementById(targetId) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  loadServices() {
    this.masterService.getServices().subscribe({
      next: (res) => (this.services = res ?? []),
      error: () =>
        this.swall.error('Error', 'Failed to load services!', () =>
          this.focusService()
        ),
    });
  }

  loadDropdowns() {
    this.masterService
      .getCategories()
      .subscribe((res) => (this.categories = res ?? []));
    this.masterService
      .getHSNCodes()
      .subscribe((res) => (this.hsnCodes = res ?? []));
    this.masterService.getTaxes().subscribe((res) => (this.taxes = res ?? []));
    this.masterService
      .getCesses()
      .subscribe((res) => (this.cesses = res ?? []));
  }

  checkDuplicate() {
    const name = this.service.serviceName?.trim().toLowerCase() || '';
    this.duplicateError = this.services.some(
      (s) =>
        s.serviceID !== this.service.serviceID &&
        s.serviceName?.trim().toLowerCase() === name
    );
  }

  private validateService(): boolean {
    this.service.serviceName = this.service.serviceName?.trim() || '';
    this.checkDuplicate();

    if (!this.service.serviceName) {
      this.swall.warning('Validation', 'Service Name is required!', () =>
        this.focusService('serviceName')
      );
      return false;
    }

    if (this.duplicateError) {
      this.swall.warning('Validation', 'Service Name already exists!', () =>
        this.focusService('serviceName')
      );
      return false;
    }

    if (!this.service.categoryID) {
      this.swall.warning('Validation', 'Please select a Category!', () =>
        this.focusService()
      );
      return false;
    }

    return true;
  }

  saveOrUpdateService() {
    if (!this.validateService()) return;

    const now = new Date().toISOString();
    if (this.service.serviceID && this.service.serviceID > 0) {
      this.service.updatedByUserID = this.commonService.getCurrentUserId();
      this.service.updatedSystemName = 'AngularApp';
      this.service.updatedAt = now;
    } else {
      this.service.createdByUserID = this.commonService.getCurrentUserId();
      this.service.createdSystemName = 'AngularApp';
      this.service.createdAt = now;
      this.service.updatedByUserID = this.commonService.getCurrentUserId();
      this.service.updatedSystemName = 'AngularApp';
      this.service.updatedAt = now;
    }

    this.masterService.saveService(this.service).subscribe({
      next: (res: ApiResponse) => {
        if (res.success) {
          this.loadServices();
          this.resetService();
          this.swall.success(
            'Success',
            res.message || 'Service saved successfully!',
            () => this.focusService()
          );
        } else {
          this.swall.error(
            'Error',
            res.message || 'Something went wrong!',
            () => this.focusService()
          );
        }
      },
      error: () =>
        this.swall.error('Error', 'Failed to save service!', () =>
          this.focusService()
        ),
    });
  }

  editService(s: Service) {
    this.service = { ...s };
    this.focusService();
  }

  deleteService(s: Service) {
    this.swall
      .confirm(
        `Delete ${s.serviceName}?`,
        'This will mark the service as inactive.'
      )
      .then((result) => {
        if (!result.isConfirmed) return;

        const deleted: Service = {
          ...s,
          isActive: false,
          updatedByUserID: this.commonService.getCurrentUserId(),
          updatedSystemName: 'AngularApp',
          updatedAt: new Date().toISOString(),
        };

        this.masterService.saveService(deleted).subscribe({
          next: (res: ApiResponse) => {
            if (res.success) {
              this.loadServices();
              this.swall.success(
                'Deleted!',
                res.message || 'Service deleted!',
                () => this.focusService()
              );
            } else {
              this.swall.error(
                'Error',
                res.message || 'Failed to delete service!',
                () => this.focusService()
              );
            }
          },
          error: () =>
            this.swall.error('Error', 'Failed to delete service!', () =>
              this.focusService()
            ),
        });
      });
  }

  resetService() {
    this.service = this.newService();
    this.duplicateError = false;
    this.focusService();
  }
  getCategoryName(categoryID: number): string {
    return (
      this.categories?.find((c) => c.categoryID === categoryID)?.categoryName ||
      ''
    );
  }

  getHSNCode(hsnID: number): string {
    return this.hsnCodes?.find((h) => h.hsnid === hsnID)?.hsnCode || '';
  }

  getCessName(cessID: number): string {
    return this.cesses?.find((c) => c.cessID === cessID)?.cessName || '';
  }
  getTaxName(taxID: number): string {
    if (!this.taxes) return '';
    const tax = this.taxes.find((t) => t.taxID === taxID);
    return tax ? tax.taxName : '';
  }
}
