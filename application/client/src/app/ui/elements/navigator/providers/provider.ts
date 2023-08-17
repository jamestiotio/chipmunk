import { IlcInterface } from '@service/ilc';
import { ChangesDetector } from '@ui/env/extentions/changes';
import { IMenuItem } from '@ui/service/contextmenu';

export interface IStatistics {
    title: string;
    total: number;
    info: string[];
}

export interface INoContentActions {
    title: string;
    buttons: { caption: string; handler: () => void }[];
}

export abstract class Provider<T> {
    private readonly _abort: AbortController = new AbortController();

    constructor(
        public readonly ilc: IlcInterface & ChangesDetector,
        public readonly index: number,
    ) {}

    public abstract load(): Promise<T[]>;
    public abstract action(entity: T): void;
    public abstract stat(): IStatistics;
    public abstract getContextMenu(entity: T): IMenuItem[];
    public abstract title(): string;
    public abstract getNoContentActions(): INoContentActions;

    public destroy(): void {
        this._abort.abort();
    }

    public isAborted(): boolean {
        return this._abort.signal.aborted;
    }
}
