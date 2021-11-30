import nc from 'next-connect';
import Dish from '../../../models/Dish';
import db from '../../../utils/db';

const handler = nc();

handler.get(async (req, res) => {
  await db.connect();
  const dish = await Dish.findById(req.query.id);
  await db.disconnect();
  res.send(dish);
});

export default handler;
