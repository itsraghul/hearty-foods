import {
  Card,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
  CardContent,
  CardActions,
  Button,
} from '@material-ui/core';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
// import { Bar } from 'react-chartjs-2';
import NextLink from 'next/link';
import React, { useContext, useEffect, useReducer } from 'react';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';
import { Store } from '../../utils/store';
import useStyles from '../../utils/styles';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, summary: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

function AdminDashboard() {
  const { state } = useContext(Store);
  const router = useRouter();
  const classes = useStyles();
  const { userInfo } = state;

  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    summary: { salesData: [] },
  });

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/summary`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo, router]);

  return (
    <Layout title="Admin Dashboard">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card
            className={classes.section}
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0.26)',
              borderRadius: '15px',
              marginTop: '25px',
            }}
          >
            <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Admin Dashboard"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Orders"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/dishes" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Dishes"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/users" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Users"></ListItemText>
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card
            className={classes.section}
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0.26)',
              borderRadius: '15px',
              marginTop: '30px',
            }}
          >
            <List>
              <ListItem>
                {loading ? (
                  <CircularProgress></CircularProgress>
                ) : error ? (
                  <Typography variant="h6" className={classes.error}>
                    {error}
                  </Typography>
                ) : (
                  <Grid container spacing={5}>
                    <Grid item md={3}>
                      <Card
                        raised
                        style={{
                          borderRadius: '15px',
                        }}
                      >
                        <CardContent>
                          <Typography variant="h5">
                            Rs.{summary.ordersPrice}
                          </Typography>
                          <Typography variant="h6">Sales</Typography>
                        </CardContent>
                        <CardActions>
                          <NextLink href="/admin/orders" passHref>
                            <Button size="small" color="primary">
                              View Sales
                            </Button>
                          </NextLink>
                        </CardActions>
                      </Card>
                    </Grid>
                    <Grid item md={3}>
                      <Card
                        raised
                        style={{
                          borderRadius: '15px',
                        }}
                      >
                        <CardContent>
                          <Typography variant="h5">
                            {summary.ordersCount}
                          </Typography>
                          <Typography variant="h6">Orders</Typography>
                        </CardContent>
                        <CardActions>
                          <NextLink href="/admin/orders" passHref>
                            <Button size="small" color="primary">
                              View Orders
                            </Button>
                          </NextLink>
                        </CardActions>
                      </Card>
                    </Grid>
                    <Grid item md={3}>
                      <Card
                        raised
                        style={{
                          borderRadius: '15px',
                        }}
                      >
                        <CardContent>
                          <Typography variant="h5">
                            {summary.dishesCount}
                          </Typography>
                          <Typography variant="h6">Dishes</Typography>
                        </CardContent>
                        <CardActions>
                          <NextLink href="/admin/dishes" passHref>
                            <Button size="small" color="primary">
                              View Dishes
                            </Button>
                          </NextLink>
                        </CardActions>
                      </Card>
                    </Grid>
                    <Grid item md={3}>
                      <Card
                        raised
                        style={{
                          borderRadius: '15px',
                        }}
                      >
                        <CardContent>
                          <Typography variant="h5">
                            {summary.usersCount}
                          </Typography>
                          <Typography variant="h6">Users</Typography>
                        </CardContent>
                        <CardActions>
                          <NextLink href="/admin/users" passHref>
                            <Button size="small" color="primary">
                              View Users
                            </Button>
                          </NextLink>
                        </CardActions>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </ListItem>
              {/* <ListItem>
                <Typography variant="h4" component="h1">
                  Sales Chart
                </Typography>
              </ListItem>
              <ListItem>
                <Bar
                  data={{
                    labels: summary.salesData.map((x) => x._id),
                    datasets: [
                      {
                        label: 'Sales',
                        backgroundColor: 'rgba(162,222,208,1)',
                        data: summary.salesData.map((x) => x.totalSales),
                      },
                    ],
                  }}
                  options={{
                    legend: { display: true, position: 'right' },
                  }}
                ></Bar>
              </ListItem> */}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default dynamic(() => Promise.resolve(AdminDashboard), { ssr: false });
