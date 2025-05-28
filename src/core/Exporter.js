import { getWindow } from "./window";

export class Exporter {
    static createLevelSnapshot(level) {
        return level.toJSON();
    }

    static exportLevel(level) {
        if (getWindow()) {
            const snapshot = Exporter.createLevelSnapshot(level);
            const content = JSON.stringify(snapshot);
            const fileName = `${level.getName()}.snapshot.json`;
            const contentType = "application/json";
            const file = new Blob([content], { type: contentType });

            const a = document.createElement("a");
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        }
    }
}
