# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| latest | ✅ |
| older | ❌ |

Only the latest release receives security updates. Please update before reporting a vulnerability.

---

## Reporting a Vulnerability

Do not open a public GitHub issue for security vulnerabilities.

Report vulnerabilities privately through one of these channels:

- **Discord**: [nolly__](https://discord.com/invite/JYDzHfgmrP) (DM or open a ticket)
- **GitHub**: [Private security advisory](https://github.com/thenolle/discord-rpc/security/advisories/new)

Please include:

- A clear description of the vulnerability.
- Steps to reproduce, or proof-of-concept code.
- An assessment of the potential impact.
- A suggested fix, if available.

---

## Response Timeline

| Step | Target Time |
|---|---|
| Acknowledgement | Within 48 hours |
| Initial assessment | Within 5 days |
| Fix or mitigation | Within 30 days, depending on severity |
| Public disclosure | After the fix is released |

---

## Scope

This policy applies to the `drpc` executable and its source code.

### In scope

- RPC server security issues.
- Local HTTP/WebSocket server vulnerabilities.
- Image proxy misuse or open-relay potential.
- Arbitrary file read or write via server endpoints.

### Out of scope

- Discord platform security.
- Imgur platform security.
- Third-party dependency issues, which should be reported upstream.