import crypto from 'crypto';
import { ShopeeApiError } from './ShopeeOfferList';
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
import { AxiosInstance } from 'axios';


export interface ProductOfferListParams {
  shopId?: number;
  itemId?: number;
  productCatId?: number;
  listType?: number;
  matchId?: number;
  keyword?: string;
  sortType?: number;
  page?: number;
  isAMSOffer?: boolean;
  isKeySeller?: boolean;
  limit?: number;
}

export interface ProductOfferV2 {
  itemId: number;
  commissionRate: string;
  sellerCommissionRate?: string;
  shopeeCommissionRate?: string;
  commission?: string;
  appExistRate?: string;
  appNewRate?: string;
  webExistRate?: string;
  webNewRate?: string;
  price?: string;
  sales?: number;
  priceMax?: string;
  priceMin?: string;
  productCatIds?: number[];
  ratingStar?: string;
  priceDiscountRate?: number;
  imageUrl?: string;
  productName?: string;
  shopId?: number;
  shopName?: string;
  shopType?: number[];
  productLink?: string;
  offerLink?: string;
  periodStartTime?: number;
  periodEndTime?: number;
}

export interface PageInfo {
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface ProductOfferListResponse {
  nodes: ProductOfferV2[];
  pageInfo: PageInfo;
}

export class ProductOfferListService {
  constructor(private axios: AxiosInstance, private appId: string, private secret: string) {}

  async getProductOfferList(params: ProductOfferListParams): Promise<ProductOfferListResponse> {
    const variables: any = { ...params };
    const query = `query productOfferV2($shopId: Long, $itemId: Long, $productCatId: Int, $listType: Int, $matchId: Long, $keyword: String, $sortType: Int, $page: Int, $isAMSOffer: Boolean, $isKeySeller: Boolean, $limit: Int) {\n      productOfferV2(shopId: $shopId, itemId: $itemId, productCatId: $productCatId, listType: $listType, matchId: $matchId, keyword: $keyword, sortType: $sortType, page: $page, isAMSOffer: $isAMSOffer, isKeySeller: $isKeySeller, limit: $limit) {\n        nodes {\n          itemId\n          commissionRate\n          sellerCommissionRate\n          shopeeCommissionRate\n          commission\n          appExistRate\n          appNewRate\n          webExistRate\n          webNewRate\n          price\n          sales\n          priceMax\n          priceMin\n          productCatIds\n          ratingStar\n          priceDiscountRate\n          imageUrl\n          productName\n          shopId\n          shopName\n          shopType\n          productLink\n          offerLink\n          periodStartTime\n          periodEndTime\n        }\n        pageInfo {\n          page\n          limit\n          hasNextPage\n        }\n      }\n    }`;
    const payloadObj = {
      query,
      variables,
      operationName: 'productOfferV2',
    };
    const payload = JSON.stringify(payloadObj);
    const { Authorization } = generateShopeeAuthorization(this.appId, this.secret, payloadObj);
    try {
      const response = await this.axios.post('', payloadObj, {
        headers: {
          'Authorization': Authorization,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.errors) {
        throw new ShopeeApiError(
          response.data.errors[0]?.extensions?.message || response.data.errors[0]?.message || 'Unknown Shopee error',
          response.data.errors[0]?.extensions?.code,
          response.data.errors[0]?.path,
          response.data.errors[0]?.extensions
        );
      }
      if (!response.data.data || !response.data.data.productOfferV2) {
        throw new Error('Unexpected Shopee response: productOfferV2 field missing');
      }
      return response.data.data.productOfferV2;
    } catch (error: any) {
      throw new Error(`Shopee ProductOfferListService error: ${error.message}`);
    }
  }
}
