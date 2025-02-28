import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessages: string[] = [];
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.isLoading = true;

    if (!this.username || !this.password) {
      this.isLoading = false;
      this.errorMessages = ['Por favor, preencha todos os campos.'];
      return;
    }

    this.authService
      .login({ username: this.username, password: this.password })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (errors: string[]) => {
          console.error(errors);
          this.isLoading = false;
          this.errorMessages = errors;
        },
      });
  }
}
