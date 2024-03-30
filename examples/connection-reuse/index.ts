import { faber } from "./faber";
import { alice } from "./alice";
import { bob } from "./bob";

async function app() {
	await faber.initialize();
	await alice.initialize();
	await bob.initialize();
	bob.config.logger.info("Agents initialized!");

	const routing = await faber.mediationRecipient.getRouting({});

	// Create out of band invitation
	const inv = await faber.oob.createInvitation({
		routing,
	});

	// Accept the invitation
	const { connectionRecord } = await alice.oob.receiveInvitation(
		inv.outOfBandInvitation,
		{
			reuseConnection: true,
		},
	);

	if (!connectionRecord) {
		throw new Error("Connection not found");
	}

	// Wait for connection to be established
	await alice.connections.returnWhenIsConnected(connectionRecord.id);

	const inv1 = await faber.oob.createInvitation({
		routing,
	});

	const { connectionRecord: rec1 } = await alice.oob.receiveInvitation(
		inv1.outOfBandInvitation,
		{
			reuseConnection: true,
		},
	);

	if (!rec1) {
		throw new Error("Connection not found");
	}

	// Wait for connection to be established
	await alice.connections.returnWhenIsConnected(rec1.id);

	const inv2 = await faber.oob.createInvitation({
		routing,
	});

	// Accept the invitation
	const { connectionRecord: rec2 } = await bob.oob.receiveInvitation(
		inv2.outOfBandInvitation,
		{
			reuseConnection: true,
		},
	);

	if (!rec2) {
		throw new Error("Connection not found");
	}

	// Wait for connection to be established
	await bob.connections.returnWhenIsConnected(rec2.id);

	const inv3 = await bob.oob.createInvitation({
		routing,
	});

	// Accept the invitation
	const { connectionRecord: rec3 } = await bob.oob.receiveInvitation(
		inv3.outOfBandInvitation,
		{
			reuseConnection: true,
		},
	);

	if (!rec3) {
		throw new Error("Connection not found");
	}

	// Wait for connection to be established
	await bob.connections.returnWhenIsConnected(rec3.id);
}

app();
