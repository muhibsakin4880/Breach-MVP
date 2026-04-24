export type ProviderUploadStep3SchemaField = {
    field: string
    type: string
    sample: string
    nullRate: number
    piiStatus: 'safe' | 'flagged' | 'review'
    residency: 'global' | 'local'
    aiDescription: string
    cryptoState: string
    cardinality: string
    provenance: string
    anomalyFlags: string
    updateVelocity: string
}

export const PROVIDER_UPLOAD_STEP3_SCHEMA_FIELDS: ProviderUploadStep3SchemaField[] = [
    {
        field: 'device_id',
        type: 'String',
        sample: '["DE-7829-XK", "AE-4512-QR"]',
        nullRate: 0.0,
        piiStatus: 'safe',
        residency: 'global',
        aiDescription: 'Unique device identifier assigned to tracking hardware. No PII correlation detected.',
        cryptoState: 'Plaintext',
        cardinality: 'High (12k unique)',
        provenance: 'IoT Sensor Stream',
        anomalyFlags: '0.01% Outliers Detected',
        updateVelocity: 'Real-time stream'
    },
    {
        field: 'timestamp_utc',
        type: 'Timestamp',
        sample: '["2026-01-15T08:23:41Z"]',
        nullRate: 0.0,
        piiStatus: 'safe',
        residency: 'global',
        aiDescription: 'UTC timestamp of data capture event. System-generated, no personal data.',
        cryptoState: 'Plaintext',
        cardinality: 'High (890k unique)',
        provenance: 'IoT Sensor Stream',
        anomalyFlags: '0.00% Outliers Detected',
        updateVelocity: 'Real-time stream'
    },
    {
        field: 'flow_count',
        type: 'Integer',
        sample: '[1247, 3892, 562]',
        nullRate: 1.8,
        piiStatus: 'safe',
        residency: 'global',
        aiDescription: 'Aggregated flow measurement. No individual attribution possible.',
        cryptoState: 'Plaintext',
        cardinality: 'High (67k unique)',
        provenance: 'IoT Sensor Stream',
        anomalyFlags: '0.12% Outliers Detected',
        updateVelocity: 'Real-time stream'
    },
    {
        field: 'blood_type',
        type: 'String',
        sample: '["A+", "O-", "B+"]',
        nullRate: 0.0,
        piiStatus: 'flagged',
        residency: 'local',
        aiDescription: 'Medical classification data. HIGH RISK: PDPL Article 4 - Health data requires explicit consent and local processing.',
        cryptoState: 'Plaintext',
        cardinality: 'Low (8 unique)',
        provenance: 'Direct User Input',
        anomalyFlags: '0.00% Outliers Detected',
        updateVelocity: 'Batch updated'
    },
    {
        field: 'national_id',
        type: 'String',
        sample: '["784-1972-1234567-1"]',
        nullRate: 0.0,
        piiStatus: 'flagged',
        residency: 'local',
        aiDescription: 'UAE National ID number. CRITICAL: Direct identifier under PDPL Article 2. Local storage mandatory.',
        cryptoState: 'AES-256 Encrypted',
        cardinality: 'High (45k unique)',
        provenance: 'Direct User Input',
        anomalyFlags: '0.00% Outliers Detected',
        updateVelocity: 'Batch updated'
    },
    {
        field: 'location_lat',
        type: 'Float',
        sample: '["24.4539", "25.2697"]',
        nullRate: 2.1,
        piiStatus: 'review',
        residency: 'local',
        aiDescription: 'Geographic coordinates. GRAY ZONE: Can derive home location if combined with temporal patterns.',
        cryptoState: 'Plaintext',
        cardinality: 'High (890k unique)',
        provenance: 'IoT Sensor Stream',
        anomalyFlags: '0.08% Outliers Detected',
        updateVelocity: 'Real-time stream'
    },
    {
        field: 'location_lon',
        type: 'Float',
        sample: '["54.3773", "55.3092"]',
        nullRate: 2.1,
        piiStatus: 'review',
        residency: 'local',
        aiDescription: 'Geographic coordinates. GRAY ZONE: Can derive home location if combined with temporal patterns.',
        cryptoState: 'Plaintext',
        cardinality: 'High (890k unique)',
        provenance: 'IoT Sensor Stream',
        anomalyFlags: '0.08% Outliers Detected',
        updateVelocity: 'Real-time stream'
    },
    {
        field: 'salary_bracket',
        type: 'String',
        sample: '["150000-200000 AED"]',
        nullRate: 5.4,
        piiStatus: 'review',
        residency: 'local',
        aiDescription: 'Financial bracket. GRAY ZONE: Financial data under PDPL Article 3 - sensitive personal data.',
        cryptoState: 'Partially Masked',
        cardinality: 'Low (12 unique)',
        provenance: 'Direct User Input',
        anomalyFlags: '0.00% Outliers Detected',
        updateVelocity: 'Batch updated'
    },
    {
        field: 'email_hash',
        type: 'String',
        sample: '["a7b3c9f2..."]',
        nullRate: 0.0,
        piiStatus: 'safe',
        residency: 'global',
        aiDescription: 'SHA-256 hashed email. Pseudonymized identifier. Reversible with original lookup table.',
        cryptoState: 'SHA-256 Hashed',
        cardinality: 'High (42k unique)',
        provenance: '3rd Party Enriched',
        anomalyFlags: '0.00% Outliers Detected',
        updateVelocity: 'Batch updated'
    },
    {
        field: 'registration_date',
        type: 'Date',
        sample: '["2024-03-12", "2025-01-08"]',
        nullRate: 0.0,
        piiStatus: 'safe',
        residency: 'global',
        aiDescription: 'Account registration date. Insufficient alone for re-identification.',
        cryptoState: 'Plaintext',
        cardinality: 'High (365 unique)',
        provenance: 'Direct User Input',
        anomalyFlags: '0.00% Outliers Detected',
        updateVelocity: 'Event-driven'
    },
    {
        field: 'ip_address',
        type: 'String',
        sample: '["185.58.142.12"]',
        nullRate: 0.0,
        piiStatus: 'flagged',
        residency: 'local',
        aiDescription: 'Network identifier. PDPL guidance: IP considered personal data if linkable to individual.',
        cryptoState: 'Partially Masked',
        cardinality: 'High (8.2k unique)',
        provenance: '3rd Party Enriched',
        anomalyFlags: '0.15% Outliers Detected',
        updateVelocity: 'Real-time stream'
    },
    {
        field: 'passport_number',
        type: 'String',
        sample: '["A12345678"]',
        nullRate: 0.0,
        piiStatus: 'flagged',
        residency: 'local',
        aiDescription: 'Travel document identifier. CRITICAL: Government ID equivalent. Local processing required.',
        cryptoState: 'AES-256 Encrypted',
        cardinality: 'High (45k unique)',
        provenance: 'Direct User Input',
        anomalyFlags: '0.00% Outliers Detected',
        updateVelocity: 'Batch updated'
    },
    {
        field: 'phone_prefix',
        type: 'String',
        sample: '["+971-50", "+971-55"]',
        nullRate: 0.0,
        piiStatus: 'review',
        residency: 'local',
        aiDescription: 'Partial phone prefix. GRAY ZONE: Can narrow to region, not full number.',
        cryptoState: 'Plaintext',
        cardinality: 'Low (15 unique)',
        provenance: 'Direct User Input',
        anomalyFlags: '0.00% Outliers Detected',
        updateVelocity: 'Batch updated'
    },
    {
        field: 'department_code',
        type: 'String',
        sample: '["HR-FIN-001", "OPS-TECH-042"]',
        nullRate: 0.0,
        piiStatus: 'safe',
        residency: 'global',
        aiDescription: 'Internal department classification. Corporate metadata only.',
        cryptoState: 'Plaintext',
        cardinality: 'Low (24 unique)',
        provenance: 'Internal System',
        anomalyFlags: '0.00% Outliers Detected',
        updateVelocity: 'Event-driven'
    },
    {
        field: 'employee_id',
        type: 'String',
        sample: '["EMP-2024-8891"]',
        nullRate: 0.0,
        piiStatus: 'safe',
        residency: 'global',
        aiDescription: 'Internal employee identifier. Pseudonymized with HR system lookup.',
        cryptoState: 'SHA-256 Hashed',
        cardinality: 'High (8.9k unique)',
        provenance: 'Internal System',
        anomalyFlags: '0.00% Outliers Detected',
        updateVelocity: 'Event-driven'
    }
]
