import 'dotenv/config';
import axios from 'axios';
import { ShopeeOfferListService } from '../models/ShopeeOfferList';

async function testShopeeOfferList() {
  const appId = process.env.SHOPEE_APP_ID!;
  const secret = process.env.SHOPEE_SECRET!;
  const url = process.env.SHOPEE_URL!;
  const axiosInstance = axios.create({ baseURL: url });
  const service = new ShopeeOfferListService(axiosInstance, appId, secret);

  try {
    const result = await service.getShopeeOfferList({ keyword: 'celular', sortType: 1, page: 1, limit: 2 });
    console.log('Shopee Offer List Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error testing ShopeeOfferListService:', err);
  }
}

testShopeeOfferList();
