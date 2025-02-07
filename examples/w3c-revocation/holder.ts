import { DataIntegrityCredentialFormatService } from "@credo-ts/anoncreds";
import { AskarModule } from "@credo-ts/askar";
import {
	Agent,
	AutoAcceptCredential,
	AutoAcceptProof,
	ConnectionsModule,
	ConsoleLogger,
	CredentialsModule,
	DidCommMimeType,
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
      id: "holder-agent-office",
      key: "holder-agent-key",
    },
    logger: new ConsoleLogger(LogLevel.trace),
    didCommMimeType: DidCommMimeType.V1,
    endpoints: ["http://192.168.1.125:6007/didcomm"],
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
          credentialFormats: [
            new JsonLdCredentialFormatService(),
            new DataIntegrityCredentialFormatService(),
          ],
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
const wsTransport = new WsOutboundTransport()
const httpTransport = new HttpOutboundTransport()
  
  
// Register a simple `WebSocket` outbound transport
holder.registerOutboundTransport(wsTransport)
// Register a simple `Http` outbound transport
holder.registerOutboundTransport(httpTransport)

	holder.registerInboundTransport(
		new HttpInboundTransport({
			port: 6007,
			path: "/didcomm",
		}),
  );
holder.registerOutboundTransport(new HttpOutboundTransport());
holder.registerOutboundTransport(new HttpOutboundTransport());
