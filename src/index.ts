import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TerminalDecorator } from 'tabby-terminal'
import { StreamingService } from './services/streaming.service'
import { TerminalStreamDecorator } from './services/terminal-decorator.service'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    providers: [
        StreamingService,
        { provide: TerminalDecorator, useClass: TerminalStreamDecorator, multi: true }
    ],
})
export default class TerminalStreamModule { }
