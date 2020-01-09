// Comcate Admin interfaces
declare interface IComcateAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

declare interface IComcateAdmin {
  email: string;
  id: number;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

declare interface IComcateAdminClaim {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  scopes: {
    comcateAdmin: boolean;
  };
}

// Agency Interfaces
declare interface IAgencyList extends IPagination {
  data: IAgencySummary[];
}

declare interface IAgencySummary {
  id: number;
  name: string;
  createdBy: string;
  totalCases: number;
  totalEntities: number;
  status: ObjectStatus;
  loginUrl: string;
  createdAt: Date;
}

// Agency Configuration interface
declare interface IAgencyConfigurationRequest {
  name: string;
  websiteURL: string;
  agencyTimezone: AgencyTimezone;
  email?: string;
  whitelistURL?: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  xerce?: IXerceRequest;
}

declare interface IAgencyConfigurationEditRequest {
  name?: string;
  websiteURL?: string;
  agencyTimezone?: AgencyTimezone;
  email?: string;
  whitelistURL?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  xerce?: IXerceRequest;
}

declare interface IAgencyConfiguration {
  id: number;
  name: string;
  websiteURL: string;
  email: string;
  agencyTimezone: AgencyTimezone;
  isActive: boolean;
  hasParcelLayer: boolean;
  whitelistURL: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  xerce: IXerce;
}

declare interface IXerceConfigurations {
  caseCustomTiles: ICaseCustomTile[];
  dispositions: IConfigDisposition[];
  mapConfig: IMapConfig;
  entitySections: IConfigXerceEntitySection[];
  caseRoles: ICaseRole[];
  contactCustomFields: IConfigContactCustomField[];
  locationCustomFields: ILocationField[];
  notices: IConfigXerceNotice[];
  agencyLogoURL: string;
  forcedAbatementActivities: IConfigForcedAbatementActivity[];
  users: IUser[];
}

declare interface IActiveAgencyList {
  agencies: IActiveAgency[];
}

declare interface IActiveAgency {
  id: number;
  name: string;
}

// Config Entity section interfaces
declare interface IConfigXerceEntitySectionRequest {
  label: string;
  isActive: boolean;
  configXerceViolationTypeId: number;
  entityFields: IConfigXerceEntityFieldRequest[];
  isCustom: boolean;
}

declare interface IConfigXerceEntitySectionEditRequest {
  label?: string;
  isActive?: boolean;
  existingEntityFields?: IConfigXerceEntityFieldEditRequest[];
  newEntityFields?: IConfigXerceEntityFieldRequest[];
}

declare interface IConfigXerceEntitySection {
  id: number;
  label: string;
  isActive: boolean;
  configXerceViolationType: IConfigXerceViolationType;
  entityFields: IConfigXerceEntityField[];
  isCustom: boolean;
}

// Config Entity Field interfaces
declare interface IConfigXerceEntityFieldRequest {
  label: string;
  isActive: boolean;
  type: CustomFieldType;
  options: string[];
  isMergeField: boolean;
  isIncludedInEntityName: boolean;
  sequence: number;
}

declare interface IConfigXerceEntityFieldEditRequest {
  id: number;
  label?: string;
  isActive?: boolean;
  type?: CustomFieldType;
  options?: string[];
  isMergeField?: boolean;
  isIncludedInEntityName?: boolean;
  sequence?: number;
}

declare interface IConfigXerceEntityField {
  id: number;
  label: string;
  isActive: boolean;
  type: CustomFieldType;
  options: string[];
  isMergeField: boolean;
  isIncludedInEntityName: boolean;
  sequence: number;
}

// System Icon interfaces
declare interface ISystemIconRequest {
  fileUrl: string;
}

declare interface ISystemIcon {
  id: number;
  fileUrl: string;
  isAvailableForUse: boolean;
}

// System Xerce Entity Field interfaces
declare interface ISystemXerceEntityFieldRequest {
  label: string;
  isActive: boolean;
  isMergeField: boolean;
  isIncludedInEntityName: boolean;
  type: CustomFieldType;
  options?: string[];
  sequence: number;
}

declare interface ISystemXerceEntityField {
  id: number;
  label: string;
  isActive: boolean;
  isMergeField: boolean;
  isIncludedInEntityName: boolean;
  type: CustomFieldType;
  options: string[];
  sequence: number;
}

// System Xerce Entity Section interfaces

declare interface ISystemXerceEntitySectionRequest {
  label: string;
  systemXerceViolationTypeId: number;
  systemXerceEntityFields: ISystemXerceEntityFieldRequest[];
}

declare interface ISystemXerceEntitySection {
  id: number;
  label: string;
  systemXerceViolationType: ISystemXerceViolationType;
  systemXerceEntityFields: ISystemXerceEntityFieldRequest[];
}

// System Xerce Violation Type interfaces

declare interface ISystemXerceViolationTypeRequest {
  label: string;
  iconId: number;
  isAvailableForActivation: boolean;
  isCustom: boolean;
}

declare interface ISystemXerceViolationTypeEditRequest {
  label?: string;
  iconId?: number;
}

declare interface ISystemXerceViolationType {
  id: number;
  label: string;
  iconUrl: string;
  isAvailableForActivation: boolean;
  isCustom: boolean;
  associatedEntitySectionName: string;
}
