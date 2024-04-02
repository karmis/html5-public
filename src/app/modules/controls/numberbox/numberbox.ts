/**
 * Created by Sergey Trizna on 06.02.2017.
 */
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {NumberBoxValues} from "../../search/advanced/comps/criteria/comps/controls/comps/container/comps/numberbox/types";
import {DebounceProvider} from "../../../providers/common/debounce.provider";

@Component({
    selector: 'imfx-controls-number',
    templateUrl: './tpl/index.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})

export class IMFXControlsNumberboxComponent {
    @ViewChild('imfxNumberBoxModule', {static: false}) compRef;
    @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
    @Input('sharpType') private sharpType = 'System.Decimal';
    // private mask = [/[0-9]/];
    private value;
    constructor(private debounceProvider: DebounceProvider){

    }

    // public constructor(private cdr: ChangeDetectorRef) {
    // }

    setFocus() {
        setTimeout(() => {
            this.compRef.nativeElement.focus();
        })
    }

    /**
     * Validate value
     * @param $event
     */
    private validate($event) {
        let allowedKeys = [
            48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // digits
            96, 97, 98, 99, 100, 101, 102, 103, 104, 105, // digits (small keyboard)
            // 190, 188, // comma and point
            190, 191, // point
            110, // point in small keyboard
            8, 46, // backspace and delete
            37, 39, // left and right buttons
            109, // minus
            35, 36 // home, end
            // 17, // ctrlKey
            // 91, // cmdKey
            // 86, // vKey
            // 67 // cKey
        ];

        //need for allow 'ctrl' key's functional on WinOS
        if ($event.ctrlKey) {
            // ctrl + c || ctrl + v || ctrl + a
            if ($event.which === 67 || $event.which === 86 || $event.which === 65) {
                return true;
            }
        }

        //need for allow 'cmd' key's functional on MacOS
        if ($event.metaKey) {
            // cmd + c || cmd + v || cmd + a
            if ($event.which === 67 || $event.which === 86 || $event.which === 65) {
                return true;
            }
        }

        if(($event.keyCode == 110 || $event.keyCode == 190 || $event.keyCode == 191)
            &&
            ($event.target.value.indexOf('.') > -1) || $event.target.value.indexOf(',') > -1){
            $event.preventDefault();
            return;
        }
        if ($event.keyCode != 8 && $event.keyCode != 46) {
            // || this.issetSymbols($event)
            // || !this.validateType($event)
            if (allowedKeys.indexOf($event.keyCode) == -1) {
                $event.preventDefault();
                return;
            }
        }
    }

    getValue(defVal?: number): NumberBoxValues {
        let inputValue = this.prepare(this.compRef.nativeElement.value);

        if(!isNaN(parseFloat(inputValue))){
            this.value = {
                valueAsString: inputValue.toString(),
                valueAsNumber: parseFloat(<string>inputValue)
            };
        } else {
            this.value = {
                valueAsString: defVal?defVal.toString():'',
                valueAsNumber: defVal?defVal:null
            };
        }

        return this.value;
    }

    setValue(val:string|number) {
        if(isNaN((val as number))){
            val = '';
        }
        this.compRef.nativeElement.value = this.prepare(val.toString());
    }

    keyUp($event) {
        new Promise((resolve, reject) => {
            resolve()
        }).then(() => {
            let pos = $event.target.selectionStart;
            if(isNaN(parseFloat(this.getValue().valueAsString))){
                this.setValue("");
            } else {
                this.setValue(this.getValue().valueAsNumber.toString());
            }

            //to provide persist cursor position by forbidding auto-displacement to end position (in safari)
            $event.target.selectionStart = pos;
            $event.target.selectionEnd = pos;

            this.onChange.emit(this.getValue());
        })
        // setTimeout(() => {
        //
        // }, 1000);
    }

    // private issetSymbols($event) {
    //     let res = false;
    //     if ([190, 188, 110].indexOf($event.keyCode) > -1) {
    //         res = ((this.compRef.nativeElement.value.match(/(\,|\.|\-)/g) || []).length >= 1);
    //     }
    //     return res;
    // }

    // private validateType($event) {
    //     let res = false;
    //     if (($event.keyCode >= 48 && $event.keyCode <= 57) || ($event.keyCode >= 96 && $event.keyCode <= 105)) {
    //         let num = ($event.keyCode >= 48 && $event.keyCode <= 57) ? parseInt($event.key) : parseInt(String.fromCharCode($event.keyCode - 48));
    //         let nextVal = this.compRef.nativeElement.value + num;
    //         let nextValNum = (nextVal * 1);
    //         switch (this.sharpType) {
    //             case 'System.Byte':
    //                 res = !!(nextValNum >= 0 && nextValNum <= 255);
    //                 break;
    //             case 'System.SByte':
    //                 res = !!(nextValNum >= -128 && nextValNum <= 127);
    //                 break;
    //             case 'System.Int16':
    //                 res = !!(nextValNum >= -32768 && nextValNum <= 32767);
    //                 break;
    //             case 'System.Int32':
    //                 res = !!(nextValNum >= -2147483648 && nextValNum <= 2147483647);
    //                 break;
    //             case 'System.Int64':
    //                 res = !!(nextValNum >= -9223372036854775808 && nextValNum <= 9223372036854775807);
    //                 break;
    //             case 'System.UInt16':
    //                 res = !!(nextValNum >= 0 && nextValNum <= 65535);
    //                 break;
    //             case 'System.UInt32':
    //                 res = !!(nextValNum >= 0 && nextValNum <= 65535);
    //                 break;
    //             case 'System.UInt64':
    //                 res = !!(nextValNum >= 0 && nextValNum <= 4294967295);
    //                 break;
    //             case 'System.UInt64':
    //                 res = !!(nextValNum >= 0 && nextValNum <= 4294967295);
    //                 break;
    //             case 'System.Single':
    //                 res = !!(nextValNum >= -3.402823E38 && nextValNum <= 3.402823E38);
    //                 break;
    //
    //
    //             default:
    //                 res = true;
    //                 break;
    //         }
    //     } else {
    //         res = true;
    //     }
    //
    //     return res;
    // }

    private prepare(val: string): string {

        val = val.replace(",", '.');
        if(val[val.length-1] == '.'){
            val += '0';
        }

        return val;
    }
}
