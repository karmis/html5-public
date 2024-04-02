/**
 * Created by Sergey Trizna on 11.07.2017.
 */
import {Component, ElementRef, Input, Renderer} from '@angular/core';
import { GridStackComponent } from 'ng2-gridstack/ng2-gridstack';
import "style-loader!jquery-ui-bundle/jquery-ui.min.css";
import "style-loader!jquery-ui-bundle/jquery-ui.structure.min.css";
import "style-loader!jquery-ui-bundle/jquery-ui.theme.min.css";
import "jquery-ui-bundle/jquery-ui.min.js";
import "./libs/gridstack.js";
import "./libs/gridstack.ui.js";
import "style-loader!gridstack/dist/gridstack.min.css";
import * as $ from 'jquery';
import { Observable, Subscription } from "rxjs";

// declare var $: any; // JQuery
declare var _: any; // lodash

@Component({
    selector: 'gridStack',
    template: `
        <!--<div>-->
        <!--&lt;!&ndash;<button *ngIf="addButtonText && addButtonText != ''" (click)="addItem()" class='{{buttonClass}}'>{{addButtonText}}</button>&ndash;&gt;-->
        <!--&lt;!&ndash;<button *ngIf="saveButtonText && saveButtonText != ''" (click)="savePanel()"&ndash;&gt;-->
        <!--&lt;!&ndash;class='btn-gridstack-save {{buttonClass}}'>{{saveButtonText}}&ndash;&gt;-->
        <!--&lt;!&ndash;</button>&ndash;&gt;-->
        <!--&lt;!&ndash;<button *ngIf="deleteButtonText && deleteButtonText != ''" (click)="deletePanel()"&ndash;&gt;-->
        <!--&lt;!&ndash;class='btn-gridstack-del {{buttonClass}}'>{{deleteButtonText}}&ndash;&gt;-->
        <!--&lt;!&ndash;</button>&ndash;&gt;-->
        <!--&lt;!&ndash;<span class="card-management" hidden>&ndash;&gt;-->
        <!--&lt;!&ndash;<button *ngIf="deleteCardButtonText && deleteCardButtonText != ''" (click)="deleteCard()"&ndash;&gt;-->
        <!--&lt;!&ndash;class='btn-gridstack-del-card {{buttonClass}}'>&ndash;&gt;-->
        <!--&lt;!&ndash;{{deleteCardButtonText}}&ndash;&gt;-->
        <!--&lt;!&ndash;</button>&ndash;&gt;-->
        <!--&lt;!&ndash;</span>&ndash;&gt;-->
        <!--</div>-->
        <!--<br/>-->
        <div class="grid-stack"
             [attr.data-gs-width]="w"
             [attr.data-gs-height]="h"
             [attr.data-gs-animate]="animate">
            <ng-content></ng-content>
            <div gridStackItem
                 spellcheck="false"
                 *ngFor="let item of items"
                 [x]="item.X" [y]="item.Y" [h]="item.Height" [w]="item.Width"
                 [customid]="item.CardId"
                 [content]="item.Content"
                 (dblclick)="onItemClick()">
            </div>
        </div>`
})
export class IMFXGridStack extends GridStackComponent {
    constructor(el: ElementRef, renderer: Renderer) {
        super(el, renderer)
    }
    @Input('h') private h: number = 192;

    savePanel(): Observable<Subscription> {
        return new Observable((observer: any) => {

            //Get cards from view
            let jsonItems = _.map($('#consumer-builder .grid-stack .grid-stack-item:visible'), function (el) {
                el = $(el);
                let node = el.data('_gridstack_node');
                if (node) {
                    return {
                        customid: el.attr('data-custom-id'),
                        x: node.x,
                        y: node.y,
                        width: node.width,
                        height: node.height,
                        content: el[0].firstChild.outerText
                    };
                }

            });
            observer.next(jsonItems);
            observer.complete();
        });
    }
}
