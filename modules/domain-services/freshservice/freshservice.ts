import fetch from "node-fetch";
import config from "config";
import { UserIdWhereInput } from "graphql-api/server-types.gen";
import { getUserInfo } from "rest-endpoints/mes-security/mes-security-api";
import { FreshserviceCatalogOptions } from "graphql-api/server-types.gen";

/// These Types are based exactly on Freshservice ticket attributes from the official documentation.
/// Documentation: https://api.freshservice.com/#ticket_attributes

export type FreshserviceAttachment = {
  contentType: string;
  size: number;
  name: string;
  attachmentUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type FreshserviceServiceRequest = {
  subject: string;
  groupId: number | null;
  departmentId: number | null;
  category: string | null;
  subCategory: string | null;
  itemCategory: string | null;
  requesterId: number;
  responderId: number | null;
  dueBy: string;
  frEscalated: boolean;
  deleted: boolean;
  spam: boolean;
  emailConfigId: number | null;
  fwdEmails: string[];
  replyCCEmails: string[];
  ccEmails: string[];
  isEscalated: boolean;
  frDueBy: string;
  createdAt: string;
  updatedAt: string;
  status: number;
  source: number;
  priority: number;
  urgency: number | null;
  impact: number | null;
  slaPolicyId: number | null;
  workspaceId: number;
  id: number;
  type: string;
  description: string;
  descriptionText: string;
  toEmails: string[] | null;
  approvalStatus: string | null;
  approvalStatusName: string | null;
  createdBy: number | null;
  customFields: { [k: string]: any };
  attachments: FreshserviceAttachment[];
};

export type FreshserviceRequestFields = {
  [k: string]: any;
};

function getApiKey() {
  return process.env.NODE_ENV === "test"
    ? String(process.env.FRESHSERVICE_API_KEY)
    : config.get<string>("freshservice.apiKey");
}

function formatErrorMessage(message: string) {
  if (message.toLowerCase().includes("no api key")) {
    return "No Freshservice API Key found in request";
  }
  if (message.toLowerCase().includes("invalid authentication")) {
    return "Invalid Freshservice API Key";
  }
  return message;
}

function freshserviceServiceRequestFromJson(data: any) {
  const attachments: FreshserviceAttachment[] = data["attachments"].map((x: any) => {
    return {
      contentType: x["content_type"],
      size: +x["size"],
      name: x["name"],
      attachmentUrl: x["attachment_url"],
      createdAt: x["created_at"],
      updatedAt: x["updated_at"],
    } as FreshserviceAttachment;
  });
  const serviceRequest: FreshserviceServiceRequest = {
    subject: data["subject"],
    groupId: data["group_id"] !== null && !Number.isNaN(+data["group_id"]) ? +data["group_id"] : null,
    departmentId: data["department_id"],
    category: data["category"],
    subCategory: data["sub_category"],
    itemCategory: data["item_category"],
    requesterId: +data["requester_id"],
    responderId: data["responder_id"] !== null && !Number.isNaN(+data["responder_id"]) ? +data["responder_id"] : null,
    dueBy: data["due_by"],
    frEscalated: data["fr_escalated"],
    deleted: data["deleted"] ?? false,
    spam: data["spam"],
    emailConfigId:
      data["email_config_id"] !== null && !Number.isNaN(+data["email_config_id"]) ? +data["email_config_id"] : null,
    fwdEmails: data["fwd_emails"],
    replyCCEmails: data["reply_cc_emails"],
    ccEmails: data["cc_emails"],
    isEscalated: data["is_escalated"],
    frDueBy: data["fr_due_by"],
    createdAt: data["created_at"],
    updatedAt: data["updated_at"],
    status: +data["status"],
    source: +data["source"],
    priority: +data["priority"],
    urgency: !Number.isNaN(+data["urgency"]) ? +data["urgency"] : null,
    impact: !Number.isNaN(+data["impact"]) ? +data["impact"] : null,
    slaPolicyId: data["sla_policy_id"] ?? null,
    workspaceId: +data["workspace_id"],
    id: +data["id"],
    type: data["type"],
    description: data["description"],
    descriptionText: data["description_text"],
    toEmails: data["to_emails"] ?? null,
    approvalStatus: data["approval_status"] ?? null,
    approvalStatusName: data["approval_status_name"] ?? null,
    createdBy: !Number.isNaN(+data["created_by"]) ? +data["created_by"] : null,
    customFields: data["custom_fields"],
    attachments: attachments,
  };
  return serviceRequest;
}

export async function createServiceRequest(
  catalogId: number,
  where: UserIdWhereInput,
  fields: FreshserviceRequestFields
): Promise<FreshserviceServiceRequest | undefined> {
  try {
    if (catalogId < 1) {
      throw new Error(`'Catalog Id' field must be a positive integer.`);
    }
    const userInfo = await getUserInfo(where.userId);
    if (!userInfo || !userInfo.emailAddress) {
      throw new Error(`User "${where.userId}" does not exist or cannot create a service request.`);
    }
    const apiKey = getApiKey();
    const endpoint = config.get<string>("freshservice.endpoint");
    const url = endpoint + `servicerequests/${catalogId}/place_request`;
    const body = JSON.stringify({
      email: userInfo.emailAddress,
      custom_fields: fields,
      quantity: 1,
    });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        KeyId: apiKey,
      },
      body: body,
    });
    let jsonResponse;
    if (!response.ok) {
      try {
        jsonResponse = await response.json();
        if (jsonResponse.message) {
          const message = formatErrorMessage(jsonResponse.message);
          console.error("[Freshservice] Request failed with message:", message);
          return Promise.reject(new Error(message));
        } else if (jsonResponse.errors && jsonResponse.errors.length > 0) {
          const errorMsg = jsonResponse.errors.map((error: any) => `${error.field}: ${error.message}`).join(", ");
          console.error("[Freshservice] Request failed with errors:", errorMsg);
          const error = new Error(errorMsg ?? response.statusText);
          return Promise.reject(error);
        }
      } catch (parseError) {
        console.warn(
          "[Freshservice] Failed to parse error response JSON:",
          parseError instanceof Error ? parseError.message : String(parseError)
        );
        if (response.statusText === "Not Found") {
          throw new Error(`Invalid Catalog Id ${catalogId}.`);
        }
        throw new Error(response.statusText);
      }
    } else {
      jsonResponse = await response.json();
    }
    if (jsonResponse && jsonResponse["service_request"] && jsonResponse["service_request"]["id"]) {
      const data = jsonResponse["service_request"];
      const serviceRequest = freshserviceServiceRequestFromJson(data);
      return serviceRequest;
    }
  } catch (error) {
    console.error("[Freshservice] Caught error in createServiceRequest:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return Promise.reject(error);
  }
}

export function getGTMCatalogId(catalog: FreshserviceCatalogOptions): number | undefined {
  let catalogId: string | undefined = undefined;
  switch (catalog) {
    case FreshserviceCatalogOptions.Software:
      catalogId = process.env.FRESHSERVICE_SOFTWARE_CATALOG_ID;
      break;
    case FreshserviceCatalogOptions.Electrical:
      catalogId = process.env.FRESHSERVICE_ELECTRICAL_CATALOG_ID;
      break;
    case FreshserviceCatalogOptions.Vision:
      catalogId = process.env.FRESHSERVICE_VISION_CATALOG_ID;
      break;
  }
  return catalogId && !Number.isNaN(+catalogId) ? +catalogId : undefined;
}
