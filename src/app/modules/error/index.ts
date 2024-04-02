import { NgModule, ErrorHandler } from '@angular/core';
import { ErrorManager } from './error.manager';
import { ErrorManagerProvider } from './providers/error.manager.provider';

@NgModule({
    declarations: [],
    imports: [],
    exports: [],
    providers: [
        ErrorManager,
        ErrorManagerProvider,
        {provide: ErrorHandler, useClass: ErrorManager},
    ]
})
export class ErrorManagerModule {
}
