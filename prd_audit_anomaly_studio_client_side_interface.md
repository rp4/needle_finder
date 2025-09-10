# PRD — Audit Anomaly Studio (Client‑side Interface)

**Doc owner:** <you>  
**Stakeholders:** Internal Audit, Data Privacy, Design, Front‑end Eng  
**Last updated:** 2025‑09‑09  
**Scope:** UI/UX for a **browser‑only** interface that ingests a JSON file (produced by a separate analysis process) and provides rich, explainable anomaly exploration for internal auditors.

---

## 1) Problem & Goals
**Problem:** Audit tools expose scores but bury explanations, mix data‑quality issues with genuine risk, and often require server uploads that raise privacy concerns.

**Primary Goal:** A privacy‑preserving, client‑side web app that loads an auditor‑provided JSON file and enables:
- Fast triage of anomalies across time, groups, and sequences.
- Auditor‑readable explanations (why flagged, compared to what, how confident).
- Cohort‑level discovery (groups that look odd vs. peers).
- Drift & data‑quality awareness to reduce false positives.
- One‑click creation of defensible evidence packs and risk‑weighted samples.

**Non‑Goals:**
- Running anomaly detection or SHAP computation in the browser. (Those are done upstream; the app visualizes precomputed results.)
- Multi‑user collaboration/server storage; no cloud sync.

---

## 2) Personas & JTBD
1. **Internal Auditor (primary):** Prioritize review, understand why, create evidence.  
2. **Audit Supervisor:** See posture at a glance, assign, sign off.  
3. **Privacy Officer:** Verify nothing leaves the browser; confirm PII masking.

**Jobs‑to‑be‑done:**  
- “When a dataset is analyzed, I need a clear **worklist** with **plain‑English reasons** and materiality so I can focus on what matters.”  
- “When I open a case, I want to see **why**, **compared to what**, and **how unusual** without running SQL.”  
- “Before I report, I want to export a **binder** with consistent, explainable visuals.”

---

## 3) Success Metrics (client‑side only)
- **Triage speed:** Time to first disposition for top 20 anomalies ≤ 15 min on a 100k‑record dataset.  
- **Explainability confidence:** ≥ 80% of pilot users rate explanations as “clear/very clear.”  
- **Noise reduction:** ≥ 30% reduction in false‑positive follow‑ups due to data‑quality separation.  
- **Privacy:** 0 network calls after load (verified via CSP & e2e tests).

---

## 4) User Stories (top‑level)
- As an auditor, I can **drag‑and‑drop a JSON** or `.json.gz` and see a dataset profile and validation status.  
- I can switch between **Explore → Investigate → Report** modes with filters that persist.  
- In Explore, I can spot **hot periods, odd cohorts, emerging clusters**.  
- In Investigate, I can view a **Case Canvas** with **Reason Cards**, **SHAP Mosaic**, **Sequence Domino**, **Peer Mirror**, and **Lineage Strip**.  
- In Groups, I can compare **divergence across cohorts** and open cohort‑specific SHAP summaries.  
- In Drift, I can see **covariate/label/concept drift** and pins that suggest re‑baselining.  
- In Report, I can generate a **Binder** PDF/ZIP and a **risk‑weighted sample** CSV—entirely offline.  
- I can toggle **PII masking** and use a **privacy shutter** (hold‑to‑reveal).  
- I can export/import a **UI state bundle** to reproduce findings later.

---

## 5) Functional Requirements

### 5.1 Data Ingestion & Validation
- **R1. Drag‑and‑drop** / file chooser for `*.json` and `*.json.gz` up to 150 MB.  
- **R2. Schema validation** against the contract (see §8). Show precise errors (path, type, example).  
- **R3. Data profile** panel: rows, columns, keys, time coverage, currency, anomaly counts by type/severity.  
- **R4. Local‑only load** using `FileReader` + streaming decompression for `.gz` (WASM or worker).  
- **R5. No network I/O** during/after load. Enforced via CSP: `connect-src 'none'`.

### 5.2 Global Filters & State
- **R6. Filters:** time range, severity, materiality, anomaly type, entity/group, peer cohort, and tags.  
- **R7. Sticky filters** persist across modes; visible “Filter Chip Bar.”  
- **R8. Quick filter from any chart (click/drag = filter).**  
- **R9. Save/restore **State Bundle** (JSON of filters, selections, annotations). No data unless user opts in.

### 5.3 Explore Mode
- **R10. Risk Radar (constellation map):** each cohort is a node; similarity = distance; glow = severity × materiality; pulse = emerging subgroup. Tooltips show divergence, drivers, count.  
- **R11. Swimlane Timeline:** lanes for key metrics with anomaly intensities per bucket; click cell to filter.  
- **R12. Influencer Pods:** ranked entities (account/vendor/region) by lift; drag onto timeline to filter.  
- **R13. Data Quality Sentry:** distinct alert rail (null spikes, duplicates, schema changes, clock skew); clicking shades impacted time buckets globally.

### 5.4 Investigate Mode
- **R14. Investigation Queue:** sortable by unified score, materiality, recency, novelty; keyboard nav; bulk assign/tags (local only).  
- **R15. Case Canvas (detail):**
  - **Reason Cards:** short sentences + receipts (baseline pct, peer, deltas, model votes).  
  - **SHAP Mosaic:** tile layout from local SHAP values; toggle to beeswarm or waterfall.  
  - **Sequence Domino:** event timeline with rule violations marked; frequency vs. peers on hover.  
  - **Peer Mirror:** side‑by‑side subject vs. peer distribution with typical‑zone band.  
  - **Lineage Strip:** source file/table, ingest time, schema version; PII fields masked by default.  
  - **Counterfactual Panel:** show **precomputed** counterfactual suggestions; if multiple, slider to preview predicted score deltas.

### 5.5 Group Analyzer
- **R16. Divergence Deck:** grid of cohort cards with divergence score, top drivers, and mini beeswarm for the cohort.  
- **R17. Emerging Cluster Tracker:** small multiples for cluster size/stability/outlierness; entries can be added to a Watchlist.

### 5.6 Drift Watch
- **R18. Seismograph:** stacked lines for input PSI, label shift, concept drift; automatic change‑point pins (precomputed in JSON).  
- **R19. Explanation Stability:** radar of reason‑code distribution over time; highlights sudden mix shifts.

### 5.7 Report Mode
- **R20. Binder Builder:** user selects cases/cohorts; export **PDF** or **ZIP** with JSON snippets, charts (rasterized), annotations, and an audit trail.  
- **R21. Risk‑Weighted Sampler:** offline generator using severity/materiality strata; export CSV with rationale per record.  
- **R22. Redaction policy:** option to keep PII masked in exports; watermark if revealed.

### 5.8 Privacy & Security
- **R23. All‑local guarantee:** no telemetry; no remote fonts; CSP: `default-src 'self'; connect-src 'none'; img-src 'self' blob: data:;` etc.  
- **R24. PII shutter:** hold‑to‑reveal interaction; release auto‑re‑mask; all reveals logged in local audit trail.  
- **R25. Local Audit Trail:** timestamped list of actions (view, reveal, annotate); exportable as TXT/CSV.

### 5.9 Performance & Reliability
- **R26. Target dataset:** up to ~200k anomaly subjects / 150 MB JSON.  
- **R27. Virtualized lists** and **Web Workers** for heavy transforms; suspendable rendering.  
- **R28. Graceful degradation** if GPU/WebGL unavailable; fallback to Canvas.

### 5.10 Accessibility & i18n
- **R29. WCAG 2.2 AA** (keyboard nav, contrast, focus outlines, ARIA labels).  
- **R30. Date/time locale aware; number/currency formatting; right‑to‑left support in layout engine.

---

## 6) UI Overview (screens at a glance)
1) **Upload & Validate:** drag‑drop zone → schema check → profile summary → “Open Explore.”  
2) **Explore:** left: Risk Radar; center: Swimlanes; right: Influencer Pods; bottom: Data Quality Sentry.  
3) **Investigate:** left: Queue; right: Case Canvas (Reason Cards top; Mosaic + Peer Mirror center; Domino + Lineage bottom).  
4) **Group Analyzer:** Divergence Deck grid; right drawer: cohort beeswarm + drivers.  
5) **Drift Watch:** Seismograph with pins; Explanation Stability card.  
6) **Report:** Binder Builder checklist; Sample generator; Export settings (redaction, watermark).

---

## 7) Tech Notes (client‑side only)
- **Stack:** React (with URL‑driven state), ECharts or Vega‑Lite (Canvas/WebGL), React‑Window for virtualization, Zustand/Redux for store.  
- **Workers:** parsing, gzip inflate, large aggregations; SHAP visualization only (no SHAP compute).  
- **File handling:** streaming parse (NDJSON supported optionally); in‑memory index of anomalies by id/time/group.  
- **PWA:** optional install; offline capable; no background sync.  
- **Export:** HTML → PDF via client renderer; PNG chart snapshots via canvas; ZIP packaging via JSZip.  
- **Testing:** dataset fixtures (small/medium/large), Lighthouse for PWA/A11y, CSP e2e tests (no network requests).

---

## 8) JSON Contract (expected fields)
Minimal required top‑level keys (extensible):
```json
{
  "run_id": "ISO-8601",
  "dataset_profile": {
    "rows": 0,
    "columns": 0,
    "primary_keys": ["…"],
    "entity_keys": ["…"],
    "time_key": "…",
    "currency": "USD"
  },
  "anomalies": [
    {
      "id": "…",
      "subject_type": "transaction|entity|group|sequence",
      "subject_id": "…",
      "timestamp": "ISO-8601",
      "anomaly_types": ["point","contextual","collective","group","timeseries"],
      "severity": 0.0,
      "materiality": 0.0,
      "unified_score": 0.0,
      "model_votes": [{"model":"isolation_forest","score":0.0}],
      "reason_codes": [{"code":"…","text":"…"}],
      "explanations": {
        "shap_local": [{"feature":"…","value":0,"shap":0.0}],
        "feature_deltas": [{"feature":"…","subject":0,"peer_p50":0,"z_robust":0}],
        "counterfactual_suggestions": [{"feature":"…","target":0,"predicted_unified_score":0.0}]
      },
      "links": {"raw_record_uri":"…","lineage": {"source":"…","ingested_at":"ISO-8601"}},
      "case": {"status":"open|closed|expected","assignee":"…","tags":["…"]}
    }
  ],
  "groups": [{
    "group_key": {"dimension":"value"},
    "population": 0,
    "divergence": {"metric":"energy_distance|mmd|psi","score":0.0,"peer":"…"},
    "top_drivers": [{"feature":"…","delta_pp":0.0}]
  }],
  "timeseries": [{
    "metric":"…","entity_scope":"…","bucket":"hour|day|week",
    "points":[{"t":"ISO‑date","y":0,"y_hat":0,"resid_z":0,"labels":["spike|shift|variance"]}]
  }],
  "clusters": {
    "algo":"hdbscan",
    "params": {"min_cluster_size":0,"min_samples":0},
    "tree":"…",
    "members":[{"id":"…","cluster_id":"c_…","prob":0.0,"glosh":0.0}]
  },
  "globals": {
    "shap_beeswarm_top": [{"feature":"…","mean_abs_shap":0.0}],
    "drift": {"psi_inputs": {"feature":0.0}}
  },
  "data_quality": [{"issue":"missing|duplicate|schema_change|clock_skew","detail":"…","t":"ISO-8601"}],
  "ui_hints": {
    "reason_cards": [{"code":"…","text":"…","baseline_pctl":0.0,"peer":"…"}],
    "confidence_ribbon": 0.0,
    "sequence_domino": ["authorize","capture","refund"],
    "pii_masked_fields": ["…"],
    "mosaic_shap": [{"feature":"…","value":0,"shap":0.0}],
    "peer_mirror": {"feature":"…","subject":0,"peer_p50":0,"peer_iqr":[0,0]},
    "counterfactual": [{"feature":"…","suggested":0,"predicted_unified_score":0.0}],
    "drift_pins": [{"metric":"psi_amount","t":"ISO-8601","value":0.0,"note":"…"}]
  }
}
```
**Validation rules:**
- Required: `run_id`, `dataset_profile`, `anomalies[]`, `globals`.  
- `anomalies[].timestamp` must parse to valid date; `severity` and `unified_score` ∈ [0,1].  
- If `subject_type = group`, `group_key` reference must exist in `groups[]`.

---

## 9) Edge Cases & Error States
- **Malformed JSON / schema mismatch:** show first 10 errors with JSON paths; allow re‑try.  
- **Oversized file / memory pressure:** prompt to enable **lite mode** (reduced charts, sample 50k anomalies).  
- **Missing SHAP arrays:** fall back to Reason Cards + feature deltas only; show a non‑blocking banner.  
- **No time key:** disable Swimlanes/Seismograph; keep Investigate & Groups.  
- **No groups:** hide Risk Radar & Divergence Deck.  
- **GPU unavailable:** Canvas fallback, warn if performance may degrade.

---

## 10) Privacy & Compliance
- Offline‑only; **no data leaves the browser**.  
- CSP locked; static assets bundled; fonts local.  
- PII masking on by default; hold‑to‑reveal with local audit trail.  
- Exports can be **redacted**; watermark when PII unmasked.  
- Accessibility (WCAG 2.2 AA) and keyboard paths documented.

---

## 11) Milestones & Acceptance Criteria
**M1 — Prototype (4–6 weeks):** Upload/validate; Explore (Swimlanes + Pods); Investigate (Queue + Reason Cards + Mosaic); Binder export.  
**Criteria:** load 25 MB demo JSON; no network calls; WCAG basic keyboard nav.

**M2 — Beta:** Risk Radar; Divergence Deck; Domino View; Seismograph; State Bundles; PII shutter.  
**Criteria:** handle 100 MB JSON; binder export ≤ 60s; all features keyboard‑accessible.

**M3 — GA:** Emerging Cluster Tracker; Explanation Stability; risk‑weighted sampler; `.json.gz` streaming; i18n.  
**Criteria:** 150 MB JSON; Lighthouse A11y ≥ 95; CSP test shows 0 external requests.

---

## 12) Open Assumptions
- Upstream analysis guarantees SHAP arrays and precomputed pins (no heavy math in UI).  
- Divergence metrics and cluster metadata are included in JSON; UI does not compute them.  
- Evidence export visuals are acceptable as raster images (no vector requirement).

---

## 13) Glossary
- **Reason Cards:** Plain‑English, standardized explanations with minimal stats (“receipts”).  
- **SHAP Mosaic:** Tiled visualization of local SHAP contributions.  
- **Sequence Domino:** Visual timeline of events with deviations highlighted.  
- **Divergence Deck:** Grid of cohort anomaly summaries.  
- **Seismograph:** Drift monitor across PSI/label/concept.

