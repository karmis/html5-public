/**
 * Created by Ivan Banan on 05.02.2019.
 */

export class ShortcutsStatic {

    public static keysDict = {
        keyCode_27: "Escape",
        keyCode_8: "Backspace",
        keyCode_13: "Enter",
        keyCode_9: "Tab",
        keyCode_16: "Shift",
        keyCode_91: "Meta",
        keyCode_18: "Alt",
        keyCode_17: "Control",
        keyCode_32: "Space",
        keyCode_37: "ArrowLeft",
        keyCode_38: "ArrowUp",
        keyCode_39: "ArrowRight",
        keyCode_40: "ArrowDown"
    };

    public static defaultHotkeysData = {
        TOGGLE_PLAY: {
            combin: "T",
            active: true
        },
        BACKWARD_FRAME: {
            combin: "J",
            active: true
        },
        FORWARD_FRAME: {
            combin: "L",
            active: true
        },
        BACKWARD: {
            combin: "Shift J",
            active: true
        },
        FORWARD: {
            combin: "Shift L",
            active: true
        },
        BACKWARD_10: {
            combin: "Alt Shift J",
            active: true
        },
        FORWARD_10: {
            combin: "Alt Shift L",
            active: true
        },
        BACKWARD_20: {
            combin: "Alt Control Shift J",
            active: true
        },
        FORWARD_20: {
            combin: "Alt Control Shift L",
            active: true
        },
        ADD: {
            combin: "A",
            active: true
        },
        REPLACE: {
            combin: "R",
            active: true
        },
        CLEAR: {
            combin: "X",
            active: true
        },
        MARK_IN: {
            combin: "I",
            active: true
        },
        MARK_OUT: {
            combin: "O",
            active: true
        },
        GO_TO_IN: {
            combin: "Shift I",
            active: true
        },
        GO_TO_OUT: {
            combin: "Shift O",
            active: true
        },
        INCREASE_SPEED: {
            combin: "F",
            active: true
        },
        DECREASE_SPEED: {
            combin: "S",
            active: true
        },
        GO_TO_SEGMENT_START: {
            combin: "Shift H",
            active: true
        },
        GO_TO_SEGMENT_END: {
            combin: "Shift K",
            active: true
        },
        GO_TO_START: {
            combin: "H",
            active: true
        },
        GO_TO_END: {
            combin: "K",
            active: true
        }
    };

    public static defaultHotkeysDataWorkstation = {
        TOGGLE_PLAY: {
            combin: "T",
            active: true
        },
        BACKWARD_FRAME: {
            combin: "J",
            active: true
        },
        FORWARD_FRAME: {
            combin: "L",
            active: true
        },
        BACKWARD: {
            combin: "Shift J",
            active: true
        },
        FORWARD: {
            combin: "Shift L",
            active: true
        },
        BACKWARD_10: {
            combin: "Alt Shift J",
            active: true
        },
        FORWARD_10: {
            combin: "Alt Shift L",
            active: true
        },
        BACKWARD_20: {
            combin: "Alt Control Shift J",
            active: true
        },
        FORWARD_20: {
            combin: "Alt Control Shift L",
            active: true
        },
        ADD: {
            combin: "A",
            active: true
        },
        REPLACE: {
            combin: "R",
            active: true
        },
        CLEAR: {
            combin: "X",
            active: true
        },
        MARK_IN: {
            combin: "I",
            active: true
        },
        MARK_OUT: {
            combin: "O",
            active: true
        },
        GO_TO_IN: {
            combin: "Shift I",
            active: true
        },
        GO_TO_OUT: {
            combin: "Shift O",
            active: true
        },
        INCREASE_SPEED: {
            combin: "F",
            active: true
        },
        DECREASE_SPEED: {
            combin: "S",
            active: true
        },
        GO_TO_SEGMENT_START: {
            combin: "Shift H",
            active: true
        },
        GO_TO_SEGMENT_END: {
            combin: "Shift K",
            active: true
        },
        GO_TO_START: {
            combin: "H",
            active: true
        },
        GO_TO_END: {
            combin: "K",
            active: true
        },
        REWIND: {
            combin: "",
            active: true
        },
        FAST_FORWARD: {
            combin: "",
            active: true
        }
    };

    public static permanentHotkeys = {
        TOGGLE_PLAY: {
            combin: "Space"
        }
    };

    public static defineHotkeyBundle($event: KeyboardEvent) : string {
        let simpleKey;
        let keyCode = $event.which || $event.keyCode || null;
        let specKeyName = this.keysDict['keyCode_' + keyCode];
        let specKeys = {
            'altKey': 'Alt',
            'ctrlKey': 'Control',
            'metaKey': 'Meta',
            'shiftKey': 'Shift',
        };
        let activeKeys = [];
        let dublicateFlag;

        // simpleKey = $event.code.replace(new RegExp(/^Key|^Digit/), '');

        simpleKey = (specKeyName)
            ? specKeyName
            : String.fromCharCode(keyCode);

        for (let key in specKeys) {
            if ($event[key]) {
                activeKeys.push(specKeys[key]);
            }
        }

        //define to exclude excess keys like MetaLeft, ShiftLeft
        dublicateFlag = activeKeys.find((el) => {
            return simpleKey.indexOf(el) !== -1;
        });

        if (!dublicateFlag) {
            activeKeys.push(simpleKey);
        }

        return activeKeys.join(' ');
    };

    public static defineForbiddenKeys($event: KeyboardEvent, forbiddenKeys?: Array<string>) {
        let keyCode = $event.which || $event.keyCode || null;

        if (!forbiddenKeys) {
            forbiddenKeys = [
                'Enter',
                'Escape',
                // 'Backspace',
                'CapsLock'
            ];
        }

        if (keyCode > 91) {
            return true;
        }

        //Digit
        if ((keyCode > 47) && (keyCode < 58)) {
            return false;
        }

        //Letter
        if ((keyCode > 64) && (keyCode < 91)) {
            return false;
        }

        return forbiddenKeys.some((el) => {
            return el === $event.code;
        });
    }



    public static _deepCopy(obj) {
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
    }
}
