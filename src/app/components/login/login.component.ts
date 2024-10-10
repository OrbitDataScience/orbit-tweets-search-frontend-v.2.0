import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../auth.service'; // Importe o serviço de autenticação

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  loginError: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    const isAuthenticated = this.authService.login(
      this.username,
      this.password
    );
    if (isAuthenticated) {
      // Se a autenticação for bem-sucedida, redirecione para a rota '/main'
      this.router.navigate(['/searchPage']);
    } else {
      // Se a autenticação falhar, defina loginError como true
      this.loginError = true;
    }
  }

  ngOnInit(): void { }
}