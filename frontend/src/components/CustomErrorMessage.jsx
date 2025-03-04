import React from 'react';
import { ErrorMessage } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';

const CustomErrorMessage = ({ name }) => {
  return (
    <ErrorMessage name={name}>
      {(msg) => (
        <AnimatePresence>
          <motion.div 
            className="FieldErrorMsg"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {msg}
          </motion.div>
        </AnimatePresence>
      )}
    </ErrorMessage>
  );
};

export default CustomErrorMessage;
