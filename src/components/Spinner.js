import React from 'react';

const Spinner = () => (
  <div className="flex justify-center items-center h-full py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
  </div>
);

export default Spinner;