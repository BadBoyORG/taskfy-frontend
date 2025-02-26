import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
        }),
        catchError(this.handleError)
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
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.cookieService.delete(this.tokenKey, '/');
        this.isLoggedInSubject.next(false);
        this.router.navigate(['/login']);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessages: string[] = [];
    if (error.error instanceof ErrorEvent) {
      // Erro no lado do cliente
      errorMessages.push(`Error: ${error.error.message}`);
    } else {
      // Erro do lado do servidor, a resposta geralmente tem "message", "error" e "statusCode"
      if (Array.isArray(error.error?.message)) {
        errorMessages = error.error.message;
      } else {
        errorMessages.push(
          error.error?.message || 'Ocorreu um erro desconhecido'
        );
      }
    }
    return throwError(() => errorMessages);
  }

  getToken(): string | null {
    return this.cookieService.get(this.tokenKey) || null;
  }
}
