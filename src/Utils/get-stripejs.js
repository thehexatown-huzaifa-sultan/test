/**
 * This is a singleton to ensure we only instantiate Stripe once.
 */
import { loadStripe } from '@stripe/stripe-js';

let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe("pk_test_51O2YfCKKOVnC0ABneuVs9NHWrTS1V5f2Cob0564V1xMOE77YsK39gsfKSOXaC7qEf66gwradTiXurEM3eVtcz0Af00BMhOZD4t");
  }
  return stripePromise;
};

export default getStripe;