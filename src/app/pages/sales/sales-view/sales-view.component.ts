import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SalesService } from '../sales.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MasterService } from '../../../services/master.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { AuthService } from '../../../authentication/auth-service.service';
import { Company } from '../../models/common-models/companyMaster';

@Component({
  selector: 'app-sales-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-view.component.html',
  styleUrl: './sales-view.component.css',
})
export class SalesViewComponent {
  selectedPageSize = 'a4';
  orientation: 'portrait' | 'landscape' = 'portrait';

  company: any = {};
  invoice: any = { items: [] };
  taxSummary: any[] = [];

  pageLabel = '';
  pageSizeText = '';

  constructor(
    private route: ActivatedRoute,
    private salesService: SalesService,
    private authService: AuthService,
    private commonService: CommonserviceService,
    private masterService: MasterService
  ) {}

  // ================================
  // INIT
  // ================================
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.load(id);
      }
    });

    this.updateSizeInfo();
  }

  // ================================
  // LOAD INVOICE
  // ================================
  load(id: string) {
    this.salesService.getSalesEntries(null, null, id).subscribe((rows) => {
      if (!rows || rows.length === 0) return;

      const header = rows[0];
      this.invoice = { ...header };

      // ---------------- Payments
      this.invoice.cash = header.cashAmount ?? 0;
      this.invoice.card = header.cardAmount ?? 0;
      this.invoice.upi = header.upiAmount ?? 0;

      this.invoice.totalPaid =
        header.totalPaidAmount ?? header.paidAmount ?? 0;

      this.invoice.customerGiven =
        this.invoice.cash + this.invoice.card + this.invoice.upi;

      this.invoice.balance =
        header.totalBalanceAmount ?? header.balanceAmount ?? 0;

      // ---------------- Company
      this.commonService
        .getCompanyById(header.companyID)
        .subscribe((c: Company) => (this.company = c));

      // ---------------- Items
      this.invoice.items = rows.map((r) => ({
        productName: r.productName,
        hsnid: r.hsnid || 'NA',
        quantity: r.quantity ?? 0,
        saleRate: r.saleRate ?? 0,
        taxableAmount: r.taxableAmount ?? 0,
        gstPercentage: r.gstPercentage ?? 0,
        cgstRate: r.cgstRate ?? 0,
        cgstAmount: r.cgstAmount ?? 0,
        sgstRate: r.sgstRate ?? 0,
        sgstAmount: r.sgstAmount ?? 0,
        igstRate: r.igstRate ?? 0,
        igstAmount: r.igstAmount ?? 0,
        discountAmount: r.discountAmount ?? 0,
        netAmount: r.netAmount ?? 0,
      }));

      // ---------------- Totals
      this.invoice.totalQuantity = header.totalQuantity ?? 0;
      this.invoice.totalGrossAmount = header.totalGrossAmount ?? 0;
      this.invoice.totalDiscAmount = header.totalDiscAmount ?? 0;
      this.invoice.totalTaxableAmount = header.totalTaxableAmount ?? 0;

      this.invoice.totalCGSTAmount = header.totalCGSTAmount ?? 0;
      this.invoice.totalSGSTAmount = header.totalSGSTAmount ?? 0;
      this.invoice.totalIGSTAmount = header.totalIGSTAmount ?? 0;
      this.invoice.totalCESSAmount = header.totalCESSAmount ?? 0;
      this.invoice.totalGstAmount = header.totalGstAmount ?? 0;

      this.invoice.totalNetAmount = header.totalNetAmount ?? 0;
      this.invoice.totalInvoiceAmount = header.totalInvoiceAmount ?? 0;
      this.invoice.totalRoundOff = header.totalRoundOff ?? 0;

      // ---------------- GST Summary + Words
      this.calculateGSTSummary();
      this.invoice.totalInvoiceAmountWords =
        this.numberToWords(this.invoice.totalInvoiceAmount);
    });
  }

  // ================================
  // GST SUMMARY (HSN SPLIT)
  // ================================
calculateGSTSummary() {
  const map = new Map<string, any>();

  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let totalTax = 0;

  for (const item of this.invoice.items) {
    const key = `${item.hsnid}_${item.gstPercentage}`;

    if (!map.has(key)) {
      map.set(key, {
        hsn: item.hsnid || 'NA',
        taxable: 0,
        cgstRate: item.cgstRate ?? 0,
        cgstAmount: 0,
        sgstRate: item.sgstRate ?? 0,
        sgstAmount: 0,
        igstRate: item.igstRate ?? 0,
        igstAmount: 0,
        totalTax: 0,
      });
    }

    const row = map.get(key);

    row.taxable += item.taxableAmount;
    row.cgstAmount += item.cgstAmount;
    row.sgstAmount += item.sgstAmount;
    row.igstAmount += item.igstAmount;

    row.totalTax =
      row.cgstAmount + row.sgstAmount + row.igstAmount;

    // ===== GRAND TOTALS =====
    totalTaxable += item.taxableAmount;
    totalCGST += item.cgstAmount;
    totalSGST += item.sgstAmount;
    totalIGST += item.igstAmount;
    totalTax += item.cgstAmount + item.sgstAmount + item.igstAmount;
  }

  // HSN rows
  this.taxSummary = Array.from(map.values());

  // ===== TOTAL ROW (IMPORTANT) =====
  this.taxSummary.push({
    hsn: 'TOTAL',
    taxable: totalTaxable,
    cgstRate: '',
    cgstAmount: totalCGST,
    sgstRate: '',
    sgstAmount: totalSGST,
    igstRate: '',
    igstAmount: totalIGST,
    totalTax: totalTax,
  });
}


  // ================================
  // AMOUNT IN WORDS (INDIAN)
  // ================================
  numberToWords(amount: number): string {
    if (!amount) return '';

    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
      'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
      'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen',
    ];
    const b = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
      'Sixty', 'Seventy', 'Eighty', 'Ninety',
    ];

    const inWords = (num: number): string => {
      if (num < 20) return a[num];
      if (num < 100)
        return b[Math.floor(num / 10)] + ' ' + a[num % 10];
      if (num < 1000)
        return (
          a[Math.floor(num / 100)] +
          ' Hundred ' +
          inWords(num % 100)
        );
      if (num < 100000)
        return (
          inWords(Math.floor(num / 1000)) +
          ' Thousand ' +
          inWords(num % 1000)
        );
      if (num < 10000000)
        return (
          inWords(Math.floor(num / 100000)) +
          ' Lakh ' +
          inWords(num % 100000)
        );
      return '';
    };

    return inWords(Math.floor(amount)) + ' Rupees Only';
  }

  // ================================
  // PAGE SIZE
  // ================================
  updateSizeInfo() {
    switch (this.selectedPageSize) {
      case 'a4':
        this.pageLabel = 'A4';
        this.pageSizeText =
          this.orientation === 'portrait'
            ? '210 × 297 mm'
            : '297 × 210 mm';
        break;
      case 'a5':
        this.pageLabel = 'A5';
        this.pageSizeText =
          this.orientation === 'portrait'
            ? '148 × 210 mm'
            : '210 × 148 mm';
        break;
      case 'a6':
        this.pageLabel = 'A6';
        this.pageSizeText =
          this.orientation === 'portrait'
            ? '105 × 148 mm'
            : '148 × 105 mm';
        break;
      case 'thermal58':
        this.pageLabel = 'Thermal 58mm';
        this.pageSizeText = '58mm × Auto';
        break;
      case 'thermal80':
        this.pageLabel = 'Thermal 80mm';
        this.pageSizeText = '80mm × Auto';
        break;
      case 'thermal110':
        this.pageLabel = 'Thermal 110mm';
        this.pageSizeText = '110mm × Auto';
        break;
    }
  }

  // ================================
  // PRINT / PDF
  // ================================
  printInvoice() {
    window.print();
  }

  getPdfSize() {
    switch (this.selectedPageSize) {
      case 'thermal58':
        return [58, 300];
      case 'thermal80':
        return [80, 300];
      case 'thermal110':
        return [110, 300];
      case 'a5':
        return 'a5';
      case 'a6':
        return 'a6';
      default:
        return 'a4';
    }
  }

  downloadPDF() {
    const element = document.getElementById('invoicePDF');
    if (!element) return;

    html2canvas(element, { scale: 3, useCORS: true }).then(
      (canvas) => {
        const pdf = new jsPDF({
          orientation: this.orientation,
          unit: 'mm',
          format: this.getPdfSize(),
        });

        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;

        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          0,
          width,
          height
        );

        pdf.save(`Invoice-${this.invoice.invoiceNumber}.pdf`);
      }
    );
  }
}
