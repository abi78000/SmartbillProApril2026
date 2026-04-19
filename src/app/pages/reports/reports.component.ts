import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportdashboardComponent } from './reportdashboard/reportdashboard.component';
import { TerminalReportsComponent } from './terminal-reports/terminal-reports.component';
import { SalesReportsComponent } from './sales-reports/sales-reports.component';
import { ProfitReportsComponent } from './profit-reports/profit-reports.component';
import { GstReportComponent } from './gst-report/gst-report.component';
import { OutstandingReportsComponent } from './outstanding-reports/outstanding-reports.component'; // ✅ ADD
import { StockReportsComponent } from './stock-reports/stock-reports.component';
import { LucideAngularModule } from "lucide-angular";
import { SharedModule } from '../../shared/shared.module';

declare const lucide: any;

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReportdashboardComponent,
    TerminalReportsComponent,
    SalesReportsComponent,
    ProfitReportsComponent,
    OutstandingReportsComponent, 
    GstReportComponent, StockReportsComponent,
    LucideAngularModule,
    SharedModule
],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements AfterViewInit {

  activeTab:
    | 'dashboard'
    | 'terminal'
    | 'sales'
    | 'profit'
    | 'outstanding'
    | 'gst'
    | 'STOCK'
    = 'dashboard';

  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;

    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
  goBack() {
  history.back();
}

}
