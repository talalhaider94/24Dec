import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoadingFormComponent } from './loading-form.component';
import { LoadingFormDetailComponent } from './loading-form-detail/loading-form-detail.component';
import { LoadingFormUserComponent } from './loading-form-user/loading-form-user.component';
import { LoadingFormUserNotTrackingComponent } from './loading-form-user-nottracking/loading-form-user-nottracking.component';
import { LoadingFormSecurityUserComponent } from './loading-form-securityuser/loading-form-securityuser.component';
import { ProveVarieComponent } from './prove-varie/prove-varie.component';
import { LoadingFormAdminComponent } from './loading-form-admin/loading-form-admin.component';

const routes: Routes = [
    {
        path: '',
        data: {
            title: 'Loading Form'
        },
        children: [
            {
                path: '',
                redirectTo: 'admin'
            },
            {
                path: 'admin',
                component: LoadingFormComponent,
                data: {
                    title: 'Admin'
                }
            },
            {
                path: 'utente',
                component: LoadingFormUserComponent,
                data: {
                    title: 'Utente'
                }
            },
            {
              path: 'utente-notracking',
              component: LoadingFormUserNotTrackingComponent,
              data: {
                title: 'LF diverso periodo'
              }
            },
            {
                path: 'securityuser',
                component: LoadingFormSecurityUserComponent,
                data: {
                    title: 'S-Utente'
                }
            },
            {
                path: 'admin/:formId/:formName',
                component: LoadingFormAdminComponent,
                data: {
                    title: 'Admin'
                }
            },
            {
                path: 'utente/:formId/:formName',
                component: ProveVarieComponent,
                data: {
                    title: 'Utente'
                }
            },
        ],
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoadingFormRoutingModule { }
