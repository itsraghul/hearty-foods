import nc from 'next-connect';
import Dish from '../../../models/Dish';
import db from '../../../utils/db';

const handler = nc();

handler.get(async (req, res) => {
  await db.connect();
  const dishes = await Dish.find({});
  await db.disconnect();
  res.send(dishes);
});

export default handler;
