import BaseScript from "./BaseScript";
import Input from "../core/input/Input";
import { fetch } from "whatwg-fetch";
import BaseCar from "./builtin/BaseCar";
import SmoothCarFollow from "./builtin/SmoothCarFollow";
import { DEPRECATIONS, SCRIPT_NEEDS_TO_BE_INSTANCE, SCRIPT_NOT_PROVIDED } from "../lib/messages";

export const BUILTIN = {
    BASECAR: "BaseCar",
    TRAILS: "Trails",
    SMOOTH_CAR_FOLLOW: "SmoothCarFollow",
};
export class Scripts {
    constructor() {
        this.map = {
            [BUILTIN.BASECAR]: BaseCar,
            [BUILTIN.SMOOTH_CAR_FOLLOW]: SmoothCarFollow,
        };
    }

    get BUILTIN() {
        return BUILTIN;
    }

    update() {}

    load = (scripts, level) => {
        this.scripts = scripts;
        const keys = Object.keys(scripts);

        if (!keys.length) {
            return Promise.resolve("scripts");
        }

        return Promise.all(keys.map(name => this.register(name, this.scripts[name])));
    };

    set(id, ScriptClass) {
        this.map[id] = ScriptClass;
    }

    has(name) {
        return !!this.map[name];
    }

    get(name) {
        const ScriptClass = this.map[name];

        if (ScriptClass) {
            return new ScriptClass(name);
        }

        return false;
    }

    create(name, ScriptClass) {
        console.warn(DEPRECATIONS.SCRIPTS_CREATE);
        this.register(name, ScriptClass);
    }

    register(name, ScriptClass) {
        if (ScriptClass) {
            const script = new ScriptClass();
            if (script.__check && script.__check()) {
                this.set(name, ScriptClass);
            } else {
                console.error(SCRIPT_NEEDS_TO_BE_INSTANCE({ name }));
            }
        } else {
            console.error(SCRIPT_NOT_PROVIDED);
        }
    }

    registerList(list) {
        list.forEach(({ name, script }) => this.register(name, script));
    }
}

export default new Scripts();
