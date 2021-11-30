import React, { useContext } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import Layout from '../../components/Layout';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {
  Link,
  Grid,
  ListItem,
  List,
  Typography,
  Card,
  Button,
} from '@material-ui/core';
import useStyles from '../../utils/styles';
import db from '../../utils/db';
import Dish from '../../models/Dish';
import { Store } from '../../utils/store';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function DishScreen(props) {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { dish } = props;
  const classes = useStyles();
  if (!dish) {
    return <div>Dish is not available</div>;
  }
  const addToPlateHandler = async () => {
    const existItem = state.plate.plateItems.find((x) => x._id === dish._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/dishes/${dish._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry.Dish is not available to be made.');
      return;
    }
    dispatch({
      type: 'PLATE_ADD_ITEM',
      payload: { ...dish, quantity },
    });
    router.push('/plate');
  };
  return (
    <Layout title={dish.name} description={dish.description}>
      <div className={classes.section}>
        <NextLink href="/" passHref>
          <Link>
            <ArrowBackIcon
              fontSize="medium"
              style={{ color: '#ff9900', fontSize: 30 }}
            ></ArrowBackIcon>
            {/* <Typography variant="button">back to dishes</Typography> */}
          </Link>
        </NextLink>
      </div>
      <Grid container spacing={2}>
        <Grid item md={6} xs={12}>
          <Image
            src={dish.image}
            alt={dish.name}
            width={540}
            height={540}
            layout="responsive"
          ></Image>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card style={{ boxShadow: '0 1px 2px rgba(0,0,0.26' }}>
            <List>
              <ListItem>
                <Typography variant="h4" component="h1" gutterBottom>
                  {dish.name}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="h5" gutterBottom>
                  Category: {dish.category}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="h5" gutterBottom>
                  Cuisine: {dish.cuisine}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="h6" gutterBottom>
                  Rating: {dish.rating} stars ({dish.numReviews} reviews)
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="h6" gutterBottom>
                  Description: {dish.description}
                </Typography>
              </ListItem>
            </List>
          </Card>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card style={{ boxShadow: '0 1px 2px rgba(0,0,0.26' }}>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography variant="h5" gutterBottom>
                      Price
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h5" gutterBottom>
                      Rs.{dish.price}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography variant="h6" gutterBottom>
                      Status
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" gutterBottom>
                      {dish.countInStock > 0 ? 'Available' : 'Unavailable'}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button
                  fullWidth
                  variant="contained"
                  style={{
                    backgroundColor: '#ff9900',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0.26',
                  }}
                  onClick={addToPlateHandler}
                >
                  Add to Plate
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;
  await db.connect();
  const dish = await Dish.findOne({ slug }).lean();
  await db.disconnect();
  return {
    props: {
      dish: db.convertDocToObj(dish),
    },
  };
}
