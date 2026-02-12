import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

// Maximum number of visits to keep per user (to prevent unbounded growth)
const MAX_VISITS_PER_USER = 1000;

/**
 * Records a user activity event (login or token check)
 * @param email - User email (normalized)
 * @param eventType - Either "login" or "token_check"
 * @param ip - Client IP address
 * @param userAgent - Optional user agent string
 */
export async function recordUserActivity(
  email: string,
  eventType: 'login' | 'token_check',
  ip: string,
  userAgent?: string
): Promise<void> {
  try {
    // Create the visit record
    const visitRecord = {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      ip_address: ip,
      ...(userAgent && { user_agent: userAgent })
    };

    // Get current user record
    const { data: existingData, error: fetchError } = await supabase
      .from('user_activity_93da04dc')
      .select('visits')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching user activity:', fetchError);
      return; // Don't break auth if tracking fails
    }

    // Get existing visits or initialize empty array
    // maybeSingle() returns { data: null } when no record found, which is fine
    const existingVisits = existingData?.visits || [];

    // Add new visit to the array
    const updatedVisits = [...existingVisits, visitRecord];

    // Limit visits to prevent unbounded growth
    const visitsToKeep = updatedVisits.length > MAX_VISITS_PER_USER
      ? updatedVisits.slice(-MAX_VISITS_PER_USER)
      : updatedVisits;

    // Upsert the user record
    // Note: login_count and token_check_count are GENERATED columns that automatically
    // count from the visits array, so we don't need to update them manually
    const { error: upsertError } = await supabase
      .from('user_activity_93da04dc')
      .upsert({
        email,
        visits: visitsToKeep,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'email'
      });

    if (upsertError) {
      console.error('Error recording user activity:', upsertError);
      // Don't throw - activity tracking failures should not break authentication
    }
  } catch (error) {
    console.error('Unexpected error in recordUserActivity:', error);
    // Silently fail - don't break auth flow
  }
}

