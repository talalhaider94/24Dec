import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TConfigurationComponent } from './tconfiguration.component';
import { TConfigurationAdvancedComponent } from './advanced/advanced.component';
import { WorkflowComponent } from './workflow/workflow.component';

const routes: Routes = [
    {
        path: 'general',
        component: TConfigurationComponent,
        data: {
            title: 'Configurazioni Generali'
        }
    },
    {
        path: 'advanced',
        component: TConfigurationAdvancedComponent,
        data: {
            title: 'Configurazioni Avanzate'
        }
    },
    {
        path: 'workflow',
        component: WorkflowComponent,
        data: {
            title: 'Workflow'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TConfigurationRoutingModule { }
