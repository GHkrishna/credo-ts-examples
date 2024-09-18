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

export const holder = new Agent({
	config: {
		label: "Holder Agent",
		walletConfig: {
			id: "holder-agent-id",
			key: "holder-agent-key",
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

		// Credentials module
		credentials: new CredentialsModule({
			autoAcceptCredentials: AutoAcceptCredential.Always,

			// Only v2 Credential Protocol supports jsonld
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

holder.registerInboundTransport(
	new HttpInboundTransport({
		port: 6007,
		path: "/didcomm",
	}),
);
holder.registerOutboundTransport(new HttpOutboundTransport());