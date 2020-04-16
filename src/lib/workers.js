import { WORKERS_NOT_AVAILABLE } from './messages';

const BLOB_TYPE = 'application/javascript';

export const createBlob = (func) => (
    new Blob(['(', func.toString(), ')()'], { type: BLOB_TYPE })
);

export const hasWorkerSupport = () => (
    window &&
    window.Worker
);

export const createWorker = (func) => {
    if (hasWorkerSupport()) {
        const url = URL.createObjectURL(createBlob(func));
        const worker = new Worker(url);

        // Won't be needing this anymore
        URL.revokeObjectURL(url);

        return worker;
    } else {
        console.error(WORKERS_NOT_AVAILABLE);
        return null;
    }
}
