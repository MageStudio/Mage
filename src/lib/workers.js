import { WORKERS_NOT_AVAILABLE } from './messages';
import util, { FEATURES } from './util';

const BLOB_TYPE = 'application/javascript';

export const createBlob = (task) => (
    new Blob(['(', task.toString(), ')()'], { type: BLOB_TYPE })
);

export const createWorker = (task, message) => {
    if (util.isFeatureSupported(FEATURES.WEBWORKER)) {
        const url = URL.createObjectURL(createBlob(task));
        const worker = new Worker(url);

        // Won't be needing this anymore
        URL.revokeObjectURL(url);

        if (message) {
            worker.postMessage(message);
        }

        return worker;
    } else {
        console.error(WORKERS_NOT_AVAILABLE);
        return null;
    }
}

export const createPromiseWorker = (task, message) => {
    return new Promise((resolve, reject) => {
        const worker = createWorker(task, message);

        if (worker) {
            worker.onmessage = (data) => {
                resolve(data);
                worker.terminate();
            };
        } else {
            reject(WORKERS_NOT_AVAILABLE);
        }
    });
} 
