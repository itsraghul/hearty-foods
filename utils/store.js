import Cookies from 'js-cookie';
import { createContext, useReducer } from 'react';

export const Store = createContext();

const initialState = {
  darkMode: Cookies.get('darkMode') === 'ON' ? true : false,
  plate: {
    plateItems: Cookies.get('plateItems')
      ? JSON.parse(Cookies.get('plateItems'))
      : [],
    deliveryAddress: Cookies.get('deliveryAddress')
      ? JSON.parse(Cookies.get('deliveryAddress'))
      : {},
    paymentMethod: Cookies.get('paymentMethod')
      ? Cookies.get('paymentMethod')
      : '',
  },
  userInfo: Cookies.get('userInfo')
    ? JSON.parse(Cookies.get('userInfo'))
    : null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'DARK_MODE_ON':
      return { ...state, darkMode: true };
    case 'DARK_MODE_OFF':
      return { ...state, darkMode: false };
    case 'PLATE_ADD_ITEM': {
      const newItem = action.payload;
      const existItem = state.plate.plateItems.find(
        (item) => item._id === newItem._id
      );
      const plateItems = existItem
        ? state.plate.plateItems.map((item) =>
            item.name === existItem.name ? newItem : item
          )
        : [...state.plate.plateItems, newItem];
      Cookies.set('plateItems', JSON.stringify(plateItems));
      return { ...state, plate: { ...state.plate, plateItems } };
    }
    case 'PLATE_REMOVE_ITEM': {
      const plateItems = state.plate.plateItems.filter(
        (item) => item._id !== action.payload._id
      );
      Cookies.set('plateItems', JSON.stringify(plateItems));
      return { ...state, plate: { ...state.plate, plateItems } };
    }
    case 'SAVE_DELIVERY_ADDRESS':
      return {
        ...state,
        plate: { ...state.plate, deliveryAddress: action.payload },
      };
    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        plate: { ...state.plate, paymentMethod: action.payload },
      };
    case 'PLATE_CLEAR':
      return { ...state, plate: { ...state.plate, plateItems: [] } };
    case 'USER_LOGIN':
      return { ...state, userInfo: action.payload };
    case 'USER_LOGOUT':
      return {
        ...state,
        userInfo: null,
        plate: { plateItems: [], deliveryAddress: {}, paymentMethod: '' },
      };
    default:
      return state;
  }
}

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
