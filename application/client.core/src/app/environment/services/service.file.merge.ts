import { Subscription, Subject, Observable } from 'rxjs';
import { IPCMessages } from './service.electron.ipc';
import { ControllerSessionTab } from '../controller/controller.session.tab';
import { NotificationsService, ENotificationType } from '../services.injectable/injectable.service.notifications';
import { CommonInterfaces} from '../interfaces/interface.common';
import { CancelablePromise } from 'chipmunk.client.toolkit';
import { IFile } from './service.file.opener';
import { ControllerFileMergeSession } from '../controller/controller.file.merge.session';

import EventsSessionService from './standalone/service.events.session';
import SessionsService from './service.sessions.tabs';
import EventsHubService from './standalone/service.eventshub';
import ElectronIpcService from './service.electron.ipc';

import * as Toolkit from 'chipmunk.client.toolkit';

export interface IFileInfo {
    path: string;
    name: string;
    parser: string;
    preview: string;
    size: number;
}

export interface IMergeFile {
    path: string;
    info: IFileInfo;
    format: CommonInterfaces.Detect.ITimestampFormat;
}

class MergeFilesService {

    private _subscriptions: { [key: string]: Subscription } = {};
    private _logger: Toolkit.Logger = new Toolkit.Logger('MergeFilesService');
    private _controllers: Map<string, ControllerFileMergeSession> = new Map();

    constructor() {
        this._subscriptions.onSessionChange = EventsSessionService.getObservable().onSessionChange.subscribe(this._onSessionChange.bind(this));
        this._subscriptions.onSessionClosed = EventsSessionService.getObservable().onSessionClosed.subscribe(this._onSessionClosed.bind(this));
    }

    public add(files: IFile[], session: string) {
        const controller: ControllerFileMergeSession | undefined = this._controllers.get(session);
        if (controller === undefined) {
            return this._logger.error(`Fail to find ControllerFileMergeSession for session: ${session}`);
        }
        controller.add(files.map((file: IFile) => {
            return file.path;
        })).catch((addErr: Error) => {
            this._logger.error(`Fail add files to merge controller due error: ${addErr.message}`);
        });
    }

    public getController(session?: string): ControllerFileMergeSession | undefined {
        if (session === undefined) {
            const controller: ControllerSessionTab | undefined = SessionsService.getActive();
            if (controller === undefined) {
                return undefined;
            } else {
                session = controller.getGuid();
            }
        }
        return this._controllers.get(session);
    }

    private _onSessionChange(session: ControllerSessionTab | undefined) {
        if (session === undefined) {
            return;
        }
        if (this._controllers.has(session.getGuid())) {
            return;
        }
        this._controllers.set(session.getGuid(), new ControllerFileMergeSession(session.getGuid()));
    }

    private _onSessionClosed(guid: string) {
        const controller: ControllerFileMergeSession | undefined = this._controllers.get(guid);
        if (controller === undefined) {
            return;
        }
        // Destroy
        controller.destroy().catch((destroyErr: Error) => {
            this._logger.error(`Fail to destroy controller for "${guid}" due errr: ${destroyErr.message}`);
        }).finally(() => {
            // Remove from storage
            this._controllers.delete(guid);
        });
    }

}

export default (new MergeFilesService());
