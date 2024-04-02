/**
 * Created by Sergey Trizna on 29.03.2017.
 */
export interface ErrorInterface {
    text: string;
    title: string
    originalError?: any;
    getTitle():string
    getText(type: 'html' | 'text', mode: 'small' | 'full', cstrs: number): string;
    getOriginalError(): any;
    setOriginalError(originalError): void;
}
