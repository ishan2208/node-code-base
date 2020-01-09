import * as sequelize from 'sequelize';

declare global {
  const enum CustomFieldType {
    DATE = 'DATE',
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    PICKLIST = 'PICKLIST',
  }

  const enum GISLayerType {
    PARCEL = 'PARCEL',
    CDBG = 'cdbg',
  }

  const enum InspectionStatus {
    SCHEDULED = 'SCHEDULED',
    COMPLETED = 'COMPLETED',
  }

  const enum LocationFieldType {
    MANUAL = 'MANUAL',
    PARCEL_FILE = 'PARCEL_FILE',
  }

  const enum NoticeType {
    HTML = 'HTML',
    NON_HTML = 'NON_HTML',
  }

  const enum NoticeFormSectionType {
    HEADER = 'HEADER',
    FOOTER = 'FOOTER',
  }

  const enum ProductType {
    XERCE = 'xerce',
  }

  const enum XerceViolationStatus {
    VERIFICATION_PENDING = 'VERIFICATION_PENDING',
    OPEN = 'OPEN',
    CLOSED_INVALID = 'CLOSED_INVALID',
    CLOSED_MET_COMPLIANCE = 'CLOSED_MET_COMPLIANCE',
  }

  const enum DispositionType {
    INVALID_DISPOSITION = 'INVALID_DISPOSITION',
    COMPLIANT_DISPOSITION = 'COMPLIANT_DISPOSITION',
  }

  const enum CompliantDispositionType {
    FORCED = 'FORCED',
    VOLUNTARY = 'VOLUNTARY',
  }

  const enum CaseAttachmentType {
    AI = 'AI',
    AIFF = 'AIFF',
    BMP = 'BMP',
    DOC = 'DOC',
    DOCX = 'DOCX',
    EML = 'EML',
    EPS = 'EPS',
    GIF = 'GIF',
    HTM = 'HTM',
    HTML = 'HTML',
    JPE = 'JPE',
    JPEG = 'JPEG',
    JPG = 'JPG',
    MP3 = 'MP3',
    MP4 = 'MP4',
    MSG = 'MSG',
    PDF = 'PDF',
    PNG = 'PNG',
    PPT = 'PPT',
    PPTX = 'PPTX',
    PS = 'PS',
    RTF = 'RTF',
    TIF = 'TIF',
    TIFF = 'TIFF',
    TXT = 'TXT',
    VCF = 'VCF',
    WAV = 'WAV',
    XLS = 'XLS',
    XLSX = 'XLSX',
    ZIP = 'ZIP',
  }

  const enum XerceCaseInitiationType {
    PROACTIVE = 'PROACTIVE',
    REACTIVE = 'REACTIVE',
  }

  const enum XerceCaseStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
  }

  const enum ForcedAbatementStatus {
    OPEN = 'OPEN',
    CLOSE = 'CLOSE',
  }

  const enum FeePaymentFieldType {
    FEE = 'FEE',
    PAYMENT = 'PAYMENT',
  }

  interface IDbConnection {
    Agency: sequelize.Model<IAgencyInstance, IAgencyAttributes>;
    ConfigAgencyHoliday: sequelize.Model<
      IConfigAgencyHolidayInstance,
      IConfigAgencyHolidayAttributes
    >;
    AgencyLocation: sequelize.Model<
      IAgencyLocationInstance,
      IAgencyLocationAttributes
    >;
    CDBG: sequelize.Model<ICDBGInstance, ICDBGAttributes>;
    CDBGFileName: sequelize.Model<
      ICDBGFileNameInstance,
      ICDBGFileNameAttributes
    >;
    ComcateAdmin: sequelize.Model<
      IComcateAdminInstance,
      IComcateAdminAttributes
    >;
    ConfigAgencyBusinessHour: sequelize.Model<
      IConfigAgencyBusinessHourInstance,
      IConfigAgencyBusinessHourAttributes
    >;
    ConfigDisposition: sequelize.Model<
      IConfigDispositionInstance,
      IConfigDispositionAttributes
    >;
    ConfigContactCustomField: sequelize.Model<
      IConfigContactCustomFieldInstance,
      IConfigContactCustomFieldAttributes
    >;
    ConfigCaseRole: sequelize.Model<
      IConfigCaseRoleInstance,
      IConfigCaseRoleAttributes
    >;
    ConfigXerceEntityField: sequelize.Model<
      IConfigXerceEntityFieldInstance,
      IConfigXerceEntityFieldAttributes
    >;
    ConfigXerceEntitySection: sequelize.Model<
      IConfigXerceEntitySectionInstance,
      IConfigXerceEntitySectionAttributes
    >;
    ConfigFee: sequelize.Model<IConfigFeeInstance, IConfigFeeAttributes>;
    ConfigFeePaymentCustomField: sequelize.Model<
      IConfigFeePaymentCustomFieldInstance,
      IConfigFeePaymentCustomFieldAttributes
    >;
    ConfigFeeForcedAbatement: sequelize.Model<
      IConfigFeeForcedAbatementInstance,
      IConfigFeeForcedAbatementAttributes
    >;
    ConfigFeeNotice: sequelize.Model<
      IConfigFeeNoticeInstance,
      IConfigFeeNoticeAttributes
    >;
    ConfigXercePaymentType: sequelize.Model<
      IConfigXercePaymentTypeInstance,
      IConfigXercePaymentTypeAttributes
    >;
    ConfigForcedAbatementActivity: sequelize.Model<
      IConfigForcedAbatementActivityInstance,
      IConfigForcedAbatementActivityAttributes
    >;
    ConfigForcedAbatementField: sequelize.Model<
      IConfigForcedAbatementFieldInstance,
      IConfigForcedAbatementFieldAttributes
    >;
    ConfigHTMLFormImage: sequelize.Model<
      IConfigHTMLFormImageInstance,
      IConfigHTMLFormImageAttributes
    >;
    ConfigLocationField: sequelize.Model<
      IConfigLocationFieldInstance,
      IConfigLocationFieldAttributes
    >;
    ConfigKML: sequelize.Model<IConfigKMLInstance, IConfigKMLAttributes>;
    ConfigMunicipalCode: sequelize.Model<
      IConfigMunicipalCodeInstance,
      IConfigMunicipalCodeAttributes
    >;
    ConfigXerceNotice: sequelize.Model<
      IConfigXerceNoticeInstance,
      IConfigXerceNoticeAttributes
    >;
    ConfigXerceForm: sequelize.Model<
      IConfigXerceFormInstance,
      IConfigXerceFormAttributes
    >;
    ConfigNoticeFormSection: sequelize.Model<
      IConfigNoticeFormSectionInstance,
      IConfigNoticeFormSectionAttributes
    >;
    ConfigXerceViolation: sequelize.Model<
      IConfigXerceViolationInstance,
      IConfigXerceViolationAttributes
    >;
    ConfigXerceViolationType: sequelize.Model<
      IConfigXerceViolationTypeInstance,
      IConfigXerceViolationTypeAttributes
    >;
    ConfigCaseCustomField: sequelize.Model<
      IConfigCaseCustomFieldInstance,
      IConfigCaseCustomFieldAttributes
    >;
    ConfigCaseCustomTile: sequelize.Model<
      IConfigCaseCustomTileInstance,
      IConfigCaseCustomTileAttributes
    >;
    EmailHistory: sequelize.Model<
      IEmailHistoryInstance,
      IEmailHistoryAttributes
    >;
    FileMetadata: sequelize.Model<
      IFileMetadataInstance,
      IFileMetadataAttributes
    >;
    Contact: sequelize.Model<IContactInstance, IContactAttributes>;
    LocationFlagHistory: sequelize.Model<
      ILocationFlagHistoryInstance,
      ILocationFlagHistoryAttributes
    >;
    LegalEntityIndividualContact: sequelize.Model<
      ILegalEntityIndividualContactInstance,
      ILegalEntityIndividualContactAttributes
    >;
    Xerce: sequelize.Model<IXerceInstance, IXerceAttributes>;
    SystemIcon: sequelize.Model<ISystemIconInstance, ISystemIconAttributes>;
    SystemXerceEntityField: sequelize.Model<
      ISystemXerceEntityFieldInstance,
      ISystemXerceEntityFieldAttributes
    >;
    SystemXerceEntitySection: sequelize.Model<
      ISystemXerceEntitySectionInstance,
      ISystemXerceEntitySectionAttributes
    >;
    SystemXerceViolationType: sequelize.Model<
      ISystemXerceViolationTypeInstance,
      ISystemXerceViolationTypeAttributes
    >;
    User: sequelize.Model<IUserInstance, IUserAttributes>;
    UserXercePermission: sequelize.Model<
      IUserXercePermissionInstance,
      IUserXercePermissionAttributes
    >;
    UserXerceViolationTypePermission: sequelize.Model<
      IUserXerceViolationTypePermissionInstance,
      IUserXerceViolationTypePermissionAttributes
    >;
    XerceCaseStatusActivity: sequelize.Model<
      IXerceCaseStatusActivityInstance,
      IXerceCaseStatusActivityAttributes
    >;
    XerceCaseActivity: sequelize.Model<
      IXerceCaseActivityInstance,
      IXerceCaseActivityAttributes
    >;
    XerceCaseAttachment: sequelize.Model<
      IXerceCaseAttachmentInstance,
      IXerceCaseAttachmentAttributes
    >;
    XerceCase: sequelize.Model<IXerceCaseInstance, IXerceCaseAttributes>;
    XerceCaseContact: sequelize.Model<
      IXerceCaseContactInstance,
      IXerceCaseContactAttributes
    >;
    XerceCaseInspection: sequelize.Model<
      IXerceCaseInspectionInstance,
      IXerceCaseInspectionAttributes
    >;
    XerceCaseInspectionAttachment: sequelize.Model<
      IXerceCaseInspectionAttachmentInstance,
      IXerceCaseInspectionAttachmentAttributes
    >;
    XerceCaseInspectionViolation: sequelize.Model<
      IXerceCaseInspectionViolationInstance,
      IXerceCaseInspectionViolationAttributes
    >;
    XerceCaseNote: sequelize.Model<
      IXerceCaseNoteInstance,
      IXerceCaseNoteAttributes
    >;
    XerceCaseNotice: sequelize.Model<
      IXerceCaseNoticeInstance,
      IXerceCaseNoticeAttributes
    >;
    XerceCaseLocation: sequelize.Model<
      IXerceCaseLocationInstance,
      IXerceCaseLocationAttributes
    >;
    XerceCaseViolation: sequelize.Model<
      IXerceCaseViolationInstance,
      IXerceCaseViolationAttributes
    >;
    XerceCaseForcedAbatementActivity: sequelize.Model<
      IXerceCaseForcedAbatementActivityInstance,
      IXerceCaseForcedAbatementActivityAttributes
    >;
    XerceCaseHistory: sequelize.Model<
      IXerceCaseHistoryInstance,
      IXerceCaseHistoryAttributes
    >;
    XerceCaseTimeTracking: sequelize.Model<
      IXerceCaseTimeTrackingInstance,
      IXerceCaseTimeTrackingAttributes
    >;
    sequelize: any;
    Sequelize: any;
  }

  interface IAgencyAttributes {
    id?: number;
    name?: string;
    websiteURL?: string;
    email?: string;
    agencyTimezone?: AgencyTimezone;
    whitelistURL?: string;
    fiscalYearStartDate?: string;
    agencyLogoURL?: string;
    bannerSettings?: object;
    disclaimer?: string;
    hasParcelLayer?: boolean;
    locations?: IAgencyLocationAttributes[];
    xerce?: IXerceAttributes;
    isActive?: boolean;
    isMigratedAgency?: boolean;
    adminId?: number;
    agencyBoundaryKMLFileName?: string;
    agencyBoundaryFileURL?: string;
    agencyParcelFileName?: string;
    agencyParcelFileURL?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IAgencyInstance
    extends sequelize.Instance<IAgencyAttributes>,
      IAgencyAttributes {
    getConfiguration: any;
    setConfiguration: any;
    getLocations: any;
    setLocations: any;
    getMunicipalCodes: any;
    setMunicipalCodes: any;
    getViolationSections: any;
    setViolationSections: any;
    getViolationTypeSections: any;
    setViolationTypeSections: any;
    getViolationFields: any;
    setViolationFields: any;
    getHtmlForms: any;
    setHtmlForms: any;
    locations: IAgencyLocationInstance[];
    xerceCases: IXerceCaseInstance[];
    xerce: IXerceInstance;
    configAgencyBusinessHours: IConfigAgencyBusinessHourInstance[];
    agencyHolidays: IConfigAgencyHolidayInstance[];
    users: IUserInstance[];
    configXerceViolationTypes?: IConfigXerceViolationTypeInstance[];
    caseRoles?: IConfigCaseRoleInstance[];
    municipalCodes?: IConfigMunicipalCodeInstance[];
    violations?: IConfigXerceViolationInstance[];
    dispositions?: IConfigDispositionInstance[];
    notices?: IConfigXerceNoticeInstance[];
    entitySections?: IConfigXerceEntitySectionInstance[];
    caseCustomTiles?: IConfigCaseCustomTileInstance[];
    contactCustomFields?: IConfigContactCustomFieldInstance[];
    locationFields?: IConfigLocationFieldInstance[];
  }

  interface IConfigAgencyBusinessHourAttributes {
    id?: number;
    agencyId?: number;
    day?: Day;
    startTime?: string;
    endTime?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigAgencyBusinessHourInstance
    extends sequelize.Instance<IConfigAgencyBusinessHourAttributes>,
      IConfigAgencyBusinessHourAttributes {}

  interface IConfigAgencyHolidayAttributes {
    id?: number;
    agencyId?: number;
    startDate?: Date;
    endDate?: Date;
    title?: string;
    duration?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigAgencyHolidayInstance
    extends sequelize.Instance<IConfigAgencyHolidayAttributes>,
      IConfigAgencyHolidayAttributes {}

  interface IContactAttributes {
    id?: number;
    agencyId?: number;
    contactType?: ContactType;
    name?: string;
    isVendor?: boolean;
    isGisPopulated?: boolean;
    email?: string;
    workPhone?: string;
    cellPhone?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zip?: string;
    note?: string;
    contactCustomFieldValues?: object;
  }

  interface IContactInstance
    extends sequelize.Instance<IContactAttributes>,
      IContactAttributes {
    individualContacts?: IContactInstance[];
    legalEntityContacts?: IContactInstance[];
    setLegalEntityContacts?: any;
    setIndividualContacts?: any;
    LegalEntityIndividualContact?: ILegalEntityIndividualContactAttributes;
  }

  interface ILocationFlagHistoryAttributes {
    id?: number;
    agencyId?: number;
    agencyLocationId?: number;
    isFlagged?: boolean;
    reason?: string;
    createdBy?: number;
    updatedBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface ILocationFlagHistoryInstance
    extends sequelize.Instance<ILocationFlagHistoryAttributes>,
      ILocationFlagHistoryAttributes {
    createdByUser: IUserInstance;
  }

  interface ILegalEntityIndividualContactAttributes {
    id?: number;
    agencyId?: number;
    individualContactId?: number;
    legalEntityContactId?: number;
    isPrimary?: boolean;
  }

  interface ILegalEntityIndividualContactInstance
    extends sequelize.Instance<ILegalEntityIndividualContactAttributes>,
      ILegalEntityIndividualContactAttributes {
    contact: IContactInstance;
  }

  interface IAgencyLocationAttributes {
    id?: number;
    agencyId?: number;
    streetAddress?: string;
    latitude?: number;
    longitude?: number;
    mapZoomLevel?: number;
    city?: string;
    state?: string;
    zip?: string;
    parcelId?: number;
    isAgencyAddress?: boolean;
    isCDBGEligible?: boolean;
    apn?: string;
    assessorAddress?: string;
    isMapPinDropped?: boolean;
  }

  interface IAgencyLocationInstance
    extends sequelize.Instance<IAgencyLocationAttributes>,
      IAgencyLocationAttributes {
    xerceCases: IXerceCaseInstance[];
    locationFlagHistory: ILocationFlagHistoryInstance[];
  }

  interface ICDBGAttributes {
    id?: number;
    stateFIPS?: string;
    cntyFIPS?: string;
    fipsstco?: string;
    tract?: string;
    blkgrp?: string;
    stfid?: string;
    latitude?: number;
    longitude?: number;
    blockgroup?: string;
    stusab?: number;
    low?: number;
    lowmod?: number;
    lmmi?: number;
    lowmoduniv?: number;
    lowmodPCT?: number;
    geom?: number;
  }

  interface ICDBGInstance
    extends sequelize.Instance<ICDBGAttributes>,
      ICDBGAttributes {}

  interface ICDBGFileNameAttributes {
    id?: number;
    fileName?: string;
  }

  interface ICDBGFileNameInstance
    extends sequelize.Instance<ICDBGFileNameAttributes>,
      ICDBGFileNameAttributes {}

  interface IComcateAdminAttributes {
    id?: number;
    username?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    email?: string;
  }

  interface IComcateAdminInstance
    extends sequelize.Instance<IComcateAdminAttributes>,
      IComcateAdminAttributes {}

  interface IConfigCaseCustomFieldAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    configCaseCustomTileId?: number;
    label?: string;
    isActive?: boolean;
    isMergeField?: boolean;
    type?: CustomFieldType;
    options?: any;
    sequence?: number;
  }

  interface IConfigCaseCustomFieldInstance
    extends sequelize.Instance<IConfigCaseCustomFieldAttributes>,
      IConfigCaseCustomFieldAttributes {}

  interface IConfigCaseCustomTileAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    label?: string;
    isActive?: boolean;
    caseCustomFields?: IConfigCaseCustomFieldAttributes[];
  }

  interface IConfigCaseCustomTileInstance
    extends sequelize.Instance<IConfigCaseCustomTileAttributes>,
      IConfigCaseCustomTileAttributes {
    caseCustomFields?: IConfigCaseCustomFieldInstance[];
  }

  interface IConfigContactCustomFieldAttributes {
    id?: number;
    agencyId?: number;
    label?: string;
    contactType?: ContactType;
    isActive?: boolean;
    type?: CustomFieldType;
    options?: string[];
    sequence?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigContactCustomFieldInstance
    extends sequelize.Instance<IConfigContactCustomFieldAttributes>,
      IConfigContactCustomFieldAttributes {}

  interface IConfigCaseRoleAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    label?: string;
    isDefault?: boolean;
    isActive?: boolean;
    sequence?: number;
    createdAt?: Date;
  }

  interface IConfigCaseRoleInstance
    extends sequelize.Instance<IConfigCaseRoleAttributes>,
      IConfigCaseRoleAttributes {}

  interface IConfigDispositionAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    label?: string;
    dispositionType?: DispositionType;
    compliantDispositionType?: CompliantDispositionType;
    isDefault?: boolean;
    sequence?: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigDispositionInstance
    extends sequelize.Instance<IConfigDispositionAttributes>,
      IConfigDispositionAttributes {}

  interface IConfigFeePaymentCustomFieldAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    label?: string;
    type?: CustomFieldType;
    options?: string[];
    feePaymentFieldType?: FeePaymentFieldType;
    isMandatory?: boolean;
    isActive?: boolean;
    includeInMergeTable?: boolean;
    sequence?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigFeePaymentCustomFieldInstance
    extends sequelize.Instance<IConfigFeePaymentCustomFieldAttributes>,
      IConfigFeePaymentCustomFieldAttributes {}

  interface IConfigXercePaymentTypeAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    label?: string;
    sequence?: number;
    isDefault?: boolean;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigXercePaymentTypeInstance
    extends sequelize.Instance<IConfigXercePaymentTypeAttributes>,
      IConfigXercePaymentTypeAttributes {}

  interface IConfigFeeAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    label?: string;
    defaultAmount?: number;
    defaultDueDays?: number;
    isDefault?: boolean;
    isActive?: boolean;
    isAssociatedToNotice?: boolean;
    sequence?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigFeeInstance
    extends sequelize.Instance<IConfigFeeAttributes>,
      IConfigFeeAttributes {
    addNotices: any;
    setNotices: any;
    notices: IConfigXerceNoticeInstance[];
  }

  interface IConfigHTMLFormImageAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    fileMetadataId?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface IConfigHTMLFormImageInstance
    extends sequelize.Instance<IConfigHTMLFormImageAttributes>,
      IConfigHTMLFormImageAttributes {
    fileMetadata: IFileMetadataInstance;
  }

  interface IConfigForcedAbatementActivityAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    label?: string;
    description?: string;
    isActive?: boolean;
    closesWhenCaseIsClosed?: boolean;
    sequence?: number;
    configForcedAbatementFields?: IConfigForcedAbatementFieldAttributes[];
  }

  interface IConfigForcedAbatementActivityInstance
    extends sequelize.Instance<IConfigForcedAbatementActivityAttributes>,
      IConfigForcedAbatementActivityAttributes {
    configForcedAbatementFields: IConfigForcedAbatementFieldInstance[];
  }

  interface IConfigForcedAbatementFieldAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    configForcedAbatementId?: number;
    name?: string;
    label?: string;
    isActive?: boolean;
    isMandatory?: boolean;
    type?: CustomFieldType;
    options?: any;
    sequence?: number;
  }

  interface IConfigForcedAbatementFieldInstance
    extends sequelize.Instance<IConfigForcedAbatementFieldAttributes>,
      IConfigForcedAbatementFieldAttributes {}

  interface IConfigKMLAttributes {
    id?: number;
    agencyId?: number;
    label?: string;
    isActive?: boolean;
    layerName?: string;
    fileName?: string;
    fileURL?: string;
    layerStyleNumber?: number;
    sequence?: number;
  }

  interface IConfigKMLInstance
    extends sequelize.Instance<IConfigKMLAttributes>,
      IConfigKMLAttributes {}

  interface IConfigLocationFieldAttributes {
    id?: number;
    agencyId?: number;
    label?: string;
    type?: CustomFieldType;
    locationFieldType?: LocationFieldType;
    isActive?: boolean;
    isMandatory?: boolean;
    parcelField?: string;
    options?: string[];
    sequence?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigLocationFieldInstance
    extends sequelize.Instance<IConfigLocationFieldAttributes>,
      IConfigLocationFieldAttributes {}

  interface IConfigMunicipalCodeAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    articleNumber?: string;
    description?: string;
    resolutionAction?: string;
  }

  interface IConfigMunicipalCodeInstance
    extends sequelize.Instance<IConfigMunicipalCodeAttributes>,
      IConfigMunicipalCodeAttributes {}

  interface IConfigXerceNoticeAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    label?: string;
    noticeType?: NoticeType;
    content?: string;
    isActive?: boolean;
    sequence?: number;
    noticeFormSectionHeaderId?: number;
    noticeFormSectionFooterId?: number;
    proposeForcedAbatement?: boolean;
    mergeFields?: object;
    mergeTables?: object;
    createdBy?: number;
    updatedBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigXerceNoticeInstance
    extends sequelize.Instance<IConfigXerceNoticeAttributes>,
      IConfigXerceNoticeAttributes {
    violationTypeIds?: number[];
    createdByUser?: IUserInstance;
    updatedByUser?: IUserInstance;
    headerSection?: IConfigNoticeFormSectionInstance;
    footerSection?: IConfigNoticeFormSectionInstance;
    addFees: any;
    setFees: any;
    fees: IConfigFeeInstance[];
  }

  interface IConfigXerceFormAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    label?: string;
    content?: string;
    noticeFormSectionHeaderId?: number;
    noticeFormSectionFooterId?: number;
    mergeFields?: object;
    mergeTables?: object;
    sequence?: number;
    isDefault?: boolean;
    isActive?: boolean;
    createdBy?: number;
    updatedBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface IConfigXerceFormInstance
    extends sequelize.Instance<IConfigXerceFormAttributes>,
      IConfigXerceFormAttributes {
    createdByUser?: IUserInstance;
    updatedByUser?: IUserInstance;
    headerSection?: IConfigNoticeFormSectionInstance;
    footerSection?: IConfigNoticeFormSectionInstance;
  }

  interface IConfigNoticeFormSectionAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    label?: string;
    content?: string;
    sectionType?: NoticeFormSectionType;
    mergeFields?: object;
    mergeTables?: object;
    isActive?: boolean;
    createdBy?: number;
    updatedBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigNoticeFormSectionInstance
    extends sequelize.Instance<IConfigNoticeFormSectionAttributes>,
      IConfigNoticeFormSectionAttributes {
    createdByUser: IUserInstance;
    updatedByUser: IUserInstance;
  }

  interface IConfigXerceViolationAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    configMunicipalCodeId?: number;
    configViolationTypeId?: number;
    label?: string;
    complyByDays?: number;
    sequence?: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigXerceViolationInstance
    extends sequelize.Instance<IConfigXerceViolationAttributes>,
      IConfigXerceViolationAttributes {
    municipalCode?: IConfigMunicipalCodeInstance;
    violationType?: IConfigXerceViolationTypeInstance;
  }

  interface IConfigCustomField {
    label?: string;
    isActive?: boolean;
    type?: CustomFieldType;
    options?: string[];
  }

  interface IConfigXerceEntityFieldAttributes extends IConfigCustomField {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    configXerceEntitySectionId?: number;
    isMergeField?: boolean;
    isIncludedInEntityName?: boolean;
    sequence?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigXerceEntityFieldInstance
    extends sequelize.Instance<IConfigXerceEntityFieldAttributes>,
      IConfigXerceEntityFieldAttributes {}

  interface IConfigXerceEntitySectionAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    configXerceViolationTypeId?: number;
    label?: string;
    isActive?: boolean;
    configEntityFields?: IConfigXerceEntityFieldAttributes[];
    isCustom?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigXerceEntitySectionInstance
    extends sequelize.Instance<IConfigXerceEntitySectionAttributes>,
      IConfigXerceEntitySectionAttributes {
    violationType: IConfigXerceViolationTypeInstance;
    configEntityFields?: IConfigXerceEntityFieldInstance[];
    getEntityFields?: any;
    setEntityFields?: any;
  }

  interface IConfigXerceViolationTypeAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    systemXerceViolationTypeId?: number;
    label?: string;
    iconId?: number;
    isCustom?: boolean;
    isActive?: boolean;
    activatedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IConfigXerceViolationTypeInstance
    extends sequelize.Instance<IConfigXerceViolationTypeAttributes>,
      IConfigXerceViolationTypeAttributes {
    configEntitySection?: IConfigXerceEntitySectionInstance;
    violationTypeIcon?: ISystemIconInstance;
  }

  interface IEmailHistoryAttributes {
    id?: number;
    agencyId?: number;
    userId?: number;
    type?: EmailType;
    from?: string;
    to?: string;
    cc?: string;
    bcc?: string;
    body?: string;
    subject?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IEmailHistoryInstance
    extends sequelize.Instance<IEmailHistoryAttributes>,
      IEmailHistoryAttributes {}

  interface IFileMetadataAttributes {
    id?: number;
    agencyId?: number;
    title?: string;
    description?: string;
    fileName?: string;
    fileSize?: string;
    fileURL?: string;
    mimeType?: string;
    createdBy?: number;
    updatedBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface IFileMetadataInstance
    extends sequelize.Instance<IFileMetadataAttributes>,
      IFileMetadataAttributes {
    createdByUser?: IUserInstance;
    updatedByUser?: IUserInstance;
  }

  interface IXerceAttributes {
    id?: number;
    agencyId?: number;
    name?: string;
    caseNumberFormat?: NumberFormat;
    caseNumberInitialization?: number;
    isCaseNumberResettable?: boolean;
    nextCaseNumber?: string;
    feeReceiptNumberFormat?: NumberFormat;
    feeReceiptNumberInitialization?: number;
    isFeeReceiptNumberResettable?: boolean;
    nextFeeReceiptNumber?: string;
    nextNoticeNumber?: number;
    allowCDBG?: boolean;
    allowFeeTracking?: boolean;
    allowTimeTracking?: boolean;
    productLayout?: IXerceLayout;
    defaultComplyByDays?: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IXerceInstance
    extends sequelize.Instance<IXerceAttributes>,
      IXerceAttributes {
    municipalCodes: IConfigMunicipalCodeInstance[];
    configXerceViolationTypes: IConfigXerceViolationTypeInstance[];
  }

  interface ISystemIconAttributes {
    id?: number;
    fileUrl?: string;
    isAvailableForUse?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface ISystemIconInstance
    extends sequelize.Instance<ISystemIconAttributes>,
      ISystemIconAttributes {}

  interface ISystemXerceEntityFieldAttributes {
    id?: number;
    label?: string;
    type?: CustomFieldType;
    options?: string[];
    isMergeField?: boolean;
    isIncludedInEntityName?: boolean;
    sequence?: number;
    systemXerceEntitySectionId?: number;
    isActive?: boolean;
  }

  interface ISystemXerceEntityFieldInstance
    extends sequelize.Instance<ISystemXerceEntityFieldAttributes>,
      ISystemXerceEntityFieldAttributes {}

  interface ISystemXerceEntitySectionAttributes {
    id?: number;
    label?: string;
    systemXerceViolationTypeId?: number;
    entityFields?: ISystemXerceEntityFieldAttributes[];
  }

  interface ISystemXerceEntitySectionInstance
    extends sequelize.Instance<ISystemXerceEntitySectionAttributes>,
      ISystemXerceEntitySectionAttributes {
    entityFields?: ISystemXerceEntityFieldInstance[];
    systemXerceViolationType?: ISystemXerceViolationTypeInstance;
  }

  interface ISystemXerceViolationTypeAttributes {
    id?: number;
    label?: string;
    iconId?: number;
    isAvailableForActivation?: boolean;
    isCustom?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface ISystemXerceViolationTypeInstance
    extends sequelize.Instance<ISystemXerceViolationTypeAttributes>,
      ISystemXerceViolationTypeAttributes {
    violationTypeIcon: ISystemIconInstance;
    entitySection: ISystemXerceEntitySectionInstance;
  }

  interface IUserAttributes {
    id?: number;
    agencyId?: number;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    title?: string;
    department?: string;
    isSiteAdmin?: boolean;
    signature?: string;
    signatureFileURL?: string;
    isActive?: boolean;
    isWelcomeEmailSent?: boolean;
    emailToken?: string;
    emailTokenExpiry?: Date;
    xercePermission?: IUserXercePermissionAttributes;
    violationTypePermissions?: IUserXerceViolationTypePermissionAttributes[];
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IUserInstance
    extends sequelize.Instance<IUserAttributes>,
      IUserAttributes {
    xercePermission: IUserXercePermissionInstance;
    violationTypePermissions: IUserXerceViolationTypePermissionInstance[];
  }

  interface IUserXercePermissionAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    userId?: number;
    isActive?: boolean;
    isProductAdmin?: boolean;
    reportAccess?: ReportAccess;
    dashboardAccess?: DashboardAccess;
    feesAccess?: FeesAccess;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IUserXercePermissionInstance
    extends sequelize.Instance<IUserXercePermissionAttributes>,
      IUserXercePermissionAttributes {}

  interface IUserXerceViolationTypePermissionAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    userId?: number;
    configXerceViolationTypeId: number;
    violationTypeAccess: ViolationTypeACL;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IUserXerceViolationTypePermissionInstance
    extends sequelize.Instance<IUserXerceViolationTypePermissionAttributes>,
      IUserXerceViolationTypePermissionAttributes {
    configViolationType?: IConfigXerceViolationTypeInstance;
  }

  interface IXerceCaseAttributes {
    id?: number;
    agencyId?: number;
    caseAssigneeId?: number;
    agencyLocationId?: number;
    caseNumber?: string;
    initiationType?: XerceCaseInitiationType;
    issueDescription?: string;
    status?: XerceCaseStatus;
    abatementStage?: string;
    customCaseFieldValues?: object[];
    customForcedAbatementFieldValues?: object[];
    locationManualFields?: object;
    locationParcelFields?: object;
    isCDBGApproved?: boolean;
    forcedAbatementNoteId?: number;
    forcedAbatementInitiatedBy?: number;
    forcedAbatementInitiatedAt?: Date;
    recommendFA?: boolean;
    hoursLogged?: number;
    createdBy?: number;
    updatedBy?: number;
    closedBy?: number;
    reopenedBy?: number;
    reopenedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    closedAt?: Date;
    isMigratedCase?: boolean;
    migratedCaseURL?: string;
  }

  interface IXerceCaseInstance
    extends sequelize.Instance<IXerceCaseAttributes>,
      IXerceCaseAttributes {
    getCaseContacts: any;
    setCaseContacts: any;
    caseContacts: IXerceCaseContactInstance[];
    caseLocation: IAgencyLocationInstance;
    xerceCaseLocation: IXerceCaseLocationInstance;
    caseAssignee: ICaseUser;
    inspectionAssignee?: ICaseUser;
    closedByUser: ICaseUser;
    createdByUser: ICaseUser;
    caseInspections?: IXerceCaseInspectionInstance[];
    caseViolations?: IXerceCaseViolationInstance[];
    xerceCaseNotices?: IXerceCaseNoticeInstance[];
    xerceCaseAttachments?: IXerceCaseAttachmentInstance[];
    forcedAbatementNote?: IXerceCaseNoteInstance;
    forcedAbatementInitiatedByUser?: IUserInstance;
    xerceCaseForcedAbatementActivities?: IXerceCaseForcedAbatementActivityInstance[];
    xerceCaseStatusActivities?: IXerceCaseStatusActivityInstance[];
  }

  interface IXerceCaseAttachmentAttributes {
    id?: number;
    agencyId?: number;
    xerceCaseId?: number;
    fileMetadataId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }

  interface IXerceCaseAttachmentInstance
    extends sequelize.Instance<IXerceCaseAttachmentAttributes>,
      IXerceCaseAttachmentAttributes {
    fileMetadata: IFileMetadataInstance;
  }

  interface IXerceCaseStatusActivityInstance
    extends sequelize.Instance<IXerceCaseStatusActivityAttributes>,
      IXerceCaseStatusActivityAttributes {
    createdByUser?: IUserInstance;
  }

  interface IXerceCaseStatusActivityAttributes {
    id?: number;
    agencyId?: number;
    xerceCaseId?: number;
    status?: XerceCaseStatus;
    createdBy?: number;
    createdAt?: Date;
  }

  interface IXerceCaseActivityInstance
    extends sequelize.Instance<IXerceCaseActivityAttributes>,
      IXerceCaseActivityAttributes {}

  interface IXerceCaseActivityAttributes {
    id?: number;
    agencyId?: number;
    xerceCaseId?: number;
    activityType?: string;
    activityId?: number;
    staffId?: number;
    description?: string;
    createdAt?: Date;
  }

  interface IXerceCaseViolationAttributes {
    id?: number;
    agencyId?: number;
    xerceCaseId?: number;
    configViolationTypeId?: number;
    configViolationId?: number;
    configDispositionId?: number;
    status?: XerceViolationStatus;
    complyByDate?: Date;
    entity?: object;
    originatedFrom?: XerceViolationOrigin;
    createdBy?: number;
    updatedBy?: number;
    closedBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
    closedAt?: Date;
    deletedAt?: Date;
  }

  interface IXerceCaseHistoryAttributes {
    id?: number;
    agencyId?: number;
    xerceCaseId?: number;
    userId?: number;
    action?: CaseHistoryActions;
    description?: string;
    createdAt?: Date;
  }

  interface IXerceCaseTimeTrackingAttributes {
    id?: number;
    agencyId?: number;
    xerceCaseId?: number;
    userId?: number;
    date?: Date;
    hours?: number;
    createdAt?: Date;
  }

  interface IXerceCaseViolationInstance
    extends sequelize.Instance<IXerceCaseViolationAttributes>,
      IXerceCaseViolationAttributes {
    configViolation?: IConfigXerceViolationInstance;
    createdByUser?: IUserInstance;
    updatedByUser?: IUserInstance;
    closedByUser?: IUserInstance;
    violationType?: IConfigXerceViolationTypeInstance;
    configDisposition?: IConfigDispositionInstance;
  }

  interface IXerceCaseHistoryInstance
    extends sequelize.Instance<IXerceCaseHistoryAttributes>,
      IXerceCaseHistoryAttributes {
    createdByUser: ICaseUser;
  }

  interface IXerceCaseTimeTrackingInstance
    extends sequelize.Instance<IXerceCaseTimeTrackingAttributes>,
      IXerceCaseTimeTrackingAttributes {
    user: ICaseUser;
  }

  interface IXerceCaseForcedAbatementActivityAttributes {
    xerceCaseId: number;
    agencyId: number;
    id?: number;
    configFAAId: number;
    activityFieldsValues: object;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: number;
    updatedBy?: number;
  }

  interface IXerceCaseForcedAbatementActivityInstance
    extends sequelize.Instance<IXerceCaseForcedAbatementActivityAttributes>,
      IXerceCaseForcedAbatementActivityAttributes {}

  interface IXerceCaseInspectionAttributes {
    id?: number;
    agencyId?: number;
    xerceCaseId?: number;
    plannedDate?: Date;
    actualDate?: Date;
    assigneeId?: number;
    noteId?: number;
    attachmentIds?: number[];
    isVerificationInspection?: boolean;
    noticeId?: number;
    isNoNoticeChosen?: boolean;
    status?: InspectionStatus;
    createdBy?: number;
    updatedBy?: number;
    closedBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
    closedAt?: Date;
    deletedAt?: Date;
  }

  interface IXerceCaseInspectionInstance
    extends sequelize.Instance<IXerceCaseInspectionAttributes>,
      IXerceCaseInspectionAttributes {
    note?: IXerceCaseNoteInstance;
    violations?: IXerceCaseInspectionViolationInstance[];
    inspectionAssignee?: ICaseUser;
    createdByUser?: ICaseUser;
    closedByUser?: ICaseUser;
    updatedByUser?: ICaseUser;
    notice?: IXerceCaseNoticeInstance;
    setNote?: any;
  }

  interface IXerceCaseContactAttributes {
    id?: number;
    agencyId?: number;
    xerceCaseId?: number;
    contactId?: number;
    caseContactRoleId?: number;
    isBillable?: boolean;
  }

  interface IXerceCaseContactInstance
    extends sequelize.Instance<IXerceCaseContactAttributes>,
      IXerceCaseContactAttributes {
    contact: IContactInstance;
    caseContactRole: IConfigCaseRoleInstance;
  }

  interface IXerceCaseInspectionAttachmentAttributes {
    id?: number;
    agencyId?: number;
    xerceCaseId?: number;
    inspectionId?: number;
    attachmentId?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface IXerceCaseInspectionAttachmentInstance
    extends sequelize.Instance<IXerceCaseInspectionAttachmentAttributes>,
      IXerceCaseInspectionAttachmentAttributes {}

  interface IXerceCaseInspectionViolationAttributes {
    id?: number;
    agencyId?: number;
    xerceCaseId?: number;
    inspectionId?: number;
    configViolationId?: number;
    caseViolationId?: number;
    status?: XerceViolationStatus;
    complyByDate?: Date;
    configDispositionId?: number;
    closedAt?: Date;
    closedBy?: number;
    createdAt?: Date;
  }

  interface IXerceCaseInspectionViolationInstance
    extends sequelize.Instance<IXerceCaseInspectionViolationAttributes>,
      IXerceCaseInspectionViolationAttributes {}

  interface IXerceCaseNoteAttributes {
    id?: number;
    agencyId?: number;
    xerceCaseId?: number;
    noteContent?: string;
    isCaseNote?: boolean;
    createdBy?: number;
    updatedBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface IXerceCaseNoteInstance
    extends sequelize.Instance<IXerceCaseNoteAttributes>,
      IXerceCaseNoteAttributes {
    createdByUser?: IUserInstance;
    updatedByUser?: IUserInstance;
  }

  interface IXerceCaseNoticeAttributes {
    id?: number;
    agencyId?: number;
    xerceCaseId?: number;
    configNoticeId?: number;
    issuedAt?: Date;
    noticeContent?: object;
    certifiedMailNumber?: string;
    mergedFields?: object;
    noticeNumber?: string;
    noteId?: number;
    createdBy?: number;
    updatedBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface IXerceCaseNoticeInstance
    extends sequelize.Instance<IXerceCaseNoticeAttributes>,
      IXerceCaseNoticeAttributes {
    note?: IXerceCaseNoteInstance;
    setNote?: any;
    createdByUser?: IUserInstance;
    updatedByUser?: IUserInstance;
    configNotice?: IConfigXerceNoticeInstance;
  }

  interface IXerceCaseLocationAttributes {
    id?: number;
    agencyId?: number;
    agencyLocationId?: number;
    xerceCaseId?: number;
    apn?: string;
    assessorAddress?: string;
    isMapPinDropped?: boolean;
  }

  interface IXerceCaseLocationInstance
    extends sequelize.Instance<IXerceCaseLocationAttributes>,
      IXerceCaseLocationAttributes {
    location?: IAgencyLocationInstance;
    countCaseStatus?: number;
  }

  interface IConfigFeeForcedAbatementAttributes {
    id?: number;
    agencyId?: number;
    configForcedAbatementId?: number;
    configFeeId?: number;
  }

  interface IConfigFeeForcedAbatementInstance
    extends sequelize.Instance<IConfigFeeForcedAbatementAttributes>,
      IConfigFeeForcedAbatementAttributes {}

  interface IConfigFeeNoticeAttributes {
    id?: number;
    agencyId?: number;
    xerceId?: number;
    configNoticeId?: number;
    configFeeId?: number;
  }

  interface IConfigFeeNoticeInstance
    extends sequelize.Instance<IConfigFeeNoticeAttributes>,
      IConfigFeeNoticeAttributes {}
}
