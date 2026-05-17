
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dynamic-table',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
  ],

  templateUrl: './dynamic-table.component.html',

  styleUrls: ['./dynamic-table.component.css'],
})
export class DynamicTableComponent
implements OnChanges {

  @Input() data: any[] = [];

  @Input() columns: any[] = [];


  @Output() edit =
    new EventEmitter<any>();

  @Output() delete =
    new EventEmitter<any>();


  searchText = '';

  filteredData: any[] = [];

  pagedData: any[] = [];


  currentPage = 1;

  pageSize = 20;

  totalPages = 1;


  ngOnChanges(): void {

    this.filteredData = [...this.data];

    this.updatePagedData();
  }


  filterTable() {

    const search =
      this.searchText.toLowerCase();

    this.filteredData =
      this.data.filter(row =>

        Object.values(row)
          .join(' ')
          .toLowerCase()
          .includes(search)

      );

    this.currentPage = 1;

    this.updatePagedData();
  }


  updatePagedData() {

    const start =
      (this.currentPage - 1)
      * this.pageSize;

    const end =
      start + this.pageSize;

    this.totalPages =
      Math.ceil(
        this.filteredData.length
        / this.pageSize
      );

    this.pagedData =
      this.filteredData.slice(start, end);
  }


  nextPage() {

    if (
      this.currentPage
      < this.totalPages
    ) {

      this.currentPage++;

      this.updatePagedData();
    }
  }


  previousPage() {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.updatePagedData();
    }
  }


  changePageSize() {

    this.currentPage = 1;

    this.updatePagedData();
  }


  onEdit(row: any) {

    this.edit.emit(row);
  }


  onDelete(row: any) {

    this.delete.emit(row);
  }
}

