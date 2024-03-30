import { AskarModule } from "@credo-ts/askar";
import {
	Agent,
	ConnectionsModule,
	ConsoleLogger,
	HttpOutboundTransport,
	LogLevel,
} from "@credo-ts/core";
import { HttpInboundTransport, agentDependencies } from "@credo-ts/node";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";

export const faber = new Agent({
	config: {
		label: "Faber Agent",
		walletConfig: {
			id: "faber-agent-id",
			key: "faber-agent-key",
		},
		endpoints: ["http://localhost:6006/didcomm"],
		logger: new ConsoleLogger(LogLevel.debug),
	},
	modules: {
		// Storage Module
		askar: new AskarModule({
			ariesAskar,
		}),

		// Connections module is enabled by default, but we can
		// override the default configuration
		connections: new ConnectionsModule({
			autoAcceptConnections: true,
		}),
	},
	dependencies: agentDependencies,
});

faber.registerInboundTransport(
	new HttpInboundTransport({
		port: 6006,
		path: "/didcomm",
	}),
);
faber.registerOutboundTransport(new HttpOutboundTransport());
