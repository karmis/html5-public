import {SlickGridProvider} from "../../../../slick-grid/providers/slick.grid.provider";
import {Router} from "@angular/router";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {Select2ItemType} from "../../../../../controls/select2/types";
import { UtilitiesService } from "../../../../../../services/common/utilities.service";

export class TaggingSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    private selectedTagTypes: Select2ItemType[] = [
        {id: 0, text: 'Comments'},
        {id: 1, text: 'Legal'},
        {id: 2, text: 'Cuts'}
    ];

    constructor(@Inject(Injector) public injector: Injector, private utilities: UtilitiesService) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }

    getFilter(): Function {
        const selectedTagTypes = this.utilities.customLabels(this.selectedTagTypes, 'text');

        return (item: any) => {
            if (!(<any>this.componentContext).slickGrid.module.hasOuterFilter) {
                return true;
            } else {
                if(!selectedTagTypes || selectedTagTypes.length === 0){
                    return true;
                }
                // tagtype
                if (item) {
                    let isSuccess: boolean = false;
                    // new tag values
                    isSuccess = (selectedTagTypes.filter((selectedTagType: Select2ItemType) => {
                        return !selectedTagType.isNewTag
                    }).map((selectedTagType: Select2ItemType) => {
                        return selectedTagType.text
                    }).indexOf(item.TagType) !== -1);

                    if (isSuccess) {
                        return isSuccess;
                    } else {
                        // filter values
                        isSuccess = (selectedTagTypes.filter((selectedTagType: Select2ItemType) => {
                            return selectedTagType.isNewTag && item.Notes && item.Notes.indexOf(selectedTagType.text) > -1
                        })).length != 0;
                    }

                    return isSuccess;
                } else {
                    console.error('>>> Cant get tagtype (var item)', item);
                }
                return;
            }
        };
    }

    setSelectedTagTypes(objs: Select2ItemType[]): void {
        this.selectedTagTypes = objs;
    }

    /**
     * On double click by row
     * @param data
     */
    onRowDoubleClicked() {
        return;
    }

    /**
     * On mousedown
     * @param data
     */
    onRowMousedown(data) {
        let row = data.row;
        (<any>this.componentContext).setNode({
            markers: [
                {time: row.InTc},
                {time: row.OutTc}
            ],
            id: row.customId || row.Id
        });
    }
}
