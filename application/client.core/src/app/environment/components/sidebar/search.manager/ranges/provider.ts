import { Entity } from '../providers/entity';
import { Provider } from '../providers/provider';
import { FilterRequest } from '../../../../controller/controller.session.tab.search.filters.storage';
import { RangeRequest } from '../../../../controller/controller.session.tab.search.ranges.request';
import { IRangesStorageUpdated } from '../../../../controller/controller.session.tab.search.ranges.storage';
import { IComponentDesc } from 'chipmunk-client-material';
import { ControllerSessionTab } from '../../../../controller/controller.session.tab';
import { Subject, Observable, Subscription } from 'rxjs';
import { SidebarAppSearchManagerTimeRangesComponent } from './list/component';
import { SidebarAppSearchManagerTimerangeDetailsComponent } from './details/component';
import { IMenuItem } from '../../../../services/standalone/service.contextmenu';

export class ProviderRanges extends Provider<RangeRequest> {

    private _subs: { [key: string]: Subscription } = {};
    private _entities: Map<string, Entity<RangeRequest>> = new Map();

    constructor() {
        super();
        this.setSessionController(super.getSession());
    }

    public unsubscribe() {
        this._subs !== undefined && Object.keys(this._subs).forEach((key: string) => {
            this._subs[key].unsubscribe();
        });
    }

    public setSessionController(session: ControllerSessionTab | undefined) {
        this.unsubscribe();
        if (session === undefined) {
            return;
        }
        this._subs.updated = session.getSessionSearch().getRangesAPI().getStorage().getObservable().updated.subscribe((event?: IRangesStorageUpdated) => {
            super.update();
            if (event === undefined || !(event.added instanceof RangeRequest)) {
                // this._selectFilter(event.added); // SELECT
            }
        });
    }

    public get(): Array<Entity<RangeRequest>> {
        const guids: string[] = [];
        const entities = super.getSession() === undefined ? [] : super.getSession().getSessionSearch().getRangesAPI().getStorage().get().map((filter: RangeRequest) => {
            let entity = this._entities.get(filter.getGUID());
            if (entity === undefined) {
                entity = new Entity<RangeRequest>(filter, filter.getGUID());
            } else {
                entity.setEntity(filter);
            }
            this._entities.set(filter.getGUID(), entity);
            guids.push(filter.getGUID());
            return entity;
        });
        this._entities.forEach((_, guid: string) => {
            if (guids.indexOf(guid) === -1) {
                this._entities.delete(guid);
            }
        });
        return entities;
    }

    public reorder(params: {
        prev: number,
        curt: number,
    }) {
        if (super.getSession() === undefined) {
            return;
        }
        super.getSession().getSessionSearch().getRangesAPI().getStorage().reorder(params);
        super.update();
    }

    public getContentIfEmpty(): string | undefined {
        return undefined;
    }

    public getPanelName(): string {
        return `Time Ranges`;
    }

    public getPanelDesc(): string {
        const count = this.get().length;
        return `${count} range${count > 1 ? 's' : ''}`;
    }

    public getDetailsPanelName(): string {
        return `Time Range Details`;
    }

    public getDetailsPanelDesc(): string {
        return '';
    }

    public getListComp(): IComponentDesc {
        return {
            factory: SidebarAppSearchManagerTimeRangesComponent,
            inputs: {
                provider: this,
            },
        };
    }

    public getDetailsComp(): IComponentDesc {
        return {
            factory: SidebarAppSearchManagerTimerangeDetailsComponent,
            inputs: {
                provider: this,
            },
        };
    }

    public getContextMenuItems(target: Entity<any>, selected: Array<Entity<any>>): IMenuItem[] {
        const items: IMenuItem[] = [];
        if (selected.length === 2 && selected.filter(entity => (entity.getEntity() instanceof FilterRequest)).length === 2) {
            items.push({
                caption: `Create Time Range`,
                handler: () => {
                    super.getSession().getSessionSearch().getRangesAPI().getStorage().add(new RangeRequest({
                        start: selected[0].getEntity(),
                        end: selected[1].getEntity(),
                    }));
                }
            });
        }
        return items;
    }

    public actions(target: Entity<any>, selected: Array<Entity<any>>): {
        enable?: () => void,
        disable?: () => void,
        activate?: () => void,
        deactivate?: () => void,
        remove?: () => void,
        edit?: () => void,
    } {
        return {
            enable: () => {},
            disable: () => {},
            activate: () => {},
            deactivate: () => {},
            remove: () => {},
            edit: () => {}
        };
    }

}