import nc from 'next-connect';
import Order from '../../../models/Order';
import User from '../../../models/User';
import Dish from '../../../models/Dish';
import { isAuth, isAdmin } from '../../../utils/auth';
import db from '../../../utils/db';
import { onError } from '../../../utils/error';

const handler = nc({
  onError,
});

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.connect();
  const ordersCount = await Order.countDocuments();
  const usersCount = await User.countDocuments();
  const dishesCount = await Dish.countDocuments();
  const ordersPriceGroup = await Order.aggregate([
    {
      $group: { _id: null, sales: { $sum: '$totalPrice' } },
    },
  ]);
  const ordersPrice =
    ordersPriceGroup.length > 0 ? ordersPriceGroup[0].sales : 0;
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
      },
    },
  ]);
  await db.disconnect();
  res.send({ ordersCount, usersCount, dishesCount, ordersPrice, salesData });
});

export default handler;
