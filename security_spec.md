# EINORT CRM SECURITY SPECIFICATION
## PHASE 6: FINAL ADVERSARIAL AUDIT & ZERO-TRUST TOPOLOGY

### 1. Data Invariants & Zero-Trust Assertions

1. **Self-Promotion Guard**: No client or authenticated user can promote their own record to `role: "admin"` or `role: "super_admin"`, nor set `isAdmin: true` during any creation or update phase.
2. **Project Isolation**: Standard client users can only read projects belonging to their verified `userId` or projects with matching verified `email`. They have no read or write visibility over other client portfolios.
3. **Immutability of Historical Milestones**: Core administrative metrics like `createdAt`, original `userId`, and `leadScore` cannot be modified by standard users post-completions.
4. **Administrative Exclusivity for State Overrides**: Setting the administrative state or transitioning `status` on projects is strictly restricted to authorized business admins or super admins verified in `/users/{userId}` or the ID token claims.
5. **PII and Ledger Isolation**: System configurations, raw telemetry feeds, and custom project order databases under `/ledger`, `/crm`, and `/analytics` are inaccessible to non-admins.

---

### 2. The "Dirty Dozen" Attack Payloads

These 12 malicious payloads attempt to violate security boundaries, circumvent role-gates, or insert malformed/exhausting content to demonstrate coverage.

#### Payload 1: Privilege Escalation (Self-Promotion on Sign-Up)
* **Goal**: Attack path attempting to register a client with administrative privileges.
* **Target Path**: `databases/$(database)/documents/users/attacker_uid`
```json
{
  "uid": "attacker_uid",
  "email": "attacker@darknet.com",
  "fullName": "Malicious Actor",
  "role": "super_admin",
  "isAdmin": true,
  "accountType": "enterprise"
}
```

#### Payload 2: Privilege Escalation (Post-Registration Modification)
* **Goal**: Attempt to update a standard client profile to an admin status.
* **Target Path**: `databases/$(database)/documents/users/existing_client_uid`
```json
{
  "role": "admin",
  "isAdmin": true
}
```

#### Payload 3: Inbound Lead Interception (Cross-Reading Profiles)
* **Goal**: Attacker trying to harvest client metadata by reading another user's document.
* **Target Path**: `databases/$(database)/documents/users/victim_client_uid`
* **Expected State**: Reject with `PERMISSION_DENIED` unless auth matches `victim_client_uid`.

#### Payload 4: Orphaned Project Creation
* **Goal**: Attacker tries to inject a project pointing to a fake or unverified `userId`.
* **Target Path**: `databases/$(database)/documents/projects/malicious_project_id`
```json
{
  "userId": "victim_uid",
  "clientName": "Victim Corp",
  "projectType": "ERP Integration",
  "budget": "$500k+",
  "timeline": "6 Months",
  "status": "pending"
}
```

#### Payload 5: Lead Score Poisoning
* **Goal**: Standard client tries to set their lead score to 100 to force prioritized resourcing.
* **Target Path**: `databases/$(database)/documents/projects/assigned_project_id`
```json
{
  "leadScore": 100,
  "complexityScore": 10
}
```

#### Payload 6: Stage Shortcutting (Status Manipulation)
* **Goal**: Client attempting to mark a project as "completed" without engineering milestones.
* **Target Path**: `databases/$(database)/documents/projects/assigned_project_id`
```json
{
  "status": "completed"
}
```

#### Payload 7: Denial of Wallet (ID Poisoning on Contacts)
* **Goal**: Attempt to allocate immense document size or junk-ID patterns in `inquiries`.
* **Target Path**: `databases/$(database)/documents/inquiries/JUNK_ID_SPAM_ZZZZ_REPEATED_3500_TIMES_...`
* **Expected State**: Reject via strict ID structure validator.

#### Payload 8: Anonymous Inquiry Spoofing
* **Goal**: Submitting inquiry fields missing required full name or metadata structure to crash the admin dashboards.
* **Target Path**: `databases/$(database)/documents/inquiries/new_uuid`
```json
{
  "email": "phantom@fake.com"
}
```

#### Payload 9: Global Ledger Ingestion Exfiltration
* **Goal**: A malicious client trying to run group list queries on the central `/ledger` or `/crm` without matching admin roles.
* **Target Path**: `databases/$(database)/documents/ledger`
* **Expected State**: Reject index scraping queries.

#### Payload 10: Client Narrative Hijack (Activity Stream Swaps)
* **Goal**: Inject client activity trace as another user.
* **Target Path**: `databases/$(database)/documents/clientActivity/act_id`
```json
{
  "userId": "other_uid",
  "clientEmail": "victim@corporate.com",
  "actionTitle": "Malicious Action Logged"
}
```

#### Payload 11: Cross-Project Contact Exposure
* **Goal**: Authenticated agent trying to run `list` operations on `/projects` without matching filters (Query Scraping).
* **Target Path**: `databases/$(database)/documents/projects`
* **Expected State**: Enforce exact `userId == auth.uid` in the list query pattern.

#### Payload 12: Terminal State Tampering
* **Goal**: Modifying a historical project after it has been cancelled/completed.
* **Target Path**: `databases/$(database)/documents/projects/archived_project_id`
```json
{
  "requirements": "Override historical engineering parameters"
}
```

---

### 3. Verification Test Suite Blueprint (`firestore.rules.test.ts`)

```typescript
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import * as fs from "fs";

describe("EINORT CRM - Zero-Trust Role-Based Access Control Verification", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "einort-solutions-auth",
      firestore: {
        rules: fs.readFileSync("firestore.rules", "utf8"),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("fails: Payload 1 - privilege escalation (Self-Promotion on Sign-Up)", async () => {
    const maliciousClientDb = testEnv.authenticatedContext("attacker_uid").firestore();
    const userDocRef = doc(maliciousClientDb, "users", "attacker_uid");
    
    await expect(
      setDoc(userDocRef, {
        uid: "attacker_uid",
        email: "attacker@darknet.com",
        fullName: "Attacker",
        role: "super_admin",
        isAdmin: true,
        accountType: "enterprise",
      })
    ).rejects.toThrow();
  });

  it("fails: Payload 2 - privilege escalation (Status change restricted keys)", async () => {
    const clientDb = testEnv.authenticatedContext("client_uid").firestore();
    const userDocRef = doc(clientDb, "users", "client_uid");

    await expect(
      updateDoc(userDocRef, {
        role: "admin",
        isAdmin: true,
      })
    ).rejects.toThrow();
  });

  it("fails: Payload 5 - client attempts to alter project leadScore", async () => {
    const clientDb = testEnv.authenticatedContext("client_uid").firestore();
    const projectDoc = doc(clientDb, "projects", "assigned_project_id");

    await expect(
      updateDoc(projectDoc, {
        leadScore: 100,
      })
    ).rejects.toThrow();
  });

  it("fails: Payload 9 - global query scraping on ledger keys", async () => {
    const clientDb = testEnv.authenticatedContext("client_uid").firestore();
    const ledgerDoc = doc(clientDb, "ledger", "system_state");

    await expect(getDoc(ledgerDoc)).rejects.toThrow();
  });
});
```
