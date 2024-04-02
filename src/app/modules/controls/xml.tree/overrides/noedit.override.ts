/**
 * Created by Pavel on 31.01.2017.
 */

import {AbstractOverride} from "./abstract.override";
import {IMFXXMLNode} from "../model/imfx.xml.node";

export class NoeditOverride extends AbstractOverride {

  public override (node: IMFXXMLNode) {
    node.Readonly = true;
  }
}
