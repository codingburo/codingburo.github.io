import { inject, Injectable, Injector, runInInjectionContext } from "@angular/core";
import { collection, doc, Firestore, getDoc, getDocs, increment, query, updateDoc, where, WriteBatch, writeBatch } from "@angular/fire/firestore";
import { AuthService } from "./auth-service";

// services/chat-interactions.service.ts
@Injectable({ providedIn: 'root' })
export class ChatInteractionsService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private injector = inject(Injector);

  async toggleLike(chatId: string) {
    return runInInjectionContext(this.injector, async () => {
      const userId = this.auth.currentUserSignal()?.uid;
      if (!userId) return;

      // Find existing interaction for this user+chat
      const existingQuery = query(
        collection(this.firestore, 'chat_interactions'),
        where('chatId', '==', chatId),
        where('uid', '==', userId)
      );

      const existingSnap = await getDocs(existingQuery);
      const batch = writeBatch(this.firestore);
      await this.ensureInteractionsField(chatId, batch);
      const chatRef = doc(this.firestore, `chat/${chatId}`);

      try {
        if (!existingSnap.empty) {
          // User has existing interaction
          const existingDoc = existingSnap.docs[0];
          const currentReaction = existingDoc.data()['reaction'];

          if (currentReaction === 'like') {
            // Remove like (set to null)
            batch.update(existingDoc.ref, {
              reaction: null,
              timestamp: new Date(),
            });
            batch.update(chatRef, { 'interactions.likes': increment(-1) });
          } else if (currentReaction === 'dislike') {
            // Change from dislike to like
            batch.update(existingDoc.ref, {
              reaction: 'like',
              timestamp: new Date(),
            });
            batch.update(chatRef, {
              'interactions.dislikes': increment(-1),
              'interactions.likes': increment(1),
            });
          } else {
            // currentReaction is null, set to like
            batch.update(existingDoc.ref, {
              reaction: 'like',
              timestamp: new Date(),
            });
            batch.update(chatRef, { 'interactions.likes': increment(1) });
          }
        } else {
          // Create new interaction with auto-generated ID
          const newInteractionRef = doc(
            collection(this.firestore, 'chat_interactions')
          );
          batch.set(newInteractionRef, {
            chatId,
            uid: userId,
            reaction: 'like',
            timestamp: new Date(),
          });
          batch.update(chatRef, { 'interactions.likes': increment(1) });
        }

        await batch.commit();
      } catch (error) {
        console.error('Like interaction failed:', error);
        this.syncChatCounts(chatId);
      }
    });
  }

  async toggleDislike(chatId: string) {
    return runInInjectionContext(this.injector, async () => {
      const userId = this.auth.currentUserSignal()?.uid;
      if (!userId) return;

      // Find existing interaction for this user+chat
      const existingQuery = query(
        collection(this.firestore, 'chat_interactions'),
        where('chatId', '==', chatId),
        where('uid', '==', userId)
      );

      const existingSnap = await getDocs(existingQuery);
      const batch = writeBatch(this.firestore);
      await this.ensureInteractionsField(chatId, batch);
      const chatRef = doc(this.firestore, `chat/${chatId}`);

      try {
        if (!existingSnap.empty) {
          // User has existing interaction
          const existingDoc = existingSnap.docs[0];
          const currentReaction = existingDoc.data()['reaction'];

          if (currentReaction === 'dislike') {
            // Remove dislike (set to null)
            batch.update(existingDoc.ref, {
              reaction: null,
              timestamp: new Date(),
            });
            batch.update(chatRef, { 'interactions.dislikes': increment(-1) });
          } else if (currentReaction === 'like') {
            // Change from like to dislike
            batch.update(existingDoc.ref, {
              reaction: 'dislike',
              timestamp: new Date(),
            });
            batch.update(chatRef, {
              'interactions.likes': increment(-1),
              'interactions.dislikes': increment(1),
            });
          } else {
            // currentReaction is null, set to dislike
            batch.update(existingDoc.ref, {
              reaction: 'dislike',
              timestamp: new Date(),
            });
            batch.update(chatRef, { 'interactions.dislikes': increment(1) });
          }
        } else {
          // Create new interaction with auto-generated ID
          const newInteractionRef = doc(
            collection(this.firestore, 'chat_interactions')
          );
          batch.set(newInteractionRef, {
            chatId,
            uid: userId,
            reaction: 'dislike',
            timestamp: new Date(),
          });
          batch.update(chatRef, { 'interactions.dislikes': increment(1) });
        }

        await batch.commit();
      } catch (error) {
        console.error('Dislike interaction failed:', error);
        this.syncChatCounts(chatId);
      }
    });
  }

  private async ensureInteractionsField(chatId: string, batch: WriteBatch) {
    return runInInjectionContext(this.injector, async () => {
    const chatRef = doc(this.firestore, `chat/${chatId}`);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists() || !chatSnap.data()?.['interactions']) {
      batch.set(
        chatRef,
        {
          interactions: {
            likes: 0,
            dislikes: 0,
            shares: 0,
            copies: 0,
            retries: 0,
          },
        },
        { merge: true }
      );
    }
  });
  }

  async getUserReaction(
    chatId: string,
    userId: string
  ): Promise<'like' | 'dislike' | null> {
    return runInInjectionContext(this.injector, async () => {
      const existingQuery = query(
        collection(this.firestore, 'chat_interactions'),
        where('chatId', '==', chatId),
        where('uid', '==', userId)
      );

      const existingSnap = await getDocs(existingQuery);

      if (existingSnap.empty) {
        return null;
      }

      const reaction = existingSnap.docs[0].data()['reaction'];
      return reaction === 'like' || reaction === 'dislike' ? reaction : null;
    });
  }

  // Integrity maintenance
  private async syncChatCounts(chatId: string) {
    const interactions = await getDocs(
      query(
        collection(this.firestore, 'chat_interactions'),
        where('chatId', '==', chatId)
      )
    );

    const counts = { likes: 0, dislikes: 0, shares: 0, copies: 0, retries: 0 };
    interactions.forEach((doc) => {
      const reaction = doc.data()['reaction'];
      if (reaction === 'like') counts.likes++;
      if (reaction === 'dislike') counts.dislikes++;
    });

    await updateDoc(doc(this.firestore, `chat/${chatId}`), {
      interactions: counts,
    });
  }

  async copyToClipboard(chatId: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      await this.recordAction(chatId, 'copy');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }

  async shareChat(chatId: string) {
    const shareUrl = `${window.location.origin}/shared-chat/${chatId}`;

    try {
      if (navigator.share) {
        await navigator.share({ url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
      await this.recordAction(chatId, 'share');
    } catch (error) {
      console.error('Share failed:', error);
    }
  }

  private async recordAction(
    chatId: string,
    action: 'copy' | 'share' | 'retry'
  ) {
    const chatRef = doc(this.firestore, `chat/${chatId}`);
    try {
      await updateDoc(chatRef, { [`interactions.${action}s`]: increment(1) });
    } catch (error) {
      console.error(`Failed to record ${action}:`, error);
    }
  }
}
