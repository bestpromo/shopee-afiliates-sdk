import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { generateShopeeAuthorization } from '../models/ProductOfferList';

async function testOfferListScrollId() {
  const appId = process.env.SHOPEE_APP_ID!;
  const secret = process.env.SHOPEE_SECRET!;
  const url = process.env.SHOPEE_URL!;
  const axiosInstance = axios.create({ baseURL: url });

  let scrollId: string | undefined = undefined;
  let totalOffers = 0;
  const maxPages = 5;
  const limit = 500;
  let page = 1;

  while (page <= maxPages) {
    let query;
    let variables: any;
    if (!scrollId) {
      // Primeira requisição: sem scrollid
      query = `query offerList($limit: Int, $language: String) { offerList(input: { limit: $limit, language: $language }) { offers { product_id product_name click_url } scrollid } }`;
      variables = { limit, language: 'pt_BR' };
    } else {
      // Próximas requisições: só scrollid
      query = `query offerList($scrollid: String) { offerList(input: { scrollid: $scrollid }) { offers { product_id product_name click_url } scrollid } }`;
      variables = { scrollid: scrollId };
    }
    const payload = { query, variables };
    const { Authorization } = generateShopeeAuthorization(appId, secret, payload);
    try {
      const response = await axiosInstance.post('', payload, {
        headers: {
          Authorization,
          'Content-Type': 'application/json',
        },
      });
      const offerList = response.data.data.offerList;
      const offers = offerList.offers || [];
      totalOffers += offers.length;
      const fileName = `offerList_page${page}.json`;
      fs.writeFileSync(path.join(__dirname, fileName), JSON.stringify(offerList, null, 2));
      console.log(`Página ${page}: ${offers.length} ofertas. Arquivo salvo: ${fileName}`);
      if (offerList.scrollid) {
        scrollId = offerList.scrollid;
      } else {
        console.log('Não há mais ofertas ou scrollid retornado. Encerrando paginação.');
        break;
      }
      if (!offers.length) {
        console.log('Nenhuma oferta retornada nesta página. Encerrando.');
        break;
      }
      page++;
    } catch (err) {
      console.error('Erro ao testar paginação offerList:', err);
      break;
    }
  }
  console.log(`Total de ofertas encontradas: ${totalOffers}`);
}

testOfferListScrollId();
