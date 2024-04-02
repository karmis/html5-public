/**
 * Created by Pavel on 24.01.2017.
 */

import {AbstractOverride} from "./abstract.override";
import {IMFXXMLNode} from "../model/imfx.xml.node";

export class DefaultOverride extends AbstractOverride {

  public override (node: IMFXXMLNode) {
    node.DisplayName = node.Name || node.Schema.Name;
  }
}
