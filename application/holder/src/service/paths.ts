import {
    SetupService,
    Interface,
    Implementation,
    DependOn,
    register,
} from '@platform/entity/service';
import { environment } from '@service/environment';
import { production } from '@service/production';
import { app } from 'electron';
import { services } from '@register/services';

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

const HOME_FOLDER = '.chipmunk';
const DOWNLOADS_FOLDER = 'downloads';
const TMP_FOLDER = 'tmp';
const APPS_FOLDER = 'apps';
const SETTINGS_FOLDER = 'settings';
const STORAGE_FOLDER = 'storage';
const DEVELOPING_PATH = 'application/holder/node_modules/electron/dist/resources';

export function getHomeFolder(): string {
    return path.resolve(os.homedir(), HOME_FOLDER);
}

@DependOn(production)
@DependOn(environment)
@SetupService(services['paths'])
export class Service extends Implementation {
    private _home = '';
    private _app = '';
    private _root = '';
    private _exec = '';
    private _launcher = '';
    private _cli = '';
    private _appModules = '';
    private _resources = '';
    private _downloads = '';
    private _tmp = '';
    private _apps = '';
    private _settings = '';
    private _storage = '';

    /**
     * Initialization function
     * @returns Promise<void>
     */
    public override init(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._home = getHomeFolder();
            this._settings = path.resolve(this._home, SETTINGS_FOLDER);
            this._storage = path.resolve(this._home, STORAGE_FOLDER);
            this._downloads = path.resolve(this._home, DOWNLOADS_FOLDER);
            this._tmp = path.resolve(this._home, TMP_FOLDER);
            this._apps = path.resolve(this._home, APPS_FOLDER);
            const resources: Error | string = this._getResourcePath();
            if (resources instanceof Error) {
                return reject(resources);
            }
            this._resources = resources;
            const root: string | Error = this._getRootPath();
            if (root instanceof Error) {
                return reject(root);
            }
            this._app = root;
            this._root = root;
            const exec = this._getExecPath();
            if (exec === undefined) {
                return reject(new Error(`Fail to detect exec path`));
            }
            this._exec = exec;
            this._launcher = path.resolve(
                path.dirname(this._exec),
                `chipmunk${os.platform() === 'win32' ? '.exe' : ''}`,
            );
            this._cli = path.resolve(
                this._root,
                `apps/cm${os.platform() === 'win32' ? '.exe' : ''}`,
            );
            this._appModules = path.resolve(this._root, '../../node_modules');
            this._createHomeFolder()
                .then(() => {
                    Promise.all(
                        [
                            this._home,
                            this._settings,
                            this._storage,
                            this._downloads,
                            this._tmp,
                            this._apps,
                        ].map((folder: string) => {
                            return this._mkdir(folder);
                        }),
                    )
                        .then(() => {
                            this.log().debug(
                                `Paths:
\thome: ${this._home}
\tsettings: ${this._settings}
\tstorage: ${this._storage}
\troot: ${this._root}
\tapp: ${this._app}
\texec ${this._exec}
\tlauncher ${this._launcher}
\tcli ${this._cli}
\tresources ${this._resources}
\tclient ${this.getClient()}
\tprealod ${this.getPreload()}
\tmodules ${this._appModules}`,
                            );
                            resolve();
                        })
                        .catch((error: Error) => {
                            this.log().error(
                                `Fail to initialize paths due error: ${error.message}`,
                            );
                            reject(error);
                        });
                })
                .catch(reject);
        });
    }

    /**
     * Returns path to logviewer folder (created in home-folder of current user)
     * @returns string
     */
    public getHome(): string {
        return this._home;
    }

    public getSettings(): string {
        return this._settings;
    }

    public getStorage(): string {
        return this._storage;
    }

    /**
     * Returns path to root folder
     * @returns string
     */
    public getRoot(): string {
        return this._root;
    }

    public getClient(): string {
        return path.resolve(this.getRoot(), 'client');
    }

    public getPreload(): string {
        return path.resolve(this.getRoot(), 'holder/src/preload');
    }

    /**
     * Returns path to node_modules folder of electron app
     * @returns string
     */
    public getAppModules(): string {
        return this._appModules;
    }

    /**
     * Returns path to tmp folder
     * @returns string
     */
    public getTmp(): string {
        return this._tmp;
    }

    /**
     * Returns path to downloads folder
     * @returns string
     */
    public getDownloads(): string {
        return this._downloads;
    }

    /**
     * Returns path to apps folder
     * @returns string
     */
    public getApps(): string {
        return this._apps;
    }

    /**
     * Returns path to executable file
     * @returns string
     */
    public getExec(): string {
        return this._exec;
    }

    /**
     * Returns path to launcher executable file
     * @returns string
     */
    public getLauncher(): string {
        return this._launcher;
    }

    /**
     * Returns path to CLI executable file
     * @returns string
     */
    public getCLI(): string {
        return this._cli;
    }

    public getCLIPath(): string {
        return path.dirname(this._cli);
    }

    /**
     * Returns path to included resources
     * @returns string
     */
    public getResources(): string {
        return this._resources;
    }

    /**
     * Returns path from home perspective
     * @param {string} folder path to folder
     * @returns string
     */
    public resoveHomeFolder(folder: string): string {
        return path.normalize(path.resolve(this._home, folder));
    }

    /**
     * Returns path from root perspective
     * @param {string} folder path to folder
     * @returns string
     */
    public resoveRootFolder(folder: string): string {
        return path.normalize(path.resolve(this._root, folder));
    }

    /**
     * Check path
     * @param {string} path path to file / folder
     * @returns boolean
     */
    public isExist(path: string): boolean {
        return fs.existsSync(path);
    }

    /**
     * @MacOS only
     * Check is application file (chipmunk.app) located in system folder like "tmp" or "Downloads".
     * @returns boolean
     */
    public doesLocatedInSysFolder(): boolean {
        if (process.platform !== 'darwin') {
            return false;
        }
        if (
            this.getRoot().indexOf('/private/var/folders') === 0 &&
            this.getRoot().indexOf('AppTranslocation') !== -1
        ) {
            return true;
        } else {
            return false;
        }
    }

    private _getExecPath(): string | undefined {
        if (app === undefined) {
            return require.main?.filename;
        } else {
            return app.getPath('exe');
        }
    }

    private _createHomeFolder(): Promise<void> {
        return this._mkdir(this._home);
    }

    private _mkdir(dir: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(dir)) {
                return resolve();
            }
            fs.promises
                .mkdir(dir)
                .then(() => {
                    resolve();
                })
                .catch((error: Error) => {
                    this.log().error(
                        `Fail to create local logviewer folder "${dir}" due error: ${error.message}`,
                    );
                    reject(error);
                });
        });
    }

    /**
     * Detects root folder of application
     * @returns Promise<void>
     */
    private _getRootPath(): string | Error {
        if (
            typeof require.main !== 'undefined' &&
            typeof require.main.filename === 'string' &&
            require.main.filename.trim() !== ''
        ) {
            return path.resolve(path.dirname(require.main.filename), '../..');
        }
        if (
            typeof require.resolve('../main') === 'string' &&
            require.resolve('../main').trim() === ''
        ) {
            return path.dirname(require.resolve('../main'));
        }
        if (process.argv instanceof Array && process.argv.length > 0) {
            let sourceFile = '';
            process.argv.forEach((arg: string) => {
                if (sourceFile !== '') {
                    return;
                }
                if (arg.search(/\.js$|\.ts$/gi) !== -1) {
                    sourceFile = arg;
                }
            });
            return path.dirname(path.resolve(process.cwd(), sourceFile));
        }
        return new Error(`Fail to detect application root folder`);
    }

    private _getResourcePath(): string | Error {
        if (typeof process.resourcesPath === 'string' && process.resourcesPath !== '') {
            if (process.resourcesPath.includes(DEVELOPING_PATH)) {
                return path.resolve(
                    process.resourcesPath.replace('/node_modules/electron/dist/resources', ''),
                    `resources`,
                );
            } else {
                return path.resolve(process.resourcesPath, `app.asar.unpacked/resources`);
            }
        }
        if (require.main === undefined) {
            return new Error(`Cannot detect resource path because require.main === undefined`);
        }
        return path.resolve(require.main.filename, '../../../../../app.asar.unpacked/resources');
    }
}
export interface Service extends Interface {}
export const paths = register(new Service());