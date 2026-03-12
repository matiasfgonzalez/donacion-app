import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const DAY_IN_MS = 86_400_000;

export async function getUserSubscription() {
  const { userId } = await auth();
  if (!userId) return null;

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
  });

  return subscription;
}

export async function isSubscribed() {
  const subscription = await getUserSubscription();
  if (!subscription) return false;

  const isActive =
    subscription.status === 'authorized' &&
    subscription.currentPeriodEnd != null &&
    subscription.currentPeriodEnd.getTime() + DAY_IN_MS > Date.now();

  return isActive;
}
