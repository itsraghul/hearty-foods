import {
  Paper,
  Typography,
  List,
  ListItem,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from '@material-ui/core';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { Store } from '../utils/store';
import useStyles from '../utils/styles';

export default function Payment() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const classes = useStyles();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('');
  const { state, dispatch } = useContext(Store);
  const {
    plate: { deliveryAddress },
  } = state;
  useEffect(() => {
    if (!deliveryAddress.address) {
      router.push('/shipping');
    } else {
      setPaymentMethod(Cookies.get('paymentMethod') || '');
    }
  }, [router, deliveryAddress]);

  const submitHandler = (e) => {
    closeSnackbar();
    e.preventDefault();
    if (!paymentMethod) {
      enqueueSnackbar('Payment Method is required', { variant: 'error' });
    } else {
      dispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethod });
      Cookies.set('paymentMethod', paymentMethod);
      router.push('/placeorder');
    }
  };
  return (
    <Layout title="Payment Method">
      <CheckoutWizard activeStep={2} />
      <form className={classes.form} onSubmit={submitHandler}>
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
            Payment Method
          </Typography>
        </Paper>
        <List>
          <Paper
            style={{
              marginTop: '20px',
              marginBottom: '25px',
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0.26)',
              borderRadius: '25px',
            }}
          >
            <ListItem>
              <FormControl component="fieldset">
                <RadioGroup
                  aria-label="Payment Method"
                  name="paymentmethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    label="Paytm"
                    value="Paytm"
                    control={<Radio />}
                  ></FormControlLabel>
                  <FormControlLabel
                    label="Stripe [not available yet]"
                    value="Stripe"
                    control={<Radio />}
                  ></FormControlLabel>
                  <FormControlLabel
                    label="Cash"
                    value="Cash"
                    control={<Radio />}
                  ></FormControlLabel>
                </RadioGroup>
              </FormControl>
            </ListItem>
          </Paper>
          <Paper
            style={{
              marginTop: '20px',
              marginBottom: '25px',
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0.26)',
              borderRadius: '25px',
            }}
          >
            <ListItem>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Continue
              </Button>
            </ListItem>
          </Paper>
          <Paper
            style={{
              marginTop: '20px',
              marginBottom: '25px',
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0.26)',
              borderRadius: '25px',
            }}
          >
            <ListItem>
              <Button
                type="button"
                variant="outlined"
                onClick={() => router.push('/delivery')}
                fullWidth
              >
                Back
              </Button>
            </ListItem>
          </Paper>
        </List>
      </form>
    </Layout>
  );
}
