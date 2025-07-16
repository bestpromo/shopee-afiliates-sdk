# Shopee Affiliates SDK

A Node.js/TypeScript SDK for integrating with the Shopee Affiliates Open API.

## Features
- Modular services for all supported Shopee endpoints
- Secure authentication (SHA256 signature)
- TypeScript types for all request/response payloads
- Error handling with custom error classes

## Installation

```
npm install shopee-affiliates-sdk
```

> Or clone/download this repository and use locally.

## Environment Variables

Create a `.env` file in the root of your project (see `.env.example`):

```
SHOPEE_APP_ID=your_app_id
SHOPEE_SECRET=your_secret
SHOPEE_URL=https://open-api.affiliate.shopee.com.br/graphql
```

## Usage Example

```typescript
import 'dotenv/config';
import { ShopeeAffiliateClient } from './src/shopee';

const client = new ShopeeAffiliateClient({
  appId: process.env.SHOPEE_APP_ID!,
  secret: process.env.SHOPEE_SECRET!,
  url: process.env.SHOPEE_URL!,
});

async function main() {
  try {
    // Example: Search for offers
    const offers = await client.shopeeOfferList.getShopeeOfferList({ keyword: 'phone', page: 1, limit: 5 });
    console.log(offers);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
```

## Supported Endpoints
- Shopee Offer List
- Shop Offer List
- Product Offer List
- Generate Short Link

## Error Handling
All API errors throw a `ShopeeApiError` with details from Shopee's response.

## Development & Testing
- See `/src/test/` for usage examples and test scripts.
- Run tests with Node.js: `node src/test/shopeeOfferList.test.ts`

## License
MIT
