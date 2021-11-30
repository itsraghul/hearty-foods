import {
  Typography,
  Paper,
  List,
  ListItem,
  TextField,
  Button,
} from '@material-ui/core';
import useStyles from '../utils/styles';
import React, { useContext, useEffect } from 'react';
import Layout from '../components/Layout';
import { Store } from '../utils/store';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { Controller, useForm } from 'react-hook-form';
import CheckoutWizard from '../components/checkoutWizard';

export default function Delivery() {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    userInfo,
    plate: { deliveryAddress },
  } = state;
  useEffect(() => {
    if (!userInfo) {
      router.push('/login?redirect=/delivery');
    }
    setValue('fullName', deliveryAddress.fullName);
    setValue('address', deliveryAddress.address);
    setValue('city', deliveryAddress.city);
    setValue('pinCode', deliveryAddress.pinCode);
    setValue('country', deliveryAddress.country);
  });

  const classes = useStyles();

  const submitHandler = ({ fullName, address, city, pinCode, country }) => {
    dispatch({
      type: 'SAVE_DELIVERY_ADDRESS',
      payload: { fullName, address, city, pinCode, country },
    });
    Cookies.set(
      'deliveryAddress',
      JSON.stringify({ fullName, address, city, pinCode, country })
    );
    router.push('/payment');
  };
  return (
    <Layout title="Delivery Address">
      <CheckoutWizard activeStep={1}></CheckoutWizard>
      <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
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
            Delivery Address
          </Typography>
        </Paper>
        <List>
          <ListItem>
            <Controller
              name="fullName"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 3,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="fullName"
                  label="Full Name"
                  inputProps={{ type: 'text' }}
                  error={Boolean(errors.fullName)}
                  helperText={
                    errors.fullName
                      ? errors.fullName.type === 'minLength'
                        ? 'Full Name length must have atleast 3 characters.'
                        : 'Full Name is required'
                      : ''
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="address"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 10,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="address"
                  label="Address"
                  inputProps={{ type: 'text' }}
                  error={Boolean(errors.address)}
                  helperText={
                    errors.address
                      ? errors.address.type === 'minLength'
                        ? 'Address length must have atleast 10 characters.'
                        : 'Address is required'
                      : ''
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="city"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 3,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="city"
                  label="City"
                  inputProps={{ type: 'text' }}
                  error={Boolean(errors.city)}
                  helperText={
                    errors.city
                      ? errors.city.type === 'minLength'
                        ? 'City length must have atleast 3 characters.'
                        : 'City is required'
                      : ''
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="pinCode"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 6,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="pinCode"
                  label="Pin Code"
                  inputProps={{ type: 'number' }}
                  error={Boolean(errors.pinCode)}
                  helperText={
                    errors.pinCode
                      ? errors.pinCode.type === 'minLength'
                        ? 'PinCode length must have atleast 6 characters.'
                        : 'PinCode is required'
                      : ''
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="country"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 3,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="country"
                  label="Country"
                  inputProps={{ type: 'text' }}
                  error={Boolean(errors.country)}
                  helperText={
                    errors.country
                      ? errors.country.type === 'minLength'
                        ? 'Country length must have atleast 3 characters.'
                        : 'Country is required'
                      : ''
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Continue
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
}
