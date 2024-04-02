/**
 * Created by Sergey Trizna on 09.03.2017.
 */
export interface SearchInterfaceModel {
    /**
     * Return params of crits as string
     */
    _toJSON(): any;

    /**
     * Is valid params of request
     */
    isValid(): boolean;
}
