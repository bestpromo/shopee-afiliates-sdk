import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { ProductOfferListService } from '../models/ProductOfferList';

async function testShopeePagination() {
  const appId = process.env.SHOPEE_APP_ID!;
  const secret = process.env.SHOPEE_SECRET!;
  const url = process.env.SHOPEE_URL!;
  const axiosInstance = axios.create({ baseURL: url });
  const service = new ProductOfferListService(axiosInstance, appId, secret);

  let page = 1;
  let scrollId: string | undefined = undefined;
  let totalProducts = 0;
  const maxPages = 5;
  const limit = 500;

  while (page <= maxPages) {
    let params: any;
    if (!scrollId) {
      // Primeira requisição: parâmetros normais
      params = {
        keyword: 'iphone',
        limit,
        language: 'pt_BR',
      };
    } else {
      // Próximas requisições: só scrollId
      params = {
        scrollId,
      };
    }

    const result = await service.getProductOfferList(params);
    const products = result.nodes || [];
    totalProducts += products.length;
    const fileName = `page${page}.json`;
    fs.writeFileSync(path.join(__dirname, fileName), JSON.stringify(result, null, 2));
    console.log(`Página ${page}: ${products.length} produtos. Arquivo salvo: ${fileName}`);

    if (result.pageInfo && result.pageInfo.scrollId) {
      scrollId = result.pageInfo.scrollId;
    } else {
      console.log('Não há mais produtos ou scrollId retornado. Encerrando paginação.');
      break;
    }
    if (!products.length) {
      console.log('Nenhum produto retornado nesta página. Encerrando.');
      break;
    }
    page++;
  }
  console.log(`Total de produtos encontrados: ${totalProducts}`);
}

testShopeePagination().catch(err => {
  console.error('Erro ao testar paginação Shopee:', err);
});
