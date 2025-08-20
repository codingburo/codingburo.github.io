import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  doc,
  docData,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  deleteDoc,
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatdbService {
  private injector = inject(Injector);
  firestore = inject(Firestore);

  getChat(uid: string): Observable<Chat[]> {
    return runInInjectionContext(this.injector, () => {
      const chatCollection = collection(this.firestore, 'chat');
      const userChatsQuery = query(
        chatCollection,
        where('uid', '==', uid) // Filter by user email
      );
      return collectionData(userChatsQuery, { idField: 'id' }) as Observable<
        Chat[]
      >;
    });
  }

  getChatById(id: string): Observable<Chat | null> {
    return runInInjectionContext(this.injector, () => {
      const chatDoc = doc(this.firestore, 'chat', id); // ← Use doc() with document ID

      return docData(chatDoc, { idField: 'id' }).pipe(
        // ← Use docData() not collectionData()
        map((chat: any) => {
          if (!chat) return null;

          return {
            ...chat,
            create_at: (chat.create_at as Timestamp).toDate(),
          } as Chat;
        })
      );
    });
  }

  getUserSessionsList(uid: string): Observable<Chat[]> {
    return runInInjectionContext(this.injector, () => {
      const chatCollection = collection(this.firestore, 'chat');
      const userChatsQuery = query(
        chatCollection,
        where('uid', '==', uid),
        orderBy('create_at', 'asc')
      );

      return collectionData(userChatsQuery, { idField: 'id' }).pipe(
        map((chats: any[]) => {
          const processedChats = chats.map((chat) => ({
            ...chat,
            create_at: chat.create_at
              ? (chat.create_at as Timestamp).toDate()
              : new Date(),
          }));

          // Group by sessionId and keep only the first chat from each session
          const sessionMap = new Map<number, Chat>();
          processedChats.forEach((chat) => {
            if (!sessionMap.has(chat.sessionId)) {
              sessionMap.set(chat.sessionId, chat);
            }
          });

          // Return sessions sorted by create_at desc (newest first)
          return Array.from(sessionMap.values()).sort(
            (a, b) => b.create_at.getTime() - a.create_at.getTime()
          );
        })
      ) as Observable<Chat[]>;
    });
  }

  async createChat(
    uid: string,
    prompt: string,
    response: string,
    sessionId?: number
  ): Promise<{ docId: string; sessionId: number }> {
    return runInInjectionContext(this.injector, async () => {
      let finalSessionId = sessionId;

      // Auto-generate sessionId if not provided
      if (!sessionId) {
        finalSessionId = await this.getNextSessionId(uid);
      }

      const chatData = {
        sessionId: finalSessionId,
        uid: uid,
        prompt: prompt,
        response: response,
        create_at: serverTimestamp(), // Server-side timestamp
      };

      const docRef = await addDoc(collection(this.firestore, 'chat'), chatData);
      return { docId: docRef.id, sessionId: finalSessionId! };
    });
  }

  private async getNextSessionId(uid: string): Promise<number> {
    const chatCollection = collection(this.firestore, 'chat');
    const q = query(
      chatCollection,
      where('uid', '==', uid),
      orderBy('sessionId', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return 1; // First session for this email
    }

    const lastChat = snapshot.docs[0].data();
    return (lastChat['sessionId'] || 0) + 1;
  }

  getChatsByUserSession(uid: string, sessionId: number): Observable<Chat[]> {
    return runInInjectionContext(this.injector, () => {
      const chatCollection = collection(this.firestore, 'chat');
      const sessionChatsQuery = query(
        chatCollection,
        where('uid', '==', uid),
        where('sessionId', '==', sessionId),
        orderBy('create_at', 'asc') // Ascending order by creation time
      );

      return collectionData(sessionChatsQuery, { idField: 'id' }).pipe(
        map((chats: any[]) =>
          chats.map((chat) => ({
            ...chat,
            create_at: (chat.create_at as Timestamp).toDate(), // Convert timestamp
          }))
        )
      ) as Observable<Chat[]>;
    });
  }

  getAllUserSessions(uid: string): Observable<Chat[]> {
    return runInInjectionContext(this.injector, () => {
      const chatCollection = collection(this.firestore, 'chat');
      const userChatsQuery = query(
        chatCollection,
        where('uid', '==', uid),
        orderBy('create_at', 'desc') // Order by time desc
      );

      return collectionData(userChatsQuery, { idField: 'id' }).pipe(
        map((chats: any[]) =>
          chats.map((chat) => ({
            ...chat,
            create_at: (chat.create_at as Timestamp).toDate(),
          }))
        )
      ) as Observable<Chat[]>;
    });
  }

  async deleteChat(chatId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const chatDoc = doc(this.firestore, 'chat', chatId);
      await deleteDoc(chatDoc);
    });
  }

  async deleteSession(uid: string, sessionId: number): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const chatCollection = collection(this.firestore, 'chat');
      const sessionQuery = query(
        chatCollection,
        where('uid', '==', uid),
        where('sessionId', '==', sessionId)
      );

      const snapshot = await getDocs(sessionQuery);
      const deletePromises = snapshot.docs.map((docSnapshot) =>
        deleteDoc(docSnapshot.ref)
      );
      await Promise.all(deletePromises);
    });
  }
}
