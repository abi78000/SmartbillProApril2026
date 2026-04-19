import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login';
import { DefaultLayoutComponent } from './pages/container/default-layout/default-layout.component';
import { CompanyMasterComponent } from './pages/common-master/company-master';
import { BranchMasterComponent } from './pages/common-master/branch-master/branch-master.component';
import { DepartmentMasterComponent } from './pages/common-master/department-master';
import { RoleMasterComponent } from './pages/common-master/role-master';
import { UsermasterComponent } from './authentication/usermaster/usermaster.component';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { BrandComponent } from './pages/master/brand/brand.component';
import { CategoryComponent } from './pages/master/category/category.component';
import { CustomerComponent } from './pages/master/customer/customer.component';
import { HsnCodeComponent } from './pages/master/hsn-code/hsn-code.component';
import { ProductComponent } from './pages/master/product/product.component';
import { ServiceMasterComponent } from './pages/master/service-master/service-master.component';
import { SubCategoryComponent } from './pages/master/sub-category/sub-category.component';
import { SupplierComponent } from './pages/master/supplier/supplier.component';
import { TaxComponent } from './pages/master/tax/tax.component';
import { UnitComponent } from './pages/master/unit/unit.component';
import { MasterDashboardComponent } from './pages/master/master-dashboard/master-dashboard.component';
import { CessComponent } from './pages/master/cess/cess.component';
import { PurchaseEntryComponent } from './pages/purchase/purchase-entry/purchase-entry.component';
import { PurchaseViewComponent } from './pages/purchase/purchase-view/purchase-view.component';
import { PurchaseCancelComponent } from './pages/purchase/purchase-cancel/purchase-cancel.component';
import { SalesEntryComponent } from './pages/sales/sales-entry/sales-entry.component';
import { SalesViewComponent } from './pages/sales/sales-view/sales-view.component';
import { SalesEditComponent } from './pages/sales/sales-edit/sales-edit.component';
import { PurchsaeOrderEntryComponent } from './purchase-order/purchsae-order-entry/purchsae-order-entry.component';
import { PurchsaeOrderViewComponent } from './purchase-order/purchsae-order-view/purchsae-order-view.component';
import { GrnMasterComponent } from './purchase-order/grn-master/grn-master.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { RegisterComponent } from './pages/register/register.component';
import { DefaultDashboardComponent } from './pages/container/default-dashboard/default-dashboard.component';
import { PaymentModeMasterComponent } from './pages/common-master/payment-mode-master/payment-mode-master.component';
import { PriceListMasterComponent } from './pages/master/price-list-master/price-list-master.component';
import { PriceListMasterItemsMappingComponent } from './pages/master/price-list-master-items-mapping/price-list-master-items-mapping.component';
import { BranchCounterComponent } from './pages/master/branch-counter/branch-counter.component';
import { ExpenseEntryComponent } from './pages/expense-management/expense-entry/expense-entry.component';
import { ExpenseCategoryComponent } from './pages/expense-management/expense-category/expense-category.component';
import { ExpenseSubcategoryComponent } from './pages/expense-management/expense-subcategory/expense-subcategory.component';
import { EstimationEntryComponent } from './pages/estimation/estimation-entry/estimation-entry.component';
import { EstimationViewComponent } from './pages/estimation/estimation-view/estimation-view.component';
import { ExpenseViewComponent } from './pages/expense-management/expense-view/expense-view.component';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'default',
    component: DefaultLayoutComponent,
    children: [
      { path: 'master/dashboard', component: DefaultDashboardComponent },
      { path: 'master/company', component: CompanyMasterComponent },
      { path: 'master/branch', component: BranchMasterComponent },
      { path: 'master/department', component: DepartmentMasterComponent },
      { path: 'master/role', component: RoleMasterComponent },
      { path: 'master/user', component: UsermasterComponent },
      { path: 'master/paymentmode', component: PaymentModeMasterComponent },
      { path: 'master/pricelist', component: PriceListMasterComponent },
      { path: 'master/pricelistitems',component: PriceListMasterItemsMappingComponent,},
      { path: 'master/branchcounter', component: BranchCounterComponent },
      { path: 'expense/category', component: ExpenseCategoryComponent },
      { path: 'expense/subcategory', component: ExpenseSubcategoryComponent },
      { path: 'expense/entry', component: ExpenseEntryComponent, data: { hideHeader: true } },
      { path: 'expense/view', component: ExpenseViewComponent },
      { path: 'estimation/entry', component: EstimationEntryComponent,  data: { hideHeader: true },},
      { path: 'estimation/view', component: EstimationViewComponent },

      { path: '', redirectTo: 'master/company', pathMatch: 'full' },
    ],
  },
  {
    path: 'user',
    component: DefaultLayoutComponent,
    children: [
      { path: 'master/accesscontrol', component: AuthenticationComponent },
      { path: '', redirectTo: 'master/accesscontrol', pathMatch: 'full' },
    ],
  },

  {
    path: 'CommonProduct',
    component: DefaultLayoutComponent,
    children: [
      { path: 'brand', component: BrandComponent },
      { path: 'category', component: CategoryComponent },
      { path: 'cess', component: CessComponent },
      { path: 'customer', component: CustomerComponent },
      { path: 'hsnCode', component: HsnCodeComponent },
      { path: 'Product', component: ProductComponent },
      { path: 'ServiceMaster', component: ServiceMasterComponent },
      { path: 'subCategory', component: SubCategoryComponent },
      { path: 'supplier', component: SupplierComponent },
      { path: 'taxmaster', component: TaxComponent },
      { path: 'unit', component: UnitComponent },
      { path: '', redirectTo: 'brand', pathMatch: 'full' },
    ],
  },

  {
    path: 'Purchase',
    component: DefaultLayoutComponent,
    children: [
      {
        path: 'PurchaseEntry',
        component: PurchaseEntryComponent,
        data: { hideHeader: true },
      },
      { path: 'PurchaseView', component: PurchaseViewComponent },
      { path: 'PurchaseCancel', component: PurchaseCancelComponent },
      { path: 'PurchaseOrderEntry', component: PurchsaeOrderEntryComponent },
      { path: 'PurchaseOrderView', component: PurchsaeOrderViewComponent },
      { path: 'PurchaseOrderCancel', component: PurchaseCancelComponent },
      { path: 'GRNEntry', component: GrnMasterComponent },
      { path: '', redirectTo: 'PurchaseEntry', pathMatch: 'full' },
    ],
  },

  {
    path: 'Sales',
    component: DefaultLayoutComponent,
    children: [
      {
        path: 'SalesEntry',
        component: SalesEntryComponent,
        data: { hideHeader: true },
      },
      {
        path: 'SalesView',
        component: SalesViewComponent,
        data: { hideHeader: true, renderMode: 'client' },
      },

      {
        path: 'SalesCancel',
        component: SalesEditComponent,
        data: { hideHeader: true },
      },
      {
        path: 'SalesView/:id',
        component: SalesViewComponent,
        data: { hideHeader: true, renderMode: 'client' },
      },

      { path: '', redirectTo: 'SalesEntry', pathMatch: 'full' },
    ],
  },
  {
    path: 'Reports',
    component: DefaultLayoutComponent,
    children: [
      {
        path: 'Reports',
        component: ReportsComponent,
        data: { hideHeader: true },
      },
      {
        path: '',
        redirectTo: 'Reports',
        pathMatch: 'full',
      },
    ],
  },
];
