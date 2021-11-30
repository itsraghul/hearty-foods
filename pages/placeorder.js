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
  Button,
  Link,
  Card,
  List,
  ListItem,
  CircularProgress,
} from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Store } from '../utils/store';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import NextLink from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useStyles from '../utils/styles';
import CheckoutWizard from '../components/CheckoutWizard';
import { useSnackbar } from 'notistack';
import { getError } from '../utils/error';
import axios from 'axios';
import Cookies from 'js-cookie';

const PlaceOrder = () => {
  const classes = useStyles();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    userInfo,
    plate: { plateItems, deliveryAddress, paymentMethod },
  } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  const itemsPrice = round2(
    plateItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  );
  const deliveryPrice = itemsPrice > 200 ? 0 : 50;
  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(itemsPrice + taxPrice + deliveryPrice);

  useEffect(() => {
    if (!paymentMethod) {
      router.push('/payment');
    }
    if (plateItems.length === 0) {
      router.push('/plate');
    }
  }, [router, paymentMethod, plateItems]);

  const { closeSnackbar, enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const placeOrderHandler = async () => {
    closeSnackbar();
    try {
      setLoading(true);
      const { data } = await axios.post(
        '/api/orders',
        {
          orderItems: plateItems,
          deliveryAddress,
          paymentMethod,
          itemsPrice,
          deliveryPrice,
          taxPrice,
          totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      dispatch({ type: 'PLATE_CLEAR' });
      Cookies.remove('plateItems');
      setLoading(false);
      router.push(`/order/${data._id}`);
    } catch (err) {
      setLoading(false);
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  return (
    <Layout title="Place Order">
      <CheckoutWizard activeStep={3} />
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
          Place Order
        </Typography>
      </Paper>
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
                      {plateItems.map((item) => (
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
              <ListItem>
                <Button
                  onClick={placeOrderHandler}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Place Order
                </Button>
              </ListItem>
              {loading && (
                <ListItem>
                  <CircularProgress></CircularProgress>
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(PlaceOrder), { ssr: false });
