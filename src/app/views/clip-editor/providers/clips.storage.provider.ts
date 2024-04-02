import {Injectable} from "@angular/core";
import {TimelineSerieItem} from "../../../modules/controls/imfx.pro.timeline.wrapper/timeline.config";
@Injectable()
export class ClipsStorageProvider {

  // private items: Map<string,any> = new Map<string,any>();
  private items: Array<TimelineSerieItem> = [];

  constructor() {

  }

  private getIdx(data: TimelineSerieItem) {
    for (let idx in this.items) {
      if (data.id == this.items[idx].id) {
        return idx;
      }
    }
  }

  public addItem(data: TimelineSerieItem) {
    this.items.push(data);
  }

  public removeItem(data: TimelineSerieItem) {
    let idx = this.getIdx(data);
    if (idx) {
      this.items.splice(parseInt(idx), 1);
    }
  }

  public replaceItem(data: TimelineSerieItem) {
    let idx = this.getIdx(data);
    if (idx) {
      this.items.splice(parseInt(idx), 1, data);
    }
  }

  public getItems(): Array<TimelineSerieItem> {
    return this.items;
  }

  public setItems(items: Array<TimelineSerieItem>) {
    this.items = items;
  }

  public extendItem(item: TimelineSerieItem) {
      let idx = this.getIdx(item);
      if (idx) {
          this.items[parseInt(idx)] = $.extend(true, this.items[parseInt(idx)], item);
      }
  }

}

export class ClipItem {
    id: string; // string Id from timeline
    itemID: number;
    startThumbnail: string;
    startTime: number;
    startTimecodeString: string;
    stopThumbnail: string;
    stopTime: number;
    stopTimecodeString: string;
    comment: string;
}
