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

export interface ShortLinkParams {
  originUrl: string;
  subIds?: string[];
}

export class ShortLinkService {
  constructor(private axios: AxiosInstance, private appId: string, private secret: string) {}

  async generateShortLink(params: ShortLinkParams): Promise<{ shortLink: string }> {
    const mutation = `mutation generateShortLink($input: GenerateShortLinkInput!) {\n  generateShortLink(input: $input) {\n    shortLink\n  }\n}`;
    const variables = { input: { originUrl: params.originUrl, subIds: params.subIds } };
    const payloadObj = {
      query: mutation,
      variables,
      operationName: 'generateShortLink',
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
      if (!response.data.data || !response.data.data.generateShortLink) {
        throw new Error('Unexpected Shopee response: generateShortLink field missing');
      }
      return response.data.data.generateShortLink;
    } catch (error: any) {
      throw new Error(`Shopee ShortLinkService error: ${error.message}`);
    }
  }
}
