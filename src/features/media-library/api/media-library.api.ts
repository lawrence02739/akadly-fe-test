import axios from 'axios';
import api from '../../../shared/api/axios';
import type {
  ListMediaParams,
  ListMediaResponse,
  MediaAsset,
  MediaAssetDetail,
  MediaAssetWithUsage,
  PresignUploadRequest,
  PresignUploadResponse,
  RegisterMediaRequest,
  ReplaceMediaRequest,
  UpdateMediaRequest,
} from '../types';

const BASE_PATH = '/media-assets';

export async function listMediaAssets(
  params: ListMediaParams = {},
): Promise<ListMediaResponse> {
  const response = await api.get(BASE_PATH, {
    params,
  });
  const raw = response.data;

  let rawItems: any[] = [];
  let total = 0;
  let page = params.page || 1;
  let limit = params.limit || 12;
  let totalPages = 1;

  if (Array.isArray(raw?.data)) {
    rawItems = raw.data;
    if (raw?.meta?.pagination) {
      total = raw.meta.pagination.total ?? rawItems.length;
      page = raw.meta.pagination.page ?? page;
      limit = raw.meta.pagination.pageSize ?? limit;
      totalPages = raw.meta.pagination.totalPages ?? 1;
    } else {
      total = rawItems.length;
      totalPages = Math.max(1, Math.ceil(total / limit));
    }
  } else if (raw?.data && typeof raw.data === 'object') {
    if (Array.isArray(raw.data.items)) {
      rawItems = raw.data.items;
      total =
        typeof raw.data.total === 'number' ? raw.data.total : rawItems.length;
      page = typeof raw.data.page === 'number' ? raw.data.page : page;
      limit = typeof raw.data.limit === 'number' ? raw.data.limit : limit;
      totalPages =
        typeof raw.data.totalPages === 'number' ? raw.data.totalPages : 1;
    } else if (Array.isArray(raw.data.data)) {
      rawItems = raw.data.data;
      total = rawItems.length;
    }
  } else if (Array.isArray(raw?.items)) {
    rawItems = raw.items;
    total = typeof raw.total === 'number' ? raw.total : rawItems.length;
    page = typeof raw.page === 'number' ? raw.page : page;
    limit = typeof raw.limit === 'number' ? raw.limit : limit;
    totalPages = typeof raw.totalPages === 'number' ? raw.totalPages : 1;
  }

  const items: MediaAssetWithUsage[] = rawItems.map((item: any) => {
    if (item && typeof item === 'object' && 'asset' in item && item.asset) {
      return {
        asset: normalizeAsset(item.asset),
        usageCount: typeof item.usageCount === 'number' ? item.usageCount : 0,
      };
    }
    const { usageCount = 0, ...assetProps } = item || {};
    return {
      asset: normalizeAsset(assetProps),
      usageCount: typeof usageCount === 'number' ? usageCount : 0,
    };
  });

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

function normalizeAsset(raw: any): MediaAsset {
  const textExtraction = raw?.extractedText || raw?.textExtraction || {
    status: 'NOT_REQUESTED',
    text: null,
    requestedAt: null,
  };
  const transcript = raw?.transcript || {
    status: 'NOT_REQUESTED',
    text: null,
    requestedAt: null,
  };
  const metadata = raw?.metadata || {};
  const tags = Array.isArray(raw?.tags) ? raw.tags : [];
  let fileUrl = raw?.fileUrl || '';
  if (fileUrl.includes('?X-Amz-') || fileUrl.includes('&X-Amz-')) {
    fileUrl = fileUrl.split('?')[0];
  }

  return {
    ...raw,
    fileUrl,
    tags,
    metadata,
    extractedText: textExtraction,
    textExtraction,
    transcript,
  } as MediaAsset;
}

export async function getMediaAsset(id: string): Promise<MediaAssetDetail> {
  const response = await api.get<{ data: any }>(
    `${BASE_PATH}/${id}`,
  );
  const raw = response.data?.data ?? response.data ?? {};
  if (raw && typeof raw === 'object' && 'asset' in raw && raw.asset) {
    return {
      asset: normalizeAsset(raw.asset),
      usageCount: typeof raw.usageCount === 'number' ? raw.usageCount : 0,
      linkedCourses: Array.isArray(raw.linkedCourses) ? raw.linkedCourses : [],
    };
  }
  const { usageCount = 0, linkedCourses = [], ...assetProps } = raw || {};
  return {
    asset: normalizeAsset(assetProps),
    usageCount: typeof usageCount === 'number' ? usageCount : 0,
    linkedCourses: Array.isArray(linkedCourses) ? linkedCourses : [],
  };
}

export async function presignUpload(
  payload: PresignUploadRequest,
): Promise<PresignUploadResponse> {
  const contentType =
    payload.contentType || payload.mimeType || 'application/octet-stream';
  const response = await api.post<{ data: PresignUploadResponse }>(
    `${BASE_PATH}/presign`,
    {
      fileName: payload.fileName,
      contentType,
      mimeType: contentType,
      sizeBytes: payload.sizeBytes,
    },
  );
  return response.data.data;
}

export async function putFileToStorage(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  // Use bare axios instance with no custom auth/credentials headers for S3 presigned PUT
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percent);
      }
    },
  });
}

export async function registerMediaAsset(
  payload: RegisterMediaRequest,
): Promise<MediaAsset> {
  const mimeType = payload.mimeType || 'application/octet-stream';
  const response = await api.post<{ data: MediaAsset }>(BASE_PATH, {
    fileKey: payload.fileKey,
    fileUrl: payload.fileUrl,
    fileName: payload.fileName,
    mimeType,
    contentType: mimeType,
    sizeBytes: payload.sizeBytes,
    title: payload.title,
    description: payload.description,
    categoryId: payload.categoryId,
    subject: payload.subject,
    topicTag: payload.topicTag,
    tags: payload.tags,
    status: payload.status,
    linkCourseId: payload.linkCourseId,
    linkNodeId: payload.linkNodeId,
    metadata: payload.metadata,
  });
  return response.data.data;
}

export async function updateMediaAsset(
  id: string,
  payload: UpdateMediaRequest,
): Promise<MediaAsset> {
  const response = await api.patch<{ data: MediaAsset }>(
    `${BASE_PATH}/${id}`,
    payload,
  );
  return response.data.data;
}

export async function replaceMediaFile(
  id: string,
  payload: ReplaceMediaRequest,
): Promise<MediaAsset> {
  const response = await api.post<{ data: MediaAsset }>(
    `${BASE_PATH}/${id}/replace`,
    payload,
  );
  return response.data.data;
}

export async function deleteMediaAsset(id: string): Promise<void> {
  await api.delete(`${BASE_PATH}/${id}`);
}

export async function getMediaDownloadUrl(id: string): Promise<string> {
  const response = await api.get<{ data: { url: string } }>(
    `${BASE_PATH}/${id}/download-url`,
  );
  return response.data.data.url;
}

export async function listMediaTags(): Promise<string[]> {
  const response = await api.get<{ data: string[] }>(`${BASE_PATH}/tags`);
  return response.data.data;
}

export async function bulkLinkMediaToCourse(
  assetIds: string[],
  courseId: string,
): Promise<{ linked: number }> {
  const response = await api.post<{ data: { linked: number } }>(
    `${BASE_PATH}/bulk-link`,
    {
      assetIds,
      courseId,
    },
  );
  return response.data.data;
}

export async function unlinkMediaFromCourse(
  assetId: string,
  courseId: string,
): Promise<void> {
  await api.delete(`${BASE_PATH}/${assetId}/link/${courseId}`);
}

export async function requestTextExtraction(
  assetId: string,
): Promise<{ status: string }> {
  const response = await api.post<{ data: { status: string } }>(
    `${BASE_PATH}/${assetId}/extract-text`,
  );
  return response.data.data;
}

export async function requestTranscript(
  assetId: string,
): Promise<{ status: string }> {
  const response = await api.post<{ data: { status: string } }>(
    `${BASE_PATH}/${assetId}/transcript`,
  );
  return response.data.data;
}
