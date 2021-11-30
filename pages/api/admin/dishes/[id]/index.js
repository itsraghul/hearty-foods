import nc from 'next-connect';
import { isAdmin, isAuth } from '../../../../../utils/auth';
import Dish from '../../../../../models/Dish';
import db from '../../../../../utils/db';

const handler = nc();
handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.connect();
  const dish = await Dish.findById(req.query.id);
  await db.disconnect();
  res.send(dish);
});

handler.put(async (req, res) => {
  await db.connect();
  const dish = await Dish.findById(req.query.id);
  if (dish) {
    dish.name = req.body.name;
    dish.slug = req.body.slug;
    dish.price = req.body.price;
    dish.image = req.body.image;
    dish.category = req.body.category;
    dish.cuisine = req.body.cuisine;
    dish.countInStock = req.body.countInStock;
    dish.description = req.body.description;
    await dish.save();
    await db.disconnect();
    res.send({ message: 'Dish Updated Successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Dish not found' });
  }
});

handler.delete(async (req, res) => {
  await db.connect();
  const dish = await Dish.findById(req.query.id);
  if (dish) {
    await dish.remove();
    await db.disconnect();
    res.send({ message: 'Dish Deleted' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Dish Not Found.' });
  }
});

export default handler;
