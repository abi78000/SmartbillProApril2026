import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-group-box',
  imports: [],
  templateUrl: './group-box.component.html',
  styleUrl: './group-box.component.css'
})
export class GroupBoxComponent {
  @Input() title: string = '';
}
