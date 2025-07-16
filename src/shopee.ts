import { ShopOfferListService } from './models/ShopOfferList';
import axios, { AxiosInstance } from 'axios';
import { ShopeeOfferListService, ShopeeOfferListParams } from './models/ShopeeOfferList';

import { ProductOfferListService, ProductOfferListParams } from './models/ProductOfferList';
import { ShortLinkService, ShortLinkParams } from './models/ShortLink';


export interface ShopeeAffiliateOptions {
  appId: string;
  secret: string;
  url: string;
}

export class ShopeeAffiliateClient {
  private axios: AxiosInstance;
  private appId: string;
  private secret: string;
  public shopeeOfferList: ShopeeOfferListService;

  public productOfferList: ProductOfferListService;
  public shortLink: ShortLinkService;
  public shopOfferList: ShopOfferListService;

  constructor(options: ShopeeAffiliateOptions) {
    this.appId = options.appId;
    this.secret = options.secret;
    this.axios = axios.create({
      baseURL: options.url,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.shopeeOfferList = new ShopeeOfferListService(this.axios, this.appId, this.secret);

    this.productOfferList = new ProductOfferListService(this.axios, this.appId, this.secret);
    this.shortLink = new ShortLinkService(this.axios, this.appId, this.secret);
    this.shopOfferList = new ShopOfferListService(this.axios, this.appId, this.secret);
  }

  // Example method: product search
  async searchProducts(query: string, page = 1, pageSize = 20) {
    // Example payload for Shopee Affiliate GraphQL
    const payload = {
      operationName: 'searchItems',
      variables: {
        keyword: query,
        page,
        pageSize,
      },
      query: `query searchItems($keyword: String!, $page: Int, $pageSize: Int) {\n  searchItems(keyword: $keyword, page: $page, pageSize: $pageSize) {\n    items {\n      itemid\n      name\n      price\n      image\n      shopid\n      ...etc\n    }\n  }\n}`,
    };
    const res = await this.axios.post('', payload, {
      headers: {
        'Authorization': `Bearer ${this.secret}`,
        'X-APP-ID': this.appId,
      },
    });
    return res.data;
  }
}
