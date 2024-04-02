/**
 * Created by Sergey Trizna on 16.02.2017.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
// comps
import { SearchGroupComponent } from './search.group.component';
import { FormsModule } from '@angular/forms';
import { appRouter } from '../../../constants/appRouter';
import { IMFXControlsTreeModule } from '../../controls/tree';
import { OverlayModule } from '../../overlay';

// async components must be named routes for WebpackAsyncRoute
// const routes: Routes = [
//     {path: appRouter.empty, component: SearchGroupComponent}
// ];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SearchGroupComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        // RouterModule.forChild(routes),
        IMFXControlsTreeModule,
        FormsModule,
        OverlayModule,
    ],
    exports: [
        SearchGroupComponent
    ]
})
export class SearchGroupModule {
    // public static routes = routes;
}
