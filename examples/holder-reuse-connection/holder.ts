import { AskarModule } from "@credo-ts/askar";
import {
	Agent,
	AutoAcceptCredential,
	AutoAcceptProof,
	ConnectionsModule,
	ConsoleLogger,
	CredentialsModule,
	DifPresentationExchangeProofFormatService,
	HttpOutboundTransport,
	JsonLdCredentialFormatService,
	LogLevel,
	MediationRecipientModule,
	MediatorPickupStrategy,
	ProofsModule,
	V2CredentialProtocol,
	V2ProofProtocol,
	WsOutboundTransport,
} from "@credo-ts/core";
import { HttpInboundTransport, agentDependencies } from "@credo-ts/node";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";

export const holder = new Agent({
	config: {
		label: "Holder Agent",
		walletConfig: {
			id: "holder-agent-id",
			key: "holder-agent-key",
		},
		endpoints: ["http://192.168.1.17:6007/didcomm"],
		logger: new ConsoleLogger(LogLevel.trace),
	},
	modules: {
		// Storage Module
		askar: new AskarModule({
			ariesAskar,
		}),

		mediationRecipient: new MediationRecipientModule({
			mediatorInvitationUrl:
				"https://us-east2.public.mediator.indiciotech.io/message?oob=eyJAaWQiOiIyNzFmYTZiYS0xYmUxLTQ0ZDEtYjZlZi01ZmM2ODcyZTY4NmYiLCJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJoYW5kc2hha2VfcHJvdG9jb2xzIjpbImh0dHBzOi8vZGlkY29tbS5vcmcvZGlkZXhjaGFuZ2UvMS4wIl0sImFjY2VwdCI6WyJkaWRjb21tL2FpcDEiLCJkaWRjb21tL2FpcDI7ZW52PXJmYzE5Il0sImxhYmVsIjoiQ2xvdWQgTWVkaWF0b3IiLCJzZXJ2aWNlcyI6W3siaWQiOiIjaW5saW5lIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtnczZNd1lCM1lnVG9aWEd3a25xQzM1MmNiSHR4SnNpM3pYWmZGMXQyZk5rVCN6Nk1rZ3M2TXdZQjNZZ1RvWlhHd2tucUMzNTJjYkh0eEpzaTN6WFpmRjF0MmZOa1QiXSwic2VydmljZUVuZHBvaW50IjoiaHR0cHM6Ly91cy1lYXN0Mi5wdWJsaWMubWVkaWF0b3IuaW5kaWNpb3RlY2guaW8vbWVzc2FnZSJ9LHsiaWQiOiIjaW5saW5lIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtnczZNd1lCM1lnVG9aWEd3a25xQzM1MmNiSHR4SnNpM3pYWmZGMXQyZk5rVCN6Nk1rZ3M2TXdZQjNZZ1RvWlhHd2tucUMzNTJjYkh0eEpzaTN6WFpmRjF0MmZOa1QiXSwic2VydmljZUVuZHBvaW50Ijoid3NzOi8vd3MudXMtZWFzdDIucHVibGljLm1lZGlhdG9yLmluZGljaW90ZWNoLmlvL3dzIn1dfQ==",
			// "https://png-mediator.bhutanndi.com/invite?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiIxOWU1NDk3NS02YzExLTQ5N2YtOTQ2Ny01MWYwNjEzZjRkOTciLCJsYWJlbCI6Im5nb3RhZ19tZWRpYXRvciIsImFjY2VwdCI6WyJkaWRjb21tL2FpcDEiLCJkaWRjb21tL2FpcDI7ZW52PXJmYzE5Il0sImhhbmRzaGFrZV9wcm90b2NvbHMiOlsiaHR0cHM6Ly9kaWRjb21tLm9yZy9kaWRleGNoYW5nZS8xLjEiLCJodHRwczovL2RpZGNvbW0ub3JnL2Nvbm5lY3Rpb25zLzEuMCJdLCJzZXJ2aWNlcyI6W3siaWQiOiIjaW5saW5lLTAiLCJzZXJ2aWNlRW5kcG9pbnQiOiJodHRwczovL3BuZy1tZWRpYXRvci5iaHV0YW5uZGkuY29tIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtmOGpvTGNYUmVkRW5ZblYxdHBnUlNpZXkzbWJpOWFHem55RUhWZVFiamdxYyJdLCJyb3V0aW5nS2V5cyI6W119LHsiaWQiOiIjaW5saW5lLTEiLCJzZXJ2aWNlRW5kcG9pbnQiOiJ3c3M6Ly9wbmctbWVkaWF0b3IuYmh1dGFubmRpLmNvbSIsInR5cGUiOiJkaWQtY29tbXVuaWNhdGlvbiIsInJlY2lwaWVudEtleXMiOlsiZGlkOmtleTp6Nk1rZjhqb0xjWFJlZEVuWW5WMXRwZ1JTaWV5M21iaTlhR3pueUVIVmVRYmpncWMiXSwicm91dGluZ0tleXMiOltdfV19",
			mediatorPickupStrategy: MediatorPickupStrategy.PickUpV2LiveMode,
		}),

		// Connections module is enabled by default, but we can
		// override the default configuration
		connections: new ConnectionsModule({
			autoAcceptConnections: true,
		}),

		// Credentials module is enabled by default, but we can
		// override the default configuration
		credentials: new CredentialsModule({
			autoAcceptCredentials: AutoAcceptCredential.Always,

			// Only v2 supports jsonld
			credentialProtocols: [
				new V2CredentialProtocol({
					credentialFormats: [new JsonLdCredentialFormatService()],
				}),
			],
		}),

		proofs: new ProofsModule({
			autoAcceptProofs: AutoAcceptProof.Always,

			proofProtocols: [
				new V2ProofProtocol({
					proofFormats: [new DifPresentationExchangeProofFormatService()],
				}),
			],
		}),
	},
	dependencies: agentDependencies,
});

holder.registerInboundTransport(
	new HttpInboundTransport({
		port: 6007,
		path: "/didcomm",
	}),
);
holder.registerOutboundTransport(new HttpOutboundTransport());
holder.registerOutboundTransport(new WsOutboundTransport());
