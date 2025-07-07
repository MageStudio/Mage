import GameRunner from "../runner/GameRunner";
import Assets from "./Assets";
import config from "./config";
import { getWindow } from "./window";

export class Exporter {
    // static exportLevels(level) {
    // return {
    //     level: level.toJSON(),
    //     config: config.toJSON(),
    //     assets: Assets.toJSON(),
    // };
    //     return level.toJSON();
    // }

    static downloadFile(fileName, content, contentType = "application/json") {
        const file = new Blob([content], { type: contentType });
        const a = document.createElement("a");

        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    static export(options = {}) {
        if (getWindow()) {
            // only exporting the current level, each level needs to be instantiated to export it
            const level = GameRunner.getCurrentLevel();
            const content = JSON.stringify(level.toJSON());
            const fileName = `${level.getName()}.snapshot.json`;

            Exporter.downloadFile(fileName, content);

            if (options.config) {
                const configData = config.toJSON();
                const configContent = JSON.stringify(configData);
                const configFileName = "config.json";

                // setTimeout(() => {
                Exporter.downloadFile(configFileName, configContent);
                // }, 1000);
            }

            if (options.assets) {
                const assets = Assets.toJSON();
                const assetsContent = JSON.stringify(assets);
                const assetsFileName = "assets.json";

                // setTimeout(() => {
                Exporter.downloadFile(assetsFileName, assetsContent);
                // }, 1000);
            }
        }
    }
}
