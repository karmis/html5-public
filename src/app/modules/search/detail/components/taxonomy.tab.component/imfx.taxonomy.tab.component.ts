import { Component, Injectable, Input, ViewChild, ViewEncapsulation } from "@angular/core";
import {IMFXControlsTreeComponent} from "../../../../controls/tree/imfx.tree";
import {TaxonomyService} from "../../../taxonomy/services/service";
import {TaxonomyType} from "../../../taxonomy/types";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'imfx-taxonomy-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
@Injectable()
export class IMFXTaxonomyComponent {
    @ViewChild('tree', {static: false}) private tree: IMFXControlsTreeComponent;
    config: any;
    private filterText: string;
    private destroyed$: Subject<any> = new Subject();
    taxonomySettings: any;

    constructor(private taxonomyService: TaxonomyService) {
    }

    ngAfterViewInit() {
        if (this.taxonomySettings) {
            this.buildTaxonomy(this.taxonomySettings.TaxonomyValues);
        } else {
            this.getTaxonomy()
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    buildTaxonomy(taxonomyValues) {
        const normData = this.tree.turnArrayOfObjectToStandart([taxonomyValues], {
            key: 'ID',
            title: 'SUBJECT_NAME',
            children: 'Children'
        });
        this.tree.setSource(normData);
        this.tree.expandAll();
    };

    getTaxonomy() {
        this.taxonomyService.getTaxonomy().pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: Array<TaxonomyType>) => {
            let normData = this.tree.turnArrayOfObjectToStandart(res, {
                key: 'Id',
                title: 'Name',
                children: 'Children'
            });
            this.tree.setSource(normData);
            this.tree.expandAll();
        });
    };

    onDblClickByTreeItem($event) {
        this.config.elem.emit('addTag', $event.data.node.data.dirtyObj);
    };

    searchKeyUp($event) {
        this.tree.filterCallback(this.filterText, function (str, node) {
            let normTitle = str.toLowerCase();
            let normNodeTitle = node.title.toLowerCase();
            if (normNodeTitle.indexOf(normTitle) !== -1 || node.selected === true) {
                return true;
            }
            return false;
        });
    };
}
