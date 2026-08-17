import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pharmacy-logo',
  standalone: true,
  templateUrl: './pharmacy-logo.component.html',
  styleUrl: './pharmacy-logo.component.css',
})
export class PharmacyLogoComponent {
  @Input() compact = false;
  @Input() dark = false;
}
