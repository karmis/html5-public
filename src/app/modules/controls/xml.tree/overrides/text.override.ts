/**
 * Created by Pavel on 24.01.2017.
 */

import {AbstractOverride} from "./abstract.override";
import {IMFXXMLNode} from "../model/imfx.xml.node";

export class TextOverride extends AbstractOverride {
  public override (node: IMFXXMLNode) {
    node.DisplayName = this.externalOverride.Value;
  }
}
