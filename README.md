# erl-config

Static files and Certify configuration for the sample e-Revenue Licence VC. Meant to be published as a GitHub repo `tharsikan-govtech/erl-config` with GitHub Pages on, which serves everything under `https://tharsikan-govtech.github.io/erl-config/`.

| File | Served at / used for |
|---|---|
| `contexts/erl.json` | JSON-LD context of the VC, `.../contexts/erl.json`. Certify and verifiers fetch it |
| `did/did.json` | Issuer DID document, `.../did/did.json` = `did:web:tharsikan-govtech.github.io:erl-config:did`. Holds the public key of the Certify instance that signs the VCs |
| `certify/erl-vc-template.vm` | Velocity template of the VC (readable source) |
| `certify/erl-credential-config.json` | Body for Certify `POST /credential-configurations`. Generated: `node scripts/build-credential-config.js` |
| `pki/root.pem`, `pki/issuer-ca.pem`, `pki/dsc.pem` | Public certificates of the sample CA chain: Root CA → Issuer Sub-CA → signing certificate (for the key in `did/did.json`). Made by `../erl-ca`. A verifier must pin `root.pem` itself, never trust this copy blindly |
| `pki/registry-ca.pem`, `pki/registry-signer.pem` | Certificates of whoever signs the trust registry: Root CA → Registry Sub-CA → registry signer (carries a dedicated "may sign registries" EKU that issuer certificates lack) |
| `registry/trust-registry.jws` | Trust registry as a **signed** compact JWS (EdDSA, `x5c` = signer + registry sub-CA). Payload: issuer id, allowed credential types, the signing key and its chain, `version`, `nextUpdate`. Made by `../erl-ca` (`build-registry.mjs`, `sign-registry.mjs`). Re-sign before `nextUpdate` (30 days) or verifiers reject it |

The CA private keys are **not** here; they stay in `../erl-ca/pki` (git-ignored). Read the registry payload with: `cut -d. -f2 registry/trust-registry.jws | base64 -d` (the Root CA fingerprint is under `trustAnchors`).

The VC is `ldp_vc`, signed `Ed25519Signature2020`, type `RevenueLicenceCredential`. There is no Claim 169 QR: a vehicle licence has no identity fields, so only the `ID` key would map. The 17 claims in the credential config are exactly what `erl-sample-api` sends to `POST /pre-authorized-data`; change one side and the other must follow, because Certify rejects unknown claims.

## Steps

The working Certify setup (Docker Compose with these properties) is in `../erl-certify-stack`.

1. Publish this folder to GitHub with Pages on (branch `main`, root).
2. Start the stack: `docker compose up -d` in `erl-certify-stack`.
3. Register the credential type: `POST http://localhost:8090/v1/certify/credential-configurations` with `certify/erl-credential-config.json`.
4. Save `GET http://localhost:8090/v1/certify/.well-known/did.json` as `did/did.json` and publish it. Verification reads the public key from there. **If the Certify keys are ever recreated (`data/CERTIFY_PKCS12` or the `pgdata` volume deleted), this file must be replaced, and VCs signed with the old key stop verifying.**
5. Start `erl-sample-api`; its defaults already point at this Certify and at Mailpit.
