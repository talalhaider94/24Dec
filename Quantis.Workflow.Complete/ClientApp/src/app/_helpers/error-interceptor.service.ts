import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../_services/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class ErrorInterceptorService implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
    ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      console.log('Error Interceptor', err);
      if (err.status === 401) {
        // auto logout if 401 response returned from api
        this.authService.logout();
        this.router.navigate(['/login']);
        this.toastr.error('Sessione Scaduta', 'Effettuare nuovamente il login');
      }
      return throwError(err);
    }))
  }
}
