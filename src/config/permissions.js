/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines roles and their specific permissions.
 */

const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    HR: 'hr'
};

const PERMISSIONS = {
    // Super Admin Features
    ACCESS_MANAGEMENT: {
        CREATE_ADMIN_ACCOUNTS: 'access_management.create_admin_accounts',
        ASSIGN_ROLES: 'access_management.assign_roles_and_permissions',
        SUSPEND_RESTORE_USERS: 'access_management.suspend_or_restore_users',
        MULTI_TENANT_CONTROL: 'access_management.multi_tenant_organization_control'
    },
    SYSTEM_CONFIGURATION: {
        MANAGE_JOB_CATEGORIES: 'system_configuration.manage_job_categories',
        MANAGE_SKILL_TAXONOMY: 'system_configuration.manage_skill_taxonomy',
        MANAGE_LOCATIONS: 'system_configuration.manage_locations_and_salary_bands',
        CONFIGURE_WORKFLOWS: 'system_configuration.configure_workflows_and_approval_rules',
        FEATURE_FLAGS: 'system_configuration.feature_flag_management'
    },
    COMPLIANCE_AUDIT: {
        VIEW_AUDIT_LOGS: 'compliance_and_audit.view_full_audit_logs',
        DATA_RETENTION: 'compliance_and_audit.data_retention_policy_management',
        EXPORT_DATA: 'compliance_and_audit.export_system_data',
        SECURITY_MONITORING: 'compliance_and_audit.security_and_login_activity_monitoring'
    },
    ANALYTICS_INSIGHTS: {
        PLATFORM_KPIS: 'analytics_and_insights.platform_kpis_dashboard',
        FUNNEL_METRICS: 'analytics_and_insights.job_and_application_funnel_metrics',
        ORG_PERFORMANCE: 'analytics_and_insights.organization_performance_comparison',
        EXPORT_REPORTS: 'analytics_and_insights.exportable_reports_csv_pdf'
    },
    BILLING_MONETIZATION: {
        SUBSCRIPTION_MANAGEMENT: 'billing_and_monetization.subscription_plan_management',
        JOB_CREDITS: 'billing_and_monetization.job_posting_credits',
        INVOICE_TRACKING: 'billing_and_monetization.invoice_and_payment_tracking',
        USAGE_METRICS: 'billing_and_monetization.usage_based_billing_metrics'
    },

    // Admin Features
    ORGANIZATION_MANAGEMENT: {
        APPROVE_REJECT_COMPANIES: 'organization_management.approve_or_reject_company_registrations',
        VERIFY_HR: 'organization_management.verify_hr_profiles',
        MANAGE_PAGES: 'organization_management.manage_company_pages',
        HANDLE_DISPUTES: 'organization_management.handle_company_disputes'
    },
    JOB_MODERATION: {
        APPROVE_REJECT_JOBS: 'job_moderation.approve_pause_or_reject_job_posts',
        DETECT_SPAM: 'job_moderation.detect_duplicate_or_spam_jobs',
        EDIT_METADATA: 'job_moderation.edit_job_metadata_for_quality',
        ENFORCE_GUIDELINES: 'job_moderation.enforce_posting_guidelines'
    },
    CANDIDATE_GOVERNANCE: {
        VIEW_PROFILES: 'candidate_governance.view_anonymized_candidate_profiles',
        HANDLE_ABUSE: 'candidate_governance.handle_abuse_or_fake_profile_reports',
        SUSPEND_CANDIDATES: 'candidate_governance.suspend_candidate_accounts'
    },
    OPERATIONAL_ANALYTICS: {
        VOLUME_TRENDS: 'operational_analytics.job_posting_volume_trends',
        GROWTH_METRICS: 'operational_analytics.application_growth_metrics',
        RESPONSE_TIME: 'operational_analytics.hr_response_time_tracking',
        SLA_COMPLIANCE: 'operational_analytics.sla_compliance_dashboard'
    },

    // HR Features
    JOB_MANAGEMENT: {
        CREATE_EDIT_JOBS: 'job_management.create_edit_duplicate_jobs',
        VISIBILITY_CONTROLS: 'job_management.job_visibility_controls',
        AUTO_EXPIRY: 'job_management.auto_expiry_and_renewal',
        BULK_UPLOAD: 'job_management.bulk_job_upload'
    },
    ATS: {
        PIPELINE_MANAGEMENT: 'applicant_tracking_system.candidate_pipeline_management',
        RESUME_VIEW: 'applicant_tracking_system.resume_upload_and_view',
        RESUME_PARSING: 'applicant_tracking_system.resume_parsing',
        TAGGING_NOTES: 'applicant_tracking_system.candidate_tagging_and_notes',
        BULK_ACTIONS: 'applicant_tracking_system.bulk_shortlist_and_reject'
    },
    COMMUNICATION: {
        MESSAGING: 'communication.in_app_candidate_messaging',
        NOTIFICATIONS: 'communication.email_and_whatsapp_notifications',
        SCHEDULING: 'communication.interview_scheduling',
        CALENDAR_INTEGRATION: 'communication.calendar_integration'
    },
    COLLABORATION: {
        INTERNAL_NOTES: 'collaboration.internal_recruiter_notes',
        FEEDBACK_FORMS: 'collaboration.interviewer_feedback_forms',
        MULTI_RECRUITER: 'collaboration.multi_recruiter_job_access',
        ACTIVITY_TIMELINE: 'collaboration.candidate_activity_timeline'
    },
    HR_ANALYTICS: {
        CONVERSION_RATES: 'hr_analytics.job_wise_conversion_rates',
        TIME_TO_HIRE: 'hr_analytics.time_to_hire_metrics',
        SOURCE_TRACKING: 'hr_analytics.candidate_source_tracking',
        PRODUCTIVITY: 'hr_analytics.recruiter_productivity_dashboard'
    }
};

const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: [
        ...Object.values(PERMISSIONS.ACCESS_MANAGEMENT),
        ...Object.values(PERMISSIONS.SYSTEM_CONFIGURATION),
        ...Object.values(PERMISSIONS.COMPLIANCE_AUDIT),
        ...Object.values(PERMISSIONS.ANALYTICS_INSIGHTS),
        ...Object.values(PERMISSIONS.BILLING_MONETIZATION)
    ],
    [ROLES.ADMIN]: [
        ...Object.values(PERMISSIONS.ORGANIZATION_MANAGEMENT),
        ...Object.values(PERMISSIONS.JOB_MODERATION),
        ...Object.values(PERMISSIONS.CANDIDATE_GOVERNANCE),
        ...Object.values(PERMISSIONS.OPERATIONAL_ANALYTICS)
    ],
    [ROLES.HR]: [
        ...Object.values(PERMISSIONS.JOB_MANAGEMENT),
        ...Object.values(PERMISSIONS.ATS),
        ...Object.values(PERMISSIONS.COMMUNICATION),
        ...Object.values(PERMISSIONS.COLLABORATION),
        ...Object.values(PERMISSIONS.HR_ANALYTICS)
    ]
};

module.exports = {
    ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS
};
