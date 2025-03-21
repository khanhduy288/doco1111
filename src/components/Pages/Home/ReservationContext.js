// ReservationContext.js
import React, { createContext, useState, useContext } from 'react';

const ReservationContext = createContext();

export const ReservationProvider = ({ children }) => {
  const [reservationData, setReservationData] = useState({
    name: '',
    phone: '',
    branch: '',
    guestCount: 1,
    date: '',
    time: '',
    cart: []
  });

  return (
    <ReservationContext.Provider value={{ reservationData, setReservationData }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => useContext(ReservationContext);