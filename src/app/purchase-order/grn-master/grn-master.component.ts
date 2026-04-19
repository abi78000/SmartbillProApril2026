import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrnEntryComponent } from '../grn-entry/grn-entry.component';
import { GrnViewComponent } from '../grn-view/grn-view.component';
@Component({
  selector: 'app-grn-master',
  standalone: true,
  imports: [
    CommonModule,
    GrnEntryComponent,
    GrnViewComponent
  ],
  templateUrl: './grn-master.component.html',
  styleUrl: './grn-master.component.css'
})
export class GrnMasterComponent {

  activeTab: string = 'entry';

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
