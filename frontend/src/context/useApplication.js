import { useContext } from 'react';
import { ApplicationContext } from './applicationContext';

export function useApplication() {
  return useContext(ApplicationContext);
}
