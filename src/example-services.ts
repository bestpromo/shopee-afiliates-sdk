import 'dotenv/config';
import { ShopeeAffiliateClient } from './shopee';

const client = new ShopeeAffiliateClient({
  appId: process.env.SHOPEE_APP_ID!,
  secret: process.env.SHOPEE_SECRET!,
  url: process.env.SHOPEE_URL!,
});

async function main() {
  try {
    // Shopee Offer List
    const offers = await client.shopeeOfferList.getShopeeOfferList({ page: 1, limit: 5 });
    console.log('Shopee Offer List:', JSON.stringify(offers, null, 2));

    // Brand Offer List
    const brandOffers = await client.brandOfferList.getBrandOfferList({ brandId: '123', page: 1, pageSize: 5 });
    console.log('Brand Offer List:', JSON.stringify(brandOffers, null, 2));

    // Product Offer List
    const productOffers = await client.productOfferList.getProductOfferList({ productId: '456', page: 1, pageSize: 5 });
    console.log('Product Offer List:', JSON.stringify(productOffers, null, 2));

    // Short Link
    const shortLink = await client.shortLink.getShortLink({ url: 'https://shopee.com.br/produto/123' });
    console.log('Short Link:', JSON.stringify(shortLink, null, 2));
  } catch (err) {
    console.error('Error consuming services:', err);
  }
}

main();
