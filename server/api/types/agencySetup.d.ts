// Agency Informatiom interface
declare interface IAgencyInformationEditRequest {
  agencyTimezone?: AgencyTimezone;
  email?: string;
  whitelistURL?: string;
  agencyLogoURL?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
}

declare interface IAgencyInformation {
  id: number;
  name: string;
  email: string;
  agencyTimezone: AgencyTimezone;
  websiteURL: string;
  whitelistURL: string;
  agencyLogoURL: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
}

// Agency Products Interfaces
declare interface IAgencyProductList {
  products: IAgencyProduct[];
}

declare interface IAgencyProduct {
  id: number;
  name: string;
  productType: ProductType;
  isActive: boolean;
}

declare interface IAgencyName {
  id: number;
  name: string;
}

// Agency Work Schedule
declare interface IConfigAgencyWorkScheduleRequest {
  businessHours?: IConfigAgencyBusinessHourRequest[];
  holidays?: IAgencyHolidayRequest[];
  fiscalYear?: string;
}

declare interface IConfigAgencyWorkScheduleEditRequest {
  businessHours?: IConfigAgencyBusinessHourEditRequest[];
  existingHolidays?: IAgencyHolidayEditRequest[];
  newHolidays?: IAgencyHolidayRequest[];
  deleteHolidays?: number[];
  fiscalYear?: string;
}

declare interface IConfigAgencyWorkSchedule {
  businessHours: IConfigAgencyBusinessHour[];
  holidays: IAgencyHoliday[];
  fiscalYear: string;
}

declare interface IConfigAgencyBusinessHourRequest {
  day: Day;
  startTime?: string;
  endTime?: string;
}

declare interface IConfigAgencyBusinessHourEditRequest {
  id: number;
  day: Day;
  startTime?: string;
  endTime?: string;
}

declare interface IConfigAgencyBusinessHour {
  id: number;
  agencyId: number;
  day: Day;
  startTime: string;
  endTime: string;
}

// Config Case Custom Tile interfaces
declare interface ICaseCustomTileRequest {
  label: string;
  isActive: boolean;
  caseCustomFields: ICaseCustomFieldRequest[];
}

declare interface ICaseCustomTileEditRequest {
  label?: string;
  isActive?: boolean;
  existingCaseCustomFields?: ICaseCustomFieldEditRequest[];
  newCaseCustomFields?: ICaseCustomFieldRequest[];
}

declare interface ICaseCustomTile {
  id: number;
  label: string;
  isActive?: boolean;
  caseCustomFields?: ICaseCustomField[];
}

declare interface ICaseCustomFieldRequest {
  label: string;
  isActive: boolean;
  isMergeField: boolean;
  type: CustomFieldType;
  options: any;
  sequence: number;
}

declare interface ICaseCustomFieldEditRequest {
  id?: number;
  label?: string;
  isActive?: boolean;
  isMergeField?: boolean;
  type?: CustomFieldType;
  options?: any;
  sequence?: number;
}

declare interface ICaseCustomField {
  id: number;
  label: string;
  isActive: boolean;
  isMergeField: boolean;
  type: CustomFieldType;
  options: any;
  sequence: number;
}

// Contact custom field interfaces
declare interface IConfigContactCustomFieldRequest {
  label: string;
  contactType: ContactType;
  type: CustomFieldType;
  isActive: boolean;
  options?: string[];
}

declare interface IConfigContactCustomField {
  id: number;
  label: string;
  contactType: ContactType;
  type: CustomFieldType;
  sequence: number;
  options: string[];
  isActive: boolean;
}

// Case Role interfaces
declare interface ICaseRoleRequest {
  label: string;
  isActive: boolean;
}

declare interface ICaseRoleEditRequest {
  label?: string;
  isActive?: boolean;
}

declare interface ICaseRole {
  id: number;
  label: string;
  isDefault: boolean;
  isActive: boolean;
  sequence: number;
}

// Config violation interface
declare interface IConfigXerceViolationRequest {
  label: string;
  configViolationTypeId: number;
  configMunicipalCodeId: number;
  complyByDays?: number;
  isActive: boolean;
}

declare interface IConfigXerceViolation {
  id: number;
  label: string;
  configViolationTypeId: number;
  configMunicipalCodeId: number;
  complyByDays: number;
  isActive: boolean;
  sequence: number;
}

declare interface IConfigViolation {
  id: number;
  label: string;
  complyByDays: number;
  configViolationType: IConfigViolationType;
  configMunicipalCode: IMunicipalCode;
}

declare interface IConfigXerceViolationList {
  id: number;
  label: string;
}

// Config Forced Abatement Section
declare interface IConfigForcedAbatementActivityRequest {
  label: string;
  description: string;
  isActive: boolean;
  closesWhenCaseIsClosed: boolean;
  forcedAbatementFields: IConfigForcedAbatementFieldRequest[];
}

declare interface IConfigForcedAbatementEditRequest {
  label?: string;
  description?: string;
  isActive?: boolean;
  closesWhenCaseIsClosed?: boolean;
  existingForcedAbatementFields?: IConfigForcedAbatementFieldEditRequest[];
  newForcedAbatementFields?: IConfigForcedAbatementFieldRequest[];
}

declare interface IConfigForcedAbatementActivity {
  id: number;
  label: string;
  description: string;
  isActive: boolean;
  closesWhenCaseIsClosed: boolean;
  sequence: number;
  forcedAbatementFields: IConfigForcedAbatementField[];
}

// Config Forced Abatement Field interfaces
declare interface IConfigForcedAbatementFieldRequest {
  label: string;
  isActive: boolean;
  isMandatory: boolean;
  type: CustomFieldType;
  options: string[];
  sequence: number;
}

declare interface IConfigForcedAbatementFieldEditRequest {
  id: number;
  label?: string;
  isActive?: boolean;
  isMandatory?: boolean;
  options?: any;
  type: CustomFieldType;
  sequence?: number;
}

declare interface IConfigForcedAbatementField {
  id: number;
  label: string;
  isActive: boolean;
  isMandatory: boolean;
  type: CustomFieldType;
  options: string[];
  sequence: number;
}

declare interface ISequenceEditRequest {
  sequence: number[];
}

// Disposition interfaces
declare interface IConfigDispositionRequest {
  label: string;
  isActive: boolean;
  dispositionType: DispositionType;
  compliantDispositionType?: CompliantDispositionType;
}

declare interface IConfigDisposition {
  id: number;
  label: string;
  dispositionType: DispositionType;
  compliantDispositionType: CompliantDispositionType;
  isDefault: boolean;
  sequence: number;
  isActive: boolean;
}
// Fee custom field interfaces
declare interface IConfigFeePaymentCustomFieldRequest {
  label: string;
  type: CustomFieldType;
  options?: string[];
  feePaymentFieldType: FeePaymentFieldType;
  isActive: boolean;
  isMandatory: boolean;
  includeInMergeTable: boolean;
}

declare interface IConfigFeePaymentCustomField {
  id: number;
  label: string;
  type: CustomFieldType;
  options: string[];
  feePaymentFieldType: FeePaymentFieldType;
  isActive: boolean;
  isMandatory: boolean;
  includeInMergeTable: boolean;
  sequence: number;
}

// Config Xerce payment type interfaces
declare interface IConfigXercePaymentTypeRequest {
  label: string;
  isActive: boolean;
}

declare interface IConfigXercePaymentTypeEditRequest {
  label?: string;
  isActive?: boolean;
}

declare interface IConfigXercePaymentType {
  id: number;
  label: string;
  isDefault: boolean;
  isActive: boolean;
  sequence: number;
}

// Notice Form interface
declare interface IConfigXerceNoticeRequest {
  label: string;
  noticeType: NoticeType;
  isActive: boolean;
  content?: string;
  associatedFeeIds?: number[];
  noticeFormSectionHeaderId?: number;
  noticeFormSectionFooterId?: number;
}

declare interface IConfigXerceNotice {
  id: number;
  label: string;
  noticeType: NoticeType;
  isActive: boolean;
  content: string;
  sequence: number;
  proposeForcedAbatement: boolean;
  associatedFees: IAssociatedNoticeFeeDetails[];
  noticeFormSectionHeader: INoticeFormSection;
  noticeFormSectionFooter: INoticeFormSection;
  createdBy: ICaseUser;
  updatedBy: ICaseUser;
  createdAt: Date;
  updatedAt: Date;
}

declare interface IConfigXerceNoticeMergeCode {
  containsPhotoMergeTable: boolean;
  containsMuniCodeMergeTable: boolean;
}

// Config Xerce Form interface
declare interface IConfigFormRequest {
  label: string;
  isActive: boolean;
  content: string;
  noticeFormSectionHeaderId?: number;
  noticeFormSectionFooterId?: number;
}

declare interface IConfigForm {
  id: number;
  label: string;
  content: string;
  sequence: number;
  isDefault: boolean;
  isActive: boolean;
  noticeFormSectionHeader: INoticeFormSection;
  noticeFormSectionFooter: INoticeFormSection;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

declare interface IConfigNoticeFormSectionRequest {
  label: string;
  sectionType: NoticeFormSectionType;
  content: string;
  isActive: boolean;
}

declare interface IConfigNoticeFormSectionEditRequest {
  label: string;
  isActive: boolean;
  content: string;
}

declare interface IConfigNoticeFormSection {
  id: number;
  label: string;
  sectionType: NoticeFormSectionType;
  content: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

declare interface INoticeFormSection {
  id: number;
  content: string;
}

// Municipal Code Interface
declare interface IMunicipalCodeRequest {
  articleNumber: string;
  description: string;
  resolutionAction: string;
}

declare interface IMunicipalCode {
  id: number;
  articleNumber: string;
  description: string;
  resolutionAction: string;
}

declare interface IMunicipalCodeEditRequest {
  articleNumber?: string;
  description?: string;
  resolutionAction?: string;
}

declare interface IMunicipalCodeList extends IPagination {
  data: IMunicipalCode[];
}

declare interface IFileName {
  fileName: string;
}

declare interface IKMLFileDetails {
  id: number;
  label: string;
  fileName: string;
  isActive: boolean;
  sequence: number;
}

declare interface IAgencyMapSettings {
  zoomLevel: number;
  centerLatitude: number;
  centerLongitude: number;
}

declare interface IConfigHTMLFormImageRequest {
  images: IConfigImageRequest[];
}

declare interface IConfigImageRequest {
  label: string;
  description?: string;
  fileName: string;
  fileSize: string;
  fileURL: string;
}

declare interface IConfigHTMLFormImage {
  id: number;
  label: string;
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

declare interface IConfigHTMLFormImageEditRequest {
  images: IConfigImageEditRequest[];
}

declare interface IConfigImageEditRequest {
  id: number;
  label: string;
  description: string;
}

// User interface
declare interface IUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  department?: string;
  isActive: boolean;
  isSiteAdmin: boolean;
  xerce?: IUserXercePermissionRequest;
}

declare interface IUserEditRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  title?: string;
  department?: string;
  isActive: boolean;
  isSiteAdmin: boolean;
  xerce?: IUserXercePermissionEditRequest;
}

declare interface IUser {
  id: number;
  agencyId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  title: string;
  department: string;
  isActive: boolean;
  isSiteAdmin: boolean;
  hasAssociatedCases: boolean;
  xerce: IUserXercePermission;
}

// User Xerce Permission interface
declare interface IUserXercePermissionRequest {
  xerceId: number;
  isActive: boolean;
  isProductAdmin: boolean;
  reportAccess: ReportAccess;
  dashboardAccess: DashboardAccess;
  feesAccess: FeesAccess;
  violationTypePermissions: IUserXerceViolationTypePermissionRequest[];
}

declare interface IUserXercePermissionEditRequest
  extends IUserXercePermissionRequest {
  id: number;
  violationTypePermissions: IUserXerceViolationTypePermissionEditRequest[];
}

declare interface IUserXerceViolationTypePermissionRequest {
  configXerceViolationTypeId: number;
  violationTypeAccess: ViolationTypeACL;
}

declare interface IUserXerceViolationTypePermissionEditRequest
  extends IUserXerceViolationTypePermissionRequest {
  id: number;
}

declare interface IUserXercePermission {
  id: number;
  xerceId: number;
  isActive: boolean;
  isProductAdmin: boolean;
  reportAccess: ReportAccess;
  dashboardAccess: DashboardAccess;
  feesAccess: FeesAccess;
  violationTypePermissions: IUserXerceViolationTypePermission[];
}

declare interface IUserXerceViolationTypePermission {
  id: number;
  configXerceViolationTypeId: number;
  label: string;
  violationTypeAccess: ViolationTypeACL;
  isActive?: boolean;
}

// Location Field interface
declare interface ILocationFieldRequest {
  label: string;
  type?: CustomFieldType;
  locationFieldType: LocationFieldType;
  isActive: boolean;
  isMandatory: boolean;
  parcelField?: string;
  options?: string[];
}

declare interface ILocationField {
  id: number;
  label: string;
  type: CustomFieldType;
  locationFieldType: LocationFieldType;
  isActive: boolean;
  isMandatory: boolean;
  parcelField: string;
  options: string[];
  sequence: number;
}

declare interface IConfigFeeRequest {
  label: string;
  defaultAmount: number;
  defaultDueDays: number;
  isActive: boolean;
  isAssociatedToNotice: boolean;
  associatedNoticeIds?: number[];
}

declare interface IConfigFee {
  id: number;
  label: string;
  defaultAmount: number;
  defaultDueDays: number;
  isAssociatedToNotice: boolean;
  associatedNotices: IAssociatedNoticeFeeDetails[];
  isDefault: boolean;
  isActive: boolean;
  sequence: number;
}

declare interface IAssociatedNoticeFeeDetails {
  id: number;
  name: string;
}

declare interface IXerceLayout {
  sectionSequence: IPageEntity[];
  config: IXerceConfigurations;
  isCreateCaseConfigValid: boolean;
}

declare interface IPageEntity {
  id: number;
  sequence: number;
  caseCustomTileId: number;
  sectionLabel: string;
  sectionType: IPageEntityType;
  isEditableLabel: boolean;
  isActive: boolean;
  isFixed: boolean;
  showCreateCase: boolean;
  showCaseDetails: boolean;
}

declare interface IXerceLayoutSectionEditRequest {
  label: string;
}

// Agency Holiday
declare interface IAgencyHolidayRequest {
  startDate: Date;
  endDate: Date;
  title: string;
}

declare interface IAgencyHolidayEditRequest {
  id: number;
  startDate?: Date;
  endDate?: Date;
  title?: string;
}

declare interface IAgencyHoliday {
  id: number;
  startDate: Date;
  endDate: Date;
  title: string;
  duration: number;
}
