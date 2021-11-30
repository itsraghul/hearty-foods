import {
  Grid,
  MenuItem,
  Paper,
  Select,
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
} from '@material-ui/core';
import React, { useContext } from 'react';
import Layout from '../components/Layout';
import { Store } from '../utils/store';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import NextLink from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useRouter } from 'next/router';

const PlateScreen = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    plate: { plateItems },
  } = state;

  const updatePlateHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/dishes/${item._id}`);
    if (data.countInStock <= 0) {
      window.alert('Sorry.Dish is not available to be made.');
    }
    dispatch({
      type: 'PLATE_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  const removeItemHandler = (item) => {
    dispatch({ type: 'PLATE_REMOVE_ITEM', payload: item });
  };

  const checkoutHandler = () => {
    router.push('/delivery');
  };

  return (
    <Layout title="Plate">
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
          Food Plate
        </Typography>
      </Paper>
      {plateItems.length === 0 ? (
        <div
          style={{
            marginTop: '10px',
            fontSize: '1.4rem',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Your Food Plate is empty.
          <br />
          <Button
            variant="outlined"
            color="secondary"
            style={{ marginTop: '12px' }}
          >
            <NextLink href="/" passHref>
              <Link>Pick Some Delicious Foods</Link>
            </NextLink>
          </Button>
        </div>
      ) : (
        <Grid container spacing={1}>
          <Grid item md={9} xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow style={{ fontWeight: 'bold' }}>
                    <TableCell>Image</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Action</TableCell>
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
                            <Typography variant="h6">{item.name}</Typography>
                          </Link>
                        </NextLink>
                      </TableCell>
                      <TableCell align="right">
                        <Select
                          value={item.quantity}
                          onChange={(e) =>
                            updatePlateHandler(item, e.target.value)
                          }
                        >
                          {[...Array(item.countInStock).keys()].map((x) => (
                            <MenuItem key={x + 1} value={x + 1}>
                              {x + 1}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell align="right">Rs.{item.price}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => removeItemHandler(item)}
                        >
                          X
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid md={3} xs={12}>
            <Card
              style={{
                boxShadow: '0 1px 4px rgba(0,0,0.26)',
                borderRadius: '15px',
              }}
            >
              <List>
                <ListItem>
                  <Typography variant="h6" component="h1">
                    Total ({plateItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                    dishes): Rs{' '}
                    {plateItems.reduce((a, c) => a + c.quantity * c.price, 0)}
                  </Typography>
                </ListItem>
                <ListItem>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={checkoutHandler}
                  >
                    Check Out
                  </Button>
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(PlateScreen), { ssr: false });
