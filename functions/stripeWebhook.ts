import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userEmail = session.metadata.user_email;
        const planId = session.metadata.plan_id;

        const subs = await base44.asServiceRole.entities.UserSubscription.filter({ 
          user_email: userEmail 
        });

        if (subs.length > 0) {
          await base44.asServiceRole.entities.UserSubscription.update(subs[0].id, {
            plan: planId,
            stripe_subscription_id: session.subscription
          });
        }

        // Send notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: userEmail,
          title: 'Subscription Activated',
          message: `Your ${planId} plan is now active!`,
          type: 'system',
          read: false
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const subs = await base44.asServiceRole.entities.UserSubscription.filter({ 
          stripe_subscription_id: subscription.id 
        });

        if (subs.length > 0) {
          await base44.asServiceRole.entities.UserSubscription.update(subs[0].id, {
            plan: 'free',
            stripe_subscription_id: null
          });
        }
        break;
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});