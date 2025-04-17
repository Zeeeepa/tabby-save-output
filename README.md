# Tabby Terminal Output Streaming Plugin

A simple plugin for Tabby terminal that provides real-time output streaming capabilities. This plugin captures and streams all terminal output with timestamps, making it easy to monitor and process terminal activity.

## Features

- Real-time terminal output streaming
- Timestamp tracking for all output
- Unique terminal session identification
- Simple integration with other tools via RxJS observables

## Installation

1. Open Tabby
2. Go to Settings → Plugins
3. Search for "save-output"
4. Click "Get" to install

## Usage

The plugin automatically starts streaming terminal output once installed. You can subscribe to the output stream from other plugins or tools using the `StreamingService`:

```typescript
import { StreamingService } from 'tabby-save-output'

constructor(private streamingService: StreamingService) {
    this.streamingService.output$.subscribe(output => {
        console.log(`Terminal ${output.terminalId}: ${output.content}`)
        console.log(`Timestamp: ${new Date(output.timestamp)}`)
    })
}
```

## Development

1. Clone the repository
2. Install dependencies: `yarn install`
3. Build: `yarn build`
4. Copy the `dist` folder to your Tabby plugins directory

## License

MIT
