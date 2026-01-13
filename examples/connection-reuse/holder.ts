import { AskarModule } from "@credo-ts/askar";
import {
	Agent,
		ConsoleLogger,
	LogLevel,
} from "@credo-ts/core";
import {
	DidCommHttpOutboundTransport,
	DidCommWsOutboundTransport,
	DidCommModule
} from "@credo-ts/didcomm";
import { DrizzleStorageModule } from "@credo-ts/drizzle-storage";
import { coreBundle } from "@credo-ts/drizzle-storage/core";
import { anoncredsBundle } from "@credo-ts/drizzle-storage/anoncreds";
import { didcommBundle } from "@credo-ts/drizzle-storage/didcomm";
import { DidCommHttpInboundTransport, agentDependencies } from "@credo-ts/node";
import { askar } from "@openwallet-foundation/askar-nodejs";

// Postgres
// import { drizzle } from "drizzle-orm/node-postgres";
// SQL
import { drizzle } from "drizzle-orm/libsql";
import { questionAnswerBundle } from "@credo-ts/drizzle-storage/question-answer";
import { actionMenuBundle } from "@credo-ts/drizzle-storage/action-menu";

// const database = drizzle(
// 	"postgresql://postgres:postgres@localhost:5432/holder-agent-id2"
// );
// SQL
const database = drizzle(
	"file:./holder_sqlite.db"
);

const bundles = [coreBundle, didcommBundle, actionMenuBundle, anoncredsBundle, questionAnswerBundle] as const;

export const holder = new Agent({
	config: {
		logger: new ConsoleLogger(LogLevel.trace),
	},
	modules: {
		// Storage Module
		askar: new AskarModule({
			askar,
			store: {
				id: "holder-agent-id-askar",
				key: "holder-agent-key",
				database: {
					type: 'postgres',
					config: {
						host: 'localhost'
					},
					credentials: {
						account: 'postgres',
						password: 'postgres',
					}
				}
			},
			enableKms: true,
			enableStorage: false
		}),
		
		drizzleStorage: new DrizzleStorageModule({
			database,
			bundles: [...bundles],
		}),
		didcomm: new DidCommModule({
			connections: {
				autoAcceptConnections: true
			},
			endpoints: ["http://localhost:6007/didcomm"],
		}),

		// Connections module is enabled by default, but we can
		// override the default configuration

	},
	dependencies: agentDependencies,
});

holder.didcomm.registerInboundTransport(
	new DidCommHttpInboundTransport({
		port: 6007,
		path: "/didcomm",
	}),
);
holder.didcomm.registerOutboundTransport(new DidCommHttpOutboundTransport());
holder.didcomm.registerOutboundTransport(new DidCommWsOutboundTransport());