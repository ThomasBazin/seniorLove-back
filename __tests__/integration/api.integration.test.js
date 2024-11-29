import request from 'supertest';
import { describe, it, expect } from '@jest/globals';

import app from '../../index.js';

describe('route POST /public/register', () => {
  describe('when data is OK', () => {
    it('should create a new user', async () => {
      // given
      const data = {
        name: 'Jacques',
        birth_date: '1930-06-06',
        description: 'Bonjour, je suis Jacques',
        gender: 'male',
        email: 'jacques@example.net',
        password: 'Azerty123456789!',
        repeat_password: 'Azerty123456789!',
        hobbies: [1, 2],
      };

      // when
      const res = await request(app)
        .post('/api/public/register')
        .field('name', data.name)
        .field('birth_date', data.birth_date)
        .field('description', data.description)
        .field('gender', data.gender)
        .field('email', data.email)
        .field('password', data.password)
        .field('repeat_password', data.repeat_password)
        .field('hobbies', data.hobbies)
        .attach('picture', '__tests__/img/PB290780.jpeg');

      //then
      expect(res.statusCode).toEqual(201);
    });
  });

  describe('when user age is under 60', () => {
    it('should respond with error', async () => {
      // given
      const under60birthdate = '2000-06-06';
      const data = {
        name: 'Jacques',
        birth_date: under60birthdate,
        description: 'Bonjour, je suis Jacques',
        gender: 'male',
        email: 'jacques@example.net',
        password: 'Azerty123456789!',
        repeat_password: 'Azerty123456789!',
        hobbies: [1, 2],
      };

      // when
      const res = await request(app)
        .post('/api/public/register')
        .field('name', data.name)
        .field('birth_date', data.birth_date)
        .field('description', data.description)
        .field('gender', data.gender)
        .field('email', data.email)
        .field('password', data.password)
        .field('repeat_password', data.repeat_password)
        .field('hobbies', data.hobbies)
        .attach('picture', '__tests__/img/PB290780.jpeg');

      //then
      expect(res.statusCode).toEqual(400);
    });
  });
});

// describe('API Endpoints', () => {
//   it('should return events', async () => {
//     const res = await request(app).get('/api/public/events');

//     expect(res.statusCode).toEqual(200);
//   });
// });
