import {Injectable} from "@angular/core";

@Injectable()
export class WorkerProvider {
    private _workers: { [key: string]: Worker } = {};

    public getMaxWorkers(): number {
        return typeof (Worker) !== "undefined" ? navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4 : 0;
    }

    public getWorker(name: string): Worker | null {
        return this._workers[name];
    }

    public startWorker(name: string, stringUrl: string): Worker {
        if (typeof (Worker) !== "undefined") {
            if(this.getMaxWorkers() >= Object.keys(this._workers).length) {
                if (typeof (this._workers[name]) == "undefined") {
                    this._workers[name] = new Worker(stringUrl, { type: 'module' });
                } else {
                    throw new Error(">>> Worker " + name + " already exist");
                }
            } else {
                throw new Error(">>> Maximum numbers of workers reached");
            }


            return this._workers[name];
        } else {
            throw new Error(">>> Browser doesn't support workers!");
        }
    }

    public stopWorker(name: string): void {
        if (this._workers[name]) {
            this._workers[name].terminate();
            delete this._workers[name];
        } else {
            throw new Error(">>> Worker " + name + " not found in the stack of workers");
        }
    }
}
