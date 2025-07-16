import 'dotenv/config';
import { ShopeeAffiliateClient } from './shopee';

const client = new ShopeeAffiliateClient({
  appId: process.env.SHOPEE_APP_ID!,
  secret: process.env.SHOPEE_SECRET!,
  url: process.env.SHOPEE_URL!,
});

async function main() {
  try {
    const result = await client.searchProducts('celular', 1, 5);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error searching products:', err);
  }
}

main();
