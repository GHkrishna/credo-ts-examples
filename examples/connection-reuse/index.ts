import { holder } from "./holder";
import { issuer } from "./issuer";

async function app() {
	await holder.initialize();
	await issuer.initialize();
	issuer.config.logger.info("Agents initialized!");

	// Create invitation
	const oobRecord = await issuer.didcomm.oob.createInvitation();

	// We have to save the invitationDid to reuse the connection later
	// and we have to use invitationDid again while creating the invitation
	const invitationDid = oobRecord.outOfBandInvitation.invitationDids[0];

	// We can reuse the connection if we want to by passing the `reuseConnection` flag to the receiveInvitation method
	const rec = await holder.didcomm.oob.receiveInvitation(
		oobRecord.outOfBandInvitation,
		{
			reuseConnection: true,
			label: 'holder',
		},
	);

	if (!rec.connectionRecord?.id) {
		throw new Error("Connection record not found");
	}

	await holder.didcomm.connections.returnWhenIsConnected(rec.connectionRecord?.id);

	// We pass the invitationDid here to create a new connection invitation
	const oobRecord1 = await issuer.didcomm.oob.createInvitation({
		invitationDid,
	});

	const oobRec = await holder.didcomm.oob.receiveInvitation(
		oobRecord1.outOfBandInvitation,
		{
			reuseConnection: true,
			label: 'issuer'
		},
	);

	if (!oobRec.connectionRecord?.id) {
		throw new Error("Connection record not found");
	}

	await holder.didcomm.connections.returnWhenIsConnected(oobRec.connectionRecord?.id);

	const issuerConnections = await issuer.didcomm.connections.getAll();
	const holderConnections = await holder.didcomm.connections.getAll();
	// Postgres
	// const holderConnectionsFilt = await holder.didcomm.connections.findAllByQuery({
	// 	// $or: [
	// 	// 	{ threadId: 'f3fd1417-5e58-4777-b23f-3fff5bebb038' },
	// 	// 	{ threadId: 'd33f99a9-8436-4932-99b8-3b7058b55ed0' }
	// 	// ]
	// }, {
	// 	cursor: {
	// 		id: '6b6df230-ad3d-4459-9e00-6e7d98aa6f78',
	// 		updatedAt: new Date('2026-01-12T10:54:35.996Z')
	// 	}
	// }) ;

	// SQL
	const holderConnectionsFilt = await holder.didcomm.connections.findAllByQuery({
		// $or: [
		// 	{ threadId: 'f3fd1417-5e58-4777-b23f-3fff5bebb038' },
		// 	{ threadId: 'd33f99a9-8436-4932-99b8-3b7058b55ed0' }
		// ]
	}, {
		// cursor: {
		// 	id: 'a676e7f3-b8ce-4b3c-8493-a974fd02fdaf',
		// 	// updatedAt: new Date('2026-01-13T06:43:45.815Z')
		// },
		offset: 1,
		limit: 4
	});


	issuer.config.logger.info(
		`Issuer Connections count: ${issuerConnections.length}`,
	);

	holder.config.logger.info(
		`Holder Connections count: ${holderConnections.length}`,
	);
	holder.config.logger.info(
		`Holder Connections: ${JSON.stringify(holderConnectionsFilt, null, 2)}`,
	);
}

app();
