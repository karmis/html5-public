/**
 * Created by Sergey Trizna on 18.12.2017.
 */
import { SlickGridFormatterData } from "../types";
import { BaseProvider } from "../../../../views/base/providers/base.provider";
import { ComponentRef } from '@angular/core';

export function commonFormatter(comp: any, setups: SlickGridFormatterData, path: string = null) {
    let ctxs = setups.columnDef.__contexts;
    let slickGrid = ctxs.provider.moduleContext;
    let deps = setups.columnDef.__deps;
    const bp = deps.injector.get(BaseProvider);
    if (!path) {
        new Promise((resolve, reject) => {
            resolve();
        }).then(
            () => {
                const element: HTMLElement = ctxs.provider.getSlick().getCellNode(setups.rowNumber, setups.cellNumber);

                if (!element) {
                    console.log("Rows not found for formatter");
                    return;
                }

                const compInstance = bp.createComponent(comp, [{
                    provide: 'data',
                    useValue: {data: setups}
                }]);
                bp.insertComponentIntoView(slickGrid.vcRef, compInstance, element);

            },
            (err) => {
                console.log(err);
            }
        );
    } else {
        new Promise((resolve, reject) => {
            resolve();
        }).then(
            () => {
                const element: HTMLElement = ctxs.provider.getSlick().getCellNode(setups.rowNumber, setups.cellNumber);

                if (!element) {
                    console.log("Rows not found for formatter");
                    return;
                }

                bp.createComponentByPath(path, comp, [{provide: 'data', useValue: {data: setups}}])
                    .then((compInstance: ComponentRef<any>) => {
                        bp.insertComponentIntoView(slickGrid.vcRef, compInstance, element);
                    });
            },
            (err) => {
                console.log(err);
            }
        );
    }


    return '';
}
