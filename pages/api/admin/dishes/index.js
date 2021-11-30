import nc from 'next-connect';
import { isAdmin, isAuth } from '../../../../utils/auth';
import Dish from '../../../../models/Dish';
import db from '../../../../utils/db';

const handler = nc();
handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.connect();
  const dishes = await Dish.find({});
  await db.disconnect();
  res.send(dishes);
});

handler.post(async (req, res) => {
  await db.connect();
  const newDish = new Dish({
    name: 'sample name',
    slug: 'sample-slug-' + Math.random(),
    image: '/images/taco.jpeg',
    price: 0,
    category: 'sample-category',
    cuisine: 'sample-cuisine',
    countInStock: 0,
    description: 'sample-description',
    rating: 0,
    numReview: 0,
  });
  const dish = await newDish.save();
  await db.disconnect();
  res.send({ message: 'Dish Created', dish });
});

export default handler;
