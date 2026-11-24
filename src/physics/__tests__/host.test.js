import Physics from "../index";
import Config from "../../core/config";
import { PHYSICS_EVENTS } from "../messages";

describe("Physics.init host resolution", () => {
    let physicsSpy;
    const originalWindow = global.window;
    const originalDocument = global.document;

    beforeEach(() => {
        jest.useFakeTimers();
        physicsSpy = jest.spyOn(Config, "physics").mockReturnValue({ enabled: true });
        Physics.createWorker = jest.fn(() => {
            Physics.worker = { postMessage: jest.fn() };
        });
    });

    afterEach(() => {
        jest.useRealTimers();
        physicsSpy.mockRestore();
        delete Physics.createWorker;
        Physics.worker = undefined;
        global.window = originalWindow;
        global.document = originalDocument;
    });

    const postedHost = (assetsBaseUrl, pageUrl) => {
        global.document = { baseURI: pageUrl };
        global.window = { MAGE_ASSETS_BASE_URL: assetsBaseUrl };

        Physics.init();

        const [message] = Physics.worker.postMessage.mock.calls[0];
        expect(message.event).toBe(PHYSICS_EVENTS.LOAD.AMMO);
        return message.host;
    };

    test("empty base url resolves to the page origin", () => {
        expect(postedHost("", "https://a.play.mage.studio/")).toBe("https://a.play.mage.studio");
    });

    test("root-relative base url is joined without a double slash", () => {
        expect(postedHost("/api/assets/p/b", "https://a.play.mage.studio/")).toBe(
            "https://a.play.mage.studio/api/assets/p/b",
        );
    });

    test("dot base url resolves to the page directory", () => {
        expect(postedHost(".", "https://html-classic.itch.zone/html/123/index.html")).toBe(
            "https://html-classic.itch.zone/html/123",
        );
    });

    test("absolute base url is used as is", () => {
        expect(postedHost("https://cdn.example.com/game", "https://a.play.mage.studio/")).toBe(
            "https://cdn.example.com/game",
        );
    });
});
