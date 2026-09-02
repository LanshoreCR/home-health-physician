# Physician Add Tool — Database Contract

**Audience:** Database engineer
**Purpose:** Here's what the app does, the data it needs to persist, and the stored procedures the app will call. Types/naming below are a proposal — adjust to house standards. What matters is the **shape of the data** and the **operations**.

---

## 1. What the app does (in one minute)

Home-health staff submit **physician add requests** — "please add this physician to HCHB for this patient." Each request captures the patient, the requester, the physician, and the physician's office. A reviewer then works each request: sets a disposition status, edits data if needed, and the clean ones get **exported to HCHB** in a batch (an Excel file today).

So the whole app is basically **one entity** — `PhysicianRequest` — plus a handful of operations against it, backed by a set of **lookup tables** for the dropdown values.

Two roles touch it:
- **Submitter** — fills out the form, creates the request.
- **Reviewer** — opens a request, edits it, sets its status, triggers the export batch.

---

## 2. Design decisions (locked)

These are settled — reflected in the schema below. Noting them so intent is clear:

- **No status-change history table.** We don't track who/when/from→to on status changes.
- **The export is repeatable.** Every batch pulls *every* request in an exportable status, whether or not it went out before — the client asked for this and de-duplicates on their side. `exportedAt` is stamped on each run as a "last exported" mark; it is **not** a filter. (It was one until 2026-09-01: the batch used to be "exportable status **and** not yet exported.")
- **Lookup tables + FKs** for all enumerated values (degree, state, notification methods, etc.) — they'll grow, so no magic strings on the row.
- **Soft delete.** Requests are never hard-deleted; `isDeleted` / `deletedAt` flag them and they drop out of lists and batches.

---

## 3. Main table: `PhysicianRequest`

One row per request. Enumerated fields are `...Id` FKs into the lookup tables in §4.

| # | Field | Proposed type | Req? | Notes |
|---|-------|--------------|------|-------|
| 1 | `id` | `INT IDENTITY` PK | auto | Surface as the request number. |
| | **Patient & requester** | | | |
| 2 | `patientName` | `NVARCHAR(200)` | ✅ | |
| 3 | `mrn` | `NVARCHAR(50)` | ✅ | Medical record number. Letters and digits only (validated in the app and the API, no DB constraint). |
| 4 | `patientStatusId` | `INT` FK → `PatientStatus` | ✅ | |
| 5 | `requesterName` | `NVARCHAR(200)` | ✅ | |
| 6 | `requesterEmail` | `NVARCHAR(256)` | ✅ | Response email sent here on approve/deny. |
| | **Physician** | | | |
| 7 | `first` | `NVARCHAR(100)` | ✅ | |
| 8 | `last` | `NVARCHAR(100)` | ✅ | |
| 9 | `npi` | `CHAR(10)` | ✅ | 10-digit National Provider Identifier. |
| 10 | `degreeId` | `INT` FK → `Degree` | ✅ | |
| 11 | `physicianTypeId` | `INT` FK → `PhysicianType` | ✅ | |
| 12 | `vaTricare` | `BIT` | ✅ | Default 0. |
| 13 | `pecosVerified` | `BIT` | ✅ | Default 0. |
| 14 | `licenseNumber` | `NVARCHAR(50)` | — | Optional. |
| 15 | `licenseStateId` | `INT` FK → `USState` | — | Optional. |
| 16 | `licenseExp` | `DATE` | — | Optional. |
| 17 | `specialty` | `NVARCHAR(100)` | — | Optional free text. |
| 18 | `taxonomy` | `NVARCHAR(20)` | — | Optional free text. Goes to column Q (`Taxonomy Code`) of the HCHB import. Blank → `*NONE`. |
| 19 | `physicianGroup` | `NVARCHAR(200)` | — | Optional free text. Blank → "None" on HCHB import. |
| | **Notifications** | | | |
| 20 | `vitalAlertMethodId` | `INT` FK → `VitalAlertMethod` | ✅ | |
| 21 | `orderNotifMethodId` | `INT` FK → `OrderNotifMethod` | ✅ | |
| | **Physician's office** | | | |
| 22 | `branch` | `NVARCHAR(50)` | ✅ | Branch code (e.g. `ADO-022`). The app and the API cap input at 25 characters; the column carries headroom so the next widening does not need another index drop/recreate. |
| 23 | `address` | `NVARCHAR(200)` | ✅ | |
| 24 | `city` | `NVARCHAR(100)` | ✅ | |
| 25 | `stateId` | `INT` FK → `USState` | ✅ | |
| 26 | `zip` | `NVARCHAR(10)` | ✅ | |
| 27 | `phone` | `NVARCHAR(12)` | ✅ | Stored formatted `NNN-NNN-NNNN`. |
| 28 | `fax` | `NVARCHAR(12)` | ✅ | Stored formatted `NNN-NNN-NNNN`. |
| 29 | `officeVitalMethodId` | `INT` FK → `VitalAlertMethod` | — | Optional. Mirrors `vitalAlertMethodId` until edited. |
| 30 | `officeOrderMethodId` | `INT` FK → `OrderNotifMethod` | — | Optional. Mirrors `orderNotifMethodId` until edited. |
| 31 | `officePhysicianGroup` | `NVARCHAR(200)` | — | Optional free text. Mirrors `physicianGroup` until edited. |
| 32 | `admissionCoordinator` | `NVARCHAR(200)` | — | Optional. |
| 33 | `additionalDetails` | `NVARCHAR(MAX)` | — | Optional free text. |
| | **Workflow / audit** | | | |
| 34 | `statusId` | `INT` FK → `RequestStatus` | ✅ | Defaults to `newreq` on create. |
| 35 | `created` | `DATETIME2` | auto | Set server-side on insert. |
| 36 | `submitter` | `NVARCHAR(100)` | auto | Who submitted (initials/user today). |
| 37 | `exportedAt` | `DATETIME2` NULL | auto | Time of the row's **most recent** export; re-stamped every batch it appears in. NULL = never exported. Informational only — it does not gate the batch. |
| 38 | `isDeleted` | `BIT` NOT NULL | auto | Soft delete. Default 0. |
| 39 | `deletedAt` | `DATETIME2` NULL | auto | Set when `isDeleted` flips to 1. |

> **Note on the `office*` mirror fields (29–31):** on the form, these default to the physician-side value (`vitalAlerts`, `orderNotif`, `physicianGroup`) and only diverge if the reviewer edits them. That behavior lives in the app — the DB just stores whatever final values it's given.

> **Suggested indexes:** `statusId` (export batch + list filter), `branch` (list filter), `npi` (duplicate detection / search), a filtered index on `(statusId) WHERE exportedAt IS NULL AND isDeleted = 0` for the batch pull, and a search-covering approach for `first/last/patientName/mrn`.

---

## 4. Lookup tables

All lookups share one shape:

```
id        INT IDENTITY PK
code      NVARCHAR(20)  NOT NULL UNIQUE   -- stable, app-facing key (what the app sends/receives)
label     NVARCHAR(100) NOT NULL          -- UI display text
sortOrder INT           NOT NULL DEFAULT 0
isActive  BIT           NOT NULL DEFAULT 1
```

> **App contract:** procs speak in `code` strings (the values the app already uses). The proc resolves `code → id` on write and returns `code` (+ `label`) on read. The app never sees the surrogate ids. Adding a new dropdown option = one INSERT, no code change.

Seed values:

**`PatientStatus`**
| code | label |
|------|-------|
| `Pending Referral` | Pending Referral |
| `Current Patient` | Current Patient |

**`Degree`**
| code | label |
|------|-------|
| `MD` `DO` `DPM` `NP` `PA` | (same as code) |

**`PhysicianType`**
| code | label |
|------|-------|
| `f2f` | F2F Only |
| `primarySecondary` | Primary/Secondary |

**`VitalAlertMethod`** — used by `vitalAlertMethodId` **and** `officeVitalMethodId`
| code | label |
|------|-------|
| `Phone` `Fax` `Email` `Web` | (same as code) |

**`OrderNotifMethod`** — used by `orderNotifMethodId` **and** `officeOrderMethodId`
| code | label |
|------|-------|
| `F-Fax` `F-Delivery` `F-Paper` `F-Circle` `Email` `Website` `Interface` | (same as code) |

**`USState`** — used by `stateId` **and** `licenseStateId`
| code | label |
|------|-------|
| `KY` `IN` `OH` `TN` `IL` | (state name) *(pilot states — will grow)* |

**`RequestStatus`** — carries the workflow metadata as columns (see §5). Extra columns beyond the standard shape:

```
isExportable BIT NOT NULL   -- included in export batch
firesEmail   BIT NOT NULL   -- sends a response to requesterEmail
```

| code | label | isExportable | firesEmail |
|------|-------|:---:|:---:|
| `newreq` | New Request | 1 | 0 |
| `modify` | Modify Physician | 1 | 0 |
| `approved` | Request Approved | 1 | 1 |
| `duplicate` | Duplicate Phy/NPI | 0 | 0 |
| `manual` | Manual Entry | 0 | 0 |
| `special` | Special Approval Requested | 0 | 0 |
| `denied` | Request Denied | 0 | 1 |

---

## 5. Status model (how the app uses `RequestStatus`)

Every request is in exactly one status; the reviewer changes it from the detail screen.

- **Exportable statuses** (`isExportable = 1`) = `newreq`, `modify`, `approved` → the export batch pulls these **when `exportedAt IS NULL`**.
- **Email statuses** (`firesEmail = 1`) = `approved`, `denied` → app sends a response email to `requesterEmail`. DB just stores the status; email is app-side.
  - **Currently disabled** while the Microsoft Graph credentials do not exist: the send is commented out in `PhysicianRequestService.SetStatusAsync` and the banners in `RequestDetail`, so `setStatus` always answers `emailSent: false`. The DB flag stays as-is.

---

## 6. Operations (stored procedures the app needs)

Swagger-style contracts. Names are suggestions. Procs accept/return lookup **codes** (§4), not surrogate ids.

### 6.1 `usp_PhysicianRequest_Create`
Creates a new request. Server sets `statusId = newreq`, `created = now`, `submitter`, `isDeleted = 0`.

```
IN  : patientName, mrn, patientStatusCode, requesterName, requesterEmail,
      first, last, npi, degreeCode, physicianTypeCode, vaTricare, pecosVerified,
      licenseNumber, licenseStateCode, licenseExp, specialty, taxonomy, physicianGroup,
      vitalAlertMethodCode, orderNotifMethodCode, branch, address, city, stateCode, zip,
      phone, fax, officeVitalMethodCode, officeOrderMethodCode, officePhysicianGroup,
      admissionCoordinator, additionalDetails, submitter
OUT : id  (SELECT SCOPE_IDENTITY(), or full row)
```

### 6.2 `usp_PhysicianRequest_Update`
Edits an existing request's data fields. Does **not** change `status`, `created`, `submitter`, `exportedAt`, or delete flags.

```
IN  : id  + all editable fields (rows 2–33, as codes where applicable)
OUT : rows affected  (0 if id not found or already deleted)
```

### 6.3 `usp_PhysicianRequest_SetStatus`
Changes disposition only.

```
IN  : id, statusCode   (must be a valid RequestStatus code)
OUT : rows affected
```
> Reject invalid `statusCode`.

### 6.4 `usp_PhysicianRequest_GetById`
Detail screen. Returns the full row with lookup **codes and labels** resolved. Returns nothing if `isDeleted = 1`.

```
IN  : id
OUT : full PhysicianRequest row (all fields; enum fields as code + label)
```

### 6.5 `usp_PhysicianRequest_List`
List screen with search + filters. All filter params optional / nullable. Excludes soft-deleted rows.

```
IN  : @search   NVARCHAR(200) = NULL   -- matches first+last, npi, patientName, mrn
      @status   NVARCHAR(20)  = NULL   -- RequestStatus code, or NULL = all
      @branch   NVARCHAR(20)  = NULL   -- branch code, or NULL = all
OUT : list rows (WHERE isDeleted = 0) — at minimum:
      id, first, last, degree(label), npi, branch, patientName, mrn,
      status(code+label), created, submitter, exportedAt
```
> Also return a total count (for the "N requests" header) and the exportable-and-unexported count — via extra result set or output params, your preference.

### 6.6 `usp_PhysicianRequest_GetExportBatch`
Pulls the clean, not-yet-exported records for the HCHB export file.

```
IN  : (none)   -- optionally @branch to scope a batch
OUT : full rows WHERE status.isExportable = 1 AND exportedAt IS NULL AND isDeleted = 0
```

### 6.7 `usp_PhysicianRequest_MarkExported`
Stamps a batch as exported so it won't be pulled again. Call after the export file is generated.

```
IN  : @ids   (TVP of INT, or comma-delimited list)  -- the rows that were exported
OUT : rows affected
      -- sets exportedAt = now WHERE id IN (@ids) AND exportedAt IS NULL
```

### 6.8 `usp_PhysicianRequest_Delete`  *(soft)*
Flags a request deleted; never removes the row.

```
IN  : id
OUT : rows affected
      -- sets isDeleted = 1, deletedAt = now WHERE id = @id AND isDeleted = 0
```

### 6.9 `usp_PhysicianRequest_ListBranches`  *(nice-to-have)*
Distinct branch codes to populate the branch filter dropdown (non-deleted rows).

```
IN  : (none)
OUT : distinct branch  (ORDER BY branch)
```

### 6.10 Lookup readers  *(dropdown population)*
One per lookup, or a single `usp_Lookup_Get @name`. Each returns active rows ordered by `sortOrder`.

```
IN  : (none) — or @name for a generic reader
OUT : code, label   (WHERE isActive = 1 ORDER BY sortOrder)
```
> Covers: `PatientStatus`, `Degree`, `PhysicianType`, `VitalAlertMethod`, `OrderNotifMethod`, `USState`, `RequestStatus`.
