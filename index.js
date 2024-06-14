const bodyParser = require('body-parser');
const express = require('express');
require('dotenv').config();
const app = express();

const stripe = require('stripe')(process.env.SECRET_KEY);;


const { v4: uuidv4 } = require('uuid');


const uniqueId = uuidv4();

console.log('Generated UUID:', uniqueId);
app.use(bodyParser());



app.post('/create_intent', async (req, res) => {
    const { amount } = req.body;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        capture_method: 'manual'
      });
      
      res.send({
        clientSecret: paymentIntent,
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  app.post('/capture_intent', async (req, res) => { 

    // For this to work client must execcute the payment so status is changed from incomplete
    const { paymentIntentId } = req.body;

    try {
        const paymentIntent1 = await stripe.paymentIntents.update(
            paymentIntentId,
            {
              metadata: {
                order_id: '6735',
              },
            }
          );
          console.log(paymentIntent1)
      
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
  
      
      res.send(paymentIntent);
    } catch (error) {
      
      res.status(500).send({ error: error.message });
    }
  });
  app.post('/create_refund', async (req, res) => {
    const { paymentIntentId } = req.body;
  
    try {
        try{
        const paymentIntent = await stripe.paymentIntents.confirm(
    paymentIntentId,
    {
      payment_method: 'pm_card_visa',
      return_url: 'https://www.example.com',
    }
  );
        }catch(err){
            // Process payment before refund
        }
      const paymentIntentret = await stripe.paymentIntents.retrieve(paymentIntentId);
    


      
      const refund = await stripe.refunds.create({charge:paymentIntentret.latest_charge});
  
      
      res.send(refund);
    } catch (error) {
      
      res.status(500).send({ error: error.message });
    }
  });
  app.get("/get_intents",async (req,res)=>{

    
    try{
        const paymentIntents = await stripe.paymentIntents.list();
      res.send(paymentIntents)
    }
    catch(err){
        res.status(500).send({ error: err.message });
    }
  });

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${port}`)
})