# Explicit memory map Save backend

## GraphQL contract

`getMemoryMap(memoryMapName: String!, bomRevision: String!, version: Int!)` now includes
`concurrencyToken: String!`. Request that field and retain the loaded token as the editor baseline.

`saveMemoryMap(memoryMapName: String!, bomRevision: String!, version: Int!, expectedToken: String!, document: JSON!): MemoryMapDocument!`
updates the existing identity and returns the canonical saved document, including `concurrencyToken`.
It never increments `InternalRevision`, creates a memory map, or changes its commandset.

The submitted JSON requires these three fields:

- `commands`: command name -> `{ parameters: { parameterName: { lowLimit, value, highLimit } } }`.
  Limits and values are strings in **raw decimal storage format**, not formatted hex/binary/ASCII.
  Add/remove commands and parameters by adding/removing their entries; every parameter must
  already exist in this memory map's commandset database records.
- `testers`: lowercase tester -> lowercase station -> command -> canonical database operation
  string, e.g. `OP_WRITE`, `OP_VERIFY`, `OP_NOT_SET`. An absent entry removes the relationship;
  `OP_NOT_SET` is a real, persisted selection, not an absent relationship.
- `partNumbers`: existing part number -> command -> parameter -> override string. All existing
  part numbers must be included, even those with `{}` (no overrides). An absent parameter removes
  its override; `""` is a persisted empty override. Part-number membership/metadata is immutable.

The complete loaded document can also be submitted. Optional identity, working-copy status,
commandset, token and parameter name/datatype/direction/default metadata must match the server.
New-command default placeholders from the shared `getDefaultParameterLimits` helper are accepted
but replaced by database defaults in the canonical response. Other unknown fields are rejected;
the top-level Apollo `__typename: "MemoryMapDocument"` is harmless and accepted.

## Safety and errors

Authorization is fail-closed: `MemoryMapSaveAuthorizationPort` must contain a nonempty authenticated
user and `canWrite: true`. Only the authenticated server GraphQL route populates it from verified
JWT user claims (`readOnly === false`, positive employee number). Integration/Freshservice headers,
query spelling/aliases and GraphiQL defaults do not grant Save permission.

One `SERIALIZABLE` transaction locks the identity's revision range with SQL Server
`UPDLOCK, HOLDLOCK` before loading children. It checks latest revision membership, both release
tables, and the expected token before validation/writes. A `ReleasedMemoryMaps` entry only marks
the map released when `ReleasedToProductionID > 0`; negative or zero IDs do not. An actual
`ReleasedToProduction` entry for the map also protects it. Reads and post-write reassembly use the
same transaction repositories. Differential writes preserve existing IDs, descriptions and units;
shared definitions and part-number records are never written. Exceptions roll back all writes.

Tokens are SHA-256 hashes using Node crypto and json-stable-stringify over deterministically sorted
persisted rows/metadata, including hidden operation parameter anchors. No schema/column migration
is needed. No-op saves return the same token. As content tokens rather than monotonic counters,
they intentionally cannot detect an intervening edit that restores identical persisted state.

GraphQL `errors[].extensions.code` values:

- `FORBIDDEN`: no trusted authenticated write permission.
- `NOT_FOUND`: identity does not identify an existing map.
- `MEMORY_MAP_PROTECTED`: not the latest working copy, a positive `ReleasedToProductionID` in
  `ReleasedMemoryMaps`, or an actual `ReleasedToProduction` entry.
- `MEMORY_MAP_CONFLICT`: token mismatch; preserve local edits and require an explicit reload.
- `BAD_USER_INPUT`: structural/type/range/reference/immutable-metadata validation failure.
- `MEMORY_MAP_UNSUPPORTED`: unrepresentable input or ambiguous/orphaned legacy data.

Validation errors include `extensions.path` when a field location is available. Unsupported
datatype representations are rejected rather than coerced. Numeric validation checks full decimal
tokens, integer/float bounds, fixed array lengths, limit ordering, and value/override bounds.
Blank numeric strings mean unspecified. String values have no numeric range check; overrides are
limited to the database's 2000-character column.

Child reads select IDs with map-local SQL subqueries rather than binding arrays of child IDs.
Override reads include relationships touching either the map's data or its part numbers, so
cross-map relationships cannot escape conflict detection or save validation. Their binding count
is constant even when a map has thousands of parameters or part numbers.

Legacy SQL NULL limits/values and overrides project to empty strings. Raw persisted NULLs still
participate in tokens; an unchanged empty-string projection does not rewrite them during Save.
The checked-in DDL declares these columns NOT NULL, so legacy NULL handling is defensive.

## Representability boundaries

Commands without parameters, tester/station selections without operations, and empty nested
command override containers have no database representation and are rejected. `{ commands: {},
testers: {}, partNumbers: { existingPart: {} } }` is representable and removes all map data while
retaining existing part-number metadata. Clients removing the last operation in a station should
remove that empty station/tester container as well, or receive an explicit unsupported error.

The read shape projects parameter-level operation rows to command-level selections. Uniform sparse
legacy mappings keep their original parameter anchors and row IDs. Updating a selection updates
those anchors; newly inserted parameters join it. New selections apply to all persisted command
parameters. If the last old anchor is removed, the selection is re-anchored to the remaining command
parameters. Different operations on parameters of the same command/station, duplicate commandset
command/parameter names across directions, and cross-map/orphaned overrides are rejected on
save. Queries retain a legacy last-row-wins projection for ambiguous mappings and skip relationships
that cannot be resolved locally, rather than denying access to the entire map. Tokens still cover
all raw snapshot rows, including those omitted by the read projection. Referenced definitions from
foreign commandsets remain readable and their metadata is hashed, but Save rejects these references.
A separate migration/editor contract would be needed to edit these mappings safely.

## Deployment considerations

The existing `AUTH_LOCAL=true` login performs user/group lookup without verifying a
password. Use it only behind a trusted development boundary, not as a public write
endpoint. Save checks authenticated JWT claims, but this change does not redesign
login or token expiry/revocation. Normal deployments should retain enterprise
authentication.

The editor uses generated Apollo operations for this contract. No database DDL or
new dependency is required.
