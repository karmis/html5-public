/**
 * Created by Ivan Banan on 05.02.2020.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Injector,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {TreeStandardListTypes} from '../controls/tree/types';
import {IMFXControlsTreeComponent} from '../controls/tree/imfx.tree';
import {LookupSearchLocationService} from '../../services/lookupsearch/location.service';
import {BasketService} from '../../services/basket/basket.service';
import {PresetGroupType, PresetType} from './types';
import * as $ from "jquery";
import { ActivatedRoute, Router } from "@angular/router";
import {BehaviorSubject, Observable, Subject} from "rxjs";

@Component({
    selector: 'order-presets-grouped',
    templateUrl: 'tpl/index.html',
    styleUrls: ['styles/index.scss'],
    providers: [
        LookupSearchLocationService,
        BasketService,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrderPresetsGroupedComponent {
    @Input() public dontLoadAfterViewInit: boolean = false;

    public data: any = null;
    @Input('data') set setData(data) {
        this.data = data;
    }
    @Output() public clickByPresetItemEvent: EventEmitter<PresetType> = new EventEmitter<PresetType>();
    @Output() public dblClickByPresetItemEvent: EventEmitter<PresetType> = new EventEmitter<PresetType>();
    // @Output() public onReady: EventEmitter<void> = new EventEmitter<void>();
    @Output() public onReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // ready: boolean = false;
    private entries: TreeStandardListTypes = [];
    @ViewChild('tree', {static: false}) private tree: IMFXControlsTreeComponent;
    @ViewChild('overlayWrapper', {static: false}) private overlayWrapper: ElementRef;
    @ViewChild('filterInput', {static: false}) private filterInput: ElementRef;
    private groupZero = null; // presets from this group will be replaced into fancy-root
    /**
     *
     * @param preset
     * @param expandParent
     * return isSuccess
     */
    private activePreset: PresetType;
    private destroyed$: Subject<any> = new Subject();

    constructor(private injector: Injector,
                protected cdr: ChangeDetectorRef,
                private service: BasketService,
                private router: Router
    ) {
    }

    ngAfterViewInit() {
        let route = this.injector.get(ActivatedRoute);
        // ngInit --x
        route.parent && route.parent.url.subscribe((data) => {
            this.setPresets();
        }, error => console.error(error));
        if (!this.dontLoadAfterViewInit) {
            this.setPresets();
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.onReady.complete();
    }

    preparePresets() {
        //replace items from group(Id=0) into source.
        let preparedData = this.data
            .filter(el => el.Id !== 0)
            .map(el => {
                el['IS_FOLDER'] = true;
                return el;
            });
        this.groupZero = this.data.find(el => el.Id == 0);
        let groupZeroPresets = (this.groupZero && this.groupZero.Presets)
            ? this.groupZero.Presets
            : [];
        preparedData = preparedData.concat(groupZeroPresets);

        let normData: TreeStandardListTypes = this.tree.turnArrayOfObjectToStandart(
            preparedData, {
                key: 'Id',
                title: 'Name',
                children: 'Presets'
            }
        );
        this.entries = normData;
        this.tree.setSource(this.entries);
        // this.tree.expandAll();
        this.toggleOverlay(false);
        setTimeout(() => {
            // this.onReady.emit();
            this.onReady.next(true);
            // this.ready = true;
        });
    }

    setPresets() {
        if (this.data) {
            this.preparePresets();
        } else {
            this.service.getOrderPresetsGrouped().subscribe(
                (data: Array<PresetGroupType>) => {
                    this.data = data;
                    this.preparePresets();
                },
                (error: any) => {
                    console.error('Failed', error);
                }
            );
        }
    }

    setFocusOnFilter() {
        setTimeout(() => {
            this.filterInput.nativeElement.focus();
        });
    }

    extraOnRenderNode($event) {
        const _this = this;
        const node = $event.data.node;
        const dirtyObj = node.data && node.data.dirtyObj || {};
        const color = getColor(node);
        const expanderSpanEl = $($event.data.node.li).find('span.fancytree-expander');

        if (dirtyObj.IS_FOLDER) {
            expanderSpanEl.css('color', color);
        } else {
            expanderSpanEl.html(`<span class="fancy-preset-prefix" style="border-color:${color}"></span>`);
        }


        function getColor(node) {
            if (node.data && node.data.dirtyObj && node.data.dirtyObj.Color) {
                return node.data.dirtyObj.Color;
            } else if (node.parent) {
                return getColor(node.parent);
            } else if (_this.groupZero && _this.groupZero.Color) {
                return _this.groupZero.Color;
            } else {
                return '';
            }

        }
    }

    /**
     * Filter of data
     * @param $event
     */
    filter($event) {
        this.tree.filterCallback($event.target.value, function (str, node) {
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

    toggleOverlay(show) {
        if (show) {
            $(this.overlayWrapper.nativeElement).show();
        } else {
            $(this.overlayWrapper.nativeElement).hide();
        }
        try {
            this.cdr.detectChanges();
        } catch (e) {

        }
    }

    getActivePreset() {
        const node = this.tree.getActiveNode();
        if (node && node.data.dirtyObj) {
            return node.data.dirtyObj;
        } else if (this.activePreset) {
            return this.activePreset;
        } else {
            return null;
        }
    }

    getPresetById(id: number): PresetType {
        let item;
        this.entries.forEach(el => {
            if (el.folder) {
                const _item = el.children.find(_el => {
                    return _el.key == id;
                });
                if (_item) {
                    item = _item;
                };
            } else {
                if (el.key == id) {
                    item = el;
                };
            }
        });

        if (item) {
            return item.dirtyObj as PresetType;
        } else {
            return null;
        }
    }

    //async
    setPresetActive(preset: PresetType, expandParent = true)  {
        this.onReady.subscribe((val) => {
            if (!val) {
                return;
            }

            this._setPresetActive(preset, expandParent);
        });
    }

    setPresetActiveByIdAsync(id: number): Observable<boolean> {
        return new Observable(obs => {
            this.onReady.subscribe(val => {
                if (!val) {
                    return;
                }
                const item = this.getPresetById(id);

                if (item) {
                    this.setPresetActive(item);
                    obs.next(true);
                } else {
                    obs.next(false);
                }
                obs.complete();
            });
        });
    }

    _setPresetActive(preset: PresetType, expandParent = true): boolean {
        const tree = this.tree.getTree();
        if (!tree) {
            return false;
        }

        if (preset && preset.Id) {
            const node = tree.findFirst(n => n.data.dirtyObj.Id == preset.Id);
            node && node.parent && node.parent.setExpanded(true);
            node && node.setActive(true);
            this.activePreset = preset;
            return true;
        } else {
            const node = this.tree.getActiveNode();
            node && node.setActive(false);
            return false;
        }
    }

    clear() {
        this.activePreset = null;
        this.tree.unSelectAll();
    }

    onClickByPresetItem($event) {
        const node = $event.data.node;
        if (!node)
            return;

        if (!node.children) {
            this.clickByPresetItemEvent.emit(<PresetType>node.data.dirtyObj);
        }
    }

    onDblClickByPresetItem($event) {
        const node = $event.data.node;
        if (!node)
            return;

        if (!node.children) {
            this.dblClickByPresetItemEvent.emit(<PresetType>node.data.dirtyObj);
        }
    }
}
