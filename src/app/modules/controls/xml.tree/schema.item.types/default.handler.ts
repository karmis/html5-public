import {AbstractHandler} from "./abstract.handler";
import {IMFXXMLNode} from "../model/imfx.xml.node";
/**
 * Created by Pavel on 24.01.2017.
 */

export class DefaultHandler extends AbstractHandler {
  constructor() {
    super();
  }
  public handle (node: IMFXXMLNode) {
    node.Value = node.Value;
  }
}
