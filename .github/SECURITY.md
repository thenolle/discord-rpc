# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | ✅        |
| older   | ❌        |

Only the latest release receives security updates. Please update before reporting.

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities privately via one of these channels:

- **Discord**: [nolly__](https://discord.com/users/1030561407411966064)
- **GitHub**: [Private security advisory](https://github.com/thenolle/discord-rpc/security/advisories/new)

Please include:

- A clear description of the vulnerability
- Steps to reproduce or proof-of-concept code
- Potential impact assessment
- Your suggested fix (optional but appreciated)

---

## Response Timeline

| Step                     | Target Time   |
|--------------------------|---------------|
| Acknowledgement          | Within 48h    |
| Initial assessment       | Within 5 days |
| Fix or mitigation        | Within 30 days (severity-dependent) |
| Public disclosure        | After fix is released |

---

## Scope

This policy applies to the `drpc` executable and its source code.

**In scope:**

- RPC server security issues
- Local HTTP/WebSocket server vulnerabilities
- Image proxy misuse or open relay potential
- Arbitrary file read/write via server endpoints

**Out of scope:**

- Discord's own platform security
- Imgur's platform security
- Third-party dependency issues (report those upstream)