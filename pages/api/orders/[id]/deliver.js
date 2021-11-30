import nc from 'next-connect';
import { isAuth } from '../../../../utils/auth';
import Order from '../../../../models/Order';
import db from '../../../../utils/db';
import onError from '../../../../utils/error';

const handler = nc({
  onError,
});
handler.use(isAuth);
handler.put(async (req, res) => {
  await db.connect();
  const order = await Order.findById(req.query.id);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const deliveredOrder = await order.save();
    await db.disconnect();
    res.send({ message: 'Order Delivered', order: deliveredOrder });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Order not found' });
  }
});

export default handler;
