/**
 * Created by Sergey Trizna on 13.01.2017.
 */
// See https://github.com/mar10/fancytree/
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
// Loading jQuery
import * as $ from "jquery";
// Loading jQueryUI
import "style-loader!jquery-ui-bundle/jquery-ui.min.css";
import "style-loader!jquery-ui-bundle/jquery-ui.structure.min.css";
import "style-loader!jquery-ui-bundle/jquery-ui.theme.min.css";
import "jquery-ui-bundle/jquery-ui.min.js";
// Fancytree
import "style-loader!jquery.fancytree/dist/skin-lion/ui.fancytree.min.css";
import "./libs/jquery.fancytree-all.js";
import {
    TreeStandardConvertParamsType,
    TreeStandardItemType,
    TreeStandardListOfPointersToNodesTypes,
    TreeStandardListTypes
} from "./types";
import { IMFXControlTreeProvider } from "./providers/control.tree.provider";
import { NotificationService } from '../../notification/services/notification.service';
import { HttpService } from '../../../services/http/http.service';
import { IMFXModalProvider } from '../../imfx-modal/proivders/provider';

declare var window: any;

@Component({
    selector: 'imfx-controls-tree',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        // IMFXControlTreeProvider
    ]
})

export class IMFXControlsTreeComponent {
    @Output() onBlurTree: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCreate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onInit: EventEmitter<any> = new EventEmitter<any>();
    @Output() onFocusTree: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRestore: EventEmitter<any> = new EventEmitter<any>();
    @Output() onActivate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onBeforeActivate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onBeforeExpand: EventEmitter<any> = new EventEmitter<any>();
    @Output() onBeforeSelect: EventEmitter<any> = new EventEmitter<any>();
    @Output() onBlur: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCollapse: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCreateNode: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDblClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDeactivate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onExpand: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEnhanceTitle: EventEmitter<any> = new EventEmitter<any>();
    @Output() onFocus: EventEmitter<any> = new EventEmitter<any>();
    @Output() onKeydown: EventEmitter<any> = new EventEmitter<any>();
    @Output() onKeypress: EventEmitter<any> = new EventEmitter<any>();
    @Output() onLazyLoad: EventEmitter<any> = new EventEmitter<any>();
    @Output() onLoadChildren: EventEmitter<any> = new EventEmitter<any>();
    @Output() onLoadError: EventEmitter<any> = new EventEmitter<any>();
    @Output() onModifyChild: EventEmitter<any> = new EventEmitter<any>();
    @Output() onPostProcess: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRenderNode: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRenderTitle: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
    @Output() onUnSelect: EventEmitter<any> = new EventEmitter<any>();
    @Output() onMouseEnter: EventEmitter<any> = new EventEmitter<any>();
    @Output() onMouseLeave: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDrop: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDragOver: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDragLeave: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDragEnter: EventEmitter<any> = new EventEmitter<any>();
    @Output() onAddItem: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRemoveItem: EventEmitter<any> = new EventEmitter<any>();
    @Input() compContext: any;
    /**
     * Callback for rendering columns
     * @type {Function}
     */
    @Input()
    public allowChangedBold: boolean = false;
    /**
     * Callback for rendering columns
     * @type {Function}
     */
    @Input()
    public renderColumns: Function;
    @Input('edit') public edit: any = null;
    @Input('showKey') public showKey: boolean = false;
    /**
     * Reference to current component
     */
    @ViewChild('imfxControlsTree', {static: false}) private compRef;
    @ViewChild('imfxControlsTableTree', {static: false}) private compRefTable;
    /**
     * Source for plugin
     * @type {Array}
     */
    @Input('source') private source: Array<Object> = [];
    /**
     * Make sure, active nodes are visible (expanded)
     * @type {boolean}
     */
    @Input('activeVisible') private activeVisible: boolean = true;
    /**
     * Enable WAI-ARIA support
     * @type {boolean}
     */
    @Input('aria') private aria: boolean = false;
    /**
     * Automatically activate a node when it is focused using keyboard
     * @type {boolean}
     */
    @Input('autoActivate') private autoActivate: boolean = true;
    /**
     * Automatically collapse all siblings, when a node is expanded
     * @type {boolean}
     */
    @Input('autoCollapse') private autoCollapse: boolean = false;
    /**
     * Automatically scroll nodes into visible area
     * @type {boolean}
     */
    @Input('autoScroll') private autoScroll: boolean = false;
    /**
     * 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
     * @type {number}
     */
    @Input('clickFolderMode') private clickFolderMode: number = 4;
    /**
     * Show checkboxes
     * @type {boolean}
     */
    @Input('checkbox') private checkbox: boolean = false;
    /**
     * 0:quiet, 1:normal, 2:debug
     * @type {number}
     */
    @Input('debugLevel') private debugLevel: number = window.IMFX_VERSION == 'dev_version' ? 2 : 0;
    /**
     * Disable control
     * @type {boolean}
     */
    @Input('disabled') private disabled: boolean = false;
    /**
     * Set focus when node is checked by a mouse click
     * @type {boolean}
     */
    @Input('focusOnSelect') private focusOnSelect: boolean = false;
    /**
     * Escape `node.title` content for display
     * @type {boolean}
     */
    @Input('escapeTitles') private escapeTitles: boolean = false;
    /**
     * Generate id attributes like <span id='fancytree-id-KEY'>
     * @type {boolean}
     */
    @Input('generateIds') private generateIds: boolean = false;
    /**
     * Used to generate node id´s like <span id='fancytree-id-<key>'>
     * @type {string}
     */
    @Input('idPrefix') private idPrefix: string = "ft_";
    /**
     * Display node icons
     * @type {boolean}
     */
    @Input('icon') private icon: boolean | string = false;
    /**
     * Support keyboard navigation
     * @type {boolean}
     */
    @Input('keyboard') private keyboard: boolean = true;
    /**
     * Used by node.getKeyPath() and tree.loadKeyPath()
     * @type {string}
     */
    @Input('keyPathSeparator') private keyPathSeparator: string = "/";
    /**
     * 1: root node is not collapsible
     * @type {number}
     */
    @Input('minExpandLevel') private minExpandLevel: number = 1;
    /**
     * Navigate to next node by typing the first letters
     * @type {boolean}
     */
    @Input('quicksearch') private quicksearch: boolean = true;
    /**
     * Enable RTL (right-to-left) mode
     * @type {boolean}
     */
    @Input('rtl') private rtl: boolean = false;
    /**
     * 1:single, 2:multi, 3:multi-hier, 4:single-with-parents, 5:multiple-with-parents, 6:multi-hier-without-parent
     * @type {number}
     */
    @Input('selectMode') private selectMode: number = 2;
    /**
     * Whole tree behaves as one single control
     * @type {number}
     */
    @Input('tabindex') private tabindex: number = 0;
    /**
     * Node titles can receive keyboard focus
     * @type {boolean}
     */
    @Input('titlesTabbable') private titlesTabbable: boolean = false;
    /**
     * Use title as tooltip (also a callback could be specified)
     * @type {boolean}
     */
    @Input('tooltip') private tooltip: boolean = false;
    /**
     * Extensions for plugin
     * @type {Array}
     */
    @Input('extensions') private extensions: Array<string> = [];
    /**
     * Table tree config
     * @type {Object}
     */
    @Input('table') private table: Object = null;
    /**
     * Readonly
     * @type {boolean}
     */
    @Input('readonly') private readonly: boolean = null;
    /**
     * Setup filter extension for plugin
     */
    @Input('ext_filter') private ext_filter: Object = {};
    /**
     * Setup tree levels which will be unselectable
     */
    @Input('unselectableLevels') private unselectableLevels: Array<number> = [];
    @Input('externalCompReference') private externalCompReference: any;
    @Input('folderMode') private folderMode: boolean = false;
    @Input('classes') private classes: string = '';
    /**
     * True if plugin was already initialised
     * @type {boolean}
     */
    private inited: boolean = false;
    /**
     * Example of correct object for plugin
     * @type {{id: string; text: string}}
     */

    private checkIfIsTreeMode: boolean = false;
    private extendsOptions = {};
    private inSelect = false;

    public constructor(private cdr: ChangeDetectorRef,
                       private provider: IMFXControlTreeProvider,
                       private notificationRef: NotificationService,
                       private httpService: HttpService,
                       private modalProvider: IMFXModalProvider) {
    }

    /**
     * Getter for private inited: boolean
     * @type {boolean}
     */
    public isInited(): boolean {
        return this.inited;
    }

    /**
     * Get default options
     */
    public getDefaultOptions() {
        let defaults = {
            source: this.source,
            activeVisible: this.activeVisible,
            aria: this.aria,
            autoActivate: this.autoActivate,
            autoCollapse: this.autoCollapse,
            autoScroll: this.autoScroll,
            clickFolderMode: this.clickFolderMode,
            checkbox: this.checkbox,
            debugLevel: this.debugLevel,
            disabled: this.disabled,
            focusOnSelect: this.focusOnSelect,
            escapeTitles: this.escapeTitles,
            generateIds: this.generateIds,
            idPrefix: this.idPrefix,
            icon: this.icon,
            keyboard: this.keyboard,
            keyPathSeparator: this.keyPathSeparator,
            minExpandLevel: this.minExpandLevel,
            quicksearch: this.quicksearch,
            rtl: this.rtl, //
            selectMode: this.selectMode == 4 ? 2 : this.selectMode,
            tabindex: this.tabindex,
            titlesTabbable: this.titlesTabbable,
            tooltip: this.tooltip,
            extensions: this.extensions,
            filter: this.ext_filter,
            table: this.table,
            renderColumns: this.renderColumns,
            lazyLoad: this.lazyLoad,
            edit: this.edit
        };
        if (this.extensions.indexOf("table") + 1) {
            defaults.table = this.table;
            defaults.renderColumns = this.renderColumns;
        }
        return defaults;
    }

    @Input('lazyLoadFn') public lazyLoadFn: Function = (event, data, compContext: any) => {
        return jQuery.Deferred();
    };

    lazyLoad(event, data): void {
        const deferredResult = this.lazyLoadFn(event, data, this.compContext);
    }

    /**
     * Turning array of objects to array of objects understandable for plugin
     */
    public turnArrayOfObjectToStandart(arr = [], comp: TreeStandardConvertParamsType = {
        key: 'id',
        title: 'text',
        children: 'children'
    }): TreeStandardListTypes {
        return this.provider.turnArrayOfObjectToStandart(arr, comp);
    }

    /**
     * Turning any crazy object to object understandable for plugin
     */
    public turnObjectToStandart(dirtyObj, comp: TreeStandardConvertParamsType = {
        key: 'id',
        title: 'text',
        children: 'children',
        selected: 'selected',
        additionalData: ''
    }): TreeStandardItemType {
        return this.provider.turnObjectToStandart(dirtyObj, comp);
    }

    public updateChanged() {
        this.compRef.fancytree("getTree").filterNodes("", {});
        this.compRef.fancytree("getTree").clearFilter();
    }

    /**
     * Set default options
     * @param paramOptions
     */
    public setDefaultOptions(paramOptions) {
        this.extendsOptions = Object.assign(
            {}, // blank
            this.getDefaultOptions(),// default options
            paramOptions // options from params
        );
    }

    /**
     * Returned current state options for plugin
     * @returns {{}&{data: Array<any>, tag: boolean, tokenSeparators: (","|" ")[], placeholder: string, ajax: null, cache: boolean}&{data: Array<any>, tag: boolean, tokenSeparators: (","|" ")[], placeholder: string, ajax: null, cache: boolean}}
     */
    public getActualOptions(paramOptions = {}) {
        let opts = Object.assign(
            {}, // blank
            this.getDefaultOptions(),// default options
            this.extendsOptions, // actually options
            paramOptions // options from params
        );

        return opts;
    }

    ngAfterViewInit() {
        this.checkIfIsTreeMode = this.isTree();
        // this.cdr.detectChanges();
        this.initPlugin();
    }

    isTree() {
        return !!(this.extensions.indexOf("table") + 1)
    }

    /**
     * Set option
     * @param optionName
     * @param optionVal
     */
    public setOption(optionName: string, optionVal: any) {
        this.compRef.fancytree('option', optionName, optionVal);
    }

    /**
     * Get option
     * @param optionName
     */
    public getOption(optionName) {
        this.compRef.fancytree('option', optionName);
    }

    /**
     * Render node
     * @param node
     */
    // public render(node) {
    //     if (this.readonly) {
    //         debugger;
    //         node.unselectable = true;
    //     }
    //     node.render();
    // }

    /**
     * Get the Fancytree instance for a tree widget
     * @returns {any}
     */
    public getTree() {
        let res: any = null;
        try {
            res = this.compRef && this.compRef.fancytree("getTree");
        } catch (e) {
            res = null;
        }

        return res;
    }

    /**
     * Return RootNode
     * @returns {any}
     */
    public getRootNode() {
        return this.compRef.fancytree("getRootNode");
    }

    /**
     * Expand all
     */
    public expandAll(): void {
        this.getRootNode().visit(function (node) {
            node.setExpanded(true);
        });
    }

    /**
     * Collapse all
     */
    public collapseAll(): void {
        this.getRootNode().visit(function (node) {
            node.setExpanded(false);
        });
    }

    /**
     * Tooggle expand
     */
    toggleExpandAll(): void {
        this.getRootNode().visit(function (node) {
            node.toggleExpanded();
        });

    }

    /**
     * Get a FancytreeNode instance
     * @returns {any}
     */
    getActiveNode() {
        return this.compRef.fancytree("getActiveNode");
    }

    /**
     * Get node by event
     * @param event
     * @returns {any}
     */
    public getNodeByEvent(event) {
        return (<any>$).ui.fancytree.getNode(event);
    }

    /**
     * Get dictionary
     * @returns {any}
     */
    public getDic(): Array<any> {
        let tree = this.getTree();

        return tree.toDict(true);
    }

    /**
     * Set key as active
     * @param key
     */
    public activateKey(key): void {
        this.compRef.activateKey(key);
    }

    /**
     * Sort root node of tree
     */
    public sortTree(): void {
        this.getRootNode().sortChildren(null, true);
    }

    /**
     * Sort active branch
     */
    public sortBranchByNode(node?: any): void {
        if (!node) {
            var node = this.getActiveNode();
        }
        let cmp = function (a, b) {
            a = a.title.toLowerCase();
            b = b.title.toLowerCase();
            return a > b ? 1 : a < b ? -1 : 0;
        };
        node.sortChildren(cmp, false);
    }

    /**
     * Add object of source to root node
     * @param item
     */
    public addToRootNode(item: Object): void {
        this.addToNode(this.getRootNode(), item);
    }

    /**
     * add object of source to node from parameter
     * @param node
     * @param item
     */
    public addToNode(node: any, item: Object): void {
        node.addChildren(item);
    }

    /**
     * Set source to plugin
     * @param items
     */
    public setSource(items: Array<Object>): void {
        const tree = this.getTree();
        if (tree) {
            this.getTree().reload(items);
        }
    }

    /**
     * Select all
     * @returns {boolean}
     */
    public selectAll() {
        this.getTree().visit((node) => {
            this.setSelectedNode(node);
        });

        return true;
    }

    /**
     * to dictionary (but why ?)
     */
    // public toDict(node?:any) {
    //     if(!node) {
    //         var node = this.getActiveNode();
    //     }
    // }

    /**
     * Select all
     * @returns {boolean}
     */
    public unSelectAll() {
        this.getTree().visit((node) => {
            // this.setUnselectedNode(node);
            this.unselectAndDeactivate(node)
        });

        return false;
    }

    /**
     * Get selected nodes
     */
    public getSelected(): any[] {
        let tree = this.getTree();
        return tree.getSelectedNodes();
    }

    public getCheckedNodes(): any {
        let els = $(this.compRef).find('.fancytree-checkbox.fancytree-checkboxCheck').parent();
        let nodes = els.map((i, el) => {
            return this.getNodeByEvent(el);
        });
        return nodes;
    }

    /**
     * Set selected by object like standard object structure
     */
    public setSelectedByArrayOfStandartObject(objs: TreeStandardListOfPointersToNodesTypes): void {
        let tree = this.getTree();
        let self = this;

        objs.forEach(function (obj) {
            let node = tree.getNodeByKey(obj.key);
            self.setSelectedNode(node);
        })
    }

    /**
     * Set selected by array of nodes
     * @param ids
     * @param expandParent
     */
    public setSelectedByArrayOfNodes(ids: number[], expandParent: boolean = false) {
        let tree = this.getTree();
        let self = this;
        ids.forEach(function (id) {
            let node = tree.getNodeByKey(id);
            if (node !== null) {
                self.setSelectedNode(node);
                expandParent && self.setAllParentsExpanded(node, true);
            }
        });
        this.cdr.markForCheck();
    }

    /**
     * Set selected node by node id
     * @param id
     * @param deselectOther
     */
    public setSelectedById(id: number, deselectOther: boolean = false): void {
        let tree = this.getTree();
        if (deselectOther) {
            var nodes = tree.getSelectedNodes();
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].setSelected(false);
            }
        }
        let node = tree.getNodeByKey(id);
        if (node) {
            this.setSelectedNode(node);
        }
    }

    /**
     * Set selected by node
     * @param node
     */
    public setSelectedNode(node): void {
        node.setSelected(true);
    }

    /**
     * Set unselected by node
     * @param node
     */
    public setUnselectedNode(node): void {
        node.setSelected(false);
    }

    unselectAndDeactivate(node) {
        node.setFocus(false);
        node.setSelected(false);
        node.setActive(false);
    }

    public setCheckboxForNodes(selected) {
        selected.forEach((selectedNode) => {
            if (selectedNode.span) {
                let checkbox = $(selectedNode.span).find('.fancytree-checkbox');
                $(checkbox).addClass('fancytree-checkboxCheck');
            } else {
                this.setAllParentsExpanded(selectedNode);
                // selectedNode.parent.setExpanded(true);
                // this.cdr.markForCheck();
                let checkbox = $(selectedNode.span).find('.fancytree-checkbox');
                $(checkbox).addClass('fancytree-checkboxCheck');
            }
        });
    }

    public setAllParentsExpanded(node, flag = true) {
        node && node.parent && this.recursiveSetExpanded(node.parent, flag)
    }

    /**
     * Refresh plugin
     */
    public refreshPlugin(): void {
        this.compRef.fancytree({render: true});
    }

    /**
     * Re init jQuery plugin with new options (not working)
     * @param paramOptions
     */
    // public reinitPlugin(paramOptions: Object = {}) {
    //     var tree = this.getTree();
    //     let opts = Object.assign(this.getActualOptions(), paramOptions)
    //     let optionsWithEvents = Object.assign(opts, this.bindEventsToEmmiters());
    //     tree.reload(optionsWithEvents).done(function(){
    //         alert("reloaded");
    //     });
    //     // this.initPlugin(paramOptions);
    // }

    /**
     * Filter
     * @param test
     * @param obj
     */
    public filter(test: string, obj: Object = {}): void {
        this.compRef.fancytree("getTree").filterNodes(test, obj);
    }

    /**
     * Clear filter
     */
    public clearFilter() {
        this.compRef.fancytree("getTree").clearFilter();
    }

    /**
     * Filter with callback
     * @param str
     * @param callback
     */
    public filterCallback(str: string, callback: Function) {
        let tree = this.getTree();
        tree.filterNodes(function (node) {
            return callback(str, node);
        });
    }

    public selectAllChildren(event) {
        let node = this.getNodeByEvent(event);
        node.selected = !node.selected;
        $.each(node.children, (k, ch) => {
            ch.selected = node.selected;
            $(ch.span).find('.fancytree-checkbox').toggleClass('fancytree-checkboxCheck');
        })
    }

    public getNodeByElement(el): any {
        return (<any>$).ui.fancytree.getNode(el[0])
    }

    getNodeDepth(node): number {
        var depth = 1;
        var tmp_node = node;
        while (this.hasParent(tmp_node)) {
            tmp_node = node.parent;
            depth++;
            if (depth > 100) {
                break;
            }
        }
        return depth;
    }

    hasParent(node) {
        return node.parent != null && node.parent.title != "root";
    }

    processNodesClick(event, data, node, self, isFirst = false, childState = undefined) {
        if (isFirst) {
            self.inSelect = true;
            var state = node.selected;
            data.tree.getSelectedNodes(false).forEach(x => x.setSelected(false));
            node.setSelected(state);
            node.selected = state;
            self.processNodesClick(event, data, node.parent, self, false, state);
        } else {
            if (node.parent != null && node.parent.title != "root") {
                node.setSelected(true);
                node.selected = true;
                self.processNodesClick(event, data, node.parent, self, false, true);
            } else {
                if (childState != undefined) {
                    node.setSelected(childState);
                    node.selected = childState;
                } else {
                    node.setSelected(true);
                    node.selected = true;
                }
                let toEmit = {
                    event: event,
                    data: data.tree.getSelectedNodes(false).map(x => x.data.dirtyObj)
                };
                self.inSelect = false;
                self.onSelect.emit(toEmit);
            }
        }
    }


    private recursiveSetExpanded(node, flag) {
        if (node.children !== null && node.expanded != flag) {
            node.setExpanded(flag);
        }

        if (node.parent) {
            this.recursiveSetExpanded(node.parent, flag);
        }
    }

    /**
     * Init jQuery plugin with options
     */
    private initPlugin(paramOptions: Object = {}) {
        // let self = this;
        let opts = Object.assign(this.getActualOptions(), paramOptions);
        let optionsWithEvents = Object.assign(opts, this.bindEventsToEmmiters());
        this.checkIfIsTreeMode = this.isTree();
        // this.cdr.detectChanges();
        this.compRef = this.checkIfIsTreeMode ? $(this.compRefTable.nativeElement) : $(this.compRef.nativeElement);
        // debugger;
        // if(optionsWithEvents.icon){
        //     optionsWithEvents.icon = function(event, data) {
        //         if( data.node.isFolder() ) { return "icon icon-right"; }
        //     };
        // }

        this.compRef.fancytree(optionsWithEvents).on("mouseenter", ".fancytree-title", (event) => {
            // let toEmit = {
            //     event: event,
            //     node: this.getNodeByEvent(event),
            // };
            //
            // this.onMouseEnter.emit(toEmit);
        }).on("mouseleave", ".fancytree-title", (event) => {
            let toEmit = {
                event: event,
                node: this.getNodeByEvent(event),
            };

            this.onMouseLeave.emit(toEmit);
        }).on("dragleave", (event) => {
            event.preventDefault();
            this.provider.onDragLeave(event, this.externalCompReference);
        }).on("drop", (event) => {
            event.preventDefault();
            this.provider.onDrop(event, this.externalCompReference);
        })
            .on("dragenter", (event) => {
                event.preventDefault();
                this.provider.onDragEnter(event, this.externalCompReference);
            }).on("dragover", (event) => {
            event.preventDefault();
            this.provider.onDragOver(event, this.externalCompReference);
        });

        $(this.compRef).find('.fancytree-container').addClass(this.classes);
        this.inited = true;
    }


    private _bindNewNodeEvents(el) {
        el.unbind('click')
            .bind(
                'click',
                (e) => {
                    e.preventDefault()
                    if (e.target.getAttribute('class').indexOf('add') > -1) {
                        this.onAddItem.emit(this.getNodeByEvent(e));
                    }
                }
            );
    }

    private _bindDeleteNodeEvents(el) {
        el.unbind('click')
            .bind(
                'click',
                (e) => {
                    e.preventDefault()
                    if (e.target.getAttribute('class').indexOf('remove') > -1) {
                        this.onRemoveItem.emit(this.getNodeByEvent(e));
                    }
                }
            );
    }

    public modifyEditNode(node) {
        const key = parseInt(node.key);
        const nodeSpan$ = $(node.span);
        if (!nodeSpan$.data('rendered') && node.key != '__not_found__') {
            console.log(node.title);
            const deleteBtn = $('<i class="icon icons-cross remove-item-' + key + '"></i>');
            const addBtn = $('<i class="icon icons-add add-item-' + key + '"></i>');
            nodeSpan$.append(addBtn);
            nodeSpan$.append(deleteBtn);
            this._bindNewNodeEvents(nodeSpan$.find('i.add-item-' + key));
            this._bindDeleteNodeEvents(nodeSpan$.find('i.remove-item-' + key));
            node.compContext = this.compContext;
            // span rendered
            nodeSpan$.data('rendered', true);
        }
    }

    private bindEventsToEmmiters() {
        let self = this;
        return {
            blurTree: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onBlurTree.emit(toEmit);
            },
            create: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onCreate.emit(toEmit);
            },
            init: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onInit.emit(toEmit);
            },
            focusTree: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onFocusTree.emit(toEmit);
            },
            restore: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onRestore.emit(toEmit);
            },
            activate: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onActivate.emit(toEmit);
            },
            beforeActivate: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onBeforeActivate.emit(toEmit);
            },
            beforeExpand: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onBeforeExpand.emit(toEmit);
            },
            beforeSelect: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                if (self.selectMode == 4 && data.originalEvent && data.originalEvent.handleObj.type == "click" && data.node.customUnselectable) {
                    event.preventDefault();
                }
                self.onBeforeSelect.emit(toEmit);
            },
            blur: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onBlur.emit(toEmit);
            },
            click: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onClick.emit(toEmit);
            },
            collapse: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onCollapse.emit(toEmit);
            },
            createNode: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onCreateNode.emit(toEmit);
            },
            dblclick: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onDblClick.emit(toEmit);
            },
            deactivate: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onDeactivate.emit(toEmit);
            },
            expand: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onExpand.emit(toEmit);
            },
            enhanceTitle: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onEnhanceTitle.emit(toEmit);
            },
            focus: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onFocus.emit(toEmit);
            },
            keydown: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onKeydown.emit(toEmit);
            },
            keypress: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onKeypress.emit(toEmit);
            },
            lazyLoad: function (event, data) {
                self.lazyLoad(event, data);
                // return children or any other node source
                // var dfd = $.Deferred();
                // data.result = [];
                // dfd.promise(data.result);
                // let toEmit = {
                //     event: event,
                //     data: data,
                //     dfd: dfd
                // };
                //
                // self.onLazyLoad.emit(toEmit);
            },
            loadChildren: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onLoadChildren.emit(toEmit);
            },
            loadError: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onLoadError.emit(toEmit);
            },
            modifyChild: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onModifyChild.emit(toEmit);
            },
            postProcess: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onPostProcess.emit(toEmit);
            },
            renderNode: function (event, data) {
                let toEmit = {
                    event: event,
                    data: data
                };
                if (self.folderMode && data.node.data.dirtyObj && data.node.data.dirtyObj.IS_FOLDER) {
                    $(data.node.li).find('span.fancytree-expander').first().addClass('fa')
                        .addClass('folder-icon');
                    $(data.node.li).find('span.fancytree-checkbox').first().hide();
                }
                if (self.readonly) {
                    $(data.node.li).find('span.fancytree-checkbox').addClass('fancytree-disabled');
                    data.node.unselectable = true;
                } else if (self.unselectableLevels.length > 0 && self.selectMode == 4) {
                    for (var i = 0; i < self.unselectableLevels.length; i++) {
                        if (self.unselectableLevels[i] == self.getNodeDepth(data.node)) {
                            $(data.node.li).find('span.fancytree-checkbox').addClass('fancytree-disabled')
                                .attr("disabled", "disabled");
                            data.node.customUnselectable = true;
                        } else {
                            $(data.node.li).find('span.fancytree-checkbox').removeClass('fancytree-disabled')
                                .removeAttr("disabled");
                        }
                    }
                }
                if (self.allowChangedBold) {
                    if (data.node.data.dirtyObj && data.node.data.dirtyObj["CHANGED"]) {
                        $(data.node.li).find('span.fancytree-title').addClass('changed-data');
                    } else {
                        $(data.node.li).find('span.fancytree-title').removeClass('changed-data');
                    }
                }

                if (data.node.data.dirtyObj && data.node.data.dirtyObj.ChildCount === 0) {
                    $(data.node.li).find('span.fancytree-expander').addClass('not-folder')
                }

                if (self.edit) {
                    self.modifyEditNode(data.node)

                }

                self.onRenderNode.emit(toEmit);
            },
            renderTitle: function (event, data) {
                if (self.showKey && data.node.title.indexOf(" (" + data.node.key + ")") == -1) {
                    data.node.title += " (" + data.node.key + ")";
                }
                let toEmit = {
                    event: event,
                    data: data
                };
                self.onRenderTitle.emit(toEmit);
            },
            select: function (event, data) {
                const toEmit = {
                    event: event,
                    data: data
                };
                if (data.node.selected) {
                    if (self.selectMode == 4) {
                        if (data.originalEvent && data.originalEvent.handleObj.type == "click" || !self.inSelect) {
                            if (!data.node.customUnselectable) {
                                self.processNodesClick(event, data, data.node, self, true);
                            }
                        }
                    } else {
                        self.onSelect.emit(toEmit);
                    }
                } else {
                    self.onUnSelect.emit(toEmit);
                }

            },
        }
    }
}
