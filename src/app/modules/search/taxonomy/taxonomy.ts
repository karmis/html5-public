/**
 * Created by Sergey Trizna on 10.01.2016.
 */
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { LookupSearchLocationService } from '../../../services/lookupsearch/location.service';
import { IMFXControlsTreeComponent } from '../../controls/tree/imfx.tree';
import { TaxonomyType } from './types';
import { TreeStandardListTypes } from '../../controls/tree/types';
import { TaxonomyService } from './services/service';

@Component({
    selector: 'taxonomy',
    templateUrl: 'tpl/index.html',
    styleUrls: ['styles/index.scss'],
    providers: [
        LookupSearchLocationService,
        TaxonomyService
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TaxonomyComponent {
    public data: any;
    public onReady: EventEmitter<void> = new EventEmitter<void>();
    public entries: TreeStandardListTypes = [];
    private classes: string = '';

    constructor(private injector: Injector,
                private service: TaxonomyService) {
        this.data = this.injector.get('modalRef');
        this.classes = this.data._data.data.classes;
        debugger
    }

    @ViewChild('tree', {static: false}) private _tree: IMFXControlsTreeComponent;

    get tree(): IMFXControlsTreeComponent {
        return this._tree;
    }

    ngAfterViewInit() {
        this.service.getTaxonomy()
            .subscribe(
                (data: Array<TaxonomyType>) => {
                    let normData: TreeStandardListTypes = this._tree.turnArrayOfObjectToStandart(
                        data, {
                            key: 'ID',
                            title: 'Name',
                            children: 'Children'
                        }
                    );
                    this.entries = normData;
                    this._tree.setSource(this.entries);
                    this._tree.expandAll();
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

    onClickByTreeItem($event) {
        if ($event.event.originalEvent.target.className == 'fancytree-expander') {
            return true;
        }
        const node = $event.data.node;
        // new selection
        if ((!node.isActive() && !node.isSelected())) {
            this.select(node, true, true);
        } else if (node.isActive() || node.isSelected()) {
            if (node.isActive()) {
                this.reset(null, true);
                this.deselect(node)
            } else {
                this.deselect(node);
            }
        } else if (node.isActive() && node.isSelected()) {
            this.reset(null, true);
        }
        // this.data._data.data.compContext.onSelect($event.data.tree.getSelectedNodes());
        $event.event.preventDefault();
        return false;
    }

    onDblClickByTreeItem($event) {
        // let node = $event.data.node;
        // if (node.children) return false;
        // this.data._data.data.compContext.onSelect([node]);
        // this.data.hide();
    }

    getSelected() {
        return this._tree.getSelected();
    }

    setSelectedByIds(arr: Array<number> = []) {
        const tree = this._tree.getTree()
        $.each(arr, (k, id) => {
            const node = tree.getNodeByKey(id)
            node.setSelected(true);
            node.setActive(true);
            // this.tree.setSelectedById(id);
        });

        // const selNodes = this.getSelected();
        // if (selNodes && selNodes.length > 0) {
        //     const selNode = selNodes[0];
        //     selNode.visit((childNode) => {
        //         childNode.setSelected(true);
        //         childNode.visit((itschildNode) => {
        //             itschildNode.setSelected(true);
        //         });
        //     });
        //
        //     selNode.setActive(true);
        // }
    }

    private reset(node = null, children: boolean = false) {
        if (!node) {
            this._tree.getTree().visit((chNode) => {
                chNode.setActive(false);
                chNode.setSelected(false);
            })
        } else if (node) {
            if (children) {
                node.visit((chNode) => {
                    chNode.setActive(false);
                    chNode.setSelected(false);
                })
            }
        }
        // reset selection

    }

    private select(node, active: boolean = true, children: boolean = false) {
        // select nodes
        node.setSelected(true);
        if (active) {
            node.setActive(true);
        }
        if (children) {
            node.visit((childNode) => {
                childNode.setSelected(true);
                if (active) {
                    node.setActive(true);
                }
            });
        }
    }

    private deselect(node, children: boolean = true) {
        node.setActive(false);
        node.setSelected(false);
        if (children) {
            node.visit((childNode) => {
                childNode.setSelected(false);
                childNode.setActive(false);
            });
        }
    }
}
