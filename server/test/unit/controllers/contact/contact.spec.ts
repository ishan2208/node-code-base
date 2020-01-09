import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import {
  create,
  edit,
  get,
  getAll,
  getDuplicateContacts,
  getList,
  getSuggestedContacts,
} from '../../../../api/controllers/contact/contact';
import { AppError } from '../../../../api/errors';
import ContactService from '../../../../api/service/contact/contact';

describe('Contact Controller: Edit Contact Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 3;
  const contactId = 4;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId: 1,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
    agencyTimezone: 'America/Los_Angeles',
    scopes: {
      superAdmin: true,
      xerce: {
        id: 1,
        productAdmin: true,
        reportAccess: ReportAccess.ALL_STAFF,
        dashboardAccess: DashboardAccess.ALL_STAFF_DASHBOARD,
        feesAccess: FeesAccess.CAN_VOID,
        violationTypeScope: {
          1: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          2: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          3: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          4: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  let response;
  let responseBody;
  let request;
  let requestBody;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = {
      id: contactId,
      name: 'john Doe',
      email: 'john@doe.com',
      contactType: 'INDIVIDUAL',
      isVendor: true,
      isGisPopulated: false,
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      contactCustomFieldValues: null,
      associatedContacts: [
        {
          id: 2,
          name: 'Janet Doe',
          email: 'janet@doe.com',
          contactType: 'LEGAL_ENTITY',
          isVendor: false,
          isGisPopulated: true,
          workPhone: '+9198765456',
          cellPhone: '+9198765456',
          streetAddress: '545,Alabama',
          city: 'Alabama',
          state: 'AL',
          zip: '94016',
          isPrimary: false,
        },
      ],
    };

    requestBody = {
      name: 'john Doe',
      contactType: 'INDIVIDUAL',
      isVendor: true,
      isGisPopulated: false,
      email: 'john@doe.com',
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      contactCustomFieldValues: {},
      associatedContacts: [
        {
          id: 2,
          isPrimary: false,
        },
      ],
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/contacts/4',
      swagger: {
        params: {
          contactId: {
            value: contactId,
          },
          body: {
            value: requestBody,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while editing billable contact';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(ContactService.prototype, 'edit')
      .withArgs(agencyId, contactId, requestBody)
      .returns(Object.assign({}, responseBody));

    await edit(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(ContactService.prototype, 'edit')
      .withArgs(agencyId, contactId, requestBody)
      .throws(
        new AppError('Error occurred while editing billable contact', 400)
      );

    await edit(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('Contact Controller: Create Contact Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 3;
  const contactId = 4;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId: 1,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
    agencyTimezone: 'America/Los_Angeles',
    scopes: {
      superAdmin: true,
      xerce: {
        id: 1,
        productAdmin: true,
        reportAccess: ReportAccess.ALL_STAFF,
        dashboardAccess: DashboardAccess.ALL_STAFF_DASHBOARD,
        feesAccess: FeesAccess.CAN_VOID,
        violationTypeScope: {
          1: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          2: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          3: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          4: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  let response;
  let responseBody;
  let request;
  let requestBody;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = {
      id: contactId,
      name: 'john Doe',
      email: 'john@doe.com',
      contactType: 'INDIVIDUAL',
      isVendor: true,
      isGisPopulated: false,
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      contactCustomFieldValues: null,
      associatedContacts: [
        {
          id: 2,
          name: 'Janet Doe',
          email: 'janet@doe.com',
          contactType: 'LEGAL_ENTITY',
          isVendor: false,
          isGisPopulated: true,
          workPhone: '+9198765456',
          cellPhone: '+9198765456',
          streetAddress: '545,Alabama',
          city: 'Alabama',
          state: 'AL',
          zip: '94016',
          isPrimary: false,
        },
      ],
    };

    requestBody = {
      name: 'john Doe',
      contactType: 'INDIVIDUAL',
      isVendor: true,
      isGisPopulated: false,
      email: 'john@doe.com',
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      contactCustomFieldValues: {},
      associatedContacts: [
        {
          id: 2,
          isPrimary: false,
        },
      ],
    };

    request = httpMocks.createRequest({
      method: 'POST',
      url: '/contacts',
      swagger: {
        params: {
          body: {
            value: requestBody,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while creating contact';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(ContactService.prototype, 'create')
      .withArgs(agencyId, requestBody)
      .returns(Object.assign({}, responseBody));

    await create(request, response);

    expect(response.statusCode).to.equal(201);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(ContactService.prototype, 'create')
      .withArgs(agencyId, requestBody)
      .throws(new AppError('Error occurred while creating contact', 400));

    await create(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('Contact Controller: GetAll Contact Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 3;
  const contactId = 4;
  const contactType = ContactType.INDIVIDUAL;
  const searchString = 'john';
  const location = 'Alabama';
  const excludeContactIds = [1, 2, 3];
  const limit = 1;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId: 1,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
    agencyTimezone: 'America/Los_Angeles',
    scopes: {
      superAdmin: true,
      xerce: {
        id: 1,
        productAdmin: true,
        reportAccess: ReportAccess.ALL_STAFF,
        dashboardAccess: DashboardAccess.ALL_STAFF_DASHBOARD,
        feesAccess: FeesAccess.CAN_VOID,
        violationTypeScope: {
          1: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          2: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          3: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          4: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  let response;
  let responseBody;
  let request;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = [
      {
        id: contactId,
        name: 'john Doe',
        email: 'john@doe.com',
        contactType: 'INDIVIDUAL',
        isVendor: true,
        isGisPopulated: false,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: 'blue',
        contactCustomFieldValues: null,
        associatedContacts: [
          {
            id: 2,
            name: 'Janet Doe',
            email: 'janet@doe.com',
            contactType: 'LEGAL_ENTITY',
            isVendor: false,
            isGisPopulated: true,
            workPhone: '+9198765456',
            cellPhone: '+9198765456',
            streetAddress: '545,Alabama',
            city: 'Alabama',
            state: 'AL',
            zip: '94016',
            isPrimary: false,
          },
        ],
      },
    ];

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/contacts',
      swagger: {
        params: {
          type: {
            value: contactType,
          },
          q: {
            value: searchString,
          },
          location: {
            value: location,
          },
          excludeContactIds: {
            value: excludeContactIds,
          },
          limit: {
            value: limit,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while fetching all contacts';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(ContactService.prototype, 'getAll')
      .withArgs(
        agencyId,
        contactType,
        searchString,
        location,
        excludeContactIds,
        limit
      )
      .returns([...responseBody]);

    await getAll(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(ContactService.prototype, 'getAll')
      .withArgs(
        agencyId,
        contactType,
        searchString,
        location,
        excludeContactIds,
        limit
      )
      .throws(new AppError('Error occurred while fetching all contacts', 400));

    await getAll(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('Contact Controller: getDuplicateContacts Contact Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 3;
  const contactId = 4;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId: 1,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
    agencyTimezone: 'America/Los_Angeles',
    scopes: {
      superAdmin: true,
      xerce: {
        id: 1,
        productAdmin: true,
        reportAccess: ReportAccess.ALL_STAFF,
        dashboardAccess: DashboardAccess.ALL_STAFF_DASHBOARD,
        feesAccess: FeesAccess.CAN_VOID,
        violationTypeScope: {
          1: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          2: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          3: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          4: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  let response;
  let requestBody;
  let responseBody;
  let request;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = [
      {
        id: contactId,
        name: 'john Doe',
        email: 'john@doe.com',
        contactType: 'INDIVIDUAL',
        isVendor: true,
        isGisPopulated: false,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: 'blue',
        contactCustomFieldValues: null,
        associatedContacts: [
          {
            id: 2,
            name: 'Janet Doe',
            email: 'janet@doe.com',
            contactType: 'LEGAL_ENTITY',
            isVendor: false,
            isGisPopulated: true,
            workPhone: '+9198765456',
            cellPhone: '+9198765456',
            streetAddress: '545,Alabama',
            city: 'Alabama',
            state: 'AL',
            zip: '94016',
            isPrimary: false,
          },
        ],
      },
    ];

    requestBody = {
      name: 'john Doe',
      contactType: 'INDIVIDUAL',
      isVendor: true,
      isGisPopulated: false,
      email: 'john@doe.com',
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      contactCustomFieldValues: {},
      associatedContacts: [
        {
          id: 2,
          isPrimary: false,
        },
      ],
    };

    request = httpMocks.createRequest({
      method: 'POST',
      url: '/xerce/contacts/duplicates',
      swagger: {
        params: {
          body: {
            value: requestBody,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while fetching duplicate contacts';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(ContactService.prototype, 'getDuplicateContacts')
      .withArgs(agencyId, requestBody)
      .returns([...responseBody]);

    await getDuplicateContacts(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(ContactService.prototype, 'getDuplicateContacts')
      .withArgs(agencyId, requestBody)
      .throws(
        new AppError('Error occurred while fetching duplicate contacts', 400)
      );

    await getDuplicateContacts(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('Contact Controller: GetSuggestedContacts Contact Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 3;
  const contactId = 4;
  const location = 'Alabama';

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId: 1,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
    agencyTimezone: 'America/Los_Angeles',
    scopes: {
      superAdmin: true,
      xerce: {
        id: 1,
        productAdmin: true,
        reportAccess: ReportAccess.ALL_STAFF,
        dashboardAccess: DashboardAccess.ALL_STAFF_DASHBOARD,
        feesAccess: FeesAccess.CAN_VOID,
        violationTypeScope: {
          1: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          2: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          3: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          4: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  let response;
  let responseBody;
  let request;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = [
      {
        id: contactId,
        name: 'john Doe',
        email: 'john@doe.com',
        contactType: 'INDIVIDUAL',
        isVendor: true,
        isGisPopulated: false,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: 'blue',
        contactCustomFieldValues: null,
        associatedContacts: [
          {
            id: 2,
            name: 'Janet Doe',
            email: 'janet@doe.com',
            contactType: 'LEGAL_ENTITY',
            isVendor: false,
            isGisPopulated: true,
            workPhone: '+9198765456',
            cellPhone: '+9198765456',
            streetAddress: '545,Alabama',
            city: 'Alabama',
            state: 'AL',
            zip: '94016',
            isPrimary: false,
          },
        ],
      },
    ];

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/contacts/suggestions',
      swagger: {
        params: {
          location: {
            value: location,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while fetching all contacts';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(ContactService.prototype, 'getSuggestedContacts')
      .withArgs(agencyId, location)
      .returns([...responseBody]);

    await getSuggestedContacts(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(ContactService.prototype, 'getSuggestedContacts')
      .withArgs(agencyId, location)
      .throws(new AppError('Error occurred while fetching all contacts', 400));

    await getSuggestedContacts(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('Contact Controller: Get Contact Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 3;
  const contactId = 4;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId: 1,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
    agencyTimezone: 'America/Los_Angeles',
    scopes: {
      superAdmin: true,
      xerce: {
        id: 1,
        productAdmin: true,
        reportAccess: ReportAccess.ALL_STAFF,
        dashboardAccess: DashboardAccess.ALL_STAFF_DASHBOARD,
        feesAccess: FeesAccess.CAN_VOID,
        violationTypeScope: {
          1: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          2: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          3: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          4: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  let response;
  let responseBody;
  let request;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = {
      id: contactId,
      name: 'john Doe',
      email: 'john@doe.com',
      contactType: 'INDIVIDUAL',
      isVendor: true,
      isGisPopulated: false,
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      contactCustomFieldValues: null,
      associatedContacts: [
        {
          id: 2,
          name: 'Janet Doe',
          email: 'janet@doe.com',
          contactType: 'LEGAL_ENTITY',
          isVendor: false,
          isGisPopulated: true,
          workPhone: '+9198765456',
          cellPhone: '+9198765456',
          streetAddress: '545,Alabama',
          city: 'Alabama',
          state: 'AL',
          zip: '94016',
          isPrimary: false,
        },
      ],
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/contacts/4',
      swagger: {
        params: {
          contactId: {
            value: contactId,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while fetching contact';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(ContactService.prototype, 'get')
      .withArgs(agencyId, contactId)
      .returns(Object.assign({}, responseBody));

    await get(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(ContactService.prototype, 'get')
      .withArgs(agencyId, contactId)
      .throws(new AppError('Error occurred while fetching contact', 400));

    await get(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('Contact Controller: GetList Contact Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 3;
  const selectedcontactId = 2;
  const selectedContactIds = [selectedcontactId];
  const contactId = 4;
  const contactType = ContactType.INDIVIDUAL;
  const searchString = 'john';
  const limit = 1;
  const offset = 0;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId: 1,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
    agencyTimezone: 'America/Los_Angeles',
    scopes: {
      superAdmin: true,
      xerce: {
        id: 1,
        productAdmin: true,
        reportAccess: ReportAccess.ALL_STAFF,
        dashboardAccess: DashboardAccess.ALL_STAFF_DASHBOARD,
        feesAccess: FeesAccess.CAN_VOID,
        violationTypeScope: {
          1: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          2: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          3: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          4: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  let response;
  let responseBody: IContactListResponse;
  let request;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    responseBody = {
      count: 1,
      data: [
        {
          id: contactId,
          name: 'john Doe',
          contactType,
        },
      ],
      selectedContacts: [
        {
          id: selectedcontactId,
          name: 'john Doe 2',
          contactType,
        },
      ],
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/contacts/list',
      swagger: {
        params: {
          q: {
            value: searchString,
          },
          limit: {
            value: limit,
          },
          offset: {
            value: offset,
          },
          selectedContactIds: {
            value: selectedContactIds,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact list', async () => {
    sandbox
      .stub(ContactService.prototype, 'getList')
      .withArgs(agencyId)
      .returns({ ...responseBody });

    await getList(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });
});
