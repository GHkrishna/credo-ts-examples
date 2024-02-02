import console from 'console'
import { issuer } from './issuer'
import { holder } from './holder'
import {
  DidDocument,
  DidDocumentBuilder,
  JsonTransformer,
  KeyType,
  OutOfBandState,
  TypedArrayEncoder,
  getEd25519VerificationKey2018,
} from '@aries-framework/core'

async function app() {
  await issuer.initialize()
  await holder.initialize()
  issuer.config.logger.info('Agents initialized!')

  const domain = 'sairanjit.github.io'
  const did = `did:web:${domain}`
  const keyId = `${did}#key-1`

  const key = await issuer.wallet.createKey({
    keyType: KeyType.Ed25519,
    privateKey: TypedArrayEncoder.fromString('afjdemoverysercure00000000000000'),
  })

  const holderKey = await holder.dids.create({
    method: 'key',
    options: {
      keyType: KeyType.Ed25519,
    },
    secret: {
      privateKey: TypedArrayEncoder.fromString('afjdemoverysercure00000000000key'),
    },
  })

  const didDocument = new DidDocumentBuilder(did)
    .addContext('https://w3id.org/security/suites/ed25519-2018/v1')
    .addVerificationMethod(getEd25519VerificationKey2018({ key, id: keyId, controller: did }))
    .addAuthentication(keyId)
    .build()

  await issuer.dids.import({
    did,
    overwrite: true,
    didDocument,
  })

  const dids = await issuer.dids.getCreatedDids({ did })

  const usingDid = dids.find((record) => record.did.includes('did:web'))?.did

  // Create out of band invitation

  const inv = await holder.oob.createLegacyInvitation({
    autoAcceptConnection: true,
  })
  const { connectionRecord } = await issuer.oob.receiveInvitation(inv.invitation)
  if (!connectionRecord) {
    throw new Error('Connection not found')
  }

  await issuer.connections.returnWhenIsConnected(connectionRecord.id)

  const credRecord = await issuer.credentials.offerCredential({
    connectionId: connectionRecord.id,
    credentialFormats: {
      jsonld: {
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
          type: ['VerifiableCredential', 'UniversityDegreeCredential'],
          issuer: { id: usingDid! },
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: holderKey.didState.did!,
            degree: {
              type: 'BachelorDegree',
              name: 'Bachelor of Science and Arts',
            },
          },
        },
        options: {
          proofType: 'Ed25519Signature2018',
          proofPurpose: 'assertionMethod',
        },
      },
    },
    protocolVersion: 'v2',
  })

  // const proofRecord = await issuer.proofs.requestProof({
  //   connectionId: connectionRecord.id,
  //   proofFormats: {
  //     presentationExchange: {
  //       presentationDefinition: {
  //         id: '32f54163-7166-48f1-93d8-ff217bdb0653',
  //         input_descriptors: [
  //           {
  //             constraints: {
  //               fields: [
  //                 {
  //                   path: ['$.credentialSubject.degree.type'],
  //                 },
  //               ],
  //             },
  //             id: 'citizenship_input_1',
  //             schema: [{ uri: 'https://www.w3.org/2018/credentials/examples/v1' }],
  //           },
  //         ],
  //       },
  //     },
  //   },
  //   protocolVersion: 'v2',
  // })
}

app()
