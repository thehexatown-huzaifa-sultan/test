// import React from "react";
// import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
// import axios from "axios";
// import { useState } from "react";

// export default function PaymentForm() {
//   var [success, setSuccess] = useState(false);
//   const stripe = useStripe();

//   const elements = useElements();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { error, paymentMethod } = await stripe.createPaymentMethod({
//       type: "card",
//       card: elements.getElement(CardElement),
//     });

//     if (!error) {
//       try {
//         const { id } = paymentMethod;
//         const response = await axios.post("http://localhost:8080/payment", {
//           amount: 1000,
//           id,
//         });

//         if (response.data.success) {
//           console.log("Successful payment");
//           setSuccess(true);
//         }
//       } catch (e) {
//         console.log(e);
//       }
//     } else {
//       console.log(error.message);
//     }

//     return (
//         <>
//         {!success?
//         <>
//             <form onSubmit={handleSubmit}>
//                 <fieldset className="FormGroup">
//                     <div className="FormRow">
//                         <CardElement options={CARD_OPTIONS}/>
//                     </div>
//                 </fieldset>

//                 <button>Pay</button>
//             </form>
//         </>: <>
//             <h1>Payment Successful!</h1>
//         </>}
//         </>
//     )
//   };
// }
import React, { useState } from 'react';

import CustomDonationInput from './CustomDonationInput';
import StripeTestCards from './StripeTestCards';
import PrintObject from './PrintObject';

import { fetchPostJSON } from '../Utils/api-helper';
import { formatAmountForDisplay } from '../Utils/stripe-helpers';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CARD_OPTIONS = {
  iconStyle: 'solid',
  style: {
    base: {
      iconColor: '#6772e5',
      color: '#6772e5',
      fontWeight: '500',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': {
        color: '#fce883',
      },
      '::placeholder': {
        color: '#6772e5',
      },
    },
    invalid: {
      iconColor: '#ef2961',
      color: '#ef2961',
    },
  },
};
var config = {
    CURRENCY: 'usd',

    MIN_AMOUNT:10.0,
    MAX_AMOUNT:5000.0,
    AMOUNT_STEP:5.0
}

const ElementsForm = () => {
  const [input, setInput] = useState({
    customDonation: Math.round(config.MAX_AMOUNT / config.AMOUNT_STEP),
    cardholderName: '',
  });
  const [payment, setPayment] = useState({ status: 'initial' });
  const [errorMessage, setErrorMessage] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const PaymentStatus = ({ status }) => {
    switch (status) {
      case 'processing':
      case 'requires_payment_method':
      case 'requires_confirmation':
        return <h2>Processing...</h2>;

      case 'requires_action':
        return <h2>Authenticating...</h2>;

      case 'succeeded':
        return <h2>Payment Succeeded 🥳</h2>;

      case 'error':
        
        return (
          <>
            <h2>Error 😭</h2>
            <p className="error-message">{errorMessage}</p>
          </>
        );

      default:
        return null;
    }
  };

  const handleInputChange = (e) =>
    setInput({
      ...input,
      [e.currentTarget.name]: e.currentTarget.value,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Abort if form isn't valid
    if (!e.currentTarget.reportValidity()) return;
    setPayment({ status: 'processing' });

    // Create a PaymentIntent with the specified amount.
    const response = await fetchPostJSON('/api/payment_intents', {
      amount: input.customDonation,
    });
    setPayment(response);

    if (response.statusCode === 500) {
      setPayment({ status: 'error' });
      setErrorMessage(response.message);
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      response.client_secret,
      {
        payment_method: {
          card: cardElement,
          billing_details: { name: input.cardholderName },
        },
      }
    );

    if (error) {
      setPayment({ status: 'error' });
      setErrorMessage(error.message ?? 'An unknown error occured');
    } else if (paymentIntent) {
      setPayment(paymentIntent);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <CustomDonationInput
          className="elements-style"
          name="customDonation"
          value={input.customDonation}
          min={config.MIN_AMOUNT}
          max={config.MAX_AMOUNT}
          step={config.AMOUNT_STEP}
          currency={config.CURRENCY}
          onChange={handleInputChange}
        />
        <StripeTestCards />
        <fieldset className="elements-style">
          <legend>Your payment details:</legend>
          <input
            placeholder="Cardholder name"
            className="elements-style"
            type="Text"
            name="cardholderName"
            onChange={handleInputChange}
            required
          />
          <div className="FormRow elements-style">
            <CardElement
              options={CARD_OPTIONS}
              onChange={(e) => {
                if (e.error) {
                  setPayment({ status: 'error' });
                  setErrorMessage(
                    e.error.message ?? 'An unknown error occured'
                  );
                }
              }}
            />
          </div>
        </fieldset>
        <button
          className="elements-style-background"
          type="submit"
          disabled={
            !['initial', 'succeeded', 'error'].includes(payment.status) ||
            !stripe
          }
        >
          Donate {formatAmountForDisplay(input.customDonation, config.CURRENCY)}
        </button>
      </form>
      <PaymentStatus status={payment.status} />
      <PrintObject content={payment} />
    </>
  );
};

export default ElementsForm;