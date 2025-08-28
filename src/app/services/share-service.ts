// services/share.service.ts
import {
  Injectable,
  inject,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  updateDoc,
  collection,
  serverTimestamp,
  increment,
  where,
  getDocs,
  query,
  getDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class ShareService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private injector = inject(Injector);

  async createShareToken(
    chatId: string,
    visibility: 'public' | 'group'
  ): Promise<string> {
    return runInInjectionContext(this.injector, async () => {
      const userId = this.auth.currentUserSignal()?.uid;
      if (!userId) throw new Error('User not authenticated');

      // Generate unique token
      const token = this.generateToken();

      // Create share token document
      const shareTokenRef = doc(collection(this.firestore, 'share_tokens'));
      await setDoc(shareTokenRef, {
        chatId,
        token,
        createdBy: userId,
        createdAt: serverTimestamp(),
        isActive: true,
      });

      // Update chat visibility
      const chatRef = doc(this.firestore, `chat/${chatId}`);
      await updateDoc(chatRef, {
        visibility,
        'interactions.shares': increment(1),
      });

      return token;
    });
  }

  private generateToken(): string {
    return crypto.randomUUID().replace(/-/g, '');
  }

  async getSharedChat(
    token: string
  ): Promise<{ chat: Chat; ownerEmail: string }> {
    return runInInjectionContext(this.injector, async () => {
      // Find share token
      const tokenQuery = query(
        collection(this.firestore, 'share_tokens'),
        where('token', '==', token),
        where('isActive', '==', true)
      );

      const tokenSnapshot = await getDocs(tokenQuery);
      if (tokenSnapshot.empty) {
        throw new Error('Invalid or expired share token');
      }

      const tokenData = tokenSnapshot.docs[0].data();
      const chatId = tokenData['chatId'];
      const createdBy = tokenData['createdBy'];

      // Get owner's email from users collection or use UID
      let ownerEmail = createdBy; // Fallback to UID

      // Optional: Get actual email from users collection if you have one
      // const userDoc = await getDoc(doc(this.firestore, `users/${createdBy}`));
      // if (userDoc.exists()) {
      //   ownerEmail = userDoc.data()['email'] || createdBy;
      // }

      // Get chat data
      const chatRef = doc(this.firestore, `chat/${chatId}`);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        throw new Error('Chat not found');
      }

      const chatData = chatSnap.data();
      const chat = {
        id: chatSnap.id,
        ...chatData,
        create_at: chatData['create_at'].toDate(),
      } as Chat;

      return { chat, ownerEmail };
    });
  }

  async trackView(token: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      // Find the chat via token
      const tokenQuery = query(
        collection(this.firestore, 'share_tokens'),
        where('token', '==', token),
        where('isActive', '==', true)
      );

      const tokenSnapshot = await getDocs(tokenQuery);
      if (!tokenSnapshot.empty) {
        const chatId = tokenSnapshot.docs[0].data()['chatId'];

        // Increment view count
        const chatRef = doc(this.firestore, `chat/${chatId}`);
        await updateDoc(chatRef, {
          'interactions.views': increment(1),
        });
      }
    });
  }

  // In share-service.ts
  async getActiveShareTokens(chatId: string): Promise<any[]> {
    return runInInjectionContext(this.injector, async () => {
      const tokensQuery = query(
        collection(this.firestore, 'share_tokens'),
        where('chatId', '==', chatId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(tokensQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    });
  }

  async deactivateShareTokens(chatId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const tokensQuery = query(
        collection(this.firestore, 'share_tokens'),
        where('chatId', '==', chatId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(tokensQuery);
      const batch = writeBatch(this.firestore);

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isActive: false });
      });

      await batch.commit();
    });
  }
}
