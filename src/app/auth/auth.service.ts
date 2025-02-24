import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

interface LoginResponse {
  accessToken: string;
}

interface SignupResponse {
  accessToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://taskfy-backend-akl2.onrender.com';
  private tokenKey = 'accessToken';
  private isBrowser: boolean;

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    const token = this.cookieService.get(this.tokenKey);
    this.isLoggedInSubject.next(!!token);
  }

  login(credentials: {
    username: string;
    password: string;
  }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.cookieService.set(this.tokenKey, response.accessToken, {
            path: '/',
          });
          this.isLoggedInSubject.next(true);
        })
      );
  }

  signUp(data: {
    username: string;
    password: string;
  }): Observable<SignupResponse> {
    return this.http
      .post<SignupResponse>(`${this.apiUrl}/auth/signup`, data)
      .pipe(
        tap((response) => {
          this.cookieService.set(this.tokenKey, response.accessToken, {
            path: '/',
          });
          this.isLoggedInSubject.next(true);
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.cookieService.delete(this.tokenKey, '/');
        this.isLoggedInSubject.next(false);
        this.router.navigate(['/login']);
      })
    );
  }

  getToken(): string | null {
    return this.cookieService.get(this.tokenKey) || null;
  }
}
