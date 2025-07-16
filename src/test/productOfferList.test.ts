import 'dotenv/config';
import axios from 'axios';
import { ProductOfferListService } from '../models/ProductOfferList';

import fs from 'fs';
import path from 'path';

async function testProductOfferList() {
  const appId = process.env.SHOPEE_APP_ID!;
  const secret = process.env.SHOPEE_SECRET!;
  const url = process.env.SHOPEE_URL!;
  const axiosInstance = axios.create({ baseURL: url });
  const service = new ProductOfferListService(axiosInstance, appId, secret);

  // Teste de paginação: busca até 3 páginas ou até acabar
  const params = { keyword: 'celular', page: 1, limit: 10, listType: 1 };
  let currentPage = 1;
  let hasNext = true;
  let pageResults = [];
  while (hasNext && currentPage <= 3) {
    const result = await service.getProductOfferList({ ...params, page: currentPage });
    pageResults.push(result);
    const fileName = `page${currentPage}.json`;
    fs.writeFileSync(path.join(__dirname, fileName), JSON.stringify(result, null, 2));
    console.log(`Arquivo salvo: ${fileName}`);
    // Imprime o conteúdo do arquivo
    console.log(`Conteúdo de ${fileName}:`);
    console.log(JSON.stringify(result, null, 2));
    hasNext = result.pageInfo.hasNextPage;
    currentPage++;
  }
  if (!hasNext) {
    console.log('Não há mais páginas disponíveis.');
  }

  // Test 2: Sorting by price descending (PRICE_DESC)
  const paramsDesc = { ...params, sortType: 3 };
  const pageDesc = await service.getProductOfferList(paramsDesc);
  const pricesDesc = pageDesc.nodes.map(o => parseFloat(o.priceMax || o.price || '0'));
  const isSortedDesc = pricesDesc.every((v, i, arr) => i === 0 || arr[i - 1] >= v);
  console.log('Offers are sorted by priceMax descending (API):', isSortedDesc);

  // Salva página ordenada por preço decrescente
  fs.writeFileSync(path.join(__dirname, 'pageDesc.json'), JSON.stringify(pageDesc, null, 2));

  // Test 3: Sorting by price ascending (PRICE_ASC)
  const paramsAsc = { ...params, sortType: 4 };
  const pageAsc = await service.getProductOfferList(paramsAsc);
  const pricesAsc = pageAsc.nodes.map(o => parseFloat(o.priceMin || o.price || '0'));
  const isSortedAsc = pricesAsc.every((v, i, arr) => i === 0 || arr[i - 1] <= v);
  console.log('Offers are sorted by priceMin ascending (API):', isSortedAsc);

  // Salva página ordenada por preço crescente
  fs.writeFileSync(path.join(__dirname, 'pageAsc.json'), JSON.stringify(pageAsc, null, 2));
}

testProductOfferList().catch(err => {
  console.error('Error testing ProductOfferListService:', err);
});
