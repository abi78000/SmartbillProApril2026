import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputRestrictDirective } from '../../../directives/input-restrict.directive';
@Component({
  selector: 'app-input-data-grid',
  standalone: true,
  imports: [CommonModule, FormsModule,  InputRestrictDirective
  ],
  templateUrl: './input-data-grid.component.html',
  styleUrls: ['./input-data-grid.component.css'],
})
export class InputDataGridComponent implements AfterViewInit {
  /* ================================
      INPUTS
  ================================= */
  @Input() columns: any[] = [];
  @Input() data: any[] = [];

  @Input() allowUserToAddRows = true;
  @Input() allowUserToDeleteRows = false;
  @Input() allowUserToResizeColumns = true;
  @Input() readOnly = false;
  @Input() selectionMode: 'CellSelect' | 'FullRowSelect' = 'CellSelect';
  @Input() parent: any = {};

  /* ================================
      OUTPUTS
  ================================= */
  @Output() cellFocus = new EventEmitter<any>();
  @Output() cellBeginEdit = new EventEmitter<any>();
  @Output() cellEndEdit = new EventEmitter<any>();
  @Output() cellValueChanged = new EventEmitter<any>();
  @Output() rowAdded = new EventEmitter<any>();
  @Output() rowDeleted = new EventEmitter<any>();
  @Output() columnResized = new EventEmitter<any>();
  @Output() numberChanged = new EventEmitter<{ rowIndex: number; field: string; value: any }>();

  /* ================================
      INTERNAL
  ================================= */
  @ViewChildren('gridInput') inputs!: QueryList<ElementRef>;
  focusedCell = { row: 0, col: 0 };
  editingCell = { row: -1, col: -1 };

  resizingColumn: number | null = null;
  startX: number | null = null;
  startWidth: number | null = null;

  private rowIdCounter = 0;

  ngAfterViewInit() {
    if (this.data.length) {
      setTimeout(() => this.focusCell(0, 0), 300);
    }
  }

  /* ================================
      TRACKBY — prevent re-render
  ================================= */
  trackByRow(index: number, row: any) {
    if (!row._rowId) row._rowId = ++this.rowIdCounter;
    return row._rowId;
  }

  trackByCol(index: number, col: any) {
    return col.field || index;
  }

  /* ================================
      FOCUS + SELECTION
  ================================= */
  private focusAndSelect(el: HTMLElement | null) {
    if (!el) return;
    el.focus();
    if ('select' in el) (el as any).select?.();
  }
currentCell = { row: 0, col: 0 };

  focusCell(row: number, col: number) {
    if (row < 0 || col < 0) return;

    this.focusedCell = { row, col };
      this.currentCell = { row, col };  
    this.cellFocus.emit({ row, col, field: this.columns[col].field });

    setTimeout(() => {
      const input = this.getInput(row, col);
      this.focusAndSelect(input?.nativeElement);
    });
  }

  getInput(row: number, col: number): ElementRef | null {
    const flat = this.inputs?.toArray();
    const index = row * this.columns.length + col;
    return flat[index] || null;
  }

  /* ================================
      EDITING
  ================================= */
  enableEditing(row: number, col: number) {
    if (this.readOnly) return;

    this.editingCell = { row, col };
    this.cellBeginEdit.emit({ row, col });

    setTimeout(() => {
      this.focusAndSelect(this.getInput(row, col)?.nativeElement);
    });
  }

  disableEditing(row: number, col: number) {
    if (!this.isEditingCell(row, col)) return;

    const field = this.columns[col].field;
    const value = this.data[row][field];

    this.cellEndEdit.emit({ row, col, value });
    this.cellValueChanged.emit({ row, col, value });

    this.editingCell = { row: -1, col: -1 };
  }

  isEditingCell(row: number, col: number) {
    return this.editingCell.row === row && this.editingCell.col === col;
  }

  /* ================================
      KEYBOARD HANDLING
  ================================= */
handleKeyDown(event: KeyboardEvent, row: number, col: number) {
  const key = event.key;
  const colDef = this.columns[col];

  switch (key) {

    case 'Enter':
      event.preventDefault();

      if (colDef.openSmallGrid && this.parent?.showSmallGrid) {
        this.disableEditing(row, col);
        this.parent.showSmallGrid(row);
        return;
      }

      this.disableEditing(row, col);
      this.focusNextEditableCell(row, col);
      return;

    case 'ArrowRight':
      event.preventDefault();
      this.focusNextEditableCell(row, col);
      return;

    case 'ArrowLeft':
      event.preventDefault();
      this.focusPrevEditableCell(row, col);
      return;

    case 'ArrowDown':
      event.preventDefault();
      if (row < this.data.length - 1) {
        this.focusCell(row + 1, col);
        this.enableEditing(row + 1, col);
      }
      return;

    case 'ArrowUp':
      event.preventDefault();
      if (row > 0) {
        this.focusCell(row - 1, col);
        this.enableEditing(row - 1, col);
      }
      return;

    case 'Tab':
      event.preventDefault();
      if (event.shiftKey) this.focusPrevEditableCell(row, col);
      else this.focusNextEditableCell(row, col);
      return;




    case 'Delete':
      this.deleteRow(row);
      return
    default:
      if (event.key.length === 1 && !this.isEditingCell(row, col)) {
        this.enableEditing(row, col);
        setTimeout(() => {
          const field = this.columns[col].field;
          this.data[row][field] = event.key;
          this.cellValueChanged.emit({ row, col, value: event.key });
        });
      }
      return;
  }
}


onNumberChanged(rowIndex: number, field: string) {
  const value = this.data[rowIndex][field];
  this.numberChanged.emit({ rowIndex, field, value });
}



  /* ================================
      SELECT KEYDOWN (missing method)
  ================================= */
  handleSelectKeyDown(
    event: KeyboardEvent,
    row: number,
    col: number,
    select: HTMLSelectElement
  ) {
    const key = event.key;

    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.stopPropagation();
        return;

      case 'Enter':
        event.preventDefault();
        this.disableEditing(row, col);
        this.focusNextEditableCell(row, col);
        return;

      case 'Tab':
        event.preventDefault();
        if (event.shiftKey) this.focusPrevEditableCell(row, col);
        else this.focusNextEditableCell(row, col);
        return;

      case 'ArrowLeft':
        event.preventDefault();
        this.focusPrevEditableCell(row, col);
        return;

      case 'ArrowRight':
        event.preventDefault();
        this.focusNextEditableCell(row, col);
        return;

      default:
        return;
    }
  }

  /* ================================
      NAVIGATION HELPERS
  ================================= */
focusNextEditableCell(row: number, col: number) {
  const totalCols = this.columns.length;

  const isEditable = (c: any) =>
    c.visible && !c.readOnly; // base editable condition

  // ------------------------------
  // 1) Next editable column in SAME row
  // ------------------------------
  for (let c = col + 1; c < totalCols; c++) {
    if (isEditable(this.columns[c])) {
      this.focusCell(row, c);
      this.enableEditing(row, c);
      return;
    }
  }

  // ------------------------------
  // 2) If all required fields are filled → ADD ROW
  // ------------------------------
  if (this.allowUserToAddRows) {
    if (this.isRowReadyForNext(row)) {
      this.addRow();
      return;
    }
  }

  // ------------------------------
  // 3) Move to next row's first editable column
  // ------------------------------
  if (row + 1 < this.data.length) {
    for (let c = 0; c < totalCols; c++) {
      if (isEditable(this.columns[c])) {
        this.focusCell(row + 1, c);
        this.enableEditing(row + 1, c);
        return;
      }
    }
  }
}
formatDate(value: any): string | null {
  if (!value) return null;
  const d = new Date(value);
  return d.toISOString().substring(0, 10); // yyyy-MM-dd
}

onDateChange(value: string, row: any, field: string) {
  row[field] = value ? new Date(value) : null;
}

updateSerialNumbers() {
  let sno = 1;
  this.data.forEach(row => {
    if (row.hasOwnProperty("sno")) {
      row.sno = sno++;
    }
  });
}

isRowReadyForNext(rowIndex: number): boolean {
  const row = this.data[rowIndex];

  for (const col of this.columns) {

    if (col.requiredForNextRow) {
      const value = row[col.field];

      if (value === null || value === undefined || value === '' || value === 0) {
        return false; // required field missing
      }
    }
  }
  return true;
}


  focusPrevEditableCell(row: number, col: number) {
    for (let c = col - 1; c >= 0; c--) {
      if (!this.columns[c].readOnly) {
        this.focusCell(row, c);
        this.enableEditing(row, c);
        return;
      }
    }

    if (row > 0) {
      for (let c = this.columns.length - 1; c >= 0; c--) {
        if (!this.columns[c].readOnly) {
          this.focusCell(row - 1, c);
          this.enableEditing(row - 1, c);
          return;
        }
      }
    }
  }

  /* ================================
      ADD ROW (NO RENDER SHAKE)
  ================================= */
  addRow() {
    const newRow: any = {};
    this.columns.forEach(c => newRow[c.field] = '');

    this.data.push(newRow);
  this.updateSerialNumbers();   

    this.rowAdded.emit(newRow);
    const r = this.data.length - 1;

    setTimeout(() => {
      this.focusCell(r, 0);
      this.enableEditing(r, 0);
    });
  }

  /* ================================
      DELETE ROW
  ================================= */
  deleteRow(row: number) {
    if (row < 0 || row >= this.data.length) return;

    this.data.splice(row, 1);
    this.rowDeleted.emit(row);

    if (this.data.length === 0 && this.allowUserToAddRows) {
      this.addRow();
      return;
    }

    const next = Math.min(row, this.data.length - 1);
    this.focusCell(next, 0);
  }

  /* ================================
      COLUMN RESIZE
  ================================= */
  startResize(event: MouseEvent, colIndex: number) {
    if (!this.allowUserToResizeColumns) return;

    this.resizingColumn = colIndex;
    this.startX = event.pageX;
    this.startWidth =
      (event.target as HTMLElement).parentElement!.offsetWidth;

    document.addEventListener('mousemove', this.resizeMove);
    document.addEventListener('mouseup', this.resizeStop);
  }

  resizeMove = (event: MouseEvent) => {
    if (this.resizingColumn === null) return;

    const dx = event.pageX - (this.startX ?? 0);
    const newWidth = Math.max(60, (this.startWidth ?? 0) + dx);

    const th = document.querySelectorAll('th')[this.resizingColumn];
    if (th) (th as HTMLElement).style.width = `${newWidth}px`;
  };

  resizeStop = () => {
    this.columnResized.emit(this.resizingColumn);
    this.resizingColumn = null;

    document.removeEventListener('mousemove', this.resizeMove);
    document.removeEventListener('mouseup', this.resizeStop);
  };

emitCellValueChanged(row: number, col: number, value: any) {
  const field = this.columns[col].field;   // <-- CRITICAL
  this.cellValueChanged.emit({ row, col, field, value });
}
onSelectChanged(row: number, col: number, field: string, value: any) {
  this.cellValueChanged.emit({
    row,
    col,
    value: Number(value)
  });
}




}
