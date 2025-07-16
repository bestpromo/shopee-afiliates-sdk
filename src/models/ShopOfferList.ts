import { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { ShopeeApiError } from './ShopeeOfferList';

export interface ShopOfferListParams {
  shopId?: string;
  keyword?: string;
  shopType?: number[];
  isKeySeller?: boolean;
  sortType?: 1 | 2 | 3;
  sellerCommCoveRatio?: string;
  page?: number;
  limit?: number;
}

export interface BannerInfo {
  fileName: string;
  imageUrl: string;
  imageSize: number;
  imageWidth: number;
  imageHeight: number;
}

export interface ShopOfferV2 {
  commissionRate: string;
  imageUrl: string;
  offerLink: string;
  originalLink: string;
  shopId: string;
  shopName: string;
  ratingStar?: string;
  shopType?: number[];
  remainingBudget?: number;
  periodStartTime: number;
  periodEndTime: number;
  sellerCommCoveRatio?: string;
  bannerInfo?: BannerInfo;
}

export interface PageInfo {
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface ShopOfferConnectionV2 {
  nodes: ShopOfferV2[];
  pageInfo: PageInfo;
}

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

export class ShopOfferListService {
  constructor(private axios: AxiosInstance, private appId: string, private secret: string) {}

  async getShopOfferList(params: ShopOfferListParams): Promise<ShopOfferConnectionV2> {
    const payload = {
      operationName: 'shopOfferV2',
      variables: {
        shopId: params.shopId,
        keyword: params.keyword,
        shopType: params.shopType,
        isKeySeller: params.isKeySeller,
        sortType: params.sortType,
        sellerCommCoveRatio: params.sellerCommCoveRatio,
        page: params.page || 1,
        limit: params.limit || 20,
      },
      query: `query shopOfferV2($shopId: String, $keyword: String, $shopType: [Int], $isKeySeller: Boolean, $sortType: Int, $sellerCommCoveRatio: String, $page: Int, $limit: Int) {\n  shopOfferV2(shopId: $shopId, keyword: $keyword, shopType: $shopType, isKeySeller: $isKeySeller, sortType: $sortType, sellerCommCoveRatio: $sellerCommCoveRatio, page: $page, limit: $limit) {\n    nodes {\n      commissionRate\n      imageUrl\n      offerLink\n      originalLink\n      shopId\n      shopName\n      ratingStar\n      shopType\n      remainingBudget\n      periodStartTime\n      periodEndTime\n      sellerCommCoveRatio\n      bannerInfo {\n        fileName\n        imageUrl\n        imageSize\n        imageWidth\n        imageHeight\n      }\n    }\n    pageInfo {\n      page\n      limit\n      hasNextPage\n    }\n  }\n}`,
    };
    console.log('Payload sent:', JSON.stringify(payload, null, 2));
    const { Authorization } = generateShopeeAuthorization(this.appId, this.secret, payload);
    const res = await this.axios.post('/', payload, {
      headers: {
        'Authorization': Authorization,
        'Content-Type': 'application/json',
      },
    });
    console.log('Shopee API raw response:', JSON.stringify(res.data, null, 2));
    if (res.data.errors && res.data.errors.length > 0) {
      console.error('Shopee API errors:', JSON.stringify(res.data.errors, null, 2));
      const err = res.data.errors[0];
      throw new ShopeeApiError(
        err.extensions?.message || err.message || 'Unknown Shopee error',
        err.extensions?.code,
        err.path,
        err.extensions
      );
    }
    if (!res.data.data || !res.data.data.shopOfferV2) {
      console.error('Shopee API unexpected response:', JSON.stringify(res.data, null, 2));
      throw new Error('Unexpected Shopee response: shopOfferV2 field missing');
    }
    return res.data.data.shopOfferV2;
  }
}
