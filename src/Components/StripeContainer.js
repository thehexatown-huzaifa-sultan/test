// import React from 'react'
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from "./PaymentForm";

// export default function StripeContainer() {

//     const options = {
//         // passing the client secret obtained from the server
//         clientSecret: 'sk_test_51O2YfCKKOVnC0ABnymOQGslmkjwSvDvVe9vmPtvwfKeJoLfM4IGITBkjIkvLSl0Xp8wQiN97dRztuOefG9B9I7qi00xIV68X71',
//       };

//     const public_key = "pk_test_51O2YfCKKOVnC0ABneuVs9NHWrTS1V5f2Cob0564V1xMOE77YsK39gsfKSOXaC7qEf66gwradTiXurEM3eVtcz0Af00BMhOZD4t";
//     const stripTextPromise = loadStripe(public_key);
//     return (
//     <div>
//     <Elements stripe={stripTextPromise} options={options}>
//         <PaymentForm/>
//       </Elements>
//     </div>
//   )
// }

import { Elements } from "@stripe/react-stripe-js";
import getStripe from "../Utils/get-stripejs";
import ElementsForm from "./PaymentForm";

const DonatePag = () => {
  return (
    <div className="page-container">
      <Elements stripe={getStripe()}>
        <ElementsForm />
      </Elements>
    </div>
  );
};

export default DonatePag;
