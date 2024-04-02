/**
 * Created by Sergey Klimeko on 08.02.2017.
 */
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'imfx-xml-dropdown',
  templateUrl: '/tpl/index.html',
  styleUrls: [
    'styles/index.scss'
  ]
})

/**
 * Xml dropdown
 */
export class XmlDropdownComponent {
@Input() groups;
@Output() selected:EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  selectXmlDoc(id) {
    this.selected.emit(''+id);
  }

  ngOnInit() {

  }
}
