/**
 * Created by Sergey Trizna on 07.12.2017.
 */
import { SlickGridColumn, SlickGridRowData, SlickGridTreeRowData } from "../../types";
import { SlickGridProvider } from "../../providers/slick.grid.provider";


export function TreeFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {

    let ctx = columnDef.__contexts;
    let provider: SlickGridProvider = ctx.provider;
    let dataView = provider.dataView;
    let data = provider.getData();
    let spacer = "<span style='display:inline-block;height:1px;flex: 0 0 " + (10 * dataContext["indent"]) + "px'></span>";
    const signColumn = columnDef.__deps.data && columnDef.__deps.data.signColumn || null;
    let idx = dataView.getIdxById(dataContext.id);
    let propOfChild = provider.module.isTree.propOfChild?provider.module.isTree.propOfChild: provider.module.isTree.expandMode == 'allLevels' ? 'deepChilds' : 'childs';
    if (!(<SlickGridTreeRowData>data[idx]).hidden) {
        new Promise((resolve) => {
            resolve();
        }).then(() => {
            let element: HTMLElement = ctx.provider.getSlick().getCellNode(rowNumber, cellNumber);
            // const nextElementIndex = ctx.provider.getSlick().getColumnIndex(0);
            // let nextElement: HTMLElement = ctx.provider.getSlick().getCellNode(rowNumber, nextElementIndex);
            let html = '';
            if (
                data[idx] &&
                data[idx][propOfChild] &&
                data[idx][propOfChild].length > 0) {
                if ((<SlickGridTreeRowData>dataContext).collapsedMark) {
                    html = spacer + " <i class='icon icons-right slickgrid-toggle-row slickgrid-expand-collapse-icon' id='" + idx + "'></i>&nbsp;";
                } else {
                    html = spacer + " <i class='icon icons-down slickgrid-toggle-row slickgrid-expand-collapse-icon' id='" + idx + "'></i>&nbsp;";
                }
            } else {
                dataContext["indent"] = 0;
                spacer = "<span style='display:inline-block;height:1px;width:" + (15 * dataContext["indent"]) + "px'></span>";
                html = spacer + " <i class='slickgrid-expand-collapse-icon slickgrid-toggle-row' id='" + idx + "'></i> &nbsp;";
            }

            if(signColumn) {

                const signHtml = `<span style="display:inline-block">${dataContext[signColumn] || ''}</span>`;
                html = html + signHtml;
            }

            if (element) {
                const element$ = $(element)
                const parentEl = element$.parent();
                parentEl.append('<div class="padding-tree-row" style="padding-left:' + 10 * dataContext["indent"] + 'px;"></div>');
                if(dataContext.hasOwnProperty("PGM_RL_ID")) { //Vesrsion grid in Title screen
                    if(dataContext["ITEM_TYPE"] == 1040 || dataContext["ITEM_TYPE"] == 3020)
                    {
                        parentEl.addClass('tree-row-level-' + dataContext["indent"]);
                        // $(element).parent().addClass('tree-row-level');
                        // let _idx = parentEl.index();
                        // // let e = $(element).parent().parent().parent().parent().parent().find(".slick-pane-right .grid-canvas-right .ui-widget-content");
                        // const e = $(element).parents().find(".slick-pane-left").find('.ui-widget-content')
                        // if(e)
                        //     $(e[_idx]).addClass('tree-row-level-1');
                            // $(e[_idx]).addClass('tree-row-level');
                    }
                }
                else {
                    // console.log(dataContext["ITEM_TYPE"])
                    //Other grids in Title screen
                    if(dataContext["ITEM_TYPE"] != 1000 && dataContext["indent"] == 0)//3010
                    {
                        parentEl.addClass('tree-row-level-title');
                        // let _idx = $(element).parent().index();
                        // let e = $(element).parents().find(".slick-pane-right").find('.ui-widget-content');
                        // if(e)
                        //     $(e[_idx]).addClass('tree-row-level-title');
                        //     // $(e[_idx]).addClass('tree-row-title-type');

                        parentEl.addClass('tree-row-title-type');
                        parentEl.addClass('tree-row-title-type-title');
                    }
                    else
                    {
                        parentEl.addClass('tree-row-level-'+dataContext["indent"]);
                        // let _idx = $(element).parent().index();
                        // let e = $(element).parent().parent().parent().parent().parent().find(".slick-pane-right .grid-canvas-right .ui-widget-content");
                        // if(e)
                        //     $(e[_idx]).addClass('tree-row-level-'+dataContext["indent"]);
                        //     // $(e[_idx]).addClass('tree-row-level');

                        element$.addClass('tree-row-title-type');
                        if(dataContext["ITEM_TYPE"] == 1000)
                            element$.addClass('tree-row-title-type-series');
                        if(dataContext["ITEM_TYPE"] == 1010)
                            element$.addClass('tree-row-title-type-season');
                        if(dataContext["ITEM_TYPE"] == 1020)
                            element$.addClass('tree-row-title-type-episode');
                    }

                }

                // $(nextElement).css('padding-left', 10 * dataContext["indent"]+5 + 'px');
                // $(nextElement).parent().append('<div class="padding-tree-row" style=""></div>');
                // $(element).parent().css('marginLeft', 10 * dataContext["indent"] + 'px');
                element$.html(html);
                // let offset = element[0].scrollWidth - element[0].clientWidth;
                // if(offset > 0) {
                //     columnDef.width = columnDef.width + offset;
                //     // console.log(offset);
                // }
                // (<any>$(nextElement)).html(html);

            } else {
                console.error('Element not found')
            }
        });
    } else {
        console.log('skipped');
        // debugger
    }

    return '<div></div>';
    // return commonFormatter(TreeFormatterComp, {
    //     rowNumber: rowNumber,
    //     cellNumber: cellNumber,
    //     value: value,
    //     columnDef: columnDef,
    //     data: dataContext
    // });
}



