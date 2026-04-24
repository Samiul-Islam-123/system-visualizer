const express = require('express');
const router = express.Router();
const db = require('../db');

//light analytics
router.get('/light/overview', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM customers) AS total_customers,
        (SELECT COUNT(*) FROM orders) AS total_orders
    `);

    res.json({
      type: 'light',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching overview:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/light/revenue', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT SUM(payment_value) AS total_revenue FROM payments
    `);

    res.json({
      type: 'light',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching revenue:', err);
    res.status(500).json({ error: err.message });
  }
});

//moderately heavy analytics
router.get('/moderate/revenue-by-state', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.customer_state, SUM(p.payment_value) AS revenue
      FROM customers c
      JOIN orders o ON c.customer_id = o.customer_id
      JOIN payments p ON o.order_id = p.order_id
      GROUP BY c.customer_state
      ORDER BY revenue DESC
      LIMIT 10
    `);

    res.json({
      type: 'moderate',
      rows: result.rows
    });
  } catch (err) {
    console.error('Error fetching revenue by state:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/moderate/top-products', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT product_id, COUNT(*) AS total_sold
      FROM order_items
      GROUP BY product_id
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    res.json({
      type: 'moderate',
      rows: result.rows
    });
  } catch (err) {
    console.error('Error fetching top products:', err);
    res.status(500).json({ error: err.message });
  }
});

//heavy analytics
router.get('/heavy/deep-insights', async (req, res) => {
  try {
    const start = Date.now();

    // ======================
    // FETCH RAW DATA
    // ======================
    const [customers, orders, payments, items] = await Promise.all([
      db.query('SELECT * FROM customers'),
      db.query('SELECT * FROM orders'),
      db.query('SELECT * FROM payments'),
      db.query('SELECT * FROM order_items')
    ]);

    const customersMap = {};
    customers.rows.forEach(c => {
      customersMap[c.customer_id] = c;
    });

    const orderToCustomer = {};
    orders.rows.forEach(o => {
      orderToCustomer[o.order_id] = o.customer_id;
    });

    // ======================
    // PROCESSING
    // ======================

    let totalRevenue = 0;
    let values = [];

    const customerStats = {};
    const stateStats = {};

    // 💰 Payment processing
    payments.rows.forEach(p => {
      const value = parseFloat(p.payment_value) || 0;
      totalRevenue += value;
      values.push(value);

      const customerId = orderToCustomer[p.order_id];
      if (!customerId) return;

      const state = customersMap[customerId]?.customer_state;

      // customer stats
      if (!customerStats[customerId]) {
        customerStats[customerId] = { total: 0, count: 0 };
      }
      customerStats[customerId].total += value;
      customerStats[customerId].count++;

      // state stats
      if (!stateStats[state]) {
        stateStats[state] = { revenue: 0, count: 0 };
      }
      stateStats[state].revenue += value;
      stateStats[state].count++;
    });

    // ======================
    // 📊 STATISTICS (HEAVY)
    // ======================

    values.sort((a, b) => a - b);

    const n = values.length;

    const mean = totalRevenue / n;
    const median = values[Math.floor(n / 2)];

    let variance = 0;
    for (let v of values) {
      variance += Math.pow(v - mean, 2);
    }
    variance /= n;

    const stdDev = Math.sqrt(variance);

    // Percentiles
    const p90 = values[Math.floor(n * 0.9)];
    const p95 = values[Math.floor(n * 0.95)];

    // ======================
    // 👥 CUSTOMER SEGMENTATION (RFM-lite)
    // ======================

    let high = 0, mid = 0, low = 0;

    Object.values(customerStats).forEach(c => {
      if (c.total > 500) high++;
      else if (c.total > 100) mid++;
      else low++;
    });

    // ======================
    // 🌍 TOP STATES
    // ======================

    const topStates = Object.entries(stateStats)
      .map(([state, data]) => ({
        state,
        revenue: data.revenue,
        avgOrderValue: data.revenue / data.count
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const end = Date.now();

    // ======================
    // RESPONSE (WITH UNITS)
    // ======================

    res.json({
      type: 'heavy',
      meta: {
        processingTimeMs: end - start,
        currency: 'BRL', // IMPORTANT
        totalRevenue: {
          value: totalRevenue,
          unit: 'BRL'
        },
        totalOrders: orders.rows.length,
        totalCustomers: customers.rows.length
      },

      statistics: {
        meanOrderValue: { value: mean, unit: 'BRL' },
        medianOrderValue: { value: median, unit: 'BRL' },
        stdDeviation: { value: stdDev, unit: 'BRL' },
        variance: variance,
        percentiles: {
          p90: { value: p90, unit: 'BRL' },
          p95: { value: p95, unit: 'BRL' }
        }
      },

      insights: {
        topStates,
        customerSegments: {
          highValueCustomers: high,
          midValueCustomers: mid,
          lowValueCustomers: low
        }
      }
    });

  } catch (err) {
    console.error('Error fetching deep insights:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;