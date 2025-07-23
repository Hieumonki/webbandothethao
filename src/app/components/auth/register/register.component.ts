import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service'; // Đảm bảo đường dẫn đúng
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    if (this.user.password !== this.user.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    this.authService.register(this.user).subscribe({
      next: (res: any) => {
        alert(res.message || 'Đăng ký thành công!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert(err?.error?.message ?? 'Đăng ký thất bại!');
      }
    });

  }
}
