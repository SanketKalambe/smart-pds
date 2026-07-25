import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDigitalRationBook } from '../../redux/slices/rationBookSlice';
import SlotCalendar from '../../components/SlotCalendar';

const SlotBookingPage = () => {
  const dispatch = useDispatch();
  const { bookData } = useSelector((state) => state.rationBook);

  useEffect(() => {
    dispatch(fetchDigitalRationBook());
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SlotCalendar assignedShop={bookData?.assignedShop} />
    </div>
  );
};

export default SlotBookingPage;
