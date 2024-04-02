import {Injectable} from "@angular/core";
import {MultilineTextComponent} from "./multiline.text.component";
// import {ModalComponent} from "../../../../../modal/modal";

@Injectable()
export class MultilineTextProvider {
  // ref to module
    moduleContext: MultilineTextComponent;

  // ref to component
  // componentContext: IMFXSearchComponent | CoreSearchComponent;

  // reference to modalComponent
  // public multilineTextModal: ModalComponent;

  // current state of modal
  public modalIsOpen: boolean = false;

  // model for request
  private model: any = {};



  constructor() {
  }


  /**
   * Show modal
   */
  showModal(xmlString: string, displayName: string, changeEmitter) {
    this.moduleContext.setXmlString(this.formatXML(xmlString), displayName);
    this.moduleContext.toggleOverlay(true);
    // this.multilineTextModal.onShow.subscribe(() => {
    //   this.modalIsOpen = true;
    //
    // });
    // this.multilineTextModal.onShown.subscribe(() => {
    //   this.moduleContext.refreshCodeMirror();
    // });
    // this.multilineTextModal.onHide.subscribe(() => {
    //   changeEmitter.emit(this.moduleContext.getXmlString());
    //   this.modalIsOpen = false;
    // });
    //
    // this.multilineTextModal.show(displayName, false); @TODO CHECK_MODALS
  }

  formatXML(input, indent = null)
  {
    if(!input)
      return "";
    indent = indent || '\t';
    var xmlString = input.replace(/^\s+|\s+$/g, '');

    xmlString = input
		.replace( /(<([a-zA-Z]+\b)[^>]*>)(?!<\/\2>|[\w\s])/g, "$1\n" )
		.replace( /(<\/[a-zA-Z]+[^>]*>)/g, "$1\n")
		.replace( />\s+(.+?)\s+<(?!\/)/g, ">\n$1\n<")
		.replace( />(.+?)<([a-zA-Z])/g, ">\n$1\n<$2")
		.replace(/\?></, "?>\n<")

    var xmlArr = xmlString.split('\n');

    var tabs = '';
    var start = 0;

    if (/^<[?]xml/.test(xmlArr[0]))  start++;

    for (var i = start; i < xmlArr.length; i++)
    {
      var line = xmlArr[i].replace(/^\s+|\s+$/g, '');

      if (/^<[/]/.test(line))
      {
        tabs = tabs.replace(indent, '');
        xmlArr[i] = tabs + line;
      }
      else if (/<.*>.*<\/.*>|<.*[^>]\/>/.test(line))
      {
        xmlArr[i] = tabs + line;
      }
      else if (/<.*>/.test(line))
      {
        xmlArr[i] = tabs + line;
        tabs += indent;
      }
      else
      {
        xmlArr[i] = tabs + line;
      }
    }
    return  xmlArr.join('\n');
  }
}
