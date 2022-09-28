import { FilterRequest } from '../filters/request';
import { DisableConvertable } from './converting';
import { EntryConvertable, Entry, Recognizable } from '@platform/types/storage/entry';
import { Key } from '../store';
import { error } from '@platform/env/logger';
import { Json } from '@platform/types/storage/json';
import { Equal } from '@platform/types/env/types';

export interface IDesc {
    type: string;
    desc: any;
}

export class DisabledRequest
    extends Json<DisabledRequest>
    implements Recognizable, EntryConvertable, Equal<DisabledRequest>
{
    public static KEY: Key = Key.disabled;
    public static fromJson(json: string): DisabledRequest | Error {
        try {
            const def: {
                key: Key;
                value: string;
            } = JSON.parse(json);
            let entity;
            if (def.key === Key.filters) {
                entity = FilterRequest.from(def.value);
                if (entity instanceof Error) {
                    return entity;
                }
                return new DisabledRequest(entity);
            } else {
                return new Error(`Unsupportable content for Disabled; key = ${def.key}`);
            }
        } catch (e) {
            return new Error(error(e));
        }
    }
    private _entity: DisableConvertable;
    private _key: Key;

    constructor(entity: DisableConvertable) {
        super();
        let key: Key | undefined;
        [FilterRequest].forEach((classRef) => {
            if (key !== undefined) {
                return;
            }
            if (entity instanceof classRef) {
                key = classRef.KEY;
            }
        });
        if (key === undefined) {
            throw new Error(`Fail to find a class for entity: ${typeof entity}`);
        }
        this._entity = entity;
        this._key = key;
    }

    public isSame(disabled: DisabledRequest): boolean {
        const getFilterHash = (f: FilterRequest) => {
            return `${f.definition.filter.filter}|${f.definition.filter.flags.cases}|${f.definition.filter.flags.reg}|${f.definition.filter.flags.word}`;
        };
        const left = disabled.entity();
        const right = this.entity();
        if (left instanceof FilterRequest && right instanceof FilterRequest) {
            return getFilterHash(left) === getFilterHash(right);
        }
        return false;
    }

    public uuid(): string {
        return this._entity.uuid();
    }

    public entity(): DisableConvertable {
        return this._entity;
    }

    public as(): {
        filter(): FilterRequest | undefined;
    } {
        return {
            filter: (): FilterRequest | undefined => {
                return this._entity instanceof FilterRequest ? this._entity : undefined;
            },
        };
    }

    public json(): {
        to(): string;
        from(str: string): DisabledRequest | Error;
        key(): string;
    } {
        return {
            to: (): string => {
                return JSON.stringify({
                    key: this._key,
                    value: this._entity.entry().to(),
                });
            },
            from: (json: string): DisabledRequest | Error => {
                return DisabledRequest.fromJson(json);
            },
            key: (): string => {
                return DisabledRequest.KEY;
            },
        };
    }

    public entry(): {
        to(): Entry;
        from(entry: Entry): Error | undefined;
        hash(): string;
        uuid(): string;
        updated(): undefined;
    } {
        return {
            to: (): Entry => {
                return {
                    uuid: this._entity.uuid(),
                    content: JSON.stringify({
                        key: this._key,
                        value: this._entity.entry().to(),
                    }),
                };
            },
            from: (entry: Entry): Error | undefined => {
                try {
                    const def: {
                        key: Key;
                        value: string;
                    } = JSON.parse(entry.content);
                    let entity;
                    if (def.key === Key.filters) {
                        entity = FilterRequest.from(entry.content);
                        if (entity instanceof Error) {
                            return entity;
                        }
                        this._entity = entity;
                    }
                } catch (e) {
                    return new Error(error(e));
                }
                return undefined;
            },
            hash: (): string => {
                return this._entity.entry().hash();
            },
            uuid: (): string => {
                return this._entity.uuid();
            },
            updated: (): undefined => {
                return undefined;
            },
        };
    }
}
