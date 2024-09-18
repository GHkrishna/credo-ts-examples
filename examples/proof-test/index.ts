import { issuer } from "./issuer";
import { holder } from "./holder";
import {
	ConnectionEventTypes,
	ConnectionStateChangedEvent,
	DidExchangeState,
	HandshakeReusedEvent,
	KeyType,
	OutOfBandEventTypes,
	OutOfBandStateChangedEvent,
	ProofEventTypes,
	ProofStateChangedEvent,
	TypedArrayEncoder,
	utils,
} from "@credo-ts/core";

async function app() {
	await issuer.initialize();
	await holder.initialize();
	issuer.config.logger.info("Agents initialized!");

	issuer.events.on(
		ConnectionEventTypes.ConnectionStateChanged,
		async (event: ConnectionStateChangedEvent) => {
			const record = event.payload.connectionRecord;

			console.log("state", record.state);
			console.log("Connection Data", record.toJSON());

			if (record.state === DidExchangeState.Completed) {
				const proof = await issuer.proofs.requestProof({
					connectionId: record.id,
					parentThreadId: record.threadId,
					proofFormats: {
						presentationExchange: {
							presentationDefinition: {
								id: "32f54163-7166-48f1-93d8-ff217bdb0653",
								input_descriptors: [
									{
										constraints: {
											fields: [
												{
													path: ["$.credentialSubject.degree.type"],
												},
											],
										},
										id: "citizenship_input_1",
										schema: [
											{
												uri: "https://www.w3.org/2018/credentials/examples/v1",
											},
										],
									},
								],
							},
						},
					},
					protocolVersion: "v2",
				});
			}
		},
	);

	issuer.events.on(
		OutOfBandEventTypes.HandshakeReused,
		async (event: HandshakeReusedEvent) => {
			const record = event.payload;

			console.log("reusePayload", JSON.stringify(record));

			console.log("state", record.connectionRecord.state);
			console.log("Reuse Connection Data", record.connectionRecord.toJSON());

			if (record.connectionRecord.state === DidExchangeState.Completed) {
				const proof = await issuer.proofs.requestProof({
					connectionId: record.connectionRecord.id,
					parentThreadId: record.reuseThreadId,
					proofFormats: {
						presentationExchange: {
							presentationDefinition: {
								id: "32f54163-7166-48f1-93d8-ff217bdb0653",
								input_descriptors: [
									{
										constraints: {
											fields: [
												{
													path: ["$.credentialSubject.degree.type"],
												},
											],
										},
										id: "citizenship_input_1",
										schema: [
											{
												uri: "https://www.w3.org/2018/credentials/examples/v1",
											},
										],
									},
								],
							},
						},
					},
					protocolVersion: "v2",
				});

				console.log("proofproof", JSON.stringify(proof));
			}
		},
	);

	issuer.events.on(
		ProofEventTypes.ProofStateChanged,
		async (event: ProofStateChangedEvent) => {
			const record = event.payload.proofRecord;

			console.log("state", record.state);
			console.log("Proof Data", record.toJSON());
		},
	);

	const holderKey = await holder.dids.create({
		method: "key",
		options: {
			keyType: KeyType.Ed25519,
		},
		secret: {
			privateKey: TypedArrayEncoder.fromString(
				"afjdemoverysercure00000000000key",
			),
		},
	});

	const {
		didState: { did: issuerDid },
	} = await issuer.dids.create({
		method: "key",
		options: {
			keyType: KeyType.Ed25519,
			privateKey: TypedArrayEncoder.fromString(
				"00000000000000000000000000000bbs",
			),
		},
	});

	// const offer = await issuer.credentials.createOffer({
	// 	credentialFormats: {
	// 		jsonld: {
	// 			credential: {
	// 				"@context": [
	// 					"https://www.w3.org/2018/credentials/v1",
	// 					"https://www.w3.org/2018/credentials/examples/v1",
	// 				],
	// 				type: ["VerifiableCredential", "UniversityDegreeCredential"],
	// 				issuer: { id: issuerDid! },
	// 				issuanceDate: new Date().toISOString(),
	// 				credentialSubject: {
	// 					id: holderKey.didState.did!,
	// 					degree: {
	// 						type: "BachelorDegree",
	// 						name: "Bachelor of Science and Arts",
	// 					},
	// 				},
	// 			},
	// 			options: {
	// 				proofType: "Ed25519Signature2018",
	// 				proofPurpose: "assertionMethod",
	// 			},
	// 		},
	// 	},
	// 	protocolVersion: "v2",
	// });

	// // Create out of band invitation

	// const inv = await issuer.oob.createInvitation({
	// 	messages: [offer.message],
	// });
	// const { connectionRecord } = await holder.oob.receiveInvitation(
	// 	inv.outOfBandInvitation,
	// );

	// const uuid = utils.uuid();

	// console.log("Test UUID", uuid);

	// const proof = await issuer.proofs.createRequest({
	// 	// parentThreadId: uuid,
	// 	proofFormats: {
	// 		presentationExchange: {
	// 			presentationDefinition: {
	// 				id: "32f54163-7166-48f1-93d8-ff217bdb0653",
	// 				input_descriptors: [
	// 					{
	// 						constraints: {
	// 							fields: [
	// 								{
	// 									path: ["$.credentialSubject.degree.type"],
	// 								},
	// 							],
	// 						},
	// 						id: "citizenship_input_1",
	// 						schema: [
	// 							{ uri: "https://www.w3.org/2018/credentials/examples/v1" },
	// 						],
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// 	protocolVersion: "v2",
	// });

	const invDid =
		"did:peer:2.Vz6MkpBAovF3pyjcKxjbYnRNhVj4dyPhs5ctT51XQRih4GyvU.Ez6LScBLt3CSo8bbfN9qvnJE2EEx25ngHM7Gq36cQJF8Msj4U.SeyJzIjoiaHR0cDovL2xvY2FsaG9zdDo2MDA2L2RpZGNvbW0iLCJ0IjoiZGlkLWNvbW11bmljYXRpb24iLCJwcmlvcml0eSI6MCwicmVjaXBpZW50S2V5cyI6WyIja2V5LTEiXSwiciI6W119";

	const inv = await issuer.oob.createInvitation({
		// messages: [proof.message],
		invitationDid: invDid,
	});
	const invitationDid = inv.outOfBandInvitation.invitationDids;
	console.log("invitationDidss", invitationDid);
	console.log("outOfBandInvitation", JSON.stringify(inv));
	console.log(
		"outOfBandInvitation url",
		inv.outOfBandInvitation.toUrl({
			domain: "http://github.com",
		}),
	);

	const { connectionRecord } = await holder.oob.receiveInvitation(
		inv.outOfBandInvitation,
		{
			reuseConnection: true,
		},
	);

	await holder.connections.returnWhenIsConnected(connectionRecord.id);

	// const proof = await issuer.proofs.requestProof({
	// 	connectionId: "",
	// 	proofFormats: {
	// 		presentationExchange: {
	// 			presentationDefinition: {
	// 				id: "32f54163-7166-48f1-93d8-ff217bdb0653",
	// 				input_descriptors: [
	// 					{
	// 						constraints: {
	// 							fields: [
	// 								{
	// 									path: ["$.credentialSubject.degree.type"],
	// 								},
	// 							],
	// 						},
	// 						id: "citizenship_input_1",
	// 						schema: [
	// 							{ uri: "https://www.w3.org/2018/credentials/examples/v1" },
	// 						],
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// 	protocolVersion: "v2",
	// });
}

app();

// Reuse
// 4b9be4cb-c3e4-4a8b-a4db-b4f6ad1ef9dd

// new
// d42bdc76-9b84-4fd9-953d-f15f10d8954b

// a95057f6-ee6d-43b4-9666-8e09e124c161

// 2c518210-869f-4422-973c-82ba434c1923
