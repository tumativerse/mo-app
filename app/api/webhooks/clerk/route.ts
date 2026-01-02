import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Clerk webhook event types
type ClerkWebhookEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    created_at: number;
  };
};

/**
 * Clerk Webhook Handler
 * Automatically creates/updates users in our database when they sign up/change in Clerk
 */
export async function POST(req: NextRequest) {
  // Get webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Verify headers exist
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: ClerkWebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  const eventType = evt.type;
  const { id: clerkId, email_addresses } = evt.data;

  console.log(`Webhook received: ${eventType} for user ${clerkId}`);

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(clerkId, email_addresses);
        break;

      case 'user.updated':
        await handleUserUpdated(clerkId, email_addresses);
        break;

      case 'user.deleted':
        await handleUserDeleted(clerkId);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`Error handling ${eventType}:`, error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

/**
 * Handle user.created event
 * Creates user in our database with default preferences
 */
async function handleUserCreated(
  clerkId: string,
  emailAddresses: Array<{ email_address: string; id: string }>
) {
  const primaryEmail = emailAddresses[0]?.email_address;

  if (!primaryEmail) {
    // Handle test events from Clerk Dashboard (they have empty email arrays)
    if (emailAddresses.length === 0) {
      console.log(`Test event received for user ${clerkId} - skipping (no email)`);
      return;
    }
    throw new Error('No email address found for user');
  }

  console.log(`Creating user: ${clerkId} (${primaryEmail})`);

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (existingUser) {
    console.log(`User ${clerkId} already exists, skipping creation`);
    return;
  }

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      clerkId,
      email: primaryEmail,
      units: 'imperial', // Default to imperial
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  console.log(`Created user in DB: ${newUser.id}`);

  // Note: Preferences are auto-created on first access by getPreferences()
  // with proper encrypted defaults. No need to create them here.
}

/**
 * Handle user.updated event
 * Updates user email if changed
 */
async function handleUserUpdated(
  clerkId: string,
  emailAddresses: Array<{ email_address: string; id: string }>
) {
  const primaryEmail = emailAddresses[0]?.email_address;

  if (!primaryEmail) {
    // Handle test events from Clerk Dashboard (they have empty email arrays)
    if (emailAddresses.length === 0) {
      console.log(`Test event received for user ${clerkId} - skipping (no email)`);
      return;
    }
    throw new Error('No email address found for user');
  }

  console.log(`Updating user: ${clerkId} (${primaryEmail})`);

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) {
    console.warn(`User ${clerkId} not found in database during update`);
    // Create them if they don't exist (shouldn't happen, but safeguard)
    await handleUserCreated(clerkId, emailAddresses);
    return;
  }

  // Update email if changed
  if (user.email !== primaryEmail) {
    await db
      .update(users)
      .set({
        email: primaryEmail,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    console.log(`Updated email for user ${user.id}: ${primaryEmail}`);
  }
}

/**
 * Handle user.deleted event
 * Soft delete or remove user from database
 */
async function handleUserDeleted(clerkId: string) {
  console.log(`Deleting user: ${clerkId}`);

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) {
    console.warn(`User ${clerkId} not found in database during deletion`);
    return;
  }

  // For now, just log - you can decide if you want to actually delete data
  // or soft delete (add a deletedAt field)
  console.log(`User ${clerkId} deleted from Clerk. Database user ID: ${user.id}`);

  // Optional: Actually delete the user and all their data
  // await db.delete(users).where(eq(users.id, user.id));
}
