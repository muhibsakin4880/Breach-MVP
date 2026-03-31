export type ReviewTone = 'green' | 'amber' | 'red' | 'blue'

export type OrganizationReviewStatus = 'Pending' | 'Reviewing' | 'Escalated'

export type DecisionStatus = 'Awaiting first pass' | 'Secondary review' | 'Ready for signoff' | 'Pilot approved'

export type LoiStatus = 'Packet in preparation' | 'Draft LOI shared' | 'LOI under review' | 'Pilot scope agreed' | 'Pilot approved'

export type ReviewDocumentStatus = 'ready' | 'review' | 'missing'

export type ApprovalStageStatus = 'complete' | 'active' | 'blocked' | 'pending'

export type ReviewActivityType = 'approved' | 'review' | 'submitted' | 'rejected'

export type OrganizationReviewDocument = {
    id: string
    label: string
    detail: string
    status: ReviewDocumentStatus
}

export type OrganizationApprovalStage = {
    id: string
    stage: string
    owner: string
    status: ApprovalStageStatus
    note: string
}

export type OrganizationRiskFactor = {
    factor: string
    score: string
    status: string
    tone: ReviewTone
}

export type OrganizationReviewActivity = {
    type: ReviewActivityType
    message: string
    time: string
}

export type OrganizationReviewRecord = {
    id: string
    submittedAt: string
    organizationName: string
    reviewScope: string
    industry: string
    contactRole: string
    workEmail: string
    useCase: string
    jurisdiction: string
    deploymentPreference: string
    residencyRequirement: string
    pilotScope: string
    loiStatus: LoiStatus
    nextAction: string
    owner: string
    reviewDeadline: string
    reviewDeadlineLabel: string
    decisionStatus: DecisionStatus
    reviewStatus: OrganizationReviewStatus
    riskScore: number
    overview: string
    documents: OrganizationReviewDocument[]
    approvalChain: OrganizationApprovalStage[]
    internalNotes: string[]
    summary: string[]
    riskFactors: OrganizationRiskFactor[]
}

export const organizationReviewRecords: OrganizationReviewRecord[] = [
    {
        id: 'APP-7821',
        submittedAt: '2026-03-23 09:42:15',
        organizationName: 'Apex Analytics Inc.',
        reviewScope: 'Requesting Organization',
        industry: 'Climate / Geospatial Analytics',
        contactRole: 'Head of Data Partnerships',
        workEmail: 'partnerships@apexanalytics.ai',
        useCase: 'Protected evaluation of climate-observation packages for resilience modeling and scenario testing.',
        jurisdiction: 'UAE / Qatar',
        deploymentPreference: 'Azure or Google Cloud shared-responsibility deployment',
        residencyRequirement: 'GCC review region with export decisions held until legal confirmation.',
        pilotScope: 'Two-dataset protected evaluation covering climate observations and satellite-derived land-use indicators.',
        loiStatus: 'Packet in preparation',
        nextAction: 'Confirm regional counsel on cross-border review language before draft pilot letter is released.',
        owner: 'Rania Suleiman',
        reviewDeadline: '2026-04-04',
        reviewDeadlineLabel: 'Apr 04, 2026',
        decisionStatus: 'Awaiting first pass',
        reviewStatus: 'Pending',
        riskScore: 23,
        overview: 'Regional analytics team preparing a controlled pilot request for climate-risk modeling.',
        documents: [
            { id: 'doc-7821-1', label: 'Entity registration extract', detail: 'Dubai registration record uploaded and matched to corporate domain.', status: 'ready' },
            { id: 'doc-7821-2', label: 'Use-case statement', detail: 'Scenario modeling scope captured with model-output restrictions.', status: 'ready' },
            { id: 'doc-7821-3', label: 'Residency addendum', detail: 'Awaiting legal acknowledgment for GCC-only review posture.', status: 'review' },
            { id: 'doc-7821-4', label: 'Security contact confirmation', detail: 'Primary security reviewer has not yet confirmed incident contact path.', status: 'missing' }
        ],
        approvalChain: [
            { id: 'appr-7821-1', stage: 'Identity and entity checks', owner: 'Nadia Khan', status: 'complete', note: 'Corporate registry, domain ownership, and regional contact verified.' },
            { id: 'appr-7821-2', stage: 'Privacy and residency review', owner: 'Salman Farooq', status: 'active', note: 'Reviewing GCC transfer language and regional fallback posture.' },
            { id: 'appr-7821-3', stage: 'Protected evaluation approval', owner: 'Rania Suleiman', status: 'pending', note: 'Held until residency addendum is confirmed.' },
            { id: 'appr-7821-4', stage: 'Pilot signoff', owner: 'Omar Siddiqui', status: 'pending', note: 'Final signoff depends on packet completion.' }
        ],
        internalNotes: [
            'Strong use-case clarity; only residency wording is holding the packet.',
            'Requesting team prefers a short protected evaluation before any broader access terms are discussed.'
        ],
        summary: [
            'Requesting organization is low-risk and already operating with a tightly scoped use case.',
            'Residency wording remains the main blocker before the pilot letter can move forward.',
            'Recommend privacy review completion before protected evaluation scheduling.'
        ],
        riskFactors: [
            { factor: 'Entity verification', score: '94/100', status: 'Passed', tone: 'green' },
            { factor: 'Residency posture', score: '63/100', status: 'In review', tone: 'amber' },
            { factor: 'Use-case precision', score: '91/100', status: 'Clear scope', tone: 'green' },
            { factor: 'Document readiness', score: '58/100', status: 'One missing item', tone: 'amber' }
        ]
    },
    {
        id: 'APP-3390',
        submittedAt: '2026-03-23 09:38:02',
        organizationName: 'Meridian Systems',
        reviewScope: 'Contributing Institution',
        industry: 'Quant / Market-Data Research',
        contactRole: 'Chief Data Officer',
        workEmail: 'admin@meridiansystems.ae',
        useCase: 'Contributing benchmark market-signal packages for controlled factor research and validation.',
        jurisdiction: 'UAE',
        deploymentPreference: 'AWS or OCI virtual private cloud review boundary',
        residencyRequirement: 'UAE primary review boundary with controlled outbound approval path.',
        pilotScope: 'One benchmark feed and one derived events package under protected evaluation controls.',
        loiStatus: 'Draft LOI shared',
        nextAction: 'Validate licensing schedule and finalize document authenticity review before signoff.',
        owner: 'Layla Haddad',
        reviewDeadline: '2026-04-03',
        reviewDeadlineLabel: 'Apr 03, 2026',
        decisionStatus: 'Secondary review',
        reviewStatus: 'Escalated',
        riskScore: 67,
        overview: 'Contributing institution with strong domain signals and a moderate documentation-review backlog.',
        documents: [
            { id: 'doc-3390-1', label: 'Trade license bundle', detail: 'Uploaded and domain-aligned; authenticity requires secondary validation.', status: 'review' },
            { id: 'doc-3390-2', label: 'Rights schedule', detail: 'Structured usage schedule recorded for internal review.', status: 'ready' },
            { id: 'doc-3390-3', label: 'Protected evaluation conditions', detail: 'Handling boundaries and logging expectations acknowledged.', status: 'ready' },
            { id: 'doc-3390-4', label: 'Residency rider', detail: 'Jurisdiction language complete and signed.', status: 'ready' }
        ],
        approvalChain: [
            { id: 'appr-3390-1', stage: 'Identity and entity checks', owner: 'Nadia Khan', status: 'complete', note: 'Corporate identity verified against UAE records.' },
            { id: 'appr-3390-2', stage: 'Rights and handling review', owner: 'Layla Haddad', status: 'active', note: 'Licensing schedule is clear; authenticity validation remains open.' },
            { id: 'appr-3390-3', stage: 'Protected evaluation approval', owner: 'Faris Noor', status: 'blocked', note: 'Awaiting manual confirmation on uploaded registry packet.' },
            { id: 'appr-3390-4', stage: 'Pilot signoff', owner: 'Omar Siddiqui', status: 'pending', note: 'Will advance after secondary review closes.' }
        ],
        internalNotes: [
            'Best-fit organization for quant workflow demos, but keep the conversation grounded in controlled evaluation rather than broad release.',
            'Legal packet looks credible; authenticity check should close quickly if the issuer portal confirms.'
        ],
        summary: [
            'Strong contributing institution with clear use rights and a realistic protected evaluation path.',
            'Secondary review is driven by documentation authenticity, not by unclear program intent.',
            'Recommend keeping the draft LOI active while the registry check completes.'
        ],
        riskFactors: [
            { factor: 'Entity verification', score: '95/100', status: 'Passed', tone: 'green' },
            { factor: 'Document authenticity', score: '60/100', status: 'Pending review', tone: 'amber' },
            { factor: 'Jurisdiction posture', score: '88/100', status: 'Aligned', tone: 'green' },
            { factor: 'Rights clarity', score: '72/100', status: 'Secondary review', tone: 'amber' }
        ]
    },
    {
        id: 'APP-1156',
        submittedAt: '2026-03-23 09:15:47',
        organizationName: 'Cascade Data Corp',
        reviewScope: 'Requesting Organization',
        industry: 'Healthcare AI / Research',
        contactRole: 'Clinical AI Program Lead',
        workEmail: 'governance@cascade-data.com',
        useCase: 'De-identified imaging evaluation for model validation under a constrained clinical review workflow.',
        jurisdiction: 'Saudi Arabia / UAE',
        deploymentPreference: 'Azure protected evaluation environment with private-network review controls',
        residencyRequirement: 'Saudi-hosted review preferred, with UAE fallback for documentation only.',
        pilotScope: 'Single imaging dataset evaluation with model-card review, audit export, and staged legal signoff.',
        loiStatus: 'LOI under review',
        nextAction: 'Close ethics-review checklist and confirm deployment region before the pilot scope is finalized.',
        owner: 'Maha Al Tamimi',
        reviewDeadline: '2026-04-06',
        reviewDeadlineLabel: 'Apr 06, 2026',
        decisionStatus: 'Secondary review',
        reviewStatus: 'Reviewing',
        riskScore: 45,
        overview: 'Healthcare research team with clear evaluation scope and active ethics documentation review.',
        documents: [
            { id: 'doc-1156-1', label: 'Institution profile', detail: 'Organization background and named reviewers verified.', status: 'ready' },
            { id: 'doc-1156-2', label: 'Ethics approval packet', detail: 'IRB summary uploaded; final committee stamp is still pending.', status: 'review' },
            { id: 'doc-1156-3', label: 'Model validation plan', detail: 'Clear validation boundary and expected outputs documented.', status: 'ready' },
            { id: 'doc-1156-4', label: 'Residency worksheet', detail: 'Review boundary and permitted regions acknowledged.', status: 'ready' }
        ],
        approvalChain: [
            { id: 'appr-1156-1', stage: 'Identity and entity checks', owner: 'Nadia Khan', status: 'complete', note: 'Research entity and primary contacts verified.' },
            { id: 'appr-1156-2', stage: 'Privacy and ethics review', owner: 'Maha Al Tamimi', status: 'active', note: 'Waiting for committee stamp on the ethics packet.' },
            { id: 'appr-1156-3', stage: 'Protected evaluation approval', owner: 'Faris Noor', status: 'pending', note: 'Can advance once ethics review closes.' },
            { id: 'appr-1156-4', stage: 'Pilot signoff', owner: 'Omar Siddiqui', status: 'pending', note: 'Final pilot letter depends on deployment-region confirmation.' }
        ],
        internalNotes: [
            'Strong narrative for high-trust evaluation; keep the review path visibly staged.',
            'Residency preference is manageable if the protected environment stays region-pinned.'
        ],
        summary: [
            'Healthcare review remains viable but needs a complete ethics packet before signoff.',
            'Protected evaluation design is aligned; the remaining decision is governance completeness.',
            'Recommend keeping the LOI in review rather than pushing to final signoff prematurely.'
        ],
        riskFactors: [
            { factor: 'Entity verification', score: '92/100', status: 'Passed', tone: 'green' },
            { factor: 'Ethics readiness', score: '59/100', status: 'Committee stamp pending', tone: 'amber' },
            { factor: 'Residency alignment', score: '84/100', status: 'Region-pinned', tone: 'green' },
            { factor: 'Clinical use-case sensitivity', score: '64/100', status: 'Requires staged review', tone: 'amber' }
        ]
    },
    {
        id: 'APP-8847',
        submittedAt: '2026-03-23 08:52:33',
        organizationName: 'Vortex Analytics',
        reviewScope: 'Contributing Institution',
        industry: 'Mobility / Smart City Analytics',
        contactRole: 'Program Director',
        workEmail: 'ops@vortexanalytics.io',
        useCase: 'Contributing mobility sensor streams for controlled urban-flow analysis and congestion simulation.',
        jurisdiction: 'UAE',
        deploymentPreference: 'Google Cloud shared-responsibility boundary with project-level audit export',
        residencyRequirement: 'UAE or nearby GCC review region, with raw stream exposure held back until approval.',
        pilotScope: 'One live telemetry sample and one historic aggregation package under protected evaluation.',
        loiStatus: 'Packet in preparation',
        nextAction: 'Collect named security contact and complete stream-retention declaration.',
        owner: 'Yousef Mir',
        reviewDeadline: '2026-04-08',
        reviewDeadlineLabel: 'Apr 08, 2026',
        decisionStatus: 'Awaiting first pass',
        reviewStatus: 'Pending',
        riskScore: 18,
        overview: 'Low-risk contributing institution with strong operational clarity and a light documentation gap.',
        documents: [
            { id: 'doc-8847-1', label: 'Corporate profile', detail: 'Entity and domain alignment already verified.', status: 'ready' },
            { id: 'doc-8847-2', label: 'Telemetry retention declaration', detail: 'Pending upload from program operations contact.', status: 'missing' },
            { id: 'doc-8847-3', label: 'Handling constraints summary', detail: 'Protected evaluation constraints documented.', status: 'ready' },
            { id: 'doc-8847-4', label: 'Regional reviewer list', detail: 'Named reviewers submitted for admin verification.', status: 'review' }
        ],
        approvalChain: [
            { id: 'appr-8847-1', stage: 'Identity and entity checks', owner: 'Nadia Khan', status: 'complete', note: 'Domain and organization records align.' },
            { id: 'appr-8847-2', stage: 'Operational packet review', owner: 'Yousef Mir', status: 'active', note: 'Retention declaration is the last missing item.' },
            { id: 'appr-8847-3', stage: 'Protected evaluation approval', owner: 'Faris Noor', status: 'pending', note: 'Can advance once packet is complete.' },
            { id: 'appr-8847-4', stage: 'Pilot signoff', owner: 'Omar Siddiqui', status: 'pending', note: 'Not yet ready for pilot letter drafting.' }
        ],
        internalNotes: [
            'Operationally simple review; likely a fast-moving contributing institution once the retention note lands.'
        ],
        summary: [
            'Mobility data program is well-scoped with only one missing declaration.',
            'Keep the review packet moving but do not open pilot drafting until the telemetry retention note is attached.'
        ],
        riskFactors: [
            { factor: 'Entity verification', score: '96/100', status: 'Passed', tone: 'green' },
            { factor: 'Operational clarity', score: '87/100', status: 'Strong', tone: 'green' },
            { factor: 'Document completeness', score: '61/100', status: 'One missing declaration', tone: 'amber' },
            { factor: 'Residency posture', score: '90/100', status: 'Aligned', tone: 'green' }
        ]
    },
    {
        id: 'APP-2293',
        submittedAt: '2026-03-23 08:31:19',
        organizationName: 'Horizon Tech LLC',
        reviewScope: 'Compliance / Legal Reviewer',
        industry: 'Residency-Sensitive Enterprise Review',
        contactRole: 'Regional Legal Counsel',
        workEmail: 'legal@horizontech.ae',
        useCase: 'Reviewing protected evaluation and regional deployment terms for a residency-sensitive pilot program.',
        jurisdiction: 'UAE / Saudi Arabia',
        deploymentPreference: 'OCI or Azure private-region pattern with controlled audit visibility',
        residencyRequirement: 'Strict local hosting for evaluation and evidence export; no shared cross-region release.',
        pilotScope: 'Policy and deployment review for a residency-bound evaluation program before pilot approval.',
        loiStatus: 'LOI under review',
        nextAction: 'Resolve local-hosting language and dual-signoff requirements for cross-organization evidence handling.',
        owner: 'Faris Noor',
        reviewDeadline: '2026-04-02',
        reviewDeadlineLabel: 'Apr 02, 2026',
        decisionStatus: 'Secondary review',
        reviewStatus: 'Escalated',
        riskScore: 82,
        overview: 'High-scrutiny legal review centered on deployment, residency, and evidence-handling boundaries.',
        documents: [
            { id: 'doc-2293-1', label: 'Regional legal mandate', detail: 'Authorized legal reviewer record verified.', status: 'ready' },
            { id: 'doc-2293-2', label: 'Residency addendum', detail: 'Language conflicts with current fallback region assumptions.', status: 'review' },
            { id: 'doc-2293-3', label: 'Evidence-handling matrix', detail: 'Still missing local evidence-export restrictions.', status: 'missing' },
            { id: 'doc-2293-4', label: 'Deployment decision memo', detail: 'Shared-responsibility platform options recorded.', status: 'ready' }
        ],
        approvalChain: [
            { id: 'appr-2293-1', stage: 'Identity and entity checks', owner: 'Nadia Khan', status: 'complete', note: 'Counsel authority and entity identity confirmed.' },
            { id: 'appr-2293-2', stage: 'Residency and legal review', owner: 'Faris Noor', status: 'active', note: 'Fallback-region language is still contested.' },
            { id: 'appr-2293-3', stage: 'Protected evaluation approval', owner: 'Salman Farooq', status: 'blocked', note: 'Needs evidence-handling matrix before signoff.' },
            { id: 'appr-2293-4', stage: 'Pilot signoff', owner: 'Omar Siddiqui', status: 'pending', note: 'Pilot letter cannot progress until residency wording is resolved.' }
        ],
        internalNotes: [
            'This is the strongest internal example for a residency-sensitive deployment review.',
            'Keep shared-responsibility language precise and avoid implying inherited certifications from Redoubt directly.'
        ],
        summary: [
            'Escalation is driven by residency and evidence-handling language, not by unclear stakeholders.',
            'Protected evaluation can proceed only if local-hosting and export boundaries are written cleanly.',
            'Recommend direct counsel-to-counsel review before any signoff attempt.'
        ],
        riskFactors: [
            { factor: 'Legal mandate verification', score: '93/100', status: 'Passed', tone: 'green' },
            { factor: 'Residency constraints', score: '42/100', status: 'High scrutiny', tone: 'red' },
            { factor: 'Evidence-handling clarity', score: '48/100', status: 'Missing matrix', tone: 'red' },
            { factor: 'Deployment-path confidence', score: '67/100', status: 'In review', tone: 'amber' }
        ]
    },
    {
        id: 'APP-5501',
        submittedAt: '2026-03-23 08:14:56',
        organizationName: 'Quantum Insights',
        reviewScope: 'Contributing Institution',
        industry: 'Industrial / IoT Sensor Analytics',
        contactRole: 'Industrial Data Program Manager',
        workEmail: 'programs@quantuminsights.io',
        useCase: 'Contributing industrial telemetry for anomaly detection under staged protected evaluation controls.',
        jurisdiction: 'UAE',
        deploymentPreference: 'OCI or Azure shared-responsibility workspace with network-isolated evaluation',
        residencyRequirement: 'Primary evaluation within UAE region; historical package review can extend to approved GCC region.',
        pilotScope: 'Industrial telemetry evaluation with log export, rate caps, and controlled analyst workspace.',
        loiStatus: 'Pilot scope agreed',
        nextAction: 'Complete final operational contact confirmation and move the packet to signoff.',
        owner: 'Yousef Mir',
        reviewDeadline: '2026-04-05',
        reviewDeadlineLabel: 'Apr 05, 2026',
        decisionStatus: 'Ready for signoff',
        reviewStatus: 'Reviewing',
        riskScore: 31,
        overview: 'Contributing institution with mature operational documentation and a near-ready pilot packet.',
        documents: [
            { id: 'doc-5501-1', label: 'Operational packet', detail: 'Asset inventory, handling scope, and reviewer roster attached.', status: 'ready' },
            { id: 'doc-5501-2', label: 'Protected evaluation policy note', detail: 'Isolation requirements acknowledged and signed.', status: 'ready' },
            { id: 'doc-5501-3', label: 'Retention and deletion schedule', detail: 'Completed and aligned to pilot scope.', status: 'ready' },
            { id: 'doc-5501-4', label: 'Emergency contact verification', detail: 'Waiting on secondary operations contact confirmation.', status: 'review' }
        ],
        approvalChain: [
            { id: 'appr-5501-1', stage: 'Identity and entity checks', owner: 'Nadia Khan', status: 'complete', note: 'Entity and named reviewers verified.' },
            { id: 'appr-5501-2', stage: 'Operational packet review', owner: 'Yousef Mir', status: 'complete', note: 'Packet is materially complete.' },
            { id: 'appr-5501-3', stage: 'Protected evaluation approval', owner: 'Faris Noor', status: 'active', note: 'Only secondary contact confirmation remains.' },
            { id: 'appr-5501-4', stage: 'Pilot signoff', owner: 'Omar Siddiqui', status: 'pending', note: 'Ready to schedule signoff once the contact check closes.' }
        ],
        internalNotes: [
            'One of the cleanest near-signoff records in the queue.',
            'Good example of an industrial telemetry review that stays focused on controls instead of raw access.'
        ],
        summary: [
            'Packet is almost signoff-ready and already has an agreed pilot scope.',
            'Only a minor operational verification remains before the pilot can move to final approval.'
        ],
        riskFactors: [
            { factor: 'Entity verification', score: '94/100', status: 'Passed', tone: 'green' },
            { factor: 'Operational packet quality', score: '90/100', status: 'Strong', tone: 'green' },
            { factor: 'Contact-chain completeness', score: '66/100', status: 'One item open', tone: 'amber' },
            { factor: 'Deployment posture', score: '86/100', status: 'Aligned', tone: 'green' }
        ]
    },
    {
        id: 'APP-6624',
        submittedAt: '2026-03-23 07:48:22',
        organizationName: 'Nexus Dynamics',
        reviewScope: 'Requesting Organization',
        industry: 'NLP / Text-Corpus Intelligence',
        contactRole: 'Research Platform Lead',
        workEmail: 'research@nexusdynamics.ai',
        useCase: 'Reviewing moderated text-corpus packages for language-model evaluation with strong retention controls.',
        jurisdiction: 'UK / UAE',
        deploymentPreference: 'AWS or Azure shared-responsibility review boundary with audit export enabled',
        residencyRequirement: 'UAE evidence visibility for regional reviewers; raw text samples remain in protected workspace.',
        pilotScope: 'Text-corpus evaluation with moderation-policy review and staged request approval.',
        loiStatus: 'Draft LOI shared',
        nextAction: 'Close moderation-policy clarification and assign final privacy reviewer.',
        owner: 'Maha Al Tamimi',
        reviewDeadline: '2026-04-07',
        reviewDeadlineLabel: 'Apr 07, 2026',
        decisionStatus: 'Awaiting first pass',
        reviewStatus: 'Pending',
        riskScore: 12,
        overview: 'Low-risk requesting organization with a clear text-evaluation workflow and early draft pilot letter.',
        documents: [
            { id: 'doc-6624-1', label: 'Organization packet', detail: 'Corporate profile and domain checks complete.', status: 'ready' },
            { id: 'doc-6624-2', label: 'Moderation-policy note', detail: 'Awaiting clarification on retention and redaction workflow.', status: 'review' },
            { id: 'doc-6624-3', label: 'Evaluation workflow summary', detail: 'Protected workspace and audit visibility acknowledged.', status: 'ready' },
            { id: 'doc-6624-4', label: 'Privacy reviewer assignment', detail: 'Final named reviewer has not yet been submitted.', status: 'missing' }
        ],
        approvalChain: [
            { id: 'appr-6624-1', stage: 'Identity and entity checks', owner: 'Nadia Khan', status: 'complete', note: 'Corporate identity confirmed.' },
            { id: 'appr-6624-2', stage: 'Policy and moderation review', owner: 'Maha Al Tamimi', status: 'active', note: 'Needs reviewer assignment and moderation clarification.' },
            { id: 'appr-6624-3', stage: 'Protected evaluation approval', owner: 'Faris Noor', status: 'pending', note: 'Will open after policy review closes.' },
            { id: 'appr-6624-4', stage: 'Pilot signoff', owner: 'Omar Siddiqui', status: 'pending', note: 'Draft LOI is already in circulation.' }
        ],
        internalNotes: [
            'Clear use-case story and low operating risk; main open item is named reviewer completeness.'
        ],
        summary: [
            'Strong request posture with a draft LOI already circulating.',
            'Keep the packet moving but require the final privacy reviewer before protected evaluation approval.'
        ],
        riskFactors: [
            { factor: 'Entity verification', score: '96/100', status: 'Passed', tone: 'green' },
            { factor: 'Use-case specificity', score: '93/100', status: 'Clear scope', tone: 'green' },
            { factor: 'Policy documentation', score: '69/100', status: 'In review', tone: 'amber' },
            { factor: 'Reviewer completeness', score: '54/100', status: 'Missing assignment', tone: 'amber' }
        ]
    },
    {
        id: 'APP-4471',
        submittedAt: '2026-03-23 07:22:08',
        organizationName: 'Pinnacle Systems',
        reviewScope: 'Contributing Institution',
        industry: 'Utilities / Smart-Grid Analytics',
        contactRole: 'Grid Data Operations Lead',
        workEmail: 'controls@pinnaclesystems.energy',
        useCase: 'Contributing grid telemetry for controlled resilience-analysis workflows with evidence export and staged approval.',
        jurisdiction: 'UAE / Saudi Arabia',
        deploymentPreference: 'AWS or OCI shared-responsibility workspace with evidence bundle export',
        residencyRequirement: 'Evaluation telemetry stays local; derived evidence can move only after approval-chain completion.',
        pilotScope: 'Smart-grid telemetry pilot covering one resiliency package and one outage-signal dataset.',
        loiStatus: 'Pilot scope agreed',
        nextAction: 'Close the final policy review and move the packet into pilot signoff.',
        owner: 'Layla Haddad',
        reviewDeadline: '2026-04-01',
        reviewDeadlineLabel: 'Apr 01, 2026',
        decisionStatus: 'Ready for signoff',
        reviewStatus: 'Reviewing',
        riskScore: 55,
        overview: 'Utilities telemetry program with strong packet maturity and a nearly complete approval path.',
        documents: [
            { id: 'doc-4471-1', label: 'Program dossier', detail: 'Operational and legal reviewers verified.', status: 'ready' },
            { id: 'doc-4471-2', label: 'Shared-responsibility controls note', detail: 'Platform, application, and organization control split acknowledged.', status: 'ready' },
            { id: 'doc-4471-3', label: 'Evidence handling plan', detail: 'Export rules documented and aligned to review sequence.', status: 'ready' },
            { id: 'doc-4471-4', label: 'Protected evaluation risk memo', detail: 'One final policy-review comment remains open.', status: 'review' }
        ],
        approvalChain: [
            { id: 'appr-4471-1', stage: 'Identity and entity checks', owner: 'Nadia Khan', status: 'complete', note: 'Entity record and reviewer roster verified.' },
            { id: 'appr-4471-2', stage: 'Controls and policy review', owner: 'Layla Haddad', status: 'active', note: 'One policy comment remains before closure.' },
            { id: 'appr-4471-3', stage: 'Protected evaluation approval', owner: 'Faris Noor', status: 'pending', note: 'Expected to clear after policy note is resolved.' },
            { id: 'appr-4471-4', stage: 'Pilot signoff', owner: 'Omar Siddiqui', status: 'pending', note: 'Scope has already been agreed with the organization.' }
        ],
        internalNotes: [
            'Good flagship review packet for utilities and resilience-analysis conversations.',
            'Deadline is the closest in the queue, so keep the signoff path visible on the dashboard.'
        ],
        summary: [
            'Utilities pilot is almost signoff-ready with a clearly defined scope.',
            'Resolve the last policy note and move directly into pilot approval.'
        ],
        riskFactors: [
            { factor: 'Entity verification', score: '92/100', status: 'Passed', tone: 'green' },
            { factor: 'Controls clarity', score: '88/100', status: 'Aligned', tone: 'green' },
            { factor: 'Policy comment backlog', score: '64/100', status: 'One open item', tone: 'amber' },
            { factor: 'Residency handling', score: '81/100', status: 'Aligned', tone: 'green' }
        ]
    }
]

export const organizationReviewActivity: OrganizationReviewActivity[] = [
    { type: 'approved', message: 'APP-4471 moved into ready-for-signoff after utilities controls review.', time: '4m ago' },
    { type: 'review', message: 'APP-2293 remains in secondary review pending residency language updates.', time: '9m ago' },
    { type: 'submitted', message: 'APP-7821 packet refreshed with updated regional legal context.', time: '14m ago' },
    { type: 'review', message: 'APP-3390 registry packet routed to manual authenticity validation.', time: '21m ago' },
    { type: 'rejected', message: 'APP-8847 held from pilot drafting until telemetry retention note is uploaded.', time: '28m ago' }
]

export const getOrganizationReviewRecord = (reviewId: string) =>
    organizationReviewRecords.find((record) => record.id === reviewId)

export const getDocumentChecklistCounts = (record: OrganizationReviewRecord) =>
    record.documents.reduce(
        (counts, document) => {
            counts[document.status] += 1
            return counts
        },
        { ready: 0, review: 0, missing: 0 }
    )
