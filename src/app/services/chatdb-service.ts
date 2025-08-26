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
  writeBatch,
  getFirestore,
  setDoc,
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
    provider: string,
    sessionId?: string
  ): Promise<{ docId: string; sessionId: string }> {
    return runInInjectionContext(this.injector, async () => {
      let finalSessionId = sessionId;

      // Auto-generate sessionId if not provided
      if (!sessionId) {
        finalSessionId = await this.createSession(uid, prompt);
      }

      const chatData = {
        sessionId: finalSessionId,
        uid: uid,
        prompt: prompt,
        response: response,
        create_at: serverTimestamp(), // Server-side timestamp
        provider: provider,
      };

      const docRef = await addDoc(collection(this.firestore, 'chat'), chatData);
      return { docId: docRef.id, sessionId: finalSessionId! };
    });
  }

  // async createSession(uid: string, title: string): Promise<string> {
  //   const sessionData = {
  //     uid,
  //     title,
  //     createdAt: serverTimestamp(),
  //     updatedAt: serverTimestamp(),
  //   };

  //   const docRef = await addDoc(
  //     collection(this.firestore, 'sessions'),
  //     sessionData
  //   );
  //   return docRef.id; // This becomes the sessionId
  // }

  async createSession(uid: string, title: string): Promise<string> {
    const docRef = doc(collection(this.firestore, 'sessions')); // Generate doc reference first
    const sessionId = docRef.id; // Get the auto-generated ID

    const sessionData = {
      id: sessionId, // Store document ID as field
      uid,
      title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, sessionData); // Use setDoc with the reference
    return sessionId;
  }

  // async getNextSessionId(uid: string): Promise<number> {
  //   const chatCollection = collection(this.firestore, 'chat');
  //   const q = query(
  //     chatCollection,
  //     where('uid', '==', uid),
  //     orderBy('sessionId', 'desc'),
  //     limit(1)
  //   );

  //   const snapshot = await getDocs(q);

  //   if (snapshot.empty) {
  //     return 1; // First session for this email
  //   }

  //   const lastChat = snapshot.docs[0].data();
  //   return (lastChat['sessionId'] || 0) + 1;
  // }

  getChatsByUserSession(uid: string, sessionId: string): Observable<Chat[]> {
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

  async deleteSession(uid: string, sessionId: string): Promise<void> {
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

  async migrateSessionIds() {
    const firestore = getFirestore();
    const chatsRef = collection(firestore, 'chat');

    // Step 1: Get all unique (uid, sessionId) pairs
    const snapshot = await getDocs(chatsRef);
    const uniqueSessions = new Set<string>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (typeof data['sessionId'] === 'number') {
        uniqueSessions.add(`${data['uid']}:${data['sessionId']}`);
      }
    });

    console.log(`Found ${uniqueSessions.size} unique sessions to migrate`);

    // Step 2: Process each unique (uid, sessionId) pair
    for (const sessionKey of uniqueSessions) {
      const [uid, numericSessionId] = sessionKey.split(':');
      const newSessionId = crypto.randomUUID();

      // Create session document
      await addDoc(collection(firestore, 'sessions'), {
        uid,
        title: `Session ${numericSessionId}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update all chats for this (uid, sessionId) pair
      const sessionChatsQuery = query(
        chatsRef,
        where('uid', '==', uid),
        where('sessionId', '==', parseInt(numericSessionId))
      );

      const sessionChats = await getDocs(sessionChatsQuery);
      const batch = writeBatch(firestore);

      sessionChats.docs.forEach((doc) => {
        batch.update(doc.ref, { sessionId: newSessionId });
      });

      await batch.commit();
      console.log(
        `Migrated ${uid}:${numericSessionId} -> ${newSessionId} (${sessionChats.size} chats)`
      );
    }
  }
}
