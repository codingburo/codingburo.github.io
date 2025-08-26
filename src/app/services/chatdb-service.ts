import {
  inject,
  Injectable,
  Injector,
  runInInjectionContext,
} from '@angular/core';
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
  updateDoc,
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';

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

  getUserSessionsList(uid: string): Observable<Session[]> {
    return runInInjectionContext(this.injector, () => {
      const sessionsCollection = collection(this.firestore, 'sessions');
      const userSessionsQuery = query(
        sessionsCollection,
        where('uid', '==', uid),
        orderBy('updatedAt', 'desc'),
        orderBy('createdAt', 'desc'),
        orderBy('title', 'asc')
      );

      return collectionData(userSessionsQuery, { idField: 'id' }).pipe(
        map((sessions: any[]) =>
          sessions.map((session) => ({
            ...session,
            createdAt: (session.createdAt as Timestamp).toDate(),
            updatedAt: (session.updatedAt as Timestamp).toDate(),
          }))
        )
      );
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

  getChatsByUserSession(
    uid: string,
    sessionId: string
  ): Observable<{ chats: Chat[]; session: Session } | null> {
    return runInInjectionContext(this.injector, () => {
      const chatCollection = collection(this.firestore, 'chat');
      const sessionCollection = collection(this.firestore, 'sessions');

      const sessionChatsQuery = query(
        chatCollection,
        where('uid', '==', uid),
        where('sessionId', '==', sessionId),
        orderBy('create_at', 'asc')
      );

      const sessionQuery = query(
        sessionCollection,
        where('uid', '==', uid),
        where('id', '==', sessionId)
      );

      return from(
        Promise.all([getDocs(sessionChatsQuery), getDocs(sessionQuery)])
      ).pipe(
        map(([chatsSnapshot, sessionSnapshot]) => {
          const chats = chatsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            create_at: (doc.data()['create_at'] as Timestamp).toDate(),
          })) as Chat[];
          if (sessionSnapshot.empty) {
            return null; // Session was deleted
          }

          const session = {
            id: sessionSnapshot.docs[0].id,
            ...sessionSnapshot.docs[0].data(),
            createdAt: (
              sessionSnapshot.docs[0].data()['createdAt'] as Timestamp
            ).toDate(),
            updatedAt: (
              sessionSnapshot.docs[0].data()['updatedAt'] as Timestamp
            ).toDate(),
          } as Session;

          return { chats, session };
        })
      );
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

  //

  async deleteChat(chatId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      // First, get the chat to find its sessionId
      const chatDoc = doc(this.firestore, 'chat', chatId);
      const chatSnapshot = await getDocs(
        query(
          collection(this.firestore, 'chat'),
          where('__name__', '==', chatId)
        )
      );

      if (chatSnapshot.empty) return;

      const chatData = chatSnapshot.docs[0].data();
      const sessionId = chatData['sessionId'];

      // Delete the chat
      await deleteDoc(chatDoc);

      // Check if there are any remaining chats in this session
      const remainingChatsQuery = query(
        collection(this.firestore, 'chat'),
        where('sessionId', '==', sessionId)
      );

      const remainingChats = await getDocs(remainingChatsQuery);

      // If no chats remain, delete the session
      if (remainingChats.empty) {
        const sessionDoc = doc(this.firestore, 'sessions', sessionId);
        await deleteDoc(sessionDoc);
      }
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

  async deleteSessionDocument(sessionId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const sessionDoc = doc(this.firestore, 'sessions', sessionId);
      await deleteDoc(sessionDoc);
    });
  }

  async migrateSessionIdsx() {
    return;
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

  async migrateSessionIds() {
    console.log('New Migration Started');
    const firestore = getFirestore();
    const chatsRef = collection(firestore, 'chat');
    const sessionsRef = collection(firestore, 'sessions');

    console.log('Starting migration...');

    // Step 1: Clear existing sessions table
    console.log('Clearing existing sessions...');
    const existingSessions = await getDocs(sessionsRef);
    const clearBatch = writeBatch(firestore);
    existingSessions.docs.forEach((doc) => {
      clearBatch.delete(doc.ref);
    });
    await clearBatch.commit();
    console.log(`Cleared ${existingSessions.size} existing sessions`);

    // Step 2: Get all chats and group by (uid, sessionId)
    const allChats = await getDocs(chatsRef);
    const sessionGroups = new Map<string, any[]>();

    allChats.docs.forEach((doc) => {
      const data = doc.data();
      const sessionKey = `${data['uid']}:${data['sessionId']}`;

      if (!sessionGroups.has(sessionKey)) {
        sessionGroups.set(sessionKey, []);
      }
      sessionGroups.get(sessionKey)!.push({
        id: doc.id,
        ...data,
        create_at: data['create_at'],
      });
    });

    console.log(`Found ${sessionGroups.size} unique (uid, sessionId) pairs`);

    // Step 3: Process each session group
    for (const [sessionKey, chats] of sessionGroups) {
      const [uid, oldSessionId] = sessionKey.split(':');

      // Sort chats by create_at to get the first one
      chats.sort((a, b) => {
        const aTime = a.create_at?.toDate?.() || new Date(0);
        const bTime = b.create_at?.toDate?.() || new Date(0);
        return aTime.getTime() - bTime.getTime();
      });

      const firstChat = chats[0];
      const title = firstChat.prompt || `Session ${oldSessionId}`;

      // Create new session document
      const newSessionRef = doc(sessionsRef);
      const newSessionId = newSessionRef.id;

      await setDoc(newSessionRef, {
        id: newSessionId, // Store document ID as field per Session model
        uid,
        title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update all chats in this session
      const updateBatch = writeBatch(firestore);
      chats.forEach((chat) => {
        const chatRef = doc(chatsRef, chat.id);
        updateBatch.update(chatRef, { sessionId: newSessionId });
      });

      await updateBatch.commit();

      console.log(
        `Migrated ${uid}:${oldSessionId} -> ${newSessionId} (${chats.length} chats, title: "${title}")`
      );
    }

    console.log('Migration completed successfully!');
  }

  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const sessionDoc = doc(this.firestore, 'sessions', sessionId);
      await updateDoc(sessionDoc, {
        title: title,
        updatedAt: serverTimestamp(),
      });
    });
  }

  async findSessionsWithNoChats(): Promise<Session[]> {
    return runInInjectionContext(this.injector, async () => {
      const sessionsRef = collection(this.firestore, 'sessions');
      const chatsRef = collection(this.firestore, 'chat');

      // Get all sessions
      const allSessions = await getDocs(sessionsRef);
      const orphanedSessions: Session[] = [];

      // Check each session for chats
      for (const sessionDoc of allSessions.docs) {
        const sessionId = sessionDoc.id;

        // Query for chats with this sessionId
        const chatsQuery = query(chatsRef, where('sessionId', '==', sessionId));
        const chatsSnapshot = await getDocs(chatsQuery);

        // If no chats found, add to orphaned list
        if (chatsSnapshot.empty) {
          orphanedSessions.push({
            id: sessionDoc.id,
            ...sessionDoc.data(),
            createdAt: (sessionDoc.data()['createdAt'] as Timestamp).toDate(),
            updatedAt: (sessionDoc.data()['updatedAt'] as Timestamp).toDate(),
          } as Session);
        }
      }

      return orphanedSessions;
    });
  }
}
