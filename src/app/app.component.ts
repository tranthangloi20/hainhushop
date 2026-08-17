import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PharmacyLogoComponent } from './shared/components/pharmacy-logo/pharmacy-logo.component';
import { SHOP_CONFIG } from './core/config/shop.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, PharmacyLogoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly config = SHOP_CONFIG;
  menuOpen = false;

  closeMenu(): void {
    this.menuOpen = false;
  }
}
