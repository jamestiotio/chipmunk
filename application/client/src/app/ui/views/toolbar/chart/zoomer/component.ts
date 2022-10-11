import {
    Component,
    Input,
    AfterViewInit,
    ChangeDetectorRef,
    ViewContainerRef,
    OnDestroy,
} from '@angular/core';
import { Ilc, IlcInterface } from '@env/decorators/component';
import { ChangesDetector } from '@ui/env/extentions/changes';
import { Session } from '@service/session';
import { State } from './state';

@Component({
    selector: 'app-views-chart-zoomer-canvas',
    templateUrl: './template.html',
    styleUrls: ['./styles.less'],
})
@Ilc()
export class ViewChartZoomerCanvas extends ChangesDetector implements AfterViewInit, OnDestroy {
    @Input() session!: Session;

    public state: State = new State();

    constructor(cdRef: ChangeDetectorRef, public vcRef: ViewContainerRef) {
        super(cdRef);
    }

    public ngAfterViewInit() {
        this.state.bind(this, this.session, this.vcRef.element.nativeElement as HTMLElement);
        this.state.init();
    }

    public ngOnDestroy() {
        this.state.destroy();
    }
}

export interface ViewChartZoomerCanvas extends IlcInterface {}
