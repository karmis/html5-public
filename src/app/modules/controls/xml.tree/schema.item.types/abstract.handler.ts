import {IMFXXMLNode} from "../model/imfx.xml.node";
/**
 * Created by Pavel on 24.01.2017.
 */

export abstract class AbstractHandler {
  constructor() {}
  public abstract handle (node: IMFXXMLNode);
}
