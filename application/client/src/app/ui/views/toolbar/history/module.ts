import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { EditableModule } from '@ui/elements/editable/module';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Preset } from './preset/component';
import { History } from './component';
import { FilterPreview } from './preview/filter/component';

const entryComponents = [Preset, History, FilterPreview];
const components = [...entryComponents];

@NgModule({
    entryComponents: [...entryComponents],
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        EditableModule,
    ],
    declarations: [...components],
    exports: [...components],
})
export class HistoryModule {}
