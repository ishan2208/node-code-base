declare const enum S3Operation {
  CASE_ATTACHMENT = 'CASE_ATTACHMENT',
  HTML_FORM_IMAGE = 'HTML_FORM_IMAGE',
  STAFF_SIGNATURE = 'STAFF_SIGNATURE',
  AGENCY_CONFIG = 'AGENCY_CONFIG',
  SYSTEM_ICON = 'SYSTEM_ICON',
  KML_MAP_LAYER = 'KML_MAP_LAYER',
  AGENCY_BOUNDRY_MAP_LAYER = 'AGENCY_BOUNDRY_MAP_LAYER',
  AGENCY_PARCEL_MAP_LAYER = 'AGENCY_PARCEL_MAP_LAYER',
}

declare const enum TEMP_VARIABLE {
  SEQUENCE_NUMBER = 100000,
}

declare const enum DefaultCaseRole {
  OWNER = 'Owner',
}

declare const enum IPageEntityType {
  SYSTEM_DEFINED = 'SYSTEM_DEFINED',
  SYSTEM_DEFINED_CONFIGURABLE = 'SYSTEM_DEFINED_CONFIGURABLE',
  CUSTOM = 'CUSTOM',
  FORCED_ABATEMENT = 'FORCED_ABATEMENT',
}

declare const enum State {
  AL = 'AL',
  AK = 'AK',
  AZ = 'AZ',
  AR = 'AR',
  CA = 'CA',
  CO = 'CO',
  CT = 'CT',
  DE = 'DE',
  FL = 'FL',
  GA = 'GA',
  HI = 'HI',
  ID = 'ID',
  IL = 'IL',
  IN = 'IN',
  IA = 'IA',
  KS = 'KS',
  KY = 'KY',
  LA = 'LA',
  ME = 'ME',
  MD = 'MD',
  MA = 'MA',
  MI = 'MI',
  MN = 'MN',
  MS = 'MS',
  MO = 'MO',
  MT = 'MT',
  NE = 'NE',
  NV = 'NV',
  NH = 'NH',
  NJ = 'NJ',
  NM = 'NM',
  NY = 'NY',
  NC = 'NC',
  ND = 'ND',
  OH = 'OH',
  OK = 'OK',
  OR = 'OR',
  PA = 'PA',
  RI = 'RI',
  SC = 'SC',
  SD = 'SD',
  TN = 'TN',
  TX = 'TX',
  UT = 'UT',
  VT = 'VT',
  VA = 'VA',
  WA = 'WA',
  WV = 'WV',
  WI = 'WI',
  WY = 'WY',
}

declare const enum AgencyTimezone {
  HST = 'HST',
  AKST = 'AKST',
  PST = 'PST',
  MST = 'MST',
  CST = 'CST',
  EST = 'EST',
}

declare const enum AgencyTimezoneAmplification {
  HST = 'Pacific/Honolulu',
  AKST = 'America/Anchorage',
  PST = 'America/Los_Angeles',
  MST = 'America/Denver',
  CST = 'America/Chicago',
  EST = 'America/New_York',
}

declare const enum ObjectStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

declare const enum AgencySortColumn {
  ID = 'id',
  CREATED_AT = 'createdAt',
  NAME = 'name',
  CASES = 'cases',
  ENTITIES = 'entities',
  STATUS = 'status',
}

declare const enum MergeFields {
  // Agency Info
  AGENCY_NAME = '{{agency_name}}',
  AGENCY_ADDRESS = '{{agency_address}}',
  AGENCY_CITY = '{{agency_city}}',
  AGENCY_STATE = '{{agency_state}}',
  AGENCY_ZIPCODE = '{{agency_zipcode}}',
  AGENCY_TIMEZONE = '{{agency_timezone}}',
  AGENCY_EMAIL_ID = '{{agency_email_id}}',
  AGENCY_WEB_URL = '{{agency_web_url}}',
  AGENCY_WHITELISTED_URL = '{{agency_whitelisted_url}}',
  AGENCY_CENTER_LATITUDE = '{{center_latitude}}',
  AGENCY_CENTER_LONGITUDE = '{{center_longitude}}',
  AGENCY_MAP_ZOOM_LEVEL = '{{map_zoom_level}}',
  // Case Info
  CASE_NUMBER = '{{case_number}}',
  CASE_ISSUE_DESCRIPTION = '{{case_issue_description}}',
  CASE_CREATE_DATE_NUMERIC = '{{case_create_date_numeric}}',
  CASE_CREATE_DATE_SPELLED = '{{case_create_date_spelled}}',
  CASE_CLOSE_DATE_NUMERIC = '{{case_close_date_numeric}}',
  CASE_CLOSE_DATE_SPELLED = '{{case_close_date_spelled}}',
  DATE_TODAY_NUMERIC = '{{todays_date_numeric}}',
  DATE_TODAY_SPELLED = '{{todays_date_spelled}}',
  CURRENT_TIME = '{{current_time}}',
  CASE_ASSIGNEE_LAST_FIRST = '{{case_assignee_last_first}}',
  CASE_ASSIGNEE_FIRST_LAST = '{{case_assignee_first_last}}',
  LOGGED_IN_USER_LAST_FIRST = '{{logged_in_user_last_first}}',
  LOGGED_IN_USER_FIRST_LAST = '{{logged_in_user_first_last}}',
  LOGGED_IN_USER_SIGNATURE_BLOCK = '{{logged_in_user_signature_block}}',
  LOGGED_IN_USER_SIGNATURE_IMAGE = '{{logged_in_user_signature_image}}',
  // Case Activity
  NEXT_INSPECTION_DATE_NUMERIC = '{{next_inspection_date_numeric}}',
  NEXT_INSPECTION_DATE_SPELLED = '{{next_inspection_date_spelled}}',
  NEXT_INSPECTION_ASSIGNEE = '{{next_inspection_assignee}}',
  // Fees
  FEES_PAID = '{{fees_paid}}',
  CURRENT_BALANCE = '{{current_balance}}',
  TOTAL_FEES = '{{total_fees}}',
  MOST_RECENT_PAYMENT = '{{most_recent_payment}}',
  PAYMENT_TYPE = '{{payment_type}}',
  PAYMENT_DATE = '{{payment_date}}',
  RECEIPT = '{{receipt}}',
  // Location
  CASE_LOCATION_ADDRESS = '{{case_location_address}}',
  CASE_LOCATION_APN = '{{case_apn}}',
  CASE_FLAGGED_ADDRESS = '{{case_flagged_address}}',
  FLAGGED_ADDRESS_REASON = '{{flagged_address_reason}}',
  //Contact Recipient
  RECIPIENT_CASE_ROLE = '{{recipient_case_role}}',
  RECIPIENT_CONTACT_TYPE = '{{recipient_contact_type}}',
  RECIPIENT_CONTACT_NAME = '{{recipient_contact_name}}',
  RECIPIENT_CONTACT_EMAIL = '{{recipient_contact_email}}',
  RECIPIENT_CONTACT_WORK_PHONE = '{{recipient_contact_work_phone}}',
  RECIPIENT_CONTACT_CELL_PHONE = '{{recipient_contact_cell_phone}}',
  RECIPIENT_CONTACT_MAILING_ADDRESS = '{{recipient_contact_mailing_address}}',
  RECIPIENT_VENDOR = '{{recipient_vendor}}',
}

declare const enum MergeFieldNames {
  // Agency Info
  AGENCY_NAME = 'Name of Agency (County)',
  AGENCY_ADDRESS = 'Agency Address',
  AGENCY_CITY = 'City',
  AGENCY_STATE = 'State',
  AGENCY_ZIPCODE = 'Zip Code',
  AGENCY_TIMEZONE = 'Agency timezone',
  AGENCY_EMAIL_ID = 'Email Address',
  AGENCY_WEB_URL = 'Website Address (URL)',
  AGENCY_WHITELISTED_URL = 'Whitelisted URL',
  AGENCY_CENTER_LATITUDE = 'Center latitude',
  AGENCY_CENTER_LONGITUDE = 'Center longitude',
  AGENCY_MAP_ZOOM_LEVEL = 'Map zoom level',
  // Case Info
  CASE_NUMBER = 'Case Number',
  CASE_ISSUE_DESCRIPTION = 'Case issue description',
  CASE_CREATE_DATE_NUMERIC = 'Case create date (numeric)',
  CASE_CREATE_DATE_SPELLED = 'Case create date (spelled out)',
  CASE_CLOSE_DATE_NUMERIC = 'Case close date (numeric)',
  CASE_CLOSE_DATE_SPELLED = 'Case close date (spelled out)',
  // tslint:disable-next-line:quotemark
  DATE_TODAY_NUMERIC = "Today's Date (numeric)",
  // tslint:disable-next-line:quotemark
  DATE_TODAY_SPELLED = "Today's Date (spelled)",
  CURRENT_TIME = 'Current Time',
  CASE_ASSIGNEE_LAST_FIRST = 'Case Assignee (Last, First)',
  CASE_ASSIGNEE_FIRST_LAST = 'Case Assignee (First, Last)',
  LOGGED_IN_USER_LAST_FIRST = 'Logged In User (Last, First)',
  LOGGED_IN_USER_FIRST_LAST = 'Logged In User (First, Last)',
  LOGGED_IN_USER_SIGNATURE_BLOCK = 'Logged in user Signature Block',
  LOGGED_IN_USER_SIGNATURE_IMAGE = 'Logged in user Signature Image',
  // Case Activity
  NEXT_INSPECTION_DATE_NUMERIC = 'Next inspection date (numeric)',
  NEXT_INSPECTION_DATE_SPELLED = 'Next inspection date (spelled out)',
  NEXT_INSPECTION_ASSIGNEE = 'Next Inspection Assignee',
  // Fees
  FEES_PAID = 'Fees paid',
  CURRENT_BALANCE = 'Current balance',
  TOTAL_FEES = 'Total fees',
  MOST_RECENT_PAYMENT = 'Most recent payment amount',
  PAYMENT_TYPE = 'Payment type (most recent payment)',
  PAYMENT_DATE = 'Payment date (most recent payment)',
  RECEIPT = 'Receipt # (most recent payment)',
  // Location
  CASE_LOCATION_ADDRESS = 'Case Location Address',
  CASE_LOCATION_APN = 'Case Location Apn',
  CASE_FLAGGED_ADDRESS = 'Case Flagged address',
  FLAGGED_ADDRESS_REASON = 'Reason for flagging address',
  //Contact Recipient
  RECIPIENT_CASE_ROLE = 'Recipient Case Role',
  RECIPIENT_CONTACT_TYPE = 'Recipient Type',
  RECIPIENT_CONTACT_NAME = 'Recipient Name',
  RECIPIENT_CONTACT_EMAIL = 'Recipient Email',
  RECIPIENT_CONTACT_WORK_PHONE = 'Recipient Work Phone',
  RECIPIENT_CONTACT_CELL_PHONE = 'Recipient Cell Phone',
  RECIPIENT_CONTACT_MAILING_ADDRESS = 'Recipient Address',
  RECIPIENT_VENDOR = 'Recipient Vendor',
}

declare const enum MergeTables {
  // Case location merge tables
  CASE_LOCATION_STACKED = '{{case_location_stacked}}',
  CASE_LOCATION_COMMA_SEPARATED = '{{case_location_comma_separated}}',
  // Fee merge table
  //FEE = '{{fee_table}}',
  // Contacts merge tables
  NAME_BILL_TO_CONTACT = '{{name_bill_to_contact}}',
  NAME_AND_ADDRESS_BILL_TO_CONTACT = '{{name_and_address_bill_to_contact}}',
  ALL_CONTACTS = '{{all_contacts}}',
  ALL_LEGAL_ENTITIES = '{{all_legal_entities}}',
  // Municipal code merge tables
  MUNICODE_DESCRIPTION = '{{municode_description}}',
  MUNICODE_RESOLUION = '{{municode_resolution}}',
  MUNICODE_RESOLUION_NONCOMPLYBY = '{{municode_resolution_nocomplyby}}',
  // Violation merge tables
  OPEN_VIOLATIONS_LIST = '{{open_violations_list}}',
  OPEN_VIOLATIONS_COMMA_SEPARATED = '{{open_violations_comma_separated}}',
  // Photos merge table
  PHOTOS = '{{photos}}',
}

declare const enum MergeTableNames {
  // Case location merge tables
  CASE_LOCATION_STACKED = 'Case Location (stacked)',
  CASE_LOCATION_COMMA_SEPARATED = 'Case Location (one line)',
  // Fee merge table
  // FEE = 'Fee Table',
  // Contacts merge tables
  NAME_BILL_TO_CONTACT = 'Name (Bill To Contact)',
  NAME_AND_ADDRESS_BILL_TO_CONTACT = 'Name, Address (Bill To Contact)',
  ALL_CONTACTS = 'All Contacts ',
  ALL_LEGAL_ENTITIES = 'All Legal entities',
  // Municipal code merge tables
  MUNICODE_DESCRIPTION = 'Municipal Code & Description',
  MUNICODE_RESOLUION = 'Municipal code and resolutions',
  MUNICODE_RESOLUION_NONCOMPLYBY = 'Municipal code and resolutions with no comply-by dates',
  // Violation merge tables
  OPEN_VIOLATIONS_LIST = 'Open Violations (list)',
  OPEN_VIOLATIONS_COMMA_SEPARATED = 'Open Violations (comma separated)',
  // Photos merge table
  PHOTOS = 'Photos & Attachments - All photos',
}

declare const enum MergeFieldCategory {
  AGENCY_INFORMATION = 'Agency Information',
  CASE_INFORMATION = 'Case Information',
  CASE_ACTIVITY = 'Case Activity',
  //FEES = 'Fees',
  LOCATION = 'Location',
  CONTACT_RECIPIENT = 'Contact Recipient',
  CONTACT = 'Contact',
}

declare const enum MergeTableCategory {
  FEE = 'Fee',
  CASE_LOCATION = 'Case Location',
  MUNICIPAL_CODE = 'Municipal Code',
  VIOLATION = 'Violation',
  CONTACTS = 'Contacts',
  PHOTOS_AND_ATTACHMENTS = 'Photos & Attachments',
  CASE_CUSTOM_TILE = 'Case Custom Tile',
}

declare const enum MunicipalCodeSortColumn {
  ID = 'id',
  ARTICLE_NUMBER = 'articleNumber',
  RESOLUTION_ACTION = 'resolutionAction',
  DESCRIPTION = 'description',
}

declare const enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

declare const enum NumberFormat {
  PR_YY_NN = 'PR-YY-NN',
  PR_NYY_NN = 'PR-NYY-NN',
  NPR_YY_NN = 'NPR-YY-NN',
  NPR_NYY_NN = 'NPR-NYY-NN',
}

declare const enum Day {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNEDAY = 'WEDNEDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

declare const enum ReportAccess {
  NO_ACCESS = 'NO_ACCESS',
  SELF_REPORTS = 'SELF_REPORTS',
  ALL_STAFF = 'ALL_STAFF',
}

declare const enum DashboardAccess {
  SELF_DASHBOARD = 'SELF_DASHBOARD',
  ALL_STAFF_DASHBOARD = 'ALL_STAFF_DASHBOARD',
}

declare const enum FeesAccess {
  CANT_VOID = 'CANT_VOID',
  CAN_VOID = 'CAN_VOID',
}

declare const enum ViolationTypeACL {
  READ_ONLY = 'READ_ONLY',
  BASIC = 'BASIC',
  OVERWRITE = 'OVERWRITE',
}

declare const enum AdminScopes {
  COMCATE_ADMIN = 'comcateAdmin',
  PRODUCT_ADMIN = 'productAdmin',
  SITE_ADMIN = 'siteAdmin',
  SUPER_ADMIN = 'superAdmin',
  PRODUCT_ACCESS = 'productAccess',
}

declare const enum ContactType {
  INDIVIDUAL = 'INDIVIDUAL',
  LEGAL_ENTITY = 'LEGAL_ENTITY',
}

declare const enum EmailType {
  WELCOME_EMAIL = 'WELCOME_EMAIL',
  FORGOT_PASSWORD_EMAIL = 'FORGOT_PASSWORD_EMAIL',
  RESET_PASSWORD_EMAIL = 'RESET_PASSWORD_EMAIL',
}

declare const enum XerceViolationOrigin {
  CREATE_CASE = 'CREATE_CASE',
  MANAGE_CASE = 'MANAGE_CASE',
  VERIFICATION_INSPECTION = 'VERIFICATION_INSPECTION',
}

// Case Listing enums
declare const enum CaseStatusFilter {
  All = 'ALL',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

declare const enum CaseListSortParams {
  CASE_NUMBER = 'caseNumber',
  LOCATION = 'location',
  CASE_ASSIGNEE = 'caseAssignee',
  HOURS_LOGGED = 'hoursLogged',
  CASE_STATUS = 'status',
  CASE_CREATED_AT = 'createdAt',
  CASE_CLOSED_AT = 'closedAt',
  CONTACTS = 'contacts',
  CASE_UPDATED_AT = 'updatedAt',
  INSPECTION_ASSIGNEE = 'inspectionAssignee',
  NEXT_SCHEDULED_INSPECTION = 'nextScheduledInspection',
  LAST_COMPLETED_INSPECTION = 'lastCompletedInspection',
}

declare const enum AbatementStage {
  VERIFICATION_PENDING = 'Verification Pending',
  INVALID = 'Invalid',
  NO_NOTICE = 'No Notice',
  REOPENED = 'Reopened',
}

declare const enum ReportsFilterType {
  DAY = 'DAY',
  MONTH = 'MONTH',
}

declare const enum ReportType {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  WORKLOAD = 'WORKLOAD',
  VIOLATIONS = 'VIOLATIONS',
  TOTAL_CASES = 'TOTAL_CASES',
}

declare const enum CaseListingViewColumns {
  ID = 'id',
  AGENCY_ID = 'agencyId',
  CASE_NUMBER = 'caseNumber',
  STATUS = 'status',
  ABATEMENT_STAGE = 'abatementStage',
  IS_MIGRATED_CASE = 'isMigratedCase',
  MIGRATED_CASE_URL = 'migratedCaseURL',
  CONFIG_VIOLATION_IDS = 'configViolationIds',
  CASE_CONTACT_IDS = 'caseContactIds',
  VIOLATIONS = 'violations',
  CONFIG_VIOLATION_TYPE_IDS = 'configViolationTypeIds',
  CONFIG_VIOLATION_TYPE_LABELS = 'configViolationTypeLabels',
  VIOLATION_TYPES = 'violationTypes',
  CASE_ASSIGNEE_ID = 'caseAssigneeId',
  CASE_ASSIGNEE = 'caseAssignee',
  INSPECTION_ASSIGNEE_ID = 'inspectionAssigneeId',
  INSPECTION_ASSIGNEE = 'inspectionAssignee',
  LOCATION = 'location',
  NEXT_SCHEDULED_INSPECTION = 'nextScheduledInspection',
  LAST_COMPLETED_INSPECTION = 'lastCompletedInspection',
  CONTACTS = 'contacts',
  CONFIG_FORCED_ABATEMENT_IDS = 'configForcedAbatementIds',
  FORCED_ABATEMENT_ACTIVITIES = 'forcedAbatementActivities',
  HOURS_LOGGED = 'hoursLogged',
  CREATED_AT = 'createdAt',
  CLOSED_AT = 'closedAt',
  UPDATED_AT = 'updatedAt',
}

declare const enum CaseHistoryActions {
  ATTACHMENTS_ADDED = 'ATTACHMENTS_ADDED',
  ATTACHMENTS_DELETED = 'ATTACHMENTS_DELETED',
  ATTACHMENTS_EDITED = 'ATTACHMENTS_EDITED',
  ATTACHMENT_NAME_EDITED = 'ATTACHMENT_NAME_EDITED',
  ATTACHMENT_DESCRIPTION_EDITED = 'ATTACHMENT_DESCRIPTION_EDITED',
  CASE_CREATED = 'CASE_CREATED',
  CASE_CLOSED = 'CASE_CLOSED',
  CASE_HOURS_LOGGED = 'CASE_HOURS_LOGGED',
  CASE_HOURS_DELETED = 'CASE_HOURS_DELETED',
  CASE_REOPENED = 'CASE_REOPENED',
  CASE_ASSIGNEE_CHANGED = 'CASE_ASSIGNEE_CHANGED',
  CASE_NOTE_ADDED = 'CASE_NOTE_ADDED',
  CASE_NOTE_MODIFIED = 'CASE_NOTE_MODIFIED',
  CASE_CUSTOM_TILE_EDITED = 'CASE_CUSTOM_TILE_EDITED',
  CASE_CREATE_DATE_MODIFIED = 'CASE_CREATE_DATE_MODIFIED',
  CASE_CLOSED_DATE_MODIFIED = 'CASE_CLOSED_DATE_MODIFIED',
  CASE_REOPENED_DATE_MODIFIED = 'CASE_REOPENED_DATE_MODIFIED',
  CASE_NOTICE_ISSUED_DATE_MODIFIED = 'CASE_NOTICE_ISSUED_DATE_MODIFIED',
  CERTIFIED_MAIL_ADDED = 'CERTIFIED_MAIL_ADDED',
  CERTIFIED_MAIL_MODIFIED = 'CERTIFIED_MAIL_MODIFIED',
  CONTACT_ADDED = 'CONTACT_ADDED',
  CONTACT_REMOVED = 'CONTACT_REMOVED',
  CONTACT_CASE_ROLE_MODIFIED = 'CONTACT_CASE_ROLE_MODIFIED',
  CONTACT_BILL_TO_CONTACT_MODIFIED = 'CONTACT_BILL_TO_CONTACT_MODIFIED',
  FORCED_ABATEMENT_INITIATED = 'FORCED_ABATEMENT_INITIATED',
  FORCED_ABATEMENT_NOTE_EDITED = 'FORCED_ABATEMENT_NOTE_EDITED',
  FORCED_ABATEMENT_ACTIVITY_ADDED = 'FORCED_ABATEMENT_ACTIVITY_ADDED',
  FORCED_ABATEMENT_ACTIVITY_EDITED = 'FORCED_ABATEMENT_ACTIVITY_EDITED',
  FORCED_ABATEMENT_ACTIVITY_DELETED = 'FORCED_ABATEMENT_ACTIVITY_DELETED',
  INSPECTION_PERFORMED = 'INSPECTION_PERFORMED',
  INSPECTION_NOTE_ADDED = 'INSPECTION_NOTE_ADDED',
  INSPECTION_NOTE_MODIFIED = 'INSPECTION_NOTE_MODIFIED',
  INSPECTION_ASSIGNEE_MODIFIED = 'INSPECTION_ASSIGNEE_ADDED',
  INSPECTION_DATE_MODIFIED = 'INSPECTION_DATE_MODIFIED',
  LOCATION_CDBG_APPROVED_TOGGLED = 'LOCATION_CDBG_APPROVED_TOGGLED',
  LOCATION_CUSTOM_FIELDS_EDITED = 'LOCATION_CUSTOM_FIELDS_EDITED',
  LOCATION_ADDRESS_EDITED = 'LOCATION_ADDRESS_EDITED',
  LOCATION_CITY_EDITED = 'LOCATION_CITY_EDITED',
  LOCATION_APN_EDITED = 'LOCATION_APN_EDITED',
  LOCATION_ASSESSOR_ADDRESS_EDITED = 'LOCATION_ASSESSOR_ADDRESS_EDITED',
  LOCATION_ZIP_EDITED = 'LOCATION_ZIP_EDITED',
  LOCATION_PIN_ADDED = 'LOCATION_PIN_ADDED',
  LOCATION_PIN_EDITED = 'LOCATION_PIN_EDITED',
  NOTICE_ISSUED = 'NOTICE_ISSUED',
  VIOLATION_ADDED = 'VIOLATION_ADDED',
  VIOLATION_CLOSED = 'VIOLATION_CLOSED',
}

// Authentication and Authorization interfaces
declare interface IAuthScope {
  comcateAdmin?: boolean;
  siteAdmin?: boolean;
  superAdmin?: boolean;
  xerce?: IXerceScope;
}

declare interface IXerceScope {
  id: number;
  productAdmin: boolean;
  reportAccess: ReportAccess;
  dashboardAccess: DashboardAccess;
  feesAccess: FeesAccess;
  violationTypeScope: IViolationTypeScope;
}

declare interface IViolationTypeScope {
  [id: number]: {
    violationTypeAccess: ViolationTypeACL;
    isActive: boolean;
  };
}

declare interface ILoginRequest {
  email: string;
  password: string;
}

declare interface ILoginResponse {
  token: string;
}

declare interface ISuperAdminClaim {
  id: number;
  agencyId: number;
  agencyName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  agencyTimezone: string;
  scopes: {
    superAdmin: boolean;
    xerce?: IXerceScope;
  };
}

declare interface IAgencyUserClaim {
  id: number;
  agencyId: number;
  agencyName: string;
  firstName: string;
  lastName: string;
  email: string;
  agencyTimezone: string;
  scopes: {
    siteAdmin: boolean;
    xerce?: IXerceScope;
  };
}

declare interface IDefaultComplyByDays {
  defaultComplyByDays: number;
}

declare interface IPagination {
  count: number;
  data: any;
}

// Case Attachments
declare interface IXerceCaseAttachmentRequest {
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  fileURL: string;
}

declare interface IXerceCaseNewAttachmentRequest {
  attachments: IXerceCaseAttachmentRequest[];
}

declare interface IXerceCaseAttachmentEditRequest {
  attachments: IXerceEditCaseAttachmentsRequest[];
}

declare interface IXerceCaseAttachmentDeleteRequest {
  attachmentIds: number[];
}

declare interface IXerceEditCaseAttachmentsRequest {
  attachmentId: number;
  title: string;
  description: string;
}

declare interface IXerceCaseAttachment {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  fileURL: string;
  mimeType: string;
  createdBy: ICaseUser;
  updatedBy: ICaseUser;
  createdAt: Date;
  updatedAt: Date;
}

// Case User Interfaces
declare interface ICaseUser {
  id: number;
  firstName: string;
  lastName: string;
}

declare interface ICaseSummary {
  caseNumber: string;
  status: string;
  abatementStage: string;
  caseAge: number;
  createdBy: ICaseUser;
  hoursLogged: number;
  caseAssignee: ICaseUser;
  closedBy: ICaseUser;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date;
}

declare interface ICaseAssigneeEditRequest {
  assigneeId: number;
}

declare interface ICaseList extends IPagination {
  count: number;
  data: ICaseListSummary[];
}

declare interface IContactListResponse extends IPagination {
  count: number;
  data: IContactList[];
  selectedContacts: IContactList[];
}

declare interface IContactList {
  id: number;
  name: string;
  contactType: ContactType;
}

//The keys are passed directly to UI, hence camel-casing is not used
declare interface ICaseListCSV {
  'Case Number': string;
  'Violation Type'?: string;
  Violations: string;
  Location: string;
  Assignee: string;
  Status: string;
  Created: string;
  Closed: string;
  'Inspection Assignee': string;
  'Next Scheduled Inspection': string;
  'Last Completed Inspection': string;
}

declare interface ICaseListCSVData {
  csvString: string;
}

declare interface ICaseListSummary {
  id: number;
  caseNumber: string;
  location: string;
  status: string;
  abatementStage: string;
  caseAssignee: string;
  inspectionAssignee?: string;
  nextScheduledInspection?: Date;
  lastCompletedInspection?: Date;
  isMigratedCase: boolean;
  migratedCaseURL: string;
  violationTypes: string[];
  violations: string[];
  contacts: string;
  forcedAbatementActivities: string;
  configViolationTypeLabels?: string[];
  hoursLogged: number;
  total?: number;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date;
}

declare interface ICaseListQueryParams {
  caseAssigneeId?: number;
  searchQuery?: string;
  violationTypeIds?: number[];
  violationIds?: number[];
  contactIds?: number[];
  forcedAbatementActivityIds?: number[];
  caseStatus?: CaseStatusFilter;
  openAbatementStages?: string[];
  closedAbatementStages?: string[];
  createdCaseStartDate?: Date;
  createdCaseEndDate?: Date;
  closedCaseStartDate?: Date;
  closedCaseEndDate?: Date;
  inspectionAssigneeIds?: number[];
  nextScheduledInspectionStartDate?: Date;
  nextScheduledInspectionEndDate?: Date;
  lastCompletedInspectionStartDate?: Date;
  lastCompletedInspectionEndDate?: Date;
  minHours?: number;
  maxHours?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  limit?: number;
  offset?: number;
}

// Case Reports
declare interface ICaseReportQueryParams {
  caseAssigneeId: number;
  violationTypeId: number;
  startDate: Date;
  endDate: Date;
  filterType: ReportsFilterType;
  reportType: ReportType;
  isLastMonthSelected: boolean;
}

declare interface IOpenCaseReportResult {
  agencyId: number;
  day: Date;
  caseCount: number;
  previousCaseCount: number;
}

declare interface IReportResult {
  agencyId: number;
  day: Date;
  workload: number;
}

declare interface IViolationReportResult {
  agencyId: number;
  file_url: string;
  count: number;
  label: string;
}

declare interface ICaseReport {
  percentDifference: number;
  data: IGraphResult[] | ITotalCasesReport[];
  count: number;
}

declare interface ITotalCasesReport {
  yAxis: {
    open: number;
    closed: number;
  };
  xAxis: string;
}

declare interface IGraphResult {
  xAxis: string;
  yAxis: number;
  url?: string;
}

// Case Location
declare interface ICaseLocationRequest {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  isCDBGEligible: boolean;
  isCDBGApproved: boolean;
  manualFields: object;
  parcelFields: object;
  parcelId?: number;
  flagAddress?: ILocationFlagAddressRequest;
  apn: string;
  assessorAddress: string;
  isMapPinDropped: boolean;
}

declare interface ICaseLocation {
  id: number;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  parcelId: number;
  manualFields: object;
  parcelFields: object;
  flagHistory: ILocationFlagHistory[];
  isCDBGApproved: boolean;
  parcel: IParcel;
  apn: string;
  assessorAddress: string;
  isMapPinDropped: boolean;
  associatedCases: IXerceCaseCount;
}

// Flag Address Interfaces
declare interface ILocationFlagAddressRequest {
  isFlagged: boolean;
  reasonForFlagging: string;
}

declare interface ILocationFlagHistory {
  id: number;
  isFlagged: boolean;
  reasonForFlagging: string;
  updatedBy: ICaseUser;
  updatedAt: Date;
}

declare interface ICaseCustomEditTile {
  customCaseFieldValues: object[];
}

// Conntact interfaces
declare interface IContactRequest {
  name: string;
  contactType: ContactType;
  isVendor: boolean;
  isGisPopulated: boolean;
  email?: string;
  cellPhone?: string;
  workPhone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  note?: string;
  contactCustomFieldValues?: object;
  associatedContacts?: IAssociateContactRequest[];
}

declare interface IAssociateContactRequest {
  id: number;
  isPrimary: boolean;
}

declare interface IAssociatedContacts {
  id: number;
  name: string;
  contactType: ContactType;
  isVendor: boolean;
  isGisPopulated: boolean;
  email: string;
  cellPhone: string;
  workPhone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  isPrimary: boolean;
}

declare interface IContact {
  id: number;
  name: string;
  contactType: ContactType;
  isVendor: boolean;
  isGisPopulated: boolean;
  email: string;
  cellPhone: string;
  workPhone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  note: string;
  contactCustomFieldValues: object;
  associatedContacts: IAssociatedContacts[];
}

//File Metadata Interface
declare interface IFileMetaDataRequest {
  title: string;
  fileName: string;
  fileSize: string;
  fileURL: string;
  mimeType?: string;
}

declare interface IFileMetaData {
  id: number;
  name: string;
  fileName: string;
  fileSize: string;
  fileURL: string;
  mimeType: string;
  createdBy: ICaseUser;
  updatedBy: ICaseUser;
}

declare interface IResolutionServiceMap {
  [serviceName: string]: string;
}

declare interface IConfigMergeCodes {
  fields: IMergeCodeList[];
  tables: IMergeCodeList[];
}

declare interface IMergeCodeList {
  category: MergeFieldCategory | MergeTableCategory;
  codes: IMergeCodes[];
}

declare interface IMergeCodes {
  name: string;
  code: string;
}

// Dashboard Interface
declare interface IDashboardResponse {
  cases: ICaseStatusSummary | IAllDashBoardSummary;
  inspections: ICaseInspectionSummary;
}

declare interface ICaseStatusSummary {
  open: ICaseCountSummary;
}

declare interface ICaseCountSummary {
  all: number;
  mine: number;
}

declare interface IAllDashBoardSummary {
  open: IAllDashBoardStats;
  all: IAllDashBoardStats;
}

declare interface IAllDashBoardStats {
  count: number;
  assigneeStats: IAssigneeStats[];
}

declare interface IAssigneeStats {
  name: string;
  percent: number;
  cases: number;
}

declare interface IAssigneeGroupResult {
  caseAssigneeId: number;
  first_name: string;
  last_name: string;
  all: string;
  open: string;
}

declare interface IInspectionGroupResult {
  inspectionAssigneeId: number;
  first_name: string;
  last_name: string;
  overdue: string;
  dueToday: string;
  total: string;
}

declare interface ICaseInspectionSummary {
  dueToday: IAllDashBoardStats;
  overdue: IAllDashBoardStats;
  total: IAllDashBoardStats;
}

declare interface IOpenCaseCountsResult {
  agencyId?: number;
  all?: string;
  mine?: string;
}

declare interface IAllDashboardCountsResult {
  agencyId?: number;
  all?: string;
  open?: string;
}

declare interface IInspectionCountsResult {
  agencyId?: number;
  total?: string;
  overdue?: string;
  dueToday?: string;
}

// Inspection Interface
declare interface IInspectionRequest {
  plannedDate: Date;
  assigneeId: number;
}

declare interface ICaseInspection {
  id: number;
  name: string;
  dueDate: Date;
  actualDate?: Date;
  assignee: ICaseUser;
  note: INote;
  notice: IXerceCaseNotice;
  isNoNoticeChosen: boolean;
  createdAt: Date;
  createdBy: ICaseUser;
  closedBy: ICaseUser;
  closedAt: Date;
  updatedAt: Date;
  updatedBy: ICaseUser;
}

//Abatement Activities
declare interface IExistingCaseViolationRequest {
  caseViolationId: number;
  status: XerceViolationStatus;
  configDispositionId?: number;
  entity?: object;
  complyByDate: Date;
}

declare interface INewCaseViolationRequest {
  configViolationId: number;
  status: XerceViolationStatus;
  configDispositionId?: number;
  entity?: object;
  complyByDate?: Date;
}

declare interface IPerformInspectionRequest {
  existingViolations?: IExistingCaseViolationRequest[];
  attachments?: IXerceCaseAttachmentRequest[];
  newViolations?: INewCaseViolationRequest[];
  noteContent: string;
  notice?: IXerceCaseNoticeRequest;
  scheduledInspection?: IInspectionRequest;
  caseAssigneeId?: number;
}

declare interface IXerceCaseNoticeRequest {
  configNoticeId: number;
  issuedAt: Date;
  certifiedMailNumber: string;
  noticeContent: string[];
}

declare interface IEditCertifiedMailNumberRequest {
  certifiedMailNumber: string;
}

declare interface IEditCertifiedMailNumberResponse {
  noticeId: number;
  inspectionId: number;
  certifiedMailNumber: string;
}

declare interface IXerceCaseNotice {
  id: number;
  noticeContent: object;
  issuedAt: Date;
  mergedFields: object;
  note: INote;
  configNotice: ICaseConfigNotice;
  certifiedMailNumber: string;
  noticeNumber: string;
  createdBy: ICaseUser;
  updatedBy: ICaseUser;
  createdAt: Date;
  updatedAt: Date;
}

declare interface ICaseConfigNotice {
  id: number;
  label: string;
  proposeForcedAbatement: boolean;
}

declare interface INoteRequest {
  noteContent: string;
}

declare interface INote {
  id: number;
  noteContent: string;
  createdBy: ICaseUser;
  updatedBy: ICaseUser;
  createdAt: Date;
  updatedAt: Date;
}

declare interface IXerceCaseCount {
  openCases: number;
  closedCases: number;
}

// Xerce Case Forced Abatement Interface
// TODO: create type for activities in respective story

declare interface IXerceCaseForcedAbatementActivitiesResponse {
  caseActivityId: number;
  configForcedAbatementActivityId: number;
  values: object;
}

declare interface IXerceCaseForcedAbatement {
  initiatedAt: Date;
  initiatedBy: ICaseUser;
  note: INote;
  activities: IXerceCaseForcedAbatementActivitiesResponse[];
}

declare interface IRecommendFAMetadata {
  isEligible: boolean;
  notice: string;
}

// Xerce Interface
declare interface IXerceRequest {
  name: string;
  isActive: boolean;
  caseNumberPrefix?: string;
  isCaseNumberYearIncluded: boolean;
  caseNumberInitialization: number;
  isCaseNumberResettable: boolean;
  feeReceiptNumberPrefix?: string;
  isFeeReceiptNumberYearIncluded: boolean;
  feeReceiptNumberInitialization: number;
  isFeeReceiptNumberResettable: boolean;
  violationTypes: IConfigXerceViolationTypeRequest[];
}

declare interface IXerce {
  id: number;
  name: string;
  isActive: boolean;
  caseNumberPrefix: string;
  isCaseNumberYearIncluded: boolean;
  caseNumberInitialization: number;
  isCaseNumberResettable: boolean;
  feeReceiptNumberPrefix: string;
  isFeeReceiptNumberYearIncluded: boolean;
  feeReceiptNumberInitialization: number;
  isFeeReceiptNumberResettable: boolean;
  allowCDBG: boolean;
  allowFeeTracking: boolean;
  allowTimeTracking: boolean;
  violationTypes: IXerceViolationType[];
}

// Xerce Violation Type Interface
declare interface IConfigXerceViolationTypeRequest {
  systemXerceViolationTypeId: number;
  isActive: boolean;
}

declare interface IConfigXerceViolationType {
  id: number;
  label: string;
  isActive: boolean;
  isCustom: boolean;
}

declare interface IXerceViolationType {
  id: number;
  systemXerceViolationTypeId: number;
  label: string;
  isActive: boolean;
}

declare interface IConfigViolationType {
  id: number;
  label: string;
  iconURL: string;
}

declare interface IConfigViolations {
  id: number;
  label: string;
}

declare interface ICreateCaseViolationRequest {
  configXerceViolationId: number;
  entities?: object[];
}

declare interface IEditCaseViolationEntityRequest {
  entity: object;
}

declare interface IResetPasswordRequest {
  old: string;
  new: string;
}

declare interface ISetPasswordRequest {
  password: string;
}

declare interface IForgotPasswordRequest {
  email: string;
}

// Abatement Stages
declare interface IXerceCaseAbatementStages {
  open: string[];
  closed: string[];
}

declare interface IUserProfileEditRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  department: string;
}

declare interface IUserProfile extends IUserProfileEditRequest {
  id: number;
  signature: string;
  signatureFileURL: string;
}

// Parcel response interface
declare interface IParcel {
  id: number;
  apn: string;
  siteAddress: string;
  siteCity: string;
  siteState: string;
  siteZip: string;
  ownerName: string;
  ownerAddress: string;
  ownerCity: string;
  ownerState: string;
  ownerZip: string;
  isOwnerBusiness: boolean;
  customFields: object;
  cdbgCensusTract: string;
  cdbgBlockGroup: string;
  cdbgLowModPercent: number;
  isCDBGEligible: boolean;
  mapboxAddress: string;
  mapboxCity: string;
  mapboxState: string;
  mapboxZip: number;
  mapboxFullAddress: string;
  flagHistory: ILocationFlagHistory[];
}

declare interface IMapLayer {
  url: string;
  name: string;
  checked: boolean;
  label: string;
}

declare interface IMapConfig {
  center: number[];
  bounds: number[];
  zoomLevel: number;
  layers?: {
    baseLayers?: IMapLayer[];
    parcel?: IMapLayer;
    cdbg?: IMapLayer;
    kmls?: IMapLayer[];
    agencyBoundaryKml?: IMapLayer;
  };
  city: string;
  state: string;
}

// Search interface
declare interface ILocation {
  name: string;
  lat: number;
  long: number;
}

declare interface ILocationSearchResult {
  section?: string;
  items: ILocation[];
}

// Case creation
declare interface ICaseRequest {
  assigneeId: number;
  inspectionAssigneeId: number;
  initiationType?: XerceCaseInitiationType;
  followUp?: Date;
  customCaseFieldValues: object[];
  issueDescription?: string;
  inspectionDate: Date;
  location: ICaseLocationRequest;
  violations?: ICreateCaseViolationRequest[];
  attachments?: IXerceCaseAttachmentRequest[];
  contacts?: ICaseContactRequest[];
}

declare interface ICaseContactRequest {
  id: number;
  isBillable: boolean;
  caseContactRoleId?: number;
}

declare interface IReopenCaseRequest {
  inspection: IInspectionRequest;
  openViolationIds: number[];
}

declare interface IXerceCaseStatusActivity {
  id: number;
  status: XerceCaseStatus;
  createdBy: ICaseUser;
  createdAt: Date;
}

declare interface ICaseResponse {
  id: number;
  caseSummary: ICaseSummary;
  customCaseFieldValues: object[];
  issueDescription: string;
  inspections: ICaseInspection[];
  location: ICaseLocation;
  caseViolations: ICaseViolation[];
  attachments: IXerceCaseAttachment[];
  caseContacts: IXerceCaseContact[];
  caseNotices: IXerceCaseNotice[];
  caseNotes: INote[];
  caseStatusActivity: IXerceCaseStatusActivity[];
  forcedAbatement: IXerceCaseForcedAbatement;
  recommendFAMetadata: IRecommendFAMetadata;
}

// Case config
declare interface ICustomFieldConfig {
  [key: string]: {
    label: string;
    value: string;
    isRequired: boolean;
    type: CustomFieldType | LocationFieldType;
    options?: string[];
  };
}

declare interface IForcedAbatementSectionsConfig {
  id: number;
  label: string;
  abatementSectionFields: ICustomFieldConfig[];
}

declare interface ICaseViolation {
  id: number;
  configDispositionId: number;
  status: XerceViolationStatus;
  complyByDate: Date;
  configViolation: IConfigViolation;
  entity: object;
  createdBy: ICaseUser;
  updatedBy: ICaseUser;
  closedBy: ICaseUser;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date;
}

// S3 Presigned response
declare interface IS3PresignedHeader {
  url: string;
  requestBodyparams: string[][];
}

declare interface IXerceCaseContactEditRequest {
  billableContact: boolean;
  caseRoleId: number;
}

declare interface IXerceCaseContact {
  id: number;
  caseContactId: number;
  name: string;
  contactType: ContactType;
  isVendor: boolean;
  isGisPopulated: boolean;
  email: string;
  cellPhone: string;
  workPhone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  note: string;
  contactCustomFieldValues: object;
  isBillable: boolean;
  caseContactRole?: ICaseContactRole;
}

declare interface ICaseContactRole {
  id: number;
  label: string;
}

declare interface IAssociateForcedAbatementWithNoticesRequest {
  noticeIds: number[];
}

declare interface IGenerateNoticeRequest {
  configNoticeId: number;
  uiMergeCodes: IGenerateNoticeUiCodes;
}

declare interface IGenerateNoticeUiCodes {
  recipientIds: number[];
  responsibleContactId: number;
  attachments: IAttachmentsUiMergeCodes[];
  nextInspection: IInspectionRequest;
  openViolations: IOpenViolationUiMergeCodes[];
  resolutionActions: IResolutionAction[];
  caseAssigneeId: number;
}

declare interface IResolutionAction {
  articleNumber: string;
  description: string;
  resolution: string;
  complyByDate: string;
}

declare interface IOpenViolationUiMergeCodes {
  configViolationId: number;
  entity: object;
}

declare interface IAttachmentsUiMergeCodes {
  fileURL: string;
  title: string;
  uploadedAt: Date;
  uploadedBy: string;
}

declare interface INotice {
  notice: string;
}

declare interface INoticePDFFileMetaData {
  fileURL: string;
  fileMetaDataId: number;
}

declare interface IEditCaseViolationDispositionRequest {
  dispositionId: number;
}

declare interface IModifyAbatementActivitiesDatesReq {
  inspections: IModifyDates[];
  caseStatusActivity: IModifyDates[];
  notices: IModifyDates[];
}

declare interface IModifyDates {
  id: number;
  modifiedDate: Date;
}

declare interface ICaseHistory {
  createdAt: Date;
  createdByUser: ICaseUser;
  action: CaseHistoryActions;
  description: string;
}

declare interface ICaseTimeTracking {
  user: ICaseUser;
  date: Date;
  hours: number;
  id: number;
}

declare interface ICaseTimeTrackingRequest {
  userId: number;
  date: Date;
  hours: number;
}
