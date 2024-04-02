/**
 * Created by Sergey Klimenko on 05.04.2017.
 */
import {Directive, ElementRef, Input, HostListener} from '@angular/core';
import * as $ from "jquery";
import {NavigationEnd, NavigationStart, Router} from "@angular/router";
@Directive({
  selector: '[tmdfullimage]'
})

export class TmdFullImageDirective {

  constructor(private el: ElementRef,
              private router: Router) {
      router.events.subscribe((val) => {
          if(val instanceof NavigationStart) {
              $('#full-image-container').remove();
          }
      });
  }

  @HostListener('click') onClick(e) {

    if(this.el.nativeElement.nodeName == "IMG") {
      var imageSrc = this.el.nativeElement.currentSrc;
      var imageTemplate ='' +
        '<div id="full-image-container" class="full-image-container">' +
        '<div class="full-image-wrapper">' +
        '<img src="' + imageSrc + '">' +
        '</div>' +
        '</div>';

      $("app div:first").prepend(imageTemplate);
      $( "#full-image-container" ).fadeIn(200).css('display','table');
      $('#full-image-container').click(function(){
          $( "#full-image-container" ).fadeOut( 200, function() {
            $('#full-image-container').remove();
          });
      });
    } else if (this.el.nativeElement.nodeName == "A") {  // for ImageLinkFormatterComp
        var imageTemplate ='' +
            '<div id="full-image-container">' +
            '<div #image' +
            '     [attr.data-src]="url"' +
            '     class="img-link-wrapper">' +
            '    <div class="img-link" id="link-img">' +
            '        <div style="position: absolute; right: 10px;font-weight: bold;top: 10px;" >' +
            '            <div class="close" (click)="closeImg($event)">' +
            '                <i class="icons-closedelete icon"></i>' +
            '            </div>' +
            '        </div>' +
            '        <img style="max-height: 500px; max-width: 800px; margin: auto;"  src="' + this.el.nativeElement.getAttribute("data-src") + '"/>' +
            '    </div>' +
            '</div>'
            '</div>';
        $("app div:first").prepend(imageTemplate);
        $( "#full-image-container" ).find('.img-link-wrapper').fadeIn(200).css('display', 'flex');
        $('#full-image-container').click(function(){
            $( "#full-image-container" ).find('.img-link-wrapper').fadeOut( 200, function() {
                $( "#full-image-container" ).remove();
            });
        });
    } else {
      var imageSrc = this.el.nativeElement.getAttribute("data-src");
      if(imageSrc) {
        var imageTemplate ='' +
          '<div id="full-image-container" class="full-image-container">' +
          '<div class="full-image-wrapper">' +
          '<img src="' + imageSrc + '">' +
          '</div>' +
          '</div>';

        $("app div:first").prepend(imageTemplate);
        $( "#full-image-container" ).fadeIn(200).css('display','table');
        $('#full-image-container').click(function(){
          $( "#full-image-container" ).fadeOut( 200, function() {
            $('#full-image-container').remove();
          });
        });
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let x = event.keyCode;
    if (x === 27 && $('#full-image-container').length > 0) {
        $( "#full-image-container" ).fadeOut( 200, function() {
          $('#full-image-container').remove();
        });
    }
  }
    closeImg(e) {
        $( "#full-image-container" ).find('.img-link-wrapper').fadeOut( 200, function() {
            $( "#full-image-container" ).remove();
        });
    }
}

