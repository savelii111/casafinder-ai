import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();

    const prices = {
      pro1: { amount: 900, name: 'Pro 1 Plan' },
      pro2: { amount: 2000, name: 'Pro 2 Plan' },
      ultimate: { amount: 4900, name: 'Ultimate Plan' }
    };

    const planData = prices[planId];
    if (!planData) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create or get customer
    let customer;
    const subs = await base44.entities.UserSubscription.filter({ user_email: user.email });
    
    if (subs[0]?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(subs[0].stripe_customer_id);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: planData.name,
            description: `${planData.name} - Monthly subscription`
          },
          unit_amount: planData.amount,
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/?success=true&plan=${planId}`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`,
      metadata: {
        user_email: user.email,
        plan_id: planId
      }
    });

    // Save customer ID
    if (subs.length > 0) {
      await base44.entities.UserSubscription.update(subs[0].id, {
        stripe_customer_id: customer.id
      });
    } else {
      await base44.entities.UserSubscription.create({
        user_email: user.email,
        plan: 'free',
        stripe_customer_id: customer.id
      });
    }

    return Response.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});