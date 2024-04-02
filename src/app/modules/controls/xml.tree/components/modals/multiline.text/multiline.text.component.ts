import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector, OnInit,
  ViewEncapsulation, ViewChild
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MultilineTextProvider } from './multiline.text.provider';
import 'codemirror/mode/xml/xml';
import { Subscription } from 'rxjs';

@Component({
  selector: 'view-xml-modal',
  templateUrl: 'tpl/index.html',
  styleUrls: [
    './styles/index.scss',
    '../../../../../../../../node_modules/codemirror/lib/codemirror.css'
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    MultilineTextProvider
  ]
})

export class MultilineTextComponent implements OnInit, AfterViewInit {

  private data: any;
  private xmlString: string;
  private displayName: string;
  private showOverlay: boolean = true;
    private routerEventsSubscr: Subscription;

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                private translate: TranslateService,
                private multilineTextProvider: MultilineTextProvider,
                private router: Router) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });

        this.multilineTextProvider.moduleContext = this;

        // modal data
        this.data = this.injector.get('modalRef');
    }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.refreshCodeMirror();
  }

    ngOnDestroy(){
        this.routerEventsSubscr.unsubscribe();
    }

  closeModal() {
    this.data.hide();
    this.showOverlay = false;
    this.xmlString = '';
  }

  toggleOverlay(show) {
    this.showOverlay = show;
    this.cdr.detectChanges();
  }

  getXmlString() {
    return this.xmlString;
  }

  setXmlString(xmlString: string, displayName: string) {
      this.xmlString = xmlString;
      this.displayName = displayName;
      this.cdr.detectChanges();
  }

  refreshCodeMirror() {
    let editor = (<any>($('.CodeMirror')[0])).CodeMirror;
    editor.on('refresh', () => {
      this.toggleOverlay(false);
    });
    editor.refresh();
  }
}
