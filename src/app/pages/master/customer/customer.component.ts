import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { InputRestrictDirective } from '../../../directives/input-restrict.directive';
import { Customer } from '../../models/common-models/master-models/master';
import { CommonserviceService } from '../../../services/commonservice.service';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';

interface ApiResponse { success: boolean; message?: string; }

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [FormsModule, CommonModule, InputRestrictDirective,
     FocusOnKeyDirective,MasterTableViewComponent,SharedModule],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent {
  customers: Customer[] = [];
  customer!: Customer;  
  duplicateError = false;
  isEditMode = false;
  isFormEnabled = false;
 customerColumns = [
    { field: 'customerName', header: 'Customer Name' },
    { field: 'phone', header: 'Phone' },
    { field: 'email', header: 'Email' },
    { field: 'isActive', header: 'Active' },
  ];
  constructor(
    private readonly masterService: MasterService,
    private readonly validationService: ValidationService,
    private readonly commonService: CommonserviceService,
    private readonly swall: SweetAlertService
  ) {}

  ngOnInit() {
    this.resetCustomer();
    this.loadCustomers();
    this.isFormEnabled = false;
;

  }
  newCustomerCreate() {
    this.refreshCustomers();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }
  refreshCustomers() {
    this.resetCustomer();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }
  private newCustomer(): Customer {
    const now = new Date().toISOString();
    return {
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
      createdByUserID: this.commonService.getCurrentUserId(),
      createdSystemName: 'AngularApp',
      createdAt: now,
      updatedByUserID: this.commonService.getCurrentUserId(),
      updatedSystemName: 'AngularApp',
      updatedAt: now
    };
  }

  private focusCustomer(targetId: string = 'customerName') {
    setTimeout(() => {
      const el = document.getElementById(targetId) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  loadCustomers() {
    this.masterService.getCustomers().subscribe({
      next: res => this.customers = res ?? [],
      error: () => this.swall.error('Error', 'Failed to load customers!', () => this.focusCustomer())
    });
  }

  checkDuplicate() {
    this.duplicateError = this.validationService.isDuplicate(
      this.customer.customerName?.trim(), 
      this.customers,
      'customerName',
      this.customer.customerID
    );
  }

  private validateCustomer(): boolean {
    this.customer.customerName = this.customer.customerName?.trim() || '';
    this.checkDuplicate();
    if (!this.customer.customerName) { 
      this.swall.warning('Validation', 'Customer Name is required!', () => this.focusCustomer('customerName')); 
      return false; 
    }

    if (this.duplicateError) { 
      this.swall.warning('Validation', 'Customer Name already exists!', () => this.focusCustomer('customerName')); 
      return false; 
    }

    return true;
  }

  saveOrUpdateCustomer() {
    if (!this.validateCustomer()) return;

    const now = new Date().toISOString();
    if (this.customer.customerID && this.customer.customerID > 0) {
      this.customer.updatedByUserID = this.commonService.getCurrentUserId();
      this.customer.updatedSystemName = 'AngularApp';
      this.customer.updatedAt = now;
    } else {
      this.customer.createdByUserID = this.commonService.getCurrentUserId();
      this.customer.createdSystemName = 'AngularApp';
      this.customer.createdAt = now;
      this.customer.updatedByUserID = this.commonService.getCurrentUserId();
      this.customer.updatedSystemName = 'AngularApp';
      this.customer.updatedAt = now;
    }

    this.masterService.saveCustomer(this.customer).subscribe({
      next: (res: ApiResponse) => {
        if (res.success) {
          this.loadCustomers();
          this.resetCustomer();
          this.swall.success('Success', res.message || 'Customer saved successfully!', () => this.focusCustomer());
        } else {
          this.swall.error('Error', res.message || 'Something went wrong!', () => this.focusCustomer());
        }
      },
      error: () => this.swall.error('Error', 'Failed to save customer!', () => this.focusCustomer())
    });
  }

  editCustomer(c: Customer) {
    this.customer = { ...c };
    this.focusCustomer();
  }

  deleteCustomer(c: Customer) {
    this.swall.confirm(`Delete ${c.customerName}?`, 'This will mark the customer as inactive.').then(result => {
      if (!result.isConfirmed) return;

      const deleted: Customer = { 
        ...c, 
        isActive: false, 
        updatedByUserID: this.commonService.getCurrentUserId(), 
        updatedSystemName: 'AngularApp', 
        updatedAt: new Date().toISOString() 
      };

      this.masterService.saveCustomer(deleted).subscribe({
        next: (res: ApiResponse) => {
          if (res.success) {
            this.loadCustomers();
            this.swall.success('Deleted!', res.message || 'Customer deleted!', () => this.focusCustomer());
          } else {
            this.swall.error('Error', res.message || 'Failed to delete customer!', () => this.focusCustomer());
          }
        },
        error: () => this.swall.error('Error', 'Failed to delete customer!', () => this.focusCustomer())
      });
    });
  }

  resetCustomer() { 
    this.customer = this.newCustomer(); 
    this.duplicateError = false; 
    this.focusCustomer();
  }
}
