# Security Policy

## Supported Versions

The following table outlines the currently maintained versions of this project. Only supported versions will receive critical security patches and vulnerability disclosures.

| Version Range | Support Level   | Notes                                  |
| ------------- | --------------- | -------------------------------------- |
| >= 5.1.x      | ✅ Fully Supported | Actively maintained, receives full support including security patches |
| 5.0.x         | ⚠️ Security Fixes Only | No new features, critical CVEs only |
| 4.0.x         | ⚠️ Limited Support | Security fixes on a case-by-case basis |
| < 4.0         | ❌ Unsupported    | No support or security updates        |

---

## Reporting a Vulnerability

If you believe you have found a security vulnerability in this project, we strongly encourage responsible disclosure and offer the following reporting process:

### 🔒 Private Disclosure Process

- **Preferred Method:** Use [GitHub's Private Vulnerability Reporting](../../security/advisories) feature.
- **Alternative:** Send encrypted email to `security@yourdomain.com` using our [PGP key](https://yourdomain.com/pgp.txt).

Please include the following in your report:
- Description of the vulnerability and potential impact
- Affected versions
- Steps to reproduce
- Proof-of-concept code or exploit (if applicable)
- Your contact information for follow-up

We will respond within **72 hours** with:
- Acknowledgment of the report
- A triage plan and severity assessment (see CVSS rating below)
- Disclosure and remediation timeline (if applicable)

---

## Vulnerability Management Process

1. **Triage:** The issue is validated and assessed for impact and scope.
2. **Severity Rating:** We assign a CVSSv3 base score to determine priority:
   - 🔴 Critical (9.0–10.0)
   - 🟠 High (7.0–8.9)
   - 🟡 Medium (4.0–6.9)
   - 🟢 Low (0.1–3.9)
3. **Remediation:** A patch is developed and tested internally.
4. **Disclosure Coordination:** With the reporter, a coordinated release is scheduled.
5. **Public Advisory:** Once the fix is published, a GitHub Security Advisory is released.

---

## Coordinated Disclosure Policy

We follow industry-standard [Coordinated Vulnerability Disclosure (CVD)](https://www.cisa.gov/coordinated-vulnerability-disclosure-process) guidelines:

- We prefer **non-public disclosure first** to allow time for patch development.
- We aim to resolve critical issues within **30 days**, medium within **90 days**.
- Credit will be given to responsible reporters in advisory releases unless anonymity is requested.

---

## Security Enhancements & Best Practices

We maintain a proactive security posture, including:
- GitHub Advanced Security (secret scanning, Dependabot alerts)
- Static and dynamic analysis in CI/CD
- SBOM generation and signing (SPDX/CycloneDX)
- Regular third-party audits (where applicable)

---

## Hall of Fame

We appreciate and recognize the contributions of security researchers. Public credit will be given in the project's changelog and GitHub advisory page.

If you're interested in contributing to the security of this project, consider joining our security program or submitting enhancements.

