/**
 * Created by Sergey Trizna on 31.07.2017.
 */
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}
    transform(url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}

@Pipe({ name: 'safeHTML' })
export class SafeHTMLPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}
    transform(html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}