import { Component } from '@angular/core';

import { SHOP_CONFIG } from '../../core/config/shop.config';

@Component({
  standalone: true,
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.css',
})
export class PolicyComponent {
  readonly zaloLink = `https://zalo.me/${SHOP_CONFIG.zaloPhone}`;
  readonly shopTelLink = `tel:${SHOP_CONFIG.shopPhone}`;
  readonly pharmacistTelLink = `tel:${SHOP_CONFIG.pharmacistPhone}`;
}
