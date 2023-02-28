import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteModule } from '@elements/autocomplete/module';
import { FolderInputModule } from '@elements/folderinput/module';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { TransportProcess } from './component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    entryComponents: [TransportProcess],
    imports: [
        CommonModule,
        AutocompleteModule,
        FolderInputModule,
        MatMenuModule,
        MatDividerModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
    ],
    declarations: [TransportProcess],
    exports: [TransportProcess],
})
export class TransportProcessModule {}
