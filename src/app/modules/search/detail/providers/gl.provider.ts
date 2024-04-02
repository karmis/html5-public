import {ComponentFactoryResolver, Inject, Injectable, Injector, ViewContainerRef} from "@angular/core";
import {GoldenConfig} from "../detail.config";
import {IMFXAccordionComponent} from "../components/accordion.component/imfx.accordion.component";
import {TranslateService} from "@ngx-translate/core";
import { takeUntil } from 'rxjs/operators';
import {Subject} from "rxjs";

@Injectable()
export class GoldenProvider {
    public _config: GoldenConfig;
    public componentFactoryResolver: ComponentFactoryResolver;
    public destroyed$: Subject<any> = new Subject();
    private layout: any;
    constructor(public injector: Injector,
                @Inject(TranslateService) protected translate: TranslateService) {
        this.componentFactoryResolver = injector.get(ComponentFactoryResolver);
    }

    get config(): GoldenConfig {
        return (<GoldenConfig>this._config);
    }

    set config(_config: GoldenConfig) {
        this._config = _config;
    }
    get componentContext() {
        return (this._config.componentContext);
    }
    get moduleContext() {
        return (this.config.moduleContext);
    }
    public setView(self, outsideUpdate) {
        this.addDataLayout(self);
        if (outsideUpdate) {
            this.addMediaBlockIfNeed(self.layout);
            this.componentContext.addMediaLayout(self, outsideUpdate);
        } else {
            this.componentContext.addMediaLayout(self);
        }
        if (outsideUpdate) {
            this.componentContext.addTabsLayout(self, outsideUpdate);
        } else {
            this.componentContext.addTabsLayout(self);
        }
    }
    /**
     * Add accordion tab
     */
    addDataLayout(self) {
        this.layout.registerComponent('Data', (container, componentState) => {
            this.translateTitle(container, '.data');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXAccordionComponent);
            let compRef = this.componentContext.viewContainer.createComponent(factory);
            compRef.instance.file = self.config.options.file;
            compRef.instance.columnData = self.config.options.columnData;
            compRef.instance.lookup = self.config.options.lookup;
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;

            self.layout.on('thumbnailUpdated', data => {
                //Refresh media tab thumb only if we update media thumb or media haven't own thumb (PRIMARY_THUMB_ID == null)
                let isMedia = data.type == 'media';
                if(isMedia || self.config.options.file['PRIMARY_THUMB_ID'] == null) {
                    if(isMedia)
                        self.config.options.file['PRIMARY_THUMB_ID'] = data.result.ID;
                    self.config.options.file['THUMBID'] = data.result.ID;
                    var thumbUrlParts = self.config.options.file['THUMBURL'].split("?id=");
                    self.config.options.file['THUMBURL'] = thumbUrlParts[0] + "?id=" + data.result.ID;
                    compRef.instance.refresh(self.config.options.file);
                }
            });
        });
    };

    addMediaBlockIfNeed(layout) {
        let tabParent = {find: false, returnTabParent: {}};
        if (this.findMediaTab()) {
            return;
        }
        tabParent = this.findChildTab(layout.config, 'vMedia', tabParent);
        let mediaTab = {
            type: 'column',
            content: [
                {
                    type: 'component',
                    componentName: 'Media',
                    tTitle: 'Media'
                }
            ]
        };
        let oldTab = this._deepCopy(tabParent.returnTabParent);
        delete oldTab.height;
        delete oldTab.width;
        tabParent.returnTabParent['type'] = 'column';
        tabParent.returnTabParent['content'] = [mediaTab, oldTab];
        delete tabParent.returnTabParent['activeItemIndex'];
    }

    findMediaTab() {
        let mediaTab = this.componentContext.layout.root.getItemsByFilter(function (elem) {
            return elem.config.tTitle == 'Media';
        });
        if (mediaTab.length > 0) {
            return true;
        }
        ;
        return false;
    };
    findChildTab(content, type, returnTabParent) {
        let self = this;
        if (content.tTitle == type) {
            return {find: true, returnTabParent: returnTabParent};
        }
        else {
            if (content.content) {
                for (let i = 0; i < content.content.length; i++) {
                    let res = self.findChildTab(content.content[i], type, returnTabParent);
                    returnTabParent = res.returnTabParent;
                    if (res.find) {
                        returnTabParent = content;
                        break;
                    }
                    ;
                }
                ;
            }
        }
        return {find: false, returnTabParent: returnTabParent};
    }
    setCreatePopoutMethod () {
        var _createPopout = (<any>window).GoldenLayout.prototype.createPopout;

        (<any>window).GoldenLayout.prototype.createPopout = function(contentItem) {
            let d = {
                width: 800,
                height: 450,
                top: 0,
                left: 0
            }
            let arr = Array.prototype.slice.call(arguments);
            (<any>window)._imfxPopoutItem = arguments[0];
            arr.push(d);
            let popout = _createPopout.apply(this, arr);
            contentItem.parent.element.find('.lm_popout').hide();
            contentItem.container.compRef.instance.hideElem();
        };
        this.componentContext.layout.on('windowClosed', function (contentItem) {
            let _w = (<any>window);
            _w._imfxPopoutItem && _w._imfxPopoutItem.parent.element.find('.lm_popout').show();
            _w._imfxPopoutItem && _w._imfxPopoutItem.container.compRef.instance.showElem();
            delete _w._popoutWindow;
            delete _w._imfxPopoutItem;
        });
    }
    private translateTitle(container, type) {
        let fullKey = this.config.options.typeDetailsLocal + type;
        this.translate.get(fullKey)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
                (res: string) => {
                    container._config.title = res;
                });
    };
    private _deepCopy(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || 'object' != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = this._deepCopy(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = Object.create(obj);
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = this._deepCopy(obj[attr]);
            }
            return copy;
        }

        throw new Error('Unable to copy obj! Its type is not supported.');
    };
}
