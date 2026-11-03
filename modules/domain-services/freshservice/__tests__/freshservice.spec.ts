import * as config from "config";
import fetch from "node-fetch";
import { FreshserviceCatalogOptions } from "graphql-api/server-types.gen";
import { getUserInfo } from "rest-endpoints/mes-security/mes-security-api";
import { createServiceRequest, getGTMCatalogId, FreshserviceServiceRequest } from "../freshservice";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("rest-endpoints/mes-security/mes-security-api", () => ({
  getUserInfo: vi.fn(),
}));

vi.mock("node-fetch", () => ({
  default: vi.fn(),
}));

const oldEnv = { ...process.env };

const fetchMock = fetch as unknown as Mock;
const getUserInfoMock = getUserInfo as unknown as Mock;

type MockedUser = {
  userId: string;
  emailAddress: string;
};

const mockUsers: Record<string, MockedUser> = {
  "patrick.star": {
    userId: "patrick.star",
    emailAddress: "patrick.star@gentex.com",
  },
  "bill.brasky": {
    userId: "bill.brasky",
    emailAddress: "bill.brasky@gentex.com",
  },
};

function resetEnv() {
  process.env = { ...oldEnv };
}

function mockFetchResponse(
  overrides: Partial<{
    ok: boolean;
    status: number;
    statusText: string;
    json: () => Promise<any>;
  }> = {}
) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => ({}),
    ...overrides,
  });
}

function mockFieldErrors(...fieldMessages: Array<[string, string]>) {
  mockFetchResponse({
    ok: false,
    status: 400,
    statusText: "Bad Request",
    json: async () => ({
      errors: fieldMessages.map(([field, message]) => ({ field, message })),
    }),
  });
}

function toFreshserviceApiResponse(ticket: FreshserviceServiceRequest) {
  return {
    subject: ticket.subject,
    group_id: ticket.groupId,
    department_id: ticket.departmentId,
    category: ticket.category,
    sub_category: ticket.subCategory,
    item_category: ticket.itemCategory,
    requester_id: ticket.requesterId,
    responder_id: ticket.responderId,
    due_by: ticket.dueBy,
    fr_escalated: ticket.frEscalated,
    deleted: ticket.deleted,
    spam: ticket.spam,
    email_config_id: ticket.emailConfigId,
    fwd_emails: ticket.fwdEmails,
    reply_cc_emails: ticket.replyCCEmails,
    cc_emails: ticket.ccEmails,
    is_escalated: ticket.isEscalated,
    fr_due_by: ticket.frDueBy,
    created_at: ticket.createdAt,
    updated_at: ticket.updatedAt,
    status: ticket.status,
    source: ticket.source,
    priority: ticket.priority,
    urgency: ticket.urgency,
    impact: ticket.impact,
    sla_policy_id: ticket.slaPolicyId,
    workspace_id: ticket.workspaceId,
    id: ticket.id,
    type: ticket.type,
    description: ticket.description,
    description_text: ticket.descriptionText,
    to_emails: ticket.toEmails,
    approval_status: ticket.approvalStatus,
    approval_status_name: ticket.approvalStatusName,
    created_by: ticket.createdBy,
    custom_fields: ticket.customFields,
    attachments: ticket.attachments.map((attachment) => ({
      content_type: attachment.contentType,
      size: attachment.size,
      name: attachment.name,
      attachment_url: attachment.attachmentUrl,
      created_at: attachment.createdAt,
      updated_at: attachment.updatedAt,
    })),
  };
}

function mockSuccessfulTicket(ticket: FreshserviceServiceRequest) {
  mockFetchResponse({
    ok: true,
    json: async () => ({
      service_request: toFreshserviceApiResponse(ticket),
    }),
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  getUserInfoMock.mockReset();
  getUserInfoMock.mockImplementation(async (userId: string) => mockUsers[userId]);
});

describe("test Freshservice domain service functions invalid catalog id", () => {
  beforeAll(() => {
    process.env.FRESHSERVICE_SOFTWARE_CATALOG_ID = undefined;
    process.env.FRESHSERVICE_ELECTRICAL_CATALOG_ID = undefined;
    process.env.FRESHSERVICE_VISION_CATALOG_ID = undefined;
  });
  afterAll(resetEnv);

  describe("createServiceRequest", () => {
    it("returns undefined for an invalid software catalog id", () => {
      expect(getGTMCatalogId(FreshserviceCatalogOptions.Software)).toBeUndefined();
    });
    it("returns undefined for an invalid electrical catalog id", () => {
      expect(getGTMCatalogId(FreshserviceCatalogOptions.Electrical)).toBeUndefined();
    });
    it("returns undefined for an invalid vision catalog id", () => {
      expect(getGTMCatalogId(FreshserviceCatalogOptions.Vision)).toBeUndefined();
    });
  });
});

describe("test Freshservice domain service functions valid catalog id", () => {
  beforeAll(() => {
    process.env.FRESHSERVICE_SOFTWARE_CATALOG_ID = "123";
    process.env.FRESHSERVICE_ELECTRICAL_CATALOG_ID = "124";
    process.env.FRESHSERVICE_VISION_CATALOG_ID = "125";
  });
  afterAll(resetEnv);

  describe("createServiceRequest", () => {
    it("returns valid software catalog id", () => {
      expect(getGTMCatalogId(FreshserviceCatalogOptions.Software)).toEqual(123);
    });
    it("returns valid electrical catalog id", () => {
      expect(getGTMCatalogId(FreshserviceCatalogOptions.Electrical)).toEqual(124);
    });
    it("returns valid vision catalog id", () => {
      expect(getGTMCatalogId(FreshserviceCatalogOptions.Vision)).toEqual(125);
    });
  });
});

describe("test Freshservice domain service functions unprovided API key", () => {
  beforeAll(() => {
    process.env.FRESHSERVICE_API_KEY = undefined;
  });
  afterAll(resetEnv);

  describe("createServiceRequest", () => {
    it("throws an error due to no API key provided", async () => {
      mockFetchResponse({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({ message: "No API key provided" }),
      });

      await expect(
        createServiceRequest(
          214,
          {
            userId: "patrick.star",
          },
          {}
        )
      ).rejects.toThrowError("No Freshservice API Key found in request");
    });
  });
});

describe("test Freshservice domain service functions invalid API key", () => {
  beforeAll(() => {
    process.env.FRESHSERVICE_API_KEY = "ApeEscape";
  });
  afterAll(resetEnv);

  describe("createServiceRequest", () => {
    it("throws an error due to an invalid API key", async () => {
      mockFetchResponse({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({ message: "Invalid authentication" }),
      });

      await expect(
        createServiceRequest(
          214,
          {
            userId: "patrick.star",
          },
          {}
        )
      ).rejects.toThrowError("Invalid Freshservice API Key");
    });
  });
});

describe("test Freshservice domain service functions valid API key", () => {
  beforeAll(() => {
    process.env.FRESHSERVICE_API_KEY = config.get("freshservice.apiKey") as string;
  });
  afterAll(resetEnv);

  describe("createServiceRequest", () => {
    it("throws an error due to an invalid catalog ID", async () => {
      await expect(createServiceRequest(-1, { userId: "patrick.star" }, {})).rejects.toThrowError(
        `'Catalog Id' field must be a positive integer.`
      );
      await expect(createServiceRequest(0, { userId: "patrick.star" }, {})).rejects.toThrowError(
        `'Catalog Id' field must be a positive integer.`
      );
    });

    it("throws an error due to an invalid user", async () => {
      await expect(
        createServiceRequest(
          214,
          { userId: "morty.smith" },
          { summary: "This is a summary.", details: "These are details." }
        )
      ).rejects.toThrowError(`User "morty.smith" does not exist or cannot create a service request.`);
    });

    it("throws an error due to an invalid catalog id", async () => {
      mockFetchResponse({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => {
          throw new Error("Unexpected token");
        },
      });

      await expect(
        createServiceRequest(
          1,
          { userId: "patrick.star" },
          { summary: "This is a summary.", details: "These are details." }
        )
      ).rejects.toThrowError(`Invalid Catalog Id 1.`);
    });

    it("throws errors due to invalid field values", async () => {
      mockFieldErrors(["summary", "The value provided is of type Integer.It should be of type String"]);
      await expect(
        createServiceRequest(214, { userId: "patrick.star" }, { summary: 3, details: "These are details." })
      ).rejects.toThrowError(`summary: The value provided is of type Integer.It should be of type String`);

      mockFieldErrors(["details", "The value provided is of type Integer.It should be of type String"]);
      await expect(
        createServiceRequest(214, { userId: "patrick.star" }, { summary: "This is a summary.", details: 2 })
      ).rejects.toThrowError(`details: The value provided is of type Integer.It should be of type String`);

      mockFieldErrors(
        ["summary", "The value provided is of type Integer.It should be of type String"],
        ["details", "The value provided is of type Integer.It should be of type String"]
      );
      await expect(
        createServiceRequest(214, { userId: "patrick.star" }, { summary: 3, details: 2 })
      ).rejects.toThrowError(
        `summary: The value provided is of type Integer.It should be of type String, details: The value provided is of type Integer.It should be of type String`
      );

      mockFieldErrors(["prop", "Unexpected/invalid field in request"]);
      await expect(
        createServiceRequest(214, { userId: "patrick.star" }, { summary: 3, details: 2, prop: "extra value" })
      ).rejects.toThrowError(`prop: Unexpected/invalid field in request`);

      mockFieldErrors(["sum", "Unexpected/invalid field in request"]);
      await expect(
        createServiceRequest(
          214,
          { userId: "patrick.star" },
          { sum: "This is a summary.", details: "These are details." }
        )
      ).rejects.toThrowError(`sum: Unexpected/invalid field in request`);

      mockFieldErrors(["dets", "Unexpected/invalid field in request"]);
      await expect(
        createServiceRequest(
          214,
          { userId: "patrick.star" },
          { summary: "This is a summary.", dets: "These are details." }
        )
      ).rejects.toThrowError(`dets: Unexpected/invalid field in request`);

      mockFieldErrors(["sum", "Unexpected/invalid field in request"], ["dets", "Unexpected/invalid field in request"]);
      await expect(
        createServiceRequest(214, { userId: "patrick.star" }, { sum: "This is a summary.", dets: "These are details." })
      ).rejects.toThrowError(`sum: Unexpected/invalid field in request, dets: Unexpected/invalid field in request`);

      mockFieldErrors(
        ["Summary", "Unexpected/invalid field in request"],
        ["Details", "Unexpected/invalid field in request"]
      );
      await expect(
        createServiceRequest(
          214,
          { userId: "patrick.star" },
          { Summary: "This is a summary.", Details: "These are details." }
        )
      ).rejects.toThrowError(
        `Summary: Unexpected/invalid field in request, Details: Unexpected/invalid field in request`
      );

      mockFieldErrors(["prop", "Unexpected/invalid field in request"]);
      await expect(
        createServiceRequest(
          214,
          { userId: "patrick.star" },
          {
            summary: "This is a summary.",
            details: "These are details.",
            application_software: "Test Plan Editor (TPE)",
            prop: "extra value",
          }
        )
      ).rejects.toThrowError(`prop: Unexpected/invalid field in request`);
    });

    it("successfully creates a new Freshservice ticket", async () => {
      const patrickTicket = {
        subject: "Request for Patrick Star : GTM Core Software Support",
        groupId: null,
        departmentId: 23000042069,
        category: null,
        subCategory: null,
        itemCategory: null,
        requesterId: 69000069420,
        responderId: null,
        dueBy: "2024-05-17T15:00:00Z",
        frEscalated: false,
        deleted: false,
        spam: false,
        emailConfigId: null,
        fwdEmails: [],
        replyCCEmails: [],
        ccEmails: [],
        isEscalated: false,
        frDueBy: "2024-05-16T15:00:00Z",
        createdAt: "2024-05-14T15:00:00Z",
        updatedAt: "2024-05-14T15:00:00Z",
        status: 2,
        source: 2,
        priority: 2,
        urgency: 1,
        impact: 1,
        slaPolicyId: 23000012067,
        workspaceId: 3,
        id: 31415,
        type: "Request",
        description: "",
        descriptionText: "",
        toEmails: null,
        approvalStatus: "not_requested",
        approvalStatusName: "Not Requested",
        createdBy: 69000069420,
        customFields: {},
        attachments: [],
      };
      const billTicket = {
        ...patrickTicket,
        subject: "Request for Bill Brasky : GTM Core Software Support",
        requesterId: 69000096024,
        createdBy: 69000096024,
      };

      mockSuccessfulTicket(patrickTicket);
      mockSuccessfulTicket(billTicket);

      const ticketResponse1 = await createServiceRequest(
        214,
        {
          userId: "patrick.star",
        },
        {
          summary: "Summary of the problem.",
          details: "Details about the issue.",
          application_software: "Test Plan Editor (TPE)",
        }
      );
      const ticketResponse2 = await createServiceRequest(
        214,
        {
          userId: "bill.brasky",
        },
        {
          summary: "Title of the problem I am having...",
          details: "Detailed description of the problem...",
          application_software: "Test Plan Editor (TPE)",
        }
      );
      expect(ticketResponse1).toBeDefined();
      expect(ticketResponse1).toEqual(patrickTicket);
      expect(ticketResponse2).toBeDefined();
      expect(ticketResponse2).toEqual(billTicket);
    });
  });
});
