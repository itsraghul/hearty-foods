import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import NextLink from 'next/link';
import Layout from '../components/Layout';
// import data from '../utils/data';
import db from '../utils/db';
import Dish from '../models/Dish';
import axios from 'axios';
import { Store } from '../utils/store';
import { useContext } from 'react';
import { useRouter } from 'next/router';

export default function Home(props) {
  const { dishes } = props;
  const { state, dispatch } = useContext(Store);
  const router = useRouter();

  const addToPlateHandler = async (dish) => {
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
    <Layout>
      <div>
        <Grid container direction="row" spacing={4}>
          <Grid item xs={12}></Grid>
          <Grid item xs={12}>
            <Paper
              style={{
                boxShadow: '0 1px 4px rgba(0,0,0.26)',
                borderRadius: '25px',
              }}
            >
              <Typography variant="h2">
                <center>Dishes</center>
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={5}>
          {dishes.map((dish) => (
            <Grid item md={4} key={dish.name}>
              <Card
                raised
                style={{
                  borderRadius: '25px',
                }}
              >
                <NextLink href={`/dish/${dish.slug}`} passHref>
                  <CardActionArea>
                    <CardMedia
                      height="300"
                      component="img"
                      image={dish.image}
                      title={dish.name}
                    ></CardMedia>
                    <CardContent>
                      <Typography variant="h4" gutterBottom>
                        {dish.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </NextLink>
                <CardActions>
                  <Typography variant="h6" gutterBottom>
                    Rs.{dish.price}
                  </Typography>
                  <Button
                    size="medium"
                    color="secondary"
                    onClick={() => addToPlateHandler(dish)}
                  >
                    <Typography gutterBottom>Add to Plate</Typography>
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const dishes = await Dish.find({}).lean();
  await db.disconnect();
  return {
    props: {
      dishes: dishes.map(db.convertDocToObj),
    },
  };
}
