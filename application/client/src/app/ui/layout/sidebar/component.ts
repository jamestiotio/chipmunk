import { Component, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Base } from '@service/session';
import { TabsOptions, ETabsListDirection } from '@elements/tabs/options';
import { Ilc, IlcInterface, Declarations } from '@env/decorators/component';
import { ChangesDetector } from '@ui/env/extentions/changes';

@Component({
    selector: 'app-layout-sidebar',
    templateUrl: './template.html',
    styleUrls: ['./styles.less'],
})
@Ilc()
export class LayoutSidebar extends ChangesDetector implements AfterViewInit {
    @Input() public session!: Base;

    constructor(cdRef: ChangeDetectorRef) {
        super(cdRef);
    }

    ngAfterViewInit() {
        this.session.sidebar()?.setOptions(
            new TabsOptions({
                direction: ETabsListDirection.left,
            }),
        );
        this.detectChanges();
    }
}
export interface LayoutSidebar extends IlcInterface {}
