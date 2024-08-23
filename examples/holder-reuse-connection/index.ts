import { holder } from "./holder";
import { holder1 } from "./holder1";
import { holder2 } from "./holder2";

async function app() {
	await holder.initialize();
	await holder1.initialize();
	await holder2.initialize();
	holder2.config.logger.info("Agents initialized!");

	await new Promise((resolve) => setTimeout(resolve, 5000));

	// 1st holder
	const oobRecord = await holder.oob.createInvitation();

	const invitationDid = oobRecord.outOfBandInvitation.invitationDids[0];

	console.log("invitationDid invitationDid", invitationDid);

	const rec = await holder1.oob.receiveInvitationFromUrl(
		oobRecord.outOfBandInvitation.toUrl({
			domain: "http://github.com",
		}),
		{
			reuseConnection: true,
		},
	);

	if (!rec.connectionRecord?.id) {
		throw new Error("Connection record not found");
	}

	await holder1.connections.returnWhenIsConnected(rec.connectionRecord?.id);

	// 2nd holder
	const oobRecord1 = await holder.oob.createInvitation({
		invitationDid,
	});

	const oobRec = await holder2.oob.receiveInvitationFromUrl(
		oobRecord1.outOfBandInvitation.toUrl({
			domain: "http://github.com",
		}),
		{
			reuseConnection: true,
		},
	);

	if (!oobRec.connectionRecord?.id) {
		throw new Error("Connection record not found");
	}

	// await holder2.connections.returnWhenIsConnected(oobRec.connectionRecord?.id);
}

app();
