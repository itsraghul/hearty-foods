import {
  Card,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
  TableContainer,
  Table,
  TableCell,
  TableRow,
  TableHead,
  Button,
  TableBody,
  Paper,
} from '@material-ui/core';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import React, { useContext, useEffect, useReducer } from 'react';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';
import { Store } from '../../utils/store';
import useStyles from '../../utils/styles';
import { useSnackbar } from 'notistack';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, dishes: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return {
        ...state,
        loadingCreate: false,
      };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
}

function AdminDishes() {
  const { state } = useContext(Store);
  const router = useRouter();
  const classes = useStyles();
  const { userInfo } = state;

  const [
    { loading, error, dishes, loadingCreate, loadingDelete, successDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
    dishes: [],
  });

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/dishes`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, router, successDelete]);

  const { enqueueSnackbar } = useSnackbar();

  const createHandler = async () => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(
        '/api/admin/dishes',
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'CREATE_SUCCESS' });
      enqueueSnackbar('Dish created successfully', { variant: 'success' });
      router.push(`/admin/dish/${data.dish._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  const deleteHandler = async (dishId) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/dishes/${dishId}`, {
        headers: { authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: 'DELETE_SUCCESS' });
      enqueueSnackbar('Dish deleted successfully', { variant: 'success' });
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  return (
    <Layout title="Dish History">
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
                <ListItem button component="a">
                  <ListItemText primary="Admin Dashboard"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Orders"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/dishes" passHref>
                <ListItem selected button component="a">
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
          <Paper
            style={{
              marginTop: '20px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0.26)',
              borderRadius: '15px',
              padding: '6px',
            }}
          >
            <Grid container>
              <Grid item xs={6}>
                <Typography variant="h4" component="h1">
                  Dishes
                </Typography>
                {loadingDelete && <CircularProgress />}
              </Grid>
              <Grid align="right" item xs={6}>
                {loadingCreate && <CircularProgress />}
                <Button
                  onClick={createHandler}
                  color="primary"
                  variant="contained"
                  style={{ borderRadius: '15px' }}
                >
                  Create
                </Button>
              </Grid>
            </Grid>
          </Paper>
          <Card
            className={classes.section}
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0.26)',
              borderRadius: '15px',
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
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>NAME</TableCell>
                          <TableCell>PRICE</TableCell>
                          <TableCell>CATEGORY</TableCell>
                          <TableCell>COUNT</TableCell>
                          <TableCell>RATING</TableCell>
                          <TableCell>ACTIONS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dishes.map((dish) => {
                          return (
                            <TableRow key={dish._id}>
                              <TableCell>
                                {dish._id.substring(20, 24)}
                              </TableCell>
                              <TableCell>{dish.name}</TableCell>
                              <TableCell>Rs.{dish.price}</TableCell>
                              <TableCell>{dish.category}</TableCell>
                              <TableCell>{dish.countInStock}</TableCell>
                              <TableCell>{dish.rating}</TableCell>
                              <TableCell>
                                <NextLink
                                  href={`/admin/dish/${dish._id}`}
                                  passHref
                                >
                                  <Button size="small" variant="contained">
                                    Edit
                                  </Button>
                                </NextLink>{' '}
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => deleteHandler(dish._id)}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default dynamic(() => Promise.resolve(AdminDishes), { ssr: false });
