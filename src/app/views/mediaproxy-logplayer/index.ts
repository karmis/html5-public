// async components must be named routes for WebpackAsyncRoute
import {CommonModule} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import {RouterModule} from "@angular/router";
import {SafePipeModule} from "../../modules/pipes/safePipe";
import {IMFXNotAvailableModule} from "../../modules/controls/not.available.comp";
import {OverlayModule} from "../../modules/overlay";
import {NgModule} from "@angular/core";
import {MediaProxyLogPlayerComponent} from "./mediaproxy.logplayer";
import { appRouter } from '../../constants/appRouter';

const routes = [
    {path: appRouter.empty, component: MediaProxyLogPlayerComponent}
];

@NgModule({
    declarations: [
        MediaProxyLogPlayerComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        SafePipeModule,
        IMFXNotAvailableModule,
        OverlayModule
    ],
})
export class MediaProxyLogPlayerModule {
    public static routes = routes;
}
