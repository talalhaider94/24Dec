import { Component, OnInit } from '@angular/core';
import { FormGroup,  FormBuilder,  Validators } from '@angular/forms';
import { AuthService, DashboardService } from '../../_services';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit{
  title: string = 'Login';
  loginForm: FormGroup;
  submitted: boolean = false;
  returnUrl: string;
  loading: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private dashboardService: DashboardService
  ) {
    //localStorage.removeItem('currentUser');
    if (this.authService.currentUserValue || this.authService.isLoggedIn()) {
      console.log('checkLogin');
      this.authService.checkToken();
      this.router.navigate(['/coming-soon']);
    }
  }
  
  get f() { return this.loginForm.controls; }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
        userName: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(4)]]
    });
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/coming-soon';
  }

  onLoginFormSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.toastr.error('Inserisci i campi in maniera corretta.', 'Errore');
        return;
    } else {
      const { userName, password } = this.f;
      this.loading = true;
      this.authService.login(userName.value, password.value).pipe(first()).subscribe(data => {
        this.dashboardService.GetDefaultDashboardId().subscribe(result => {
          if(result !== -1) {
            this.router.navigate(['dashboard/public', result]);
          } else if(result == -1) {
            this.router.navigate(['dashboard/landingpage']);
          }else{
            this.router.navigate(['dashboard/list']);
          }
          
          this.toastr.success('Login eseguito con successo.');
          this.loading = false;
        });
      }, error => {
        console.log('onLoginFormSubmit: error', error);
        this.toastr.error(error.error, error.description);
        this.loading = false;
      })
    }
    
  }

}
