import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import * as sha256 from 'sha256';
import {environment} from '../../environments/environment';
import Headers from '../_helpers/headers';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>; // Danial: To use for reactively updating UI login.
  // Danial TODO: replace any with user model in future
  constructor(private http: HttpClient, private router: Router) {
      this.currentUserSubject = new BehaviorSubject<any>(this.getUser());
    this.currentUser = this.currentUserSubject.asObservable();

  }
  
  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    const hashedPassword: string = sha256('p4ssw0rd'+sha256(password));
    // Danial TODO: move endpoint into separat constant file
    const loginEndPoint = `${environment.API_URL}/Data/Login?username=${username}&password=${hashedPassword}`;
    // Danial TODO: move headers code into custom HTTP Interceptor class
    return this.http.get<any>(loginEndPoint, Headers.setHeaders('GET'))
        .pipe(map(user => {
          if (!!user && user.token) {
                user.last_action = Date.now(); // temp
                console.log(user);
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            }
            return user;
        }));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : false;
  }

  isLoggedIn(): boolean {
      return !!this.getUser();
  }

  checkSession() {
    let user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      //console.log(user)
      let last_action = user.last_action;
      //console.log(last_action);
      //console.log(Date.now());
      if ((Date.now() - last_action) <= 900000) {
        let new_action = Date.now();
        user.last_action = new_action;
        localStorage.setItem('currentUSer', JSON.stringify(user));
        //console.log('sessione rinnovata')
        return true
      }
    }
    //console.log('sessione scaduta')
    this.logout();
    this.router.navigate(['/login']);
    return false
  }
  resetPassword(username,email): Observable<any> {
    const resetPasswordEndPoint = `${environment.API_URL}/Data/ResetPassword?username=${username}&email=${email}`;
    return this.http.get(resetPasswordEndPoint, Headers.setHeaders('GET'))
    .pipe(map(data => {
      return data;
    }))
  }

}
