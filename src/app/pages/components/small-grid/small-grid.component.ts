import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-small-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './small-grid.component.html',
  styleUrl: './small-grid.component.css'
})
export class SmallGridComponent implements AfterViewInit {

  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Output() rowSelected = new EventEmitter<any>();
  @Input() parent: any = {};  
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChildren('rowItem') rowElements!: QueryList<ElementRef>;

  searchText: string = "";
  filteredData: any[] = [];
  highlightedIndex: number = 0;

ngAfterViewInit() {
  setTimeout(() => {
    this.filteredData = [...this.data];
    this.searchInput?.nativeElement?.focus();
  });
}


  filterData() {
    this.filteredData = this.data.filter(item =>
      JSON.stringify(item)
        .toLowerCase()
        .includes(this.searchText.toLowerCase())
    );
    this.highlightedIndex = 0;
  }

  onRowClick(row: any) {
    this.rowSelected.emit(row);
  }

  scrollToHighlighted() {
    const rows = this.rowElements.toArray();
    const row = rows[this.highlightedIndex];
    if (row) {
      row.nativeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  handleKey(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (this.highlightedIndex < this.filteredData.length - 1) {
          this.highlightedIndex++;
          setTimeout(() => this.scrollToHighlighted(), 10);
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        if (this.highlightedIndex > 0) {
          this.highlightedIndex--;
          setTimeout(() => this.scrollToHighlighted(), 10);
        }
        break;

case "Enter":
  event.preventDefault();
  const selected = this.filteredData[this.highlightedIndex];
  if (selected) {
    this.rowSelected.emit(selected);

    // Call parent focus
    if (this.parent?.focusAfterSelect) {
      this.parent.focusAfterSelect();
    }
  }
  break;

      case "Escape":
        break;
    }
  }
}
