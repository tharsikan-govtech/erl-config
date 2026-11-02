# erl-config

Static files and Certify configuration for the sample e-Revenue Licence VC. Meant to be published as a GitHub repo `tharsikan-govtech/erl-config` with GitHub Pages on, which serves everything under `https://tharsikan-govtech.github.io/erl-config/`.

| File | Served at / used for |
|---|---|
| `contexts/erl.json` | JSON-LD context of the VC, `.../contexts/erl.json`. Certify and verifiers fetch it |
| `did/did.json` | Issuer DID document, `.../did/did.json` = `did:web:tharsikan-govtech.github.io:erl-config:did`. **Not created yet**, see below |
| `certify/erl-vc-template.vm` | Velocity template of the VC (readable source) |
| `certify/erl-credential-config.json` | Body for Certify `POST /credential-configurations`. Generated: `node scripts/build-credential-config.js` |
| `certify/application-erl.properties` | Properties to add to Certify |

The VC is `ldp_vc`, signed `Ed25519Signature2020`, type `RevenueLicenceCredential`, with a signed Claim 169 style QR (`claim169.identityQRCode`) holding the licence number, vehicle number and dates. The 17 claims in the credential config are exactly what `erl-sample-api` sends to `POST /pre-authorized-data`; change one side and the other must follow, because Certify rejects unknown claims.

## Steps

1. Publish this folder to GitHub with Pages on (branch `main`, root).
2. Add `certify/application-erl.properties` to Certify and start it (needs Postgres, `db_scripts`, and the Ed25519 key `CERTIFY_VC_SIGN_ED25519`).
3. Fetch the DID document from Certify, `GET http://localhost:8090/v1/certify/.well-known/did.json`, save it as `did/did.json`, and publish it. Verification fails until this is live, because the public key is read from there.
4. Register the credential type: `POST http://localhost:8090/v1/certify/credential-configurations` with `certify/erl-credential-config.json`.
5. Start `erl-sample-api` with `CERTIFY_URL` pointing at Certify.
