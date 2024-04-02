import {AbstractHandler} from "./abstract.handler";
import {IMFXXMLNode} from "../model/imfx.xml.node";
/**
 * Created by Pavel on 24.01.2017.
 */

export class BooleanHandler extends AbstractHandler {
  constructor() {
    super();
  }
  public handle (node: IMFXXMLNode) {
    if (node.Value === "true") {
      node.Value = true;
    }
  }
}
