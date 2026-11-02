# erl-config

Static files and Certify configuration for the sample e-Revenue Licence VC. Meant to be published as a GitHub repo `tharsikan-govtech/erl-config` with GitHub Pages on, which serves everything under `https://tharsikan-govtech.github.io/erl-config/`.

| File | Served at / used for |
|---|---|
| `contexts/erl.json` | JSON-LD context of the VC, `.../contexts/erl.json`. Certify and verifiers fetch it |
| `did/did.json` | Issuer DID document, `.../did/did.json` = `did:web:tharsikan-govtech.github.io:erl-config:did`. Holds the public key of the Certify instance that signs the VCs |
| `certify/erl-vc-template.vm` | Velocity template of the VC (readable source) |
| `certify/erl-credential-config.json` | Body for Certify `POST /credential-configurations`. Generated: `node scripts/build-credential-config.js` |

The VC is `ldp_vc`, signed `Ed25519Signature2020`, type `RevenueLicenceCredential`, with a signed Claim 169 style QR (`claim169.identityQRCode`) holding the licence number, vehicle number and dates. The 17 claims in the credential config are exactly what `erl-sample-api` sends to `POST /pre-authorized-data`; change one side and the other must follow, because Certify rejects unknown claims.

## Steps

The working Certify setup (Docker Compose with these properties) is in `../erl-certify-stack`.

1. Publish this folder to GitHub with Pages on (branch `main`, root).
2. Start the stack: `docker compose up -d` in `erl-certify-stack`.
3. Register the credential type: `POST http://localhost:8090/v1/certify/credential-configurations` with `certify/erl-credential-config.json`.
4. Save `GET http://localhost:8090/v1/certify/.well-known/did.json` as `did/did.json` and publish it. Verification reads the public key from there. **If the Certify keys are ever recreated (`data/CERTIFY_PKCS12` or the `pgdata` volume deleted), this file must be replaced, and VCs signed with the old key stop verifying.**
5. Start `erl-sample-api`; its defaults already point at this Certify and at Mailpit.
