import { authStore } from '$stores/auth.svelte';
import { fetchCloudCharacters, saveCloudCharacter, deleteCloudCharacter } from '$lib/cloudStorage';
import type { Character } from '$types/character';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

class SyncService {
  status = $state<SyncStatus>('idle');
  lastSyncedAt = $state<string | null>(null);
  error = $state<string | null>(null);
  pendingChanges = $state<number>(0);

  /**
   * Full two-way sync between local and cloud.
   * Takes local characters as input and returns the merged set.
   */
  async sync(localCharacters: Character[], saveLocal: (char: Character) => Promise<void>): Promise<void> {
    if (!authStore.isAuthenticated) {
      this.status = 'idle';
      return;
    }

    this.status = 'syncing';
    this.error = null;

    try {
      // 1. Fetch cloud characters
      const cloudCharacters = await fetchCloudCharacters();
      const cloudMap = new Map(cloudCharacters.map(c => [c.id, c]));

      // 2. Build local map
      const localMap = new Map(localCharacters.map(c => [c.id, c]));

      // 3. Merge with "last write wins" strategy
      const allIds = new Set([...cloudMap.keys(), ...localMap.keys()]);

      for (const id of allIds) {
        const cloud = cloudMap.get(id);
        const local = localMap.get(id);

        if (cloud && local) {
          // Both exist - use most recent
          const cloudTime = new Date(cloud.updatedAt).getTime();
          const localTime = new Date(local.updatedAt).getTime();
          if (cloudTime > localTime) {
            // Cloud is newer, save to local
            await saveLocal(cloud);
          } else if (localTime > cloudTime) {
            // Local is newer, push to cloud
            await saveCloudCharacter(local);
          }
        } else if (cloud) {
          // Only in cloud - download to local
          await saveLocal(cloud);
        } else if (local) {
          // Only local - upload to cloud
          await saveCloudCharacter(local);
        }
      }

      this.status = 'success';
      this.lastSyncedAt = new Date().toISOString();
      this.pendingChanges = 0;

    } catch (e) {
      this.status = 'error';
      this.error = e instanceof Error ? e.message : 'Sync failed';
      console.error('Sync failed:', e);
    }
  }

  /**
   * Push a single character to cloud (called after local save)
   */
  async pushCharacter(character: Character): Promise<void> {
    if (!authStore.isAuthenticated) {
      this.pendingChanges++;
      return;
    }

    const success = await saveCloudCharacter(character);
    if (!success) {
      this.pendingChanges++;
    }
  }

  /**
   * Delete from cloud (called after local delete)
   */
  async deleteFromCloud(characterId: string): Promise<void> {
    if (!authStore.isAuthenticated) return;
    await deleteCloudCharacter(characterId);
  }
}

export const syncService = new SyncService();
