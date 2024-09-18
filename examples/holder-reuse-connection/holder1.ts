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

export const holder1 = new Agent({
	config: {
		label: "Holder Agent 1",
		walletConfig: {
			id: "holder-agent-id-1",
			key: "holder-agent-key",
		},
		endpoints: ["http://192.168.1.17:6008/didcomm"],
		logger: new ConsoleLogger(LogLevel.off),
	},
	modules: {
		// Storage Module
		askar: new AskarModule({
			ariesAskar,
		}),

		mediationRecipient: new MediationRecipientModule({
			mediatorInvitationUrl:
				"https://us-east2.public.mediator.indiciotech.io/message?oob=eyJAaWQiOiIyNzFmYTZiYS0xYmUxLTQ0ZDEtYjZlZi01ZmM2ODcyZTY4NmYiLCJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJoYW5kc2hha2VfcHJvdG9jb2xzIjpbImh0dHBzOi8vZGlkY29tbS5vcmcvZGlkZXhjaGFuZ2UvMS4wIl0sImFjY2VwdCI6WyJkaWRjb21tL2FpcDEiLCJkaWRjb21tL2FpcDI7ZW52PXJmYzE5Il0sImxhYmVsIjoiQ2xvdWQgTWVkaWF0b3IiLCJzZXJ2aWNlcyI6W3siaWQiOiIjaW5saW5lIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtnczZNd1lCM1lnVG9aWEd3a25xQzM1MmNiSHR4SnNpM3pYWmZGMXQyZk5rVCN6Nk1rZ3M2TXdZQjNZZ1RvWlhHd2tucUMzNTJjYkh0eEpzaTN6WFpmRjF0MmZOa1QiXSwic2VydmljZUVuZHBvaW50IjoiaHR0cHM6Ly91cy1lYXN0Mi5wdWJsaWMubWVkaWF0b3IuaW5kaWNpb3RlY2guaW8vbWVzc2FnZSJ9LHsiaWQiOiIjaW5saW5lIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtnczZNd1lCM1lnVG9aWEd3a25xQzM1MmNiSHR4SnNpM3pYWmZGMXQyZk5rVCN6Nk1rZ3M2TXdZQjNZZ1RvWlhHd2tucUMzNTJjYkh0eEpzaTN6WFpmRjF0MmZOa1QiXSwic2VydmljZUVuZHBvaW50Ijoid3NzOi8vd3MudXMtZWFzdDIucHVibGljLm1lZGlhdG9yLmluZGljaW90ZWNoLmlvL3dzIn1dfQ==",
			// "https://a3a8-103-97-166-226.ngrok-free.app/invite?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiIxZWU4ZWI2Yi1jYmI4LTQ3NjYtOGY5OS1jMGRiMDI1ZjYyOWIiLCJsYWJlbCI6IkNSRURFQkwgTWVkaWF0b3IiLCJhY2NlcHQiOlsiZGlkY29tbS9haXAxIiwiZGlkY29tbS9haXAyO2Vudj1yZmMxOSJdLCJoYW5kc2hha2VfcHJvdG9jb2xzIjpbImh0dHBzOi8vZGlkY29tbS5vcmcvZGlkZXhjaGFuZ2UvMS4xIiwiaHR0cHM6Ly9kaWRjb21tLm9yZy9jb25uZWN0aW9ucy8xLjAiXSwic2VydmljZXMiOlt7ImlkIjoiI2lubGluZS0wIiwic2VydmljZUVuZHBvaW50IjoiaHR0cHM6Ly9hM2E4LTEwMy05Ny0xNjYtMjI2Lm5ncm9rLWZyZWUuYXBwIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtzd1FXUUxSQnhtTVJZUWd5YVo0cmp4cGZjRHNZY1ZqZVE0UWhyZmU2UmRaTSJdLCJyb3V0aW5nS2V5cyI6W119LHsiaWQiOiIjaW5saW5lLTEiLCJzZXJ2aWNlRW5kcG9pbnQiOiJ3c3M6Ly9hM2E4LTEwMy05Ny0xNjYtMjI2Lm5ncm9rLWZyZWUuYXBwIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtzd1FXUUxSQnhtTVJZUWd5YVo0cmp4cGZjRHNZY1ZqZVE0UWhyZmU2UmRaTSJdLCJyb3V0aW5nS2V5cyI6W119XX0",
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

holder1.registerInboundTransport(
	new HttpInboundTransport({
		port: 6008,
		path: "/didcomm",
	}),
);
holder1.registerOutboundTransport(new HttpOutboundTransport());
holder1.registerOutboundTransport(new WsOutboundTransport());
