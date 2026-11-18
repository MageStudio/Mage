const DEFAULT_LIMIT = 100;

const createEntry = (root, revision, label, timestamp) => ({ root, revision, label, timestamp });

export class History {
    constructor(state) {
        this._state = state;
        this._limit = DEFAULT_LIMIT;
        this._entries = [createEntry(state._root, state._revision, "init", Date.now())];
        this._index = 0;
    }

    undo() {
        if (!this.canUndo()) return false;

        this._move(this._index - 1, "undo");

        return true;
    }

    redo() {
        if (!this.canRedo()) return false;

        this._move(this._index + 1, "redo");

        return true;
    }

    canUndo() {
        return this._index > 0;
    }

    canRedo() {
        return this._index >= 0 && this._index < this._entries.length - 1;
    }

    entries() {
        return this._entries.map(({ revision, label, timestamp }, index) => ({
            revision,
            label,
            timestamp,
            current: index === this._index,
        }));
    }

    goTo(revision) {
        const index = this._entries.findIndex(entry => entry.revision === revision);

        if (index === -1) {
            throw new Error(`mage.state.history.goTo: revision ${revision} is not in history`);
        }

        this._move(index, "goTo");
    }

    clear() {
        if (this._limit === 0) return;

        this._entries = [this._entries[this._index]];
        this._index = 0;
    }

    // Internal

    _setLimit(limit) {
        this._limit = limit;

        if (limit === 0) {
            this._entries = [];
            this._index = -1;

            return;
        }

        if (this._entries.length === 0) {
            const state = this._state;

            this._entries = [createEntry(state._root, state._revision, "init", Date.now())];
            this._index = 0;

            return;
        }

        this._trim();
    }

    _record(commit, root) {
        if (this._limit === 0) return;

        this._entries.length = this._index + 1;
        this._entries.push(createEntry(root, commit.revision, commit.label, commit.timestamp));
        this._index++;
        this._trim();
    }

    _trim() {
        const excess = this._entries.length - this._limit;

        if (excess <= 0) return;

        this._entries.splice(0, excess);
        this._index = Math.max(0, this._index - excess);
    }

    _move(index, kind) {
        const entry = this._entries[index];

        this._index = index;
        this._state._travel(entry.root, entry.revision, kind);
    }
}
