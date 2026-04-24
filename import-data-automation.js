const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Client } = require('pg');

const DATASET_PATH = path.join(__dirname, 'dataset');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin_pass',
  database: 'analytics_db'
});

const BATCH_SIZE = 1000;

// ======================
// HELPERS
// ======================
const toInt = (v) => (v === '' ? null : parseInt(v) || null);
const toFloat = (v) => (v === '' ? null : parseFloat(v) || null);
const toStr = (v) => (v === '' ? null : v);

// ======================
// RESET DB
// ======================
async function resetDB() {
  console.log("Dropping existing tables...");

  await client.query(`
    DROP TABLE IF EXISTS 
      order_items,
      payments,
      reviews,
      orders,
      customers,
      products,
      sellers,
      geolocation,
      category_translation;
  `);

  console.log("Old tables removed");
}

// ======================
// CREATE TABLES
// ======================
async function createTables() {
  console.log("Creating schema...");

  await client.query(`
    CREATE TABLE customers (
      customer_id VARCHAR PRIMARY KEY,
      customer_unique_id VARCHAR,
      customer_zip_code_prefix INT,
      customer_city VARCHAR,
      customer_state VARCHAR
    );
  `);

  await client.query(`
    CREATE TABLE orders (
      order_id VARCHAR PRIMARY KEY,
      customer_id VARCHAR,
      order_status VARCHAR,
      order_purchase_timestamp TIMESTAMP,
      order_approved_at TIMESTAMP,
      order_delivered_carrier_date TIMESTAMP,
      order_delivered_customer_date TIMESTAMP,
      order_estimated_delivery_date TIMESTAMP
    );
  `);

  await client.query(`
    CREATE TABLE products (
      product_id VARCHAR PRIMARY KEY,
      product_category_name VARCHAR,
      product_name_lenght INT,
      product_description_lenght INT,
      product_photos_qty INT,
      product_weight_g INT,
      product_length_cm INT,
      product_height_cm INT,
      product_width_cm INT
    );
  `);

  await client.query(`
    CREATE TABLE order_items (
      order_id VARCHAR,
      order_item_id INT,
      product_id VARCHAR,
      seller_id VARCHAR,
      shipping_limit_date TIMESTAMP,
      price FLOAT,
      freight_value FLOAT
    );
  `);

  await client.query(`
    CREATE TABLE payments (
      order_id VARCHAR,
      payment_sequential INT,
      payment_type VARCHAR,
      payment_installments INT,
      payment_value FLOAT
    );
  `);

  await client.query(`
    CREATE TABLE reviews (
      review_id VARCHAR,
      order_id VARCHAR,
      review_score INT,
      review_comment_title TEXT,
      review_comment_message TEXT,
      review_creation_date TIMESTAMP,
      review_answer_timestamp TIMESTAMP
    );
  `);

  await client.query(`
    CREATE TABLE sellers (
      seller_id VARCHAR,
      seller_zip_code_prefix INT,
      seller_city VARCHAR,
      seller_state VARCHAR
    );
  `);

  await client.query(`
    CREATE TABLE geolocation (
      geolocation_zip_code_prefix INT,
      geolocation_lat FLOAT,
      geolocation_lng FLOAT,
      geolocation_city VARCHAR,
      geolocation_state VARCHAR
    );
  `);

  await client.query(`
    CREATE TABLE category_translation (
      product_category_name VARCHAR,
      product_category_name_english VARCHAR
    );
  `);

  console.log("Schema created");
}

// ======================
// GENERIC IMPORT
// ======================
async function importCSV(file, table, transform) {
  console.log(`\nImporting ${table}...`);

  const stream = fs.createReadStream(path.join(DATASET_PATH, file)).pipe(csv());

  let batch = [];
  let total = 0;

  for await (const row of stream) {
    const values = transform(row);
    batch.push(values);

    if (batch.length >= BATCH_SIZE) {
      await insertBatch(table, values.length, batch);
      total += batch.length;
      console.log(`Inserted ${total} rows into ${table}`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertBatch(table, batch[0].length, batch);
    total += batch.length;
  }

  console.log(`Finished ${table}: ${total} rows`);
}

// ======================
// INSERT BATCH
// ======================
async function insertBatch(table, colCount, batch) {
  const values = batch.flat();

  const placeholders = batch.map((_, i) => {
    const start = i * colCount;
    return `(${Array.from({ length: colCount }, (_, j) => `$${start + j + 1}`).join(',')})`;
  }).join(',');

  await client.query(`INSERT INTO ${table} VALUES ${placeholders}`, values);
}

// ======================
// MAIN
// ======================
async function run() {
  try {
    await client.connect();
    console.log("Connected to DB");

    await resetDB();
    await createTables();

    // ======================
    // IMPORT DATA
    // ======================

    await importCSV('olist_customers_dataset.csv', 'customers', (r) => [
      toStr(r.customer_id),
      toStr(r.customer_unique_id),
      toInt(r.customer_zip_code_prefix),
      toStr(r.customer_city),
      toStr(r.customer_state)
    ]);

    await importCSV('olist_orders_dataset.csv', 'orders', (r) => [
      toStr(r.order_id),
      toStr(r.customer_id),
      toStr(r.order_status),
      toStr(r.order_purchase_timestamp),
      toStr(r.order_approved_at),
      toStr(r.order_delivered_carrier_date),
      toStr(r.order_delivered_customer_date),
      toStr(r.order_estimated_delivery_date)
    ]);

    await importCSV('olist_products_dataset.csv', 'products', (r) => [
      toStr(r.product_id),
      toStr(r.product_category_name),
      toInt(r.product_name_lenght),
      toInt(r.product_description_lenght),
      toInt(r.product_photos_qty),
      toInt(r.product_weight_g),
      toInt(r.product_length_cm),
      toInt(r.product_height_cm),
      toInt(r.product_width_cm)
    ]);

    await importCSV('olist_order_items_dataset.csv', 'order_items', (r) => [
      toStr(r.order_id),
      toInt(r.order_item_id),
      toStr(r.product_id),
      toStr(r.seller_id),
      toStr(r.shipping_limit_date),
      toFloat(r.price),
      toFloat(r.freight_value)
    ]);

    await importCSV('olist_order_payments_dataset.csv', 'payments', (r) => [
      toStr(r.order_id),
      toInt(r.payment_sequential),
      toStr(r.payment_type),
      toInt(r.payment_installments),
      toFloat(r.payment_value)
    ]);

    await importCSV('olist_order_reviews_dataset.csv', 'reviews', (r) => [
      toStr(r.review_id),
      toStr(r.order_id),
      toInt(r.review_score),
      toStr(r.review_comment_title),
      toStr(r.review_comment_message),
      toStr(r.review_creation_date),
      toStr(r.review_answer_timestamp)
    ]);

    await importCSV('olist_sellers_dataset.csv', 'sellers', (r) => [
      toStr(r.seller_id),
      toInt(r.seller_zip_code_prefix),
      toStr(r.seller_city),
      toStr(r.seller_state)
    ]);

    await importCSV('olist_geolocation_dataset.csv', 'geolocation', (r) => [
      toInt(r.geolocation_zip_code_prefix),
      toFloat(r.geolocation_lat),
      toFloat(r.geolocation_lng),
      toStr(r.geolocation_city),
      toStr(r.geolocation_state)
    ]);

    await importCSV('product_category_name_translation.csv', 'category_translation', (r) => [
      toStr(r.product_category_name),
      toStr(r.product_category_name_english)
    ]);

    console.log("\n🎉 ALL DATA IMPORTED SUCCESSFULLY");

  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await client.end();
  }
}

run();