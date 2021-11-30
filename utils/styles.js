import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  navbar: {
    backgroundColor: '#039e56',
    '& a': {
      color: '#ffffff',
      marginLeft: 10,
    },
  },
  brand: {
    fontWeight: 'bold',
    fontSize: '1.8rem',
    fontFamily: 'ComicSans',
  },
  grow: {
    flexGrow: '1',
  },
  main: {
    minHeight: '80vh',
  },
  footer: {
    marginTop: 25,
    textAlign: 'center',
  },
  section: {
    marginTop: 15,
    marginBottom: 15,
  },
  form: {
    width: '100%',
    maxWidth: 800,
    margin: '0 auto',
  },
  navbarButton: {
    color: 'white',
    textTransform: 'initial',
  },
  transparentBackground: {
    backgroundColor: 'transparent',
    marginTop: '10px',
  },
  error: {
    color: '#f04040',
  },
  fullWidth: {
    width: '100%',
  },
});

export default useStyles;
