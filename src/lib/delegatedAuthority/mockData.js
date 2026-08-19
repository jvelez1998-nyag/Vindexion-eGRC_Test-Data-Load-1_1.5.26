/**
 * Seed/test data for the RSK-074 delegated-authority auto-remediation hypothesis test.
 * This is local fixture data (matching the pattern already used by VulnerabilityRegister),
 * not a live base44 entity — swap for `base44.entities.DelegatedAuthority` /
 * `base44.entities.Vulnerability` once the qualification engine is validated.
 */

/** @type {import('./qualifyVulnerability').DelegatedAuthority[]} */
export const MOCK_DELEGATED_AUTHORITIES = [
  {
    id: 'DA-SEC-014',
    name: 'DA-SEC-014',
    is_active: true,
    max_severity: 3.9,
    max_asset_criticality: 25,
    allowed_environments: ['qa', 'internal_dev'],
    patch_must_be_approved: true,
    pre_test_must_pass: true,
    rollback_required: true,
  },
];

/** @type {import('./qualifyVulnerability').VulnerabilityContext[]} */
export const MOCK_VULNERABILITIES = [
  {
    id: 'VUL-28417',
    title: 'Outdated internal utility library',
    severity: 3.2,
    asset_criticality: 18,
    environment: 'qa',
    asset_name: 'Internal QA Reporting Server',
    patch_status: 'approved',
    pre_test_status: 'passed',
    active_exploitation: false,
    has_exception: false,
    delegated_authority_id: 'DA-SEC-014',
  },
  {
    id: 'VUL-28431',
    title: 'Authentication bypass',
    severity: 8.8,
    asset_criticality: 96,
    environment: 'production',
    asset_name: 'Customer Identity Service',
    patch_status: 'pending',
    pre_test_status: 'partial',
    active_exploitation: true,
    has_exception: false,
    delegated_authority_id: null,
  },
  {
    id: 'VUL-28442',
    title: 'Verbose error messages on staging endpoint',
    severity: 2.1,
    asset_criticality: 12,
    environment: 'internal_dev',
    asset_name: 'Internal Dev Sandbox',
    patch_status: 'approved',
    pre_test_status: 'passed',
    active_exploitation: false,
    has_exception: false,
    delegated_authority_id: 'DA-SEC-014',
  },
  {
    id: 'VUL-28455',
    title: 'Legacy TLS cipher suite enabled',
    severity: 3.6,
    asset_criticality: 22,
    environment: 'qa',
    asset_name: 'QA Load Balancer',
    patch_status: 'pending',
    pre_test_status: 'none',
    active_exploitation: false,
    has_exception: false,
    delegated_authority_id: 'DA-SEC-014',
  },
];
