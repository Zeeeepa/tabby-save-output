import { Injectable } from "@angular/core"
import { TerminalDecorator, BaseTerminalDecorator } from "tabby-terminal"
import { StreamingService } from "./streaming.service"

@Injectable()
export class TerminalStreamDecorator extends BaseTerminalDecorator implements TerminalDecorator {
    constructor(private streamingService: StreamingService) {
        super()
    }

    feedFromTerminal(data: string): void {
        if (this.terminal) {
            this.streamingService.addOutput(this.terminal.name, data)
        }
        super.feedFromTerminal(data)
    }
}
