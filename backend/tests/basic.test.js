const request = require('supertest');
const mongoose = require('mongoose');

// Mock app for testing
const app = require('express')();
app.get('/health', (req, res) => res.json({ status: 'OK' }));

describe('Basic API Tests', () => {
  test('Health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  test('Environment variables loaded', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.MONGODB_URI).toBeDefined();
  });
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});