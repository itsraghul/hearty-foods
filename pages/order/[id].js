import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Link,
  Card,
  List,
  ListItem,
  CircularProgress,
  Button,
} from '@material-ui/core';
import React, { useContext, useEffect, useReducer } from 'react';
import Layout from '../../components/Layout';
import { Store } from '../../utils/store';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import NextLink from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useStyles from '../../utils/styles';
import { useSnackbar } from 'notistack';
import { getError } from '../../utils/error';
import axios from 'axios';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false, errorPay: action.payload };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false, errorPay: '' };
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false, errorDeliver: action.payload };
    case 'DELIVER_RESET':
      return {
        ...state,
        successDeliver: false,
        successPay: false,
        errorDeliver: '',
      };
    default:
      return state;
  }
}

const Order = ({ params }) => {
  const orderId = params.id;
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const classes = useStyles();
  const router = useRouter();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [
    { loading, error, order, successPay, loadingDeliver, successDeliver },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
    order: {},
  });

  const {
    deliveryAddress,
    paymentMethod,
    orderItems,
    itemsPrice,
    taxPrice,
    deliveryPrice,
    totalPrice,
    isDelivered,
    isPaid,
    paidAt,
    deliveredAt,
  } = order;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  const dollarPrice = round2(totalPrice * 0.013);

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    }
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id != orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPaypalScript();
    }
  }, [
    order,
    successPay,
    orderId,
    paypalDispatch,
    router,
    userInfo,
    successDeliver,
  ]);

  const { enqueueSnackbar } = useSnackbar();

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: dollarPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: 'PAY_SUCCESS', pay: data });
        enqueueSnackbar('Order is paid.', { variant: 'success' });
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', pay: getError(err) });
        enqueueSnackbar(getError(err), { variant: 'error' });
      }
    });
  }

  function onError(err) {
    enqueueSnackbar(getError(err), { variant: 'error' });
  }

  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'DELIVER_SUCCESS', pay: data });
      enqueueSnackbar('Order is delivered.', { variant: 'success' });
    } catch (err) {
      dispatch({ type: 'DELIVER_FAIL', pay: getError(err) });
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  }

  return (
    <Layout title={`Order ${orderId}`}>
      <Paper
        style={{
          marginTop: '20px',
          marginBottom: '25px',
          textAlign: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0.26)',
          borderRadius: '25px',
        }}
      >
        <Typography variant="h4" component="h1">
          <FastfoodIcon fontSize="medium"></FastfoodIcon>
          Order {orderId}
        </Typography>
      </Paper>
      {loading ? (
        <CircularProgress></CircularProgress>
      ) : error ? (
        <Typography variant="h6" className={classes.error}>
          {error}
        </Typography>
      ) : (
        <Grid container spacing={1}>
          <Grid item md={9} xs={12}>
            <Card
              className={classes.section}
              style={{
                boxShadow: '0 1px 4px rgba(0,0,0.26)',
                borderRadius: '15px',
              }}
            >
              <List>
                <ListItem>
                  <Typography variant="h5" component="h1">
                    Delivery Address
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body1">
                    {deliveryAddress.fullName},{deliveryAddress.address},{' '}
                    {deliveryAddress.city},{deliveryAddress.country} -
                    {deliveryAddress.pinCode}.
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="h6" style={{ fontSize: '1.2rem' }}>
                    Status :{' '}
                    {isDelivered
                      ? `Delivered at ${deliveredAt}`
                      : 'Not yet delivered.'}
                  </Typography>
                </ListItem>
              </List>
            </Card>
            <Card
              className={classes.section}
              style={{
                boxShadow: '0 1px 4px rgba(0,0,0.26)',
                borderRadius: '15px',
              }}
            >
              <List>
                <ListItem>
                  <Typography variant="h5" component="h1">
                    Payment Method
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="overline" style={{ fontSize: '1.2rem' }}>
                    {paymentMethod}
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="h6" style={{ fontSize: '1.2rem' }}>
                    Status : {isPaid ? `Paid at ${paidAt}` : 'Not yet paid.'}
                  </Typography>
                </ListItem>
              </List>
            </Card>
            <Card
              className={classes.section}
              style={{
                boxShadow: '0 1px 4px rgba(0,0,0.26)',
                borderRadius: '15px',
              }}
            >
              <List>
                <ListItem>
                  <Typography variant="h5" component="h1">
                    Order Items
                  </Typography>
                </ListItem>
                <ListItem>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow style={{ fontWeight: 'bold' }}>
                          <TableCell>Image</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              <NextLink href={`/dish/${item.slug}`} passHref>
                                <Link>
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={50}
                                    height={50}
                                  ></Image>
                                </Link>
                              </NextLink>
                            </TableCell>
                            <TableCell>
                              <NextLink href={`/dish/${item.slug}`} passHref>
                                <Link>
                                  <Typography variant="h6">
                                    {item.name}
                                  </Typography>
                                </Link>
                              </NextLink>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="h6">
                                {item.quantity}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="h6">
                                Rs.{item.price}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </ListItem>
              </List>
            </Card>
          </Grid>
          <Grid md={3} xs={12}>
            <Card
              className={classes.section}
              style={{
                boxShadow: '0 1px 4px rgba(0,0,0.26)',
                borderRadius: '15px',
                marginLeft: '10px',
              }}
            >
              <List>
                <ListItem>
                  <Typography variant="h6" component="h1">
                    Order Summary
                  </Typography>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant="body1">Items:</Typography>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant="body1" align="right">
                        Rs.{itemsPrice}
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant="body1">GST:</Typography>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant="body1" align="right">
                        Rs.{taxPrice}
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant="body1">Delivery:</Typography>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant="body1" align="right">
                        Rs.{deliveryPrice}
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        <strong>Total:</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography
                        variant="body1"
                        style={{ fontSize: '1.2rem' }}
                        align="right"
                      >
                        <strong>Rs.{totalPrice}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                {!isPaid && (
                  <ListItem>
                    {isPending ? (
                      <CircularProgress />
                    ) : (
                      <div className={classes.fullWidth}>
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div>
                    )}
                  </ListItem>
                )}
                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <ListItem>
                    {loadingDeliver && <CircularProgress />}
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={deliverOrderHandler}
                    >
                      Deliver Order
                    </Button>
                  </ListItem>
                )}
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
};

export async function getServerSideProps({ params }) {
  return { props: { params: params } };
}

export default dynamic(() => Promise.resolve(Order), { ssr: false });
