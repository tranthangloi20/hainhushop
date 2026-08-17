import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private readonly service: SupabaseService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async login(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const result = await this.service.login(this.email.trim(), this.password);

      if (result.error) {
        this.error = 'Email hoặc mật khẩu không đúng.';
        return;
      }

      await this.router.navigateByUrl('/admin');
    } catch (error) {
      console.error('[HainhuShop] Login error:', error);
      this.error = 'Không thể đăng nhập. Vui lòng thử lại.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
