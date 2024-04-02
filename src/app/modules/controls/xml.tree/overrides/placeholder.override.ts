/**
 * Created by Pavel on 25.01.2017.
 */

import {AbstractOverride} from "./abstract.override";
import {IMFXXMLNode} from "../model/imfx.xml.node";

export class PlaceholderOverride extends AbstractOverride {
    public override (node: IMFXXMLNode) {
        node.IsOverridedNode = true;
        node.Placeholder = this.externalOverride.Value;
    }
}
