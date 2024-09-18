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
	ProofsModule,
	V2CredentialProtocol,
	V2ProofProtocol,
} from "@credo-ts/core";
import { HttpInboundTransport, agentDependencies } from "@credo-ts/node";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";

export const issuer = new Agent({
	config: {
		label: "Issuer Agent",
		walletConfig: {
			id: "issuer-agent-id",
			key: "issuer-agent-key",
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

			// Support v1 and v2 protocol, but only with indy proof format
			proofProtocols: [
				new V2ProofProtocol({
					proofFormats: [new DifPresentationExchangeProofFormatService()],
				}),
			],
		}),
	},
	dependencies: agentDependencies,
});

issuer.registerInboundTransport(
	new HttpInboundTransport({
		port: 6006,
		path: "/didcomm",
	}),
);
issuer.registerOutboundTransport(new HttpOutboundTransport());
