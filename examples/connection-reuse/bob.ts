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

export const bob = new Agent({
	config: {
		label: "Bob Agent 2",
		walletConfig: {
			id: "bob-agent-id",
			key: "bob-agent-key",
		},
		logger: new ConsoleLogger(LogLevel.debug),
		endpoints: ["http://localhost:6008/didcomm"],
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

bob.registerInboundTransport(
	new HttpInboundTransport({
		port: 6008,
		path: "/didcomm",
	}),
);
bob.registerOutboundTransport(new HttpOutboundTransport());
