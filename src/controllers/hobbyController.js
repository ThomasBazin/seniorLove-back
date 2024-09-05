import { Hobby } from '../models/index.js';

export async function getHobbies(req, res) {
  const hobbiesList = await Hobby.findAll({ attributes: ['id', 'name'] });
  res.status(200).json(hobbiesList);
}
