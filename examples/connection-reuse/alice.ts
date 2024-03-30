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

export const alice = new Agent({
	config: {
		label: "Alice Agent",
		walletConfig: {
			id: "alice-agent-id",
			key: "alice-agent-key",
		},
		logger: new ConsoleLogger(LogLevel.debug),
		endpoints: ["http://localhost:6007/didcomm"],
	},
	modules: {
		// Storage Module
		askar: new AskarModule({
			ariesAskar,
		}),

		// Connections module
		connections: new ConnectionsModule({
			autoAcceptConnections: true,
		}),
	},
	dependencies: agentDependencies,
});

alice.registerInboundTransport(
	new HttpInboundTransport({
		port: 6007,
		path: "/didcomm",
	}),
);
alice.registerOutboundTransport(new HttpOutboundTransport());
