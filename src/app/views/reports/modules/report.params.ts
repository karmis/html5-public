/**
 * Created by Sergey Trizna on 25.05.2017.
 */
import {Component, Injector} from '@angular/core';
// import { ModalConfig } from '../../modules/modal/modal.config';
import {ArrayProvider} from '../../../providers/common/array.provider';
import {TimeProvider} from '../../../providers/common/time.provider';

@Component({
    selector: 'report-params',
    templateUrl: './tpl/params.html',
    // changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: [
        // './styles/params.scss'
    ],
})

export class ReportParamsModalComponent {
    public data;
    public context;
    private types = {
        number: [
            'System.Decimal', 'System.Double', 'System.Byte',
            'System.SByte', 'System.Single', 'System.Int16',
            'System.Int32', 'System.Int64', 'System.UInt16',
            'System.UInt32', 'System.UInt64',
        ],
        datetime: [
            'System.DateTime'
        ],
        rangedatetime: [
            'System.TimeSpan'
        ],
        text: [
            'System.Char', 'System.String'
        ],
        checkbox: [
            'System.Boolean'
        ]
    };
    private paramsFilled: boolean = true;

    constructor(private injector: Injector,
                private timeProvider: TimeProvider,
                private arrayProvider: ArrayProvider) {
        // this.data = this.injector.get('modalRef');
    }

    // public generateEvent: EventEmitter<any> = new EventEmitter<any>();
    private _buildParams: any[] = [];

    public get buildParams(): any[] {
        return this._buildParams;
    }

    public set buildParams(params: any[]) {
        this._buildParams = params;
    }

    isControlType(type, controlType) {
        return this.arrayProvider.inArray(this.types[controlType], type);
    }

    checkControlsValues(): void {
        this.paramsFilled = true;
        $.each(this.buildParams, (key, obj) => {
            if (obj.VALUE !== null && obj.VALUE !== '') {
                this.paramsFilled = false;
                return false;
            }
        });
    }

    private prepareParams(key, type, $event) {
        let param = this.buildParams[key];
        if (type === 'number') {
            param.VALUE = $event.valueAsNumber;
        } else if (type === 'datetime') {
            param.VALUE = this.timeProvider.dateToTicks($event);
            // param.VALUE = $event.getTime();
        } else if (type === 'text') {
            param.VALUE = $event.target.value;
        } else if (type === 'checkbox') {
            param.VALUE = $event.target.checked;
        } else if (type === 'rangedatetime') {
            param.VALUE = $event.range;
        } else {
            console.warn(
                this.buildParams[key].ParamType + ' has not associated with web-control'
            );
        }

        this.checkControlsValues();
    }
}
