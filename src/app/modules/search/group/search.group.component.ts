import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { IMFXControlsTreeComponent } from '../../controls/tree/imfx.tree';
import { HttpService } from '../../../services/http/http.service';
import { HttpResponse } from '@angular/common/http';
import { TreeStandardItemType, TreeStandardListTypes } from '../../controls/tree/types';
import { SearchGroupProvider } from './providers/search.group.provider';
import { OverlayComponent } from '../../overlay/overlay';
import { Observable, Subscriber } from 'rxjs';

export type SearchGroupItem = {
    ChildCount: number
    Children: any[]
    GroupTypeId: number
    GroupTypeName: string | 'Collection'
    Id: number
    Name: string
    ParentId: number
    SearchHit: boolean
}
export type SearchGroupOnGroupClickType = SearchGroupItem & {}
export type SearchGroupOnClickByRow = {
    id: number, str: string, mode?: 'tree' | 'rows' | 'groups'
}

@Component({
    selector: 'search-group',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/styles.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        // SearchGroupProvider
    ]
})

export class SearchGroupComponent {
    public isBuilt: boolean = false;
    public moduleContext: any = this;
    @ViewChild('tree', {static: false}) public tree: IMFXControlsTreeComponent;
    public text: string = ''; /* Monday */
    @Input('connector') public connector: SearchGroupProvider;
    @Input('mode') public mode: 'tree' | 'rows' | 'groups' = 'rows';
    @Output('onGroupClick') onGroupClick: EventEmitter<SearchGroupOnGroupClickType> = new EventEmitter<SearchGroupOnGroupClickType>();
    @Input('withInput') public withInput: boolean = true;
    public self = this;
    public ObjectRef: Object = Object;
    @ViewChild('overlay', {static: false}) private overlay: OverlayComponent;
    @ViewChild('wrapper', {static: false}) private wrapper: ElementRef;
    private searchResultList: any = {};
    private searchResultGroups: SearchGroupItem[] = [];
    private resMap: { [key: number]: TreeStandardListTypes } = {};

    constructor(private httpService: HttpService, private cdr: ChangeDetectorRef, public provider: SearchGroupProvider) {
        // this.connector = provider;
        this.provider.tree = this.tree;
    }

    ngAfterViewInit() {
        this.provider.searchResultGroups = this.searchResultGroups;
        if (this.mode === 'tree') {
            this.getChildren(0, false);
        }
        this.provider.clickByRow.subscribe((data: SearchGroupOnClickByRow) => {
            // if ((data.mode === 'groups' && this.mode === 'groups') || this.mode === 'groups') {
            //     this.loadGroups(data.id);
            // }
            if (this.mode === 'tree') {
                this.getChildren(data.id, false);
            } else if (this.mode === 'rows') {
                this.provider.selectedGroupId = data.id;
                this.connector.clickByCollection.emit(data.id);
            }
        });
    }

    public minLengthForRows: number = 3;
    search(text: string = '') {
        if(text.length < this.minLengthForRows) {
            return;
        }
        this.overlay.show(this.wrapper.nativeElement);
        this.httpService.post('/api/v3/search/folders', {'Text': text ? text : this.text})
            .subscribe((res: HttpResponse<any>) => {
            this.provider.searchResultList = res.body['Data'][0];
            this.overlay.hide(this.wrapper.nativeElement);
            this.cdr.markForCheck();
        });
    }

    _clickByRow(data: SearchGroupOnClickByRow) {
        this.provider.clickByRow.emit(data);
    }

    onActivateNode($event) {
        this.provider.selectedGroupId = $event.data.node.key;
        this.connector.clickByCollection.emit($event.data.node);
        // this.provider.clickByRow.emit(data);
        return false;
        // $event.data.node.load().done((children) => {
        //     console.log(children);
        //     debugger
        // })
        // more...
        // const data: SearchGroupOnClickByRow = $event.data.node.data.dirtyObj;
        // data.mode = 'groups';
        // this.provider.clickByRow.emit(data);
    }

    clickByCollection(group: SearchGroupItem) {
        this.provider.clickByCollection.emit(group.Id);
    }

    getParents(id: number = 0, recursive: boolean = false) {
        // if (!this.tree) {
        //     return;
        // }
        // this.overlay.show(this.wrapper.nativeElement);
        // // tree from leafs
        // const strArr = str.split('/');
        // const treeArr = strArr.map((str, i) => {
        //     return {
        //         key: i,
        //         title: str,
        //         folder: false,
        //         children: [],
        //         dirtyObj: {},
        //         selected: false,
        //         lazy: false,
        //         expanded: true,
        //     } as TreeStandardItemType
        // });
        //
        // let lastChild: TreeStandardItemType = {} as TreeStandardItemType;
        // let flag = 0;
        // for (let i = treeArr.length - 1; i > 0; i--) {
        //     let item: TreeStandardItemType = treeArr[i];
        //     item.dirtyObj = {
        //         str: str,
        //         id: id
        //     };
        //     if (flag === 0) {
        //         lastChild = item;
        //     } else {
        //         item.children = [lastChild];
        //         lastChild = item;
        //     }
        //     flag++;
        // }
        // this.tree.setSource([lastChild]);
        // new Promise((r) => {
        //     r();
        // }).then(() => {
        //     this.overlay.hide(this.wrapper.nativeElement);
        // });


        // tree from back
        this.overlay.show(this.wrapper.nativeElement);
        this.httpService.get('/api/v3/folderbrowser/' + id + '/parents?recursive=' + (recursive ? 'true' : 'false')).subscribe((res: HttpResponse<any>) => {
            this.resMap[id] = res.body;
            console.log(res);
            debugger
            // this.provider.searchResultList = res.body['Data'][0];
            this.overlay.hide(this.wrapper.nativeElement);
            this.cdr.markForCheck();
        });
    }

    buildChildren(id: number = 0, recursive: boolean = false, overlay: boolean = true) {
        if (this.resMap[id] && this.resMap[id].length > 0) {
            this.tree.setSource(this.resMap[id]);
            this.isBuilt = true;
        } else {
            if (overlay) {
                this.overlay.show(this.wrapper.nativeElement);
            }
            this.getChildren(id, recursive).subscribe((data: TreeStandardItemType[]) => {
                this.tree.setSource(data);
                this.isBuilt = true;
                if (overlay) {
                    this.overlay.hide(this.wrapper.nativeElement);
                }
                this.cdr.markForCheck();
            });
        }
    }

    getChildren(id: number = 0, recursive: boolean = false): Observable<TreeStandardListTypes> {
        return new Observable((observer: Subscriber<TreeStandardListTypes>) => {
            if (this.resMap[id]) {
                observer.next(this.resMap[id]);
                observer.complete();
                return;
            }
            this.httpService.get('/api/v3/folderbrowser/' + id + '/children?recursive=' + (recursive ? 'true' : 'false')).subscribe((res: HttpResponse<any>) => {
                this.resMap[id] = this._buildTree(res.body);
                observer.next(this.resMap[id]);
                observer.complete();
            });
        });
    }

    public lazyLoadFn(event, data, compContext: SearchGroupComponent): JQueryDeferred<any> {
        const def = jQuery.Deferred();
        const id = data.node.data.dirtyObj.Id;
        compContext.getChildren(id, false).subscribe((res: TreeStandardItemType[]) => {
            def.resolve(res);
        });
        data.result = def;

        return def;
    }

    private _buildTree(data): TreeStandardListTypes {
        return this.tree.turnArrayOfObjectToStandart(
            data,
            {
                key: 'Id',
                title: 'Name',
                children: 'Children',
                lazy: true,
                autoExpand: true
            }
        );
    }

    // private loadGroups(id: number) {
    //     this.provider.selectedGroupId = id;
    //     this.overlay.show(this.wrapper.nativeElement);
    //     this.httpService.get('/api/v3/folderbrowser/' + (id) + '/children').subscribe((_res: HttpResponse<SearchGroupItem[]>) => {
    //         this.searchResultGroups = _res.body;
    //         this.overlay.hide(this.wrapper.nativeElement);
    //         this.cdr.markForCheck();
    //     });
    // }
}
