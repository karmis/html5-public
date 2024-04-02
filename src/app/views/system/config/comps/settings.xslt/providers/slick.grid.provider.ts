import {Router} from "@angular/router";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import { SlickGridProvider } from '../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import {XMLService} from "../../../../../../services/xml/xml.service";

export class SettingsXSLTSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public xmlService: XMLService;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.xmlService = injector.get(XMLService);
    }
    //
    //
    // deleteFromServer(data) : Observable<Subscription>{
    //     var dataTable = data.columnDef.__deps.data.rows;
    //     var itemToDelete = {};
    //     for (var i = dataTable.length - 1; i >= 0; --i) {
    //         if (dataTable[i].ID == data.data.ID) {
    //             delete dataTable[i].__contexts;
    //             delete dataTable[i].id;
    //             delete dataTable[i].$id;
    //             delete dataTable[i].EntityKey;
    //             dataTable[i].ID = -dataTable[i].ID;
    //             itemToDelete = dataTable[i];
    //             break;
    //         }
    //     }
    //     if($.isEmptyObject(itemToDelete)) {
    //         delete data.data.__contexts;
    //         delete data.data.id;
    //         delete data.data.$id;
    //         delete data.data.EntityKey;
    //         data.data.ID = -data.data.ID;
    //         itemToDelete = data.data;
    //     }
    //
    //     return new Observable((observer: any) => {
    //         observer.next("");
    //     });
    // }
}
