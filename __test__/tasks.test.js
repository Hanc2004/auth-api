const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');

const testEmail = `taskuser_${Date.now()}@example.com`;
const testPassword = 'TestPass123';
let token;
let createdTaskId;

beforeAll(async () => {
  // Register and login a fresh test user to get a token
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Task Tester', email: testEmail, password: testPassword });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: testEmail, password: testPassword });

  token = res.body.token;
});

afterAll(async () => {
  // Clean up test user (tasks cascade-delete automatically)
  await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
  await pool.end();
});

// ─── CREATE TASK ─────────────────────────────────────────────────────────────

describe('POST /api/tasks', () => {
  it('should create a task for a logged-in user', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task', description: 'Jest created this', status: 'pending' });

    expect(res.statusCode).toBe(201);
    expect(res.body.task).toHaveProperty('title', 'Test Task');
    expect(res.body.task).toHaveProperty('status', 'pending');

    createdTaskId = res.body.task.id;
  });

  it('should reject task creation without a token', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Sneaky Task' });

    expect(res.statusCode).toBe(401);
  });

  it('should reject task creation without a title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'No title here' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Title is required');
  });
});

// ─── GET TASKS ────────────────────────────────────────────────────────────────

describe('GET /api/tasks', () => {
  it('should return tasks for a logged-in user', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('tasks');
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });

  it('should block unauthenticated access', async () => {
    const res = await request(app).get('/api/tasks');

    expect(res.statusCode).toBe(401);
  });
});

// ─── UPDATE TASK ──────────────────────────────────────────────────────────────

describe('PUT /api/tasks/:id', () => {
  it('should update a task status', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(res.statusCode).toBe(200);
    expect(res.body.task).toHaveProperty('status', 'completed');
  });
});

// ─── DELETE TASK ──────────────────────────────────────────────────────────────

describe('DELETE /api/tasks/:id', () => {
  it('should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Task deleted');
  });
});