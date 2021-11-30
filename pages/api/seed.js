import nc from 'next-connect';
import Dish from '../../models/Dish';
import db from '../../utils/db';
import data from '../../utils/data';
import User from '../../models/User';

const handler = nc();

handler.get(async (req, res) => {
  await db.connect();
  await User.deleteMany();
  await User.insertMany(data.users);
  await Dish.deleteMany();
  await Dish.insertMany(data.dishes);
  await db.disconnect();
  res.send({ message: 'seeded successfully' });
});

export default handler;
