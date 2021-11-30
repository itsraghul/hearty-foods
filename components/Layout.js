import React, { useContext, useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import {
  AppBar,
  Container,
  createTheme,
  CssBaseline,
  Link,
  MuiThemeProvider,
  Switch,
  Toolbar,
  Typography,
  Badge,
  Button,
  Menu,
  MenuItem,
} from '@material-ui/core';
import RestaurantSharpIcon from '@material-ui/icons/RestaurantSharp';
// import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import useStyles from '../utils/styles';
import { Store } from '../utils/store';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

export default function Layout({ title, description, children }) {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { darkMode, plate, userInfo } = state;
  const theme = createTheme({
    typography: {
      h1: { fontSize: '1.6rem', fontWeight: 400, margin: '1rem 0' },
      h2: { fontWeight: 400, margin: '1rem 0' },
      body1: {
        fontWeight: 'normal',
      },
    },
    palette: {
      type: darkMode ? 'dark' : 'light',
      primary: {
        main: '#f0c000',
      },
      secondary: {
        main: '#ff9900',
      },
    },
  });
  const classes = useStyles();
  const darkModeChangeHandler = () => {
    dispatch({ type: darkMode ? 'DARK_MODE_OFF' : 'DARK_MODE_ON' });
    const newDarkMode = !darkMode;
    Cookies.set('darkMode', newDarkMode ? 'ON' : 'OFF');
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const loginClickHandler = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const loginMenuCloseHandler = (e, redirect) => {
    setAnchorEl(null);
    if (redirect) {
      router.push(redirect);
    }
  };

  const logoutClickHandler = () => {
    setAnchorEl(null);
    dispatch({ type: 'USER_LOGOUT' });
    Cookies.remove('userInfo');
    Cookies.remove('plateItems');
    router.push('/');
  };

  return (
    <div>
      <Head>
        <title>{title ? `${title} - Hearty Foods` : 'Hearty Foods'}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static" className={classes.navbar}>
          <Toolbar>
            <NextLink href="/" passHref>
              <Link>
                <Typography className={classes.brand}>Hearty Foods</Typography>
              </Link>
            </NextLink>
            <div className={classes.grow}></div>
            <div>
              <Switch
                checked={darkMode}
                onChange={darkModeChangeHandler}
              ></Switch>
              <NextLink href="/plate" passHref>
                <Link
                  style={{
                    marginTop: '25px',
                    marginLeft: '10px',
                    fontSize: '1.5rem',
                    border: '1px solid',
                    padding: '0.3rem',
                    borderRadius: '5px',
                  }}
                >
                  {plate.plateItems.length > 0 ? (
                    <Badge
                      color="secondary"
                      badgeContent={plate.plateItems.length}
                    >
                      <RestaurantSharpIcon fontSize="large" />
                    </Badge>
                  ) : (
                    'Plate'
                  )}
                </Link>
              </NextLink>
              {userInfo ? (
                <>
                  <Button
                    className={classes.navbarButton}
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      marginLeft: '5px',
                      border: '1px solid',
                      padding: '0.1rem',
                      borderRadius: '5px',
                    }}
                    aria-owns={anchorEl ? 'simple-menu' : undefined}
                    aria-haspopup="true"
                    onClick={loginClickHandler}
                  >
                    {userInfo.name}
                  </Button>
                  <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={loginMenuCloseHandler}
                  >
                    <MenuItem
                      onClick={(e) => loginMenuCloseHandler(e, '/profile')}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                      onClick={(e) =>
                        loginMenuCloseHandler(e, '/order-history')
                      }
                    >
                      Order History
                    </MenuItem>
                    {userInfo.isAdmin && (
                      <MenuItem
                        onClick={(e) =>
                          loginMenuCloseHandler(e, '/admin/dashboard')
                        }
                      >
                        Admin Dashboard
                      </MenuItem>
                    )}
                    <MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <NextLink href="/login" passHref>
                  <Link
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      marginLeft: '15px',
                      marginTop: '20px',
                      border: '1px solid',
                      padding: '0.5rem',
                      borderRadius: '5px',
                    }}
                  >
                    Login
                  </Link>
                </NextLink>
              )}
            </div>
          </Toolbar>
        </AppBar>
        <Container className={classes.main}>{children}</Container>
        <footer className={classes.footer}>
          <Typography>
            <i>All rights reserved.Raghul S @ Hearty Foods.</i>
          </Typography>
        </footer>
      </MuiThemeProvider>
    </div>
  );
}
