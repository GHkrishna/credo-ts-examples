import { issuer } from "./issuer";
import { holder } from "./holder";
import {
  AutoAcceptProof,
  ClaimFormat,
  ConnectionEventTypes,
  ConnectionStateChangedEvent,
  DidDocument,
  DidExchangeState,
  HandshakeReusedEvent,
  KeyDidCreateOptions,
  KeyType,
  OutOfBandEventTypes,
  OutOfBandStateChangedEvent,
  ProofEventTypes,
  ProofStateChangedEvent,
  Protocol,
  TypedArrayEncoder,
  utils,
  V2ProofProtocol,
  VerificationMethod,
  W3cCredential,
  W3cCredentialSubject,
  W3cJsonLdSignCredentialOptions,
} from "@credo-ts/core";
import { BitstringStatusListCredentialStatusPurpose } from "@credo-ts/core/build/modules/vc/models/credential/w3c-credential-status/bitstring-status-list";
import { eventNames } from "process";

async function app() {
  await holder.initialize();
  await issuer.initialize();
  issuer.config.logger.info("Issuer agent initialized!");
  holder.config.logger.info("Holder agent initialized!");
  // await holder.wallet.createKey({
  // 	keyType: KeyType.Ed25519,
  // 	seed: TypedArrayEncoder.fromString("01111111110001001101100100110110"),
  // })

  // IssuerDid
  const issuerDids = await issuer.dids.create<KeyDidCreateOptions>({
    method: "key",
    options: {
      keyType: KeyType.Ed25519,
    },
    secret: {
      privateKey: TypedArrayEncoder.fromString(generateRandom32BitString()),
    },
  });
  // issuer.config.logger.info(
  //   "Dids are::: did:key:z6Mkeopj4vD9VWrKoXtvWXTNa5RWMmtMRf3wN69iV8wTdrBB"
  // );

  // Sign BSLC
  // const credential = {
  //   context: ["https://www.w3.org/ns/credentials/v2"],
  //   id: "http://localhost:5005/status/0",
  //   type: ["VerifiableCredential", "BitstringStatusListCredential"],
  //   issuer: {
  //     id: issuerDids.didState.did,
  //   },
  //   issuanceDate: Date(),
  //   credentialSubject: {
  //     claims: {
  //       hello: "world",
  //     },
  //     id: "http://localhost:5005/status/1#list",
  //     type: "BitstringStatusList",
  //     encodedList:
  //       "H4sIAAAAAAAAA-3BMQEAAADCoPVPbQsvoAAAAAAAAAAAAAAAAP4GcwM92tQwAAA",
  //     statusPurpose: BitstringStatusListCredentialStatusPurpose.Revocation,
  //   },
  // } as unknown as W3cCredential;

  // // Sign a bitstring credential
  // const signedCred = await issuer.w3cCredentials.signCredential({
  //   format: ClaimFormat.LdpVc,
  //   credential,
  //   verificationMethod:
  //     "did:key:z6Mkty8b4M1arFSmxYVtM3nsoQvyFurHPhRxRms7vZ6cVZbN#z6Mkty8b4M1arFSmxYVtM3nsoQvyFurHPhRxRms7vZ6cVZbN",
  //   proofType: "Ed25519Signature2018",
  // });

  // issuer.config.logger.debug(`signedCred:::: ${JSON.stringify(signedCred)}`);

  // Create OOB Connection
  const oobConnection = await holder.oob.createInvitation();
  const invUrl = oobConnection.outOfBandInvitation.toUrl({
    domain: "http://localhost:6007",
  });

  // Connection
  const { connectionRecord } = await issuer.oob.receiveInvitationFromUrl(
    invUrl
  );
  if (!connectionRecord?.id) {
    throw new Error("Connection not found");
  }
  await issuer.connections.returnWhenIsConnected(connectionRecord.id);
  holder.config.logger.info("Connection established!");

  // Create did key
  // await holder.wallet.createKey({
  // 	keyType: KeyType.Ed25519,
  // 	seed: TypedArrayEncoder.fromString("01111111110001001101100100110110"),
  // })
  const dids = await holder.dids.create<KeyDidCreateOptions>({
    method: "key",
    options: {
      keyType: KeyType.Ed25519,
    },
    secret: {
      privateKey: TypedArrayEncoder.fromString(generateRandom32BitString()),
    },
  });
  holder.config.logger.info(`Dids are::: ${dids.didState.did}`);

  // console.log(
  //   "This is issuerDids.didState.didDocument?.verificationMethod[0].id",
  //   issuerDids.didState.didDocument?.verificationMethod[0].id
  // );

  // // IssuerDid
  // const issuerDids = await holder.dids.create<KeyDidCreateOptions>({
  //   method: "key",
  //   options: {
  //     keyType: KeyType.Ed25519,
  //   },
  //   secret: {
  //     privateKey: TypedArrayEncoder.fromString(
  //       "01111111110001001101100100110110"
  //     ),
  //   },
  // });
  // holder.config.logger.info(`Dids are::: ${issuerDids.didState.did}`);

  // Need to uncomment this
  await issuer.credentials.offerCredential({
    protocolVersion: "v2",
    credentialFormats: {
      jsonld: {
        credential: {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1",
          ],
          type: ["VerifiableCredential", "UniversityDegreeCredential"],
          issuer: issuerDids.didState.did as string,
          issuanceDate: "2019-10-12T07:20:50.52Z",
          credentialSubject: {
            id: dids.didState.did as string,
            degree: {
              type: "BachelorDegree",
              name: "Bachelor of Science and Arts",
            },
          },
          credentialStatus: {
            id: "https://ghkrishna.github.io/schemas/revocationSchemas/signed1.json#1",
            type: "BitstringStatusListEntry",
            statusListCredential:
              "https://ghkrishna.github.io/schemas/revocationSchemas/signed1.json",
            statusListIndex: "0",
            statusPurpose: "revocation",
          },
        },
        options: {
          proofType: "Ed25519Signature2018",
          proofPurpose: "assertionMethod",
        },
      },
    },
    connectionId: connectionRecord.id,
  });

  // let credentialObject:
  // await holder.credentials.createOffer({
  //   credentialFormats: {
  //     jsonld: {
  //       credential: {
  //         "@context": [
  //           "https://www.w3.org/2018/credentials/v1",
  //           "https://www.w3.org/2018/credentials/examples/v1"
  //         ],
  //         type: [
  //           "VerifiableCredential",
  //           "UniversityDegreeCredential"
  //         ],
  //         issuer: {
  //           id: issuerDids.didState.did
  //         },
  //         issuanceDate: "2019-10-12T07:20:50.52Z",
  //         credentialSubject: {
  //           id: dids.didState.did,
  //           degree: {
  //             type: "BachelorDegree",
  //             name: "Bachelor of Science and Arts"
  //           }
  //         },
  //         credentialStatus: {
  //           id: "https://example.com/status/3",
  //           type: "CredentialStatusList2017"
  //         }
  //       },
  //       options: {
  //         proofType: "Ed25519Signature2018",
  //         proofPurpose: "assertionMethod"
  //       }
  //     }
  //   },
  //   protocolVersion: Protocol
  // })

  // Agent restart
  // holder.config.logger.info("Agents shutting down!");
  // await holder.shutdown()
  // holder.config.logger.info("Agents shutdown!");

  // const totalSeconds = 30;
  // for (let i = 1; i <= totalSeconds; i++) {
  //   holder.config.logger.info(`Waiting... ${i} second(s) elapsed`);
  //   await new Promise(r => setTimeout(r, 1000));
  // }

  // if (!holder.isInitialized) {
  //   holder.config.logger.info("Agents initializing!");
  //   await holder.initialize()
  //   holder.config.logger.info("Agents initialized!");
  // }

  // Fetch URL
  // const response = await holder.config.agentDependencies.fetch("http://localhost:5005/credentials/2.json", {method: "Get"})
  // const resJson = await response.json()
  // Need to uncomment this
  await new Promise((resolve) => setTimeout(resolve, 5000));
}
function generateRandom32BitString() {
  let binaryString = "";
  for (let i = 0; i < 32; i++) {
    binaryString += Math.floor(Math.random() * 2); // Append 0 or 1
  }
  return binaryString;
}

app();
