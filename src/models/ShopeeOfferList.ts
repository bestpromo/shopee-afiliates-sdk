import crypto from 'crypto';
// Utility function to generate Shopee Authorization header
function generateShopeeAuthorization(appId: string, secret: string, payload: any): { Authorization: string; timestamp: string } {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payloadStr = JSON.stringify(payload);
  const factor = appId + timestamp + payloadStr + secret;
  const signature = crypto.createHash('sha256').update(factor).digest('hex');
  const header = `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`;
  // Logs detalhados para debug
  console.log('Shopee Auth Debug:');
  console.log('  AppId:', appId);
  console.log('  Timestamp:', timestamp);
  console.log('  Payload:', payloadStr);
  console.log('  Signature Factor:', factor);
  console.log('  Signature:', signature);
  console.log('  Authorization Header:', header);
  return { Authorization: header, timestamp };
}
// Classe de erro customizada para erros da Shopee
export class ShopeeApiError extends Error {
  public code?: number;
  public path?: string;
  public extensions?: any;
  constructor(message: string, code?: number, path?: string, extensions?: any) {
    super(message);
    this.name = 'ShopeeApiError';
    this.code = code;
    this.path = path;
    this.extensions = extensions;
  }
}
import { AxiosInstance } from 'axios';

// Input parameters as per documentation
export interface ShopeeOfferListParams {
  keyword?: string;
  sortType?: 1 | 2; // 1: LATEST_DESC, 2: HIGHEST_COMMISSION_DESC
  page?: number;
  limit?: number;
}

// Response types as per documentation
export interface ShopeeOfferV2 {
  commissionRate: string;
  imageUrl: string;
  offerLink: string;
  originalLink: string;
  offerName: string;
  offerType: number;
  categoryId?: string;
  collectionId?: string;
  periodStartTime: number;
  periodEndTime: number;
}

export interface PageInfo {
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface ShopeeOfferConnectionV2 {
  nodes: ShopeeOfferV2[];
  pageInfo: PageInfo;
}

export class ShopeeOfferListService {
  constructor(private axios: AxiosInstance, private appId: string, private secret: string) {}

  async getShopeeOfferList(params: ShopeeOfferListParams): Promise<ShopeeOfferConnectionV2> {
    const payload = {
      operationName: 'shopeeOfferV2',
      variables: {
        keyword: params.keyword,
        sortType: params.sortType,
        page: params.page || 1,
        limit: params.limit || 20,
      },
      query: `query shopeeOfferV2($keyword: String, $sortType: Int, $page: Int, $limit: Int) {\n  shopeeOfferV2(keyword: $keyword, sortType: $sortType, page: $page, limit: $limit) {\n    nodes {\n      commissionRate\n      imageUrl\n      offerLink\n      originalLink\n      offerName\n      offerType\n      categoryId\n      collectionId\n      periodStartTime\n      periodEndTime\n    }\n    pageInfo {\n      page\n      limit\n      hasNextPage\n    }\n  }\n}`,
    };
    console.log('Payload sent:', JSON.stringify(payload, null, 2));
    const { Authorization } = generateShopeeAuthorization(this.appId, this.secret, payload);
    const res = await this.axios.post('/', payload, {
      headers: {
        'Authorization': Authorization,
        'Content-Type': 'application/json',
      },
    });
    // Full response log for debug
    console.log('Shopee API raw response:', JSON.stringify(res.data, null, 2));
    // Shopee error handling
    if (res.data.errors && res.data.errors.length > 0) {
      console.error('Shopee API errors:', JSON.stringify(res.data.errors, null, 2));
      // Throws the first error as ShopeeApiError (GraphQL standard: there may be multiple)
      const err = res.data.errors[0];
      throw new ShopeeApiError(
        err.extensions?.message || err.message || 'Unknown Shopee error',
        err.extensions?.code,
        err.path,
        err.extensions
      );
    }
    if (!res.data.data || !res.data.data.shopeeOfferV2) {
      console.error('Shopee API unexpected response:', JSON.stringify(res.data, null, 2));
      throw new Error('Unexpected Shopee response: shopeeOfferV2 field missing');
    }
    return res.data.data.shopeeOfferV2;
  }
}
