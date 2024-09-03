import { Hobby } from '../models/index.js'

export async function getHobbies(req, res) {
    const hobbiesList = Hobby.findAll();
}