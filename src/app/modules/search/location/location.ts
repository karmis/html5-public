/**
 * Created by Sergey Trizna on 10.01.2016.
 */
import { ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef
} from '@angular/core';
import { LookupSearchLocationService } from '../../../services/lookupsearch/location.service';
import { IMFXControlsTreeComponent } from '../../controls/tree/imfx.tree';
import { LocationsListLookupTypes } from './types';
import { TreeStandardListTypes } from '../../controls/tree/types';
import { PresetType } from '../../order-presets-grouped/types';
@Component({
    selector: 'location',
    templateUrl: 'tpl/index.html',
    styleUrls: ['./styles/index.scss'],
    providers: [
        LookupSearchLocationService
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class LocationComponent {
    get tree(): IMFXControlsTreeComponent {
        return this._tree;
    }
    public modalRef: any;
    public onReady: EventEmitter<void> = new EventEmitter<void>();
    public onSelectEvent: EventEmitter<any> = new EventEmitter<any>();
    private locations: TreeStandardListTypes = [];
    @ViewChild('tree', {static: false}) private _tree: IMFXControlsTreeComponent;

    constructor(private injector: Injector,
                private lookupSearchLocationService: LookupSearchLocationService,
                private cdr: ChangeDetectorRef) {
        this.modalRef = this.injector.get('modalRef');
    }

    ngAfterViewInit() {
        this.lookupSearchLocationService.getLocations()
            .subscribe(
                (data: LocationsListLookupTypes) => {
                    const normData: TreeStandardListTypes = this._tree.turnArrayOfObjectToStandart(
                        data,
                        {
                            key: 'ID',
                            title: 'NAM',
                            children: 'Children'
                        }
                    );
                    this.locations = normData;
                    this._tree.setSource(this.locations);
                    setTimeout(() => {
                        this.onReady.emit();
                    });
                },
                (error: any) => {
                    console.error('Failed', error);
                }
            );
    }

    /**
     * Filter of data
     * @param $event
     */
    filter($event) {
        this._tree.filterCallback($event.target.value, function (str, node) {
            if (node.title != null) {
                let normTitle = str.toLowerCase();
                let normNodeTitle = node.title.toLowerCase();
                if (normNodeTitle.indexOf(normTitle) !== -1 || node.selected === true) {
                    return true;
                }
                return false;
            }

            return false;
        });
    }

    onSelect($event) {
        this.onSelectEvent.emit(this.getSelected());
    }

    getSelected() {
        return this._tree.getSelected();
    }

    setSelectedByObject(arr) {
        let ids = [];
        arr.forEach((elem) => {
            ids.push(elem.key);
        });
        this._tree.setSelectedByArrayOfNodes(ids);
    }

    setSelectedByIds(arr: Array<number> = [], expandParent = true) {
        this._tree.setSelectedByArrayOfNodes(arr, expandParent);
    }

    setCheckboxByObj(arr) {
        // this.tree.toggleExpandAll();
        this._tree.setCheckboxForNodes(arr);
        // this.tree.toggleExpandAll();
    }
}
