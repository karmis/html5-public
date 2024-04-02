import {AbstractOverride} from "./abstract.override";
import {IMFXXMLNode} from "../model/imfx.xml.node";

export class MultilineOverride extends AbstractOverride {

  public override (node: IMFXXMLNode) {
    node.Multiline = true;
  }
}
