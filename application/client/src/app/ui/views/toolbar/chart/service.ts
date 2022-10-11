import { Subscriber, Subject, Subscription } from '@platform/env/subscription';
import { Destroy } from '@env/declarations';
import { Session } from '@service/session';

const CHART_SERVICE = 'workspace_chart_service';

export interface IPosition {
    left: number;
    width: number;
    full: number;
}

export interface IPositionChange {
    session: string;
    position: IPosition;
}

export class Service extends Subscriber implements Destroy {
    private _positions: Map<string, IPosition> = new Map();
    private readonly _subjects: {
        change: Subject<IPositionChange>;
    } = {
        change: new Subject<IPositionChange>(),
    };

    static from(session: Session): Service {
        const restored = session.storage.get<Service>(CHART_SERVICE);
        if (restored === undefined) {
            const service = new Service();
            session.storage.set(CHART_SERVICE, service);
            return service;
        } else {
            return restored;
        }
    }

    public correction(session: string, width: number): IPosition | undefined {
        const position: IPosition | undefined = this._positions.get(session);
        if (position === undefined || position.full <= 0) {
            return;
        }
        const change: number = width / position.full;
        position.width = position.width * change;
        position.left = position.left * change;
        return position;
    }

    public setPosition(data: IPositionChange) {
        this._positions.set(data.session, data.position);
        this._subjects.change.emit(data);
    }

    public getPosition(session: string): IPositionChange {
        let position: IPosition | undefined = this._positions.get(session);
        if (position === undefined) {
            position = {
                full: 0,
                left: 0,
                width: 0,
            };
            this._positions.set(session, position);
        }
        return { session: session, position: position };
    }

    public onChange(handler: (event: IPositionChange) => void): Subscription {
        return this._subjects.change.subscribe(handler);
    }

    public destroy() {
        this._subjects.change.destroy();
    }
}
