import { getIn, parsePath, pathToString, removeIn, setIn } from "./paths";
import { validateAndFreeze } from "./validate";
import { History } from "./history";

const DEFAULT_HISTORY_LIMIT = 100;

const SNAPSHOT_VERSION = 1;
const MAX_CHAINED_COMMITS = 100;

const isPlainRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);

const createRoot = (game, level) => Object.freeze({ game, level });

const freezeScope = (value, scope, method) => {
    if (!isPlainRecord(value)) {
        throw new TypeError(`mage.state.${method}: "${scope}" must be a plain object`);
    }

    return validateAndFreeze(value, scope, method);
};

export class State {
    constructor() {
        this._root = createRoot(validateAndFreeze({}, "game"), validateAndFreeze({}, "level"));
        this._revision = 0;
        this._subscriptions = [];
        this._levelSubscriptions = null;
        this._batchDepth = 0;
        this._batch = null;
        this._queue = [];
        this._draining = false;
        this._chained = 0;
        this._started = false;
        this.history = new History(this);
    }

    // Reads

    get(path) {
        if (path === undefined) return this._root;

        return getIn(this._root, parsePath(path));
    }

    snapshot() {
        return {
            version: SNAPSHOT_VERSION,
            revision: this._revision,
            game: this._root.game,
            level: this._root.level,
        };
    }

    // Writes

    set(path, value, options) {
        this._set("set", parsePath(path), value, options);
    }

    update(path, fn, options) {
        const segments = parsePath(path);

        this._set("update", segments, fn(getIn(this._root, segments)), options);
    }

    remove(path, options) {
        const segments = parsePath(path);
        const nextRoot = removeIn(this._root, segments, "remove");

        if (nextRoot === this._root) return;

        this._apply(
            nextRoot,
            [{ path: pathToString(segments), prev: getIn(this._root, segments), next: undefined }],
            "write",
            this._label("remove", segments, options),
        );
    }

    setDefault(path, value, options) {
        const segments = parsePath(path);
        const current = getIn(this._root, segments);

        if (current !== undefined) return current;

        this._set("setDefault", segments, value, options);

        return getIn(this._root, segments);
    }

    batch(fn, options = {}) {
        if (this._batchDepth === 0) {
            this._batch = { prevRoot: this._root, changes: [] };
        }

        const rootBefore = this._root;
        const changesBefore = this._batch.changes.length;

        this._batchDepth++;

        let result;

        try {
            result = fn();
        } catch (error) {
            this._batchDepth--;
            this._root = rootBefore;
            this._batch.changes.length = changesBefore;

            if (this._batchDepth === 0) {
                this._batch = null;
            }

            throw error;
        }

        this._batchDepth--;

        if (this._batchDepth === 0) {
            const { prevRoot, changes } = this._batch;
            const nextRoot = this._root;

            this._batch = null;
            this._root = prevRoot;

            if (nextRoot !== prevRoot) {
                this._commit(nextRoot, changes, "write", options.label || "batch");
            }
        }

        return result;
    }

    hydrate(snapshot) {
        if (!snapshot || snapshot.version !== SNAPSHOT_VERSION) {
            throw new Error(
                `mage.state.hydrate: unsupported snapshot version ${snapshot && snapshot.version}`,
            );
        }

        const game = freezeScope(snapshot.game, "game", "hydrate");
        const level = freezeScope(snapshot.level, "level", "hydrate");

        try {
            this._replaceScopes(game, level, "hydrate", "hydrate");
        } finally {
            // A throwing subscriber must not leave the old undo chain behind.
            this.history.clear();
        }
    }

    // Subscriptions

    subscribe(path, callback) {
        const segments = parsePath(path);

        if (typeof callback !== "function") {
            throw new TypeError("mage.state.subscribe: callback must be a function");
        }

        const subscription = { segments, callback, active: true };

        this._subscriptions.push(subscription);

        if (this._levelSubscriptions) this._levelSubscriptions.push(subscription);

        return () => this._unsubscribe(subscription);
    }

    // Internal hooks used by GameRunner

    _beginLevel() {
        if (!this._levelSubscriptions) this._levelSubscriptions = [];
    }

    _endLevel() {
        const owned = this._levelSubscriptions || [];

        this._levelSubscriptions = null;
        owned.forEach(subscription => this._unsubscribe(subscription));
    }

    _resetLevel() {
        if (Object.keys(this._root.level).length === 0) return;

        this._replaceScopes(
            this._root.game,
            validateAndFreeze({}, "level"),
            "levelReset",
            "levelReset",
        );
    }

    // Applies the resolved state config once per page session. Later calls are no-ops.
    _start(stateConfig) {
        if (this._started) return;

        this._started = true;
        this.history._setLimit(stateConfig?.history?.limit ?? DEFAULT_HISTORY_LIMIT);
    }

    _assertCanTravel(kind) {
        if (this._batchDepth > 0) {
            throw new Error(`mage.state.history: can't ${kind} inside a batch`);
        }
    }

    // Makes an already recorded root current again (undo, redo, goTo). It restores the
    // revision of that entry instead of taking a new one.
    _travel(root, revision, kind) {
        this._assertCanTravel(kind);

        const prevRoot = this._root;
        const changes = [];

        if (root.game !== prevRoot.game) {
            changes.push({ path: "game", prev: prevRoot.game, next: root.game });
        }

        if (root.level !== prevRoot.level) {
            changes.push({ path: "level", prev: prevRoot.level, next: root.level });
        }

        this._commit(root, changes, kind, kind, revision);
    }

    // Seam for history (record the root) and autosave (schedule a save). Runs once per
    // commit, after the root changed and before subscribers are notified.
    _afterCommit(commit, prevRoot, nextRoot) {
        if (commit.kind === "undo" || commit.kind === "redo" || commit.kind === "goTo") return;

        this.history._record(commit, nextRoot);
    }

    // Private

    _label(method, segments, options) {
        return (options && options.label) || `${method} ${pathToString(segments)}`;
    }

    _set(method, segments, value, options) {
        if (segments.length === 1) {
            value = freezeScope(value, segments[0], "set");
        }

        const nextRoot = setIn(this._root, segments, value, "set");

        if (nextRoot === this._root) return;

        this._apply(
            nextRoot,
            [
                {
                    path: pathToString(segments),
                    prev: getIn(this._root, segments),
                    next: getIn(nextRoot, segments),
                },
            ],
            "write",
            this._label(method, segments, options),
        );
    }

    _replaceScopes(game, level, kind, label) {
        const changes = [];

        if (game !== this._root.game) {
            changes.push({ path: "game", prev: this._root.game, next: game });
        }

        if (level !== this._root.level) {
            changes.push({ path: "level", prev: this._root.level, next: level });
        }

        if (changes.length === 0) return;

        this._apply(createRoot(game, level), changes, kind, label);
    }

    _apply(nextRoot, changes, kind, label) {
        if (this._batchDepth > 0) {
            this._root = nextRoot;
            this._batch.changes.push(...changes);

            return;
        }

        this._commit(nextRoot, changes, kind, label);
    }

    _commit(nextRoot, changes, kind, label, revision) {
        if (this._draining && ++this._chained > MAX_CHAINED_COMMITS) {
            throw new Error(
                "mage.state: more than 100 chained commits, a subscriber is probably writing the value it listens to",
            );
        }

        const prevRoot = this._root;
        const commit = {
            revision: revision === undefined ? ++this._revision : (this._revision = revision),
            label,
            timestamp: Date.now(),
            kind,
            changes,
        };

        this._root = nextRoot;
        this._afterCommit(commit, prevRoot, nextRoot);
        this._queue.push({ commit, prevRoot, nextRoot });

        if (!this._draining) this._drain();
    }

    _drain() {
        let firstError = null;
        let failed = false;

        this._draining = true;
        this._chained = 0;

        try {
            while (this._queue.length > 0) {
                const { commit, prevRoot, nextRoot } = this._queue.shift();

                // Iterate a copy: callbacks may subscribe or unsubscribe.
                this._subscriptions.slice().forEach(subscription => {
                    if (!subscription.active) return;

                    const prev = getIn(prevRoot, subscription.segments);
                    const next = getIn(nextRoot, subscription.segments);

                    if (prev === next) return;

                    try {
                        subscription.callback(next, prev, commit);
                    } catch (error) {
                        if (!failed) {
                            failed = true;
                            firstError = error;
                        }
                    }
                });
            }
        } finally {
            this._draining = false;
            this._queue = [];
        }

        if (failed) throw firstError;
    }

    _unsubscribe(subscription) {
        subscription.active = false;

        const index = this._subscriptions.indexOf(subscription);
        if (index !== -1) this._subscriptions.splice(index, 1);
    }
}

export default new State();
