import React from 'react';

import { ErrorMessage } from 'formik';

const CustomErrorMessage = ({ name }) => (
  <ErrorMessage name={name} component="div" className="FieldErrorMessage" />
);

export default CustomErrorMessage;
