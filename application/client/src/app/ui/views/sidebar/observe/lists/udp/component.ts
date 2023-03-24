import {
    Component,
    Input,
    ChangeDetectorRef,
    ElementRef,
    AfterContentInit,
    ViewChild,
} from '@angular/core';
import { Ilc, IlcInterface } from '@env/decorators/component';
import { ChangesDetector } from '@ui/env/extentions/changes';
import { Provider } from '../../providers/implementations/udp';
import { Element } from '../../element/element';
import { QuickSetup } from '../../../../../elements/transport/setup/quick/udp/component';
import { Action } from '@ui/tabs/sources/common/actions/action';
import { IButton } from '../../common/title/component';
import { DataSource } from '@platform/types/observe';
import { components } from '@env/decorators/initial';
import { Vertical, Horizontal } from '@ui/service/popup';
import { State } from '../../states/udp';

@Component({
    selector: 'app-views-observed-list-udp',
    templateUrl: './template.html',
    styleUrls: ['./styles.less'],
})
@Ilc()
export class List extends ChangesDetector implements AfterContentInit {
    @Input() provider!: Provider;
    @ViewChild('quicksetupref') public quickSetupRef!: QuickSetup;

    public tailing: Element[] = [];
    public offline: Element[] = [];
    public action: Action = new Action();
    public buttons: IButton[] = [
        {
            icon: 'codicon-tasklist',
            handler: () => {
                const parser = this.provider.get().parser();
                const origin = this.provider.get().origin();
                if (parser instanceof Error || origin instanceof Error) {
                    return;
                }
                this.ilc().services.ui.popup.open({
                    component: {
                        factory: components.get('app-recent-actions-mini'),
                        inputs: {
                            parser,
                            origin,
                        },
                    },
                    position: {
                        vertical: Vertical.top,
                        horizontal: Horizontal.center,
                    },
                    closeOnKey: 'Escape',
                    width: 450,
                    closed: () => {
                        //
                    },
                    uuid: 'app-recent-actions-popup-observed',
                });
            },
        },
        {
            icon: 'codicon-empty-window',
            handler: () => {
                this.provider.openNewSessionOptions();
            },
        },
    ];
    public state!: State;

    constructor(cdRef: ChangeDetectorRef, private _self: ElementRef) {
        super(cdRef);
    }

    public ngAfterContentInit(): void {
        this.state = this.provider.state;
        this.update();
        this.env().subscriber.register(
            this.provider.subjects.get().updated.subscribe(() => {
                this.update().detectChanges();
            }),
        );
        this.env().subscriber.register(
            this.action.subjects.get().apply.subscribe(() => {
                this.provider
                    .clone(DataSource.stream().udp(this.quickSetupRef.state.asSourceDefinition()))
                    .then(() => {
                        this.action.subjects.get().applied.emit();
                    })
                    .catch((err: Error) => {
                        this.log().error(`Fail to apply connection to UDP: ${err.message}`);
                    });
            }),
        );
    }

    public toggled(opened: boolean) {
        this.state.toggleQuickSetup(opened);
    }

    protected update(): List {
        this.tailing = this.provider
            .sources()
            .filter((s) => s.observer !== undefined)
            .map((s) => new Element(s, this.provider));
        this.offline = this.provider
            .sources()
            .filter((s) => s.observer === undefined)
            .map((s) => new Element(s, this.provider));
        return this;
    }
}
export interface List extends IlcInterface {}