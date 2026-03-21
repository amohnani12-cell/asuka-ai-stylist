const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = "2024-10";

async function shopifyFetch(query, variables = {}) {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

export async function searchProducts(query, limit = 6) {
  const data = await shopifyFetch(
    `query searchProducts($query: String!, $first: Int!) {
      products(first: $first, query: $query, sortKey: RELEVANCE) {
        edges {
          node {
            id
            title
            handle
            description
            productType
            tags
            priceRange {
              minVariantPrice { amount currencyCode }
            }
            compareAtPriceRange {
              minVariantPrice { amount currencyCode }
            }
            images(first: 2) {
              edges { node { url altText } }
            }
            variants(first: 1) {
              edges { node { id availableForSale } }
            }
          }
        }
      }
    }`,
    { query, first: limit }
  );

  return data.products.edges.map(({ node }) => {
    const price = parseFloat(node.priceRange.minVariantPrice.amount);
    const compareAt = parseFloat(node.compareAtPriceRange?.minVariantPrice?.amount || 0);
    const onSale = compareAt > 0 && compareAt > price;
    const discount = onSale ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description?.slice(0, 150),
      type: node.productType,
      tags: node.tags,
      price: formatPrice(node.priceRange.minVariantPrice),
      priceRaw: price,
      compareAtPrice: onSale ? formatPrice(node.compareAtPriceRange.minVariantPrice) : null,
      discount: discount,
      onSale: onSale,
      image: node.images.edges[0]?.node?.url || null,
      image2: node.images.edges[1]?.node?.url || null,
      available: node.variants.edges[0]?.node?.availableForSale || false,
      url: `https://${SHOPIFY_DOMAIN.replace(".myshopify.com", ".com")}/products/${node.handle}`,
    };
  });
}

export async function getCollection(handle, limit = 6) {
  const data = await shopifyFetch(
    `query getCollection($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        title
        products(first: $first, sortKey: BEST_SELLING) {
          edges {
            node {
              id title handle productType
              priceRange { minVariantPrice { amount currencyCode } }
              compareAtPriceRange { minVariantPrice { amount currencyCode } }
              images(first: 1) { edges { node { url altText } } }
            }
          }
        }
      }
    }`,
    { handle, first: limit }
  );
  if (!data.collection) return [];
  return data.collection.products.edges.map(({ node }) => {
    const price = parseFloat(node.priceRange.minVariantPrice.amount);
    const compareAt = parseFloat(node.compareAtPriceRange?.minVariantPrice?.amount || 0);
    const onSale = compareAt > 0 && compareAt > price;
    return {
      id: node.id, title: node.title, handle: node.handle, type: node.productType,
      price: formatPrice(node.priceRange.minVariantPrice), priceRaw: price,
      onSale, discount: onSale ? Math.round(((compareAt - price) / compareAt) * 100) : 0,
      compareAtPrice: onSale ? formatPrice(node.compareAtPriceRange.minVariantPrice) : null,
      image: node.images.edges[0]?.node?.url || null,
      url: `https://${SHOPIFY_DOMAIN.replace(".myshopify.com", ".com")}/products/${node.handle}`,
    };
  });
}

function formatPrice(price) {
  const amount = parseFloat(price.amount);
  if (price.currencyCode === "INR") return `₹${amount.toLocaleString("en-IN")}`;
  return `${price.currencyCode} ${amount.toFixed(2)}`;
}
