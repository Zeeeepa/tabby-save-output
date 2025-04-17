import { Injectable } from "@angular/core"
import { Subject } from "rxjs"

export interface TerminalOutput {
    timestamp: number
    content: string
    terminalId: string
}

@Injectable({ providedIn: "root" })
export class StreamingService {
    private outputStream = new Subject<TerminalOutput>()
    
    // Observable that components can subscribe to
    public output$ = this.outputStream.asObservable()
    
    // Method to add new output to the stream
    addOutput(terminalId: string, content: string) {
        this.outputStream.next({
            timestamp: Date.now(),
            content,
            terminalId
        })
    }
}
