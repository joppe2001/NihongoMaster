import { query, execute } from '@/lib/db';

/**
 * Get a user's custom mnemonic for a specific content item.
 */
export async function getUserMnemonic(
  userId: number,
  contentType: string,
  contentId: number
): Promise<string | null> {
  const rows = await query<{ mnemonic_text: string }>(
    'SELECT mnemonic_text FROM user_mnemonics WHERE user_id = $1 AND content_type = $2 AND content_id = $3',
    [userId, contentType, contentId]
  );
  return rows.length > 0 ? rows[0].mnemonic_text : null;
}

/**
 * Save or update a user's custom mnemonic.
 */
export async function saveUserMnemonic(
  userId: number,
  contentType: string,
  contentId: number,
  text: string
): Promise<void> {
  await execute(
    `INSERT INTO user_mnemonics (user_id, content_type, content_id, mnemonic_text)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT(user_id, content_type, content_id)
     DO UPDATE SET mnemonic_text = $4`,
    [userId, contentType, contentId, text]
  );
}

/**
 * Delete a user's custom mnemonic.
 */
export async function deleteUserMnemonic(
  userId: number,
  contentType: string,
  contentId: number
): Promise<void> {
  await execute(
    'DELETE FROM user_mnemonics WHERE user_id = $1 AND content_type = $2 AND content_id = $3',
    [userId, contentType, contentId]
  );
}
