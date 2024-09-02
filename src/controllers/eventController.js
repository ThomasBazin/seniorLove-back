import { Event, Hobby } from '../models/associations.js';

//Récuperer tous les évenements et leurs centres d'intéret et trier par date la plus ancienne
export async function getAllEvents(req, res) {
  const allEvents = await Event.findAll({
    include: [{ model: Hobby, as: 'hobbies' }],
    order: [['created_at', 'DESC']],
  });
  res.status(200).json(allEvents);
}

getAllEvents();

//Récuperer un évenement et ses centres d'intérets
export async function getOneEvent(req, res) {
  const id = parseInt(req.params.id);
  //verif de l'id
  if (id === isNaN) {
    res.status(400).json({ message: 'this id is not valid' });
  }
  const oneEvent = await Event.findByPk(id, {
    include: [{ model: Hobby, as: 'hobbies' }],
  });
  if (!oneEvent) {
    res.status(404).json({ message: 'Event not found' });
  }
  res.status(200).json(oneEvent);
}
