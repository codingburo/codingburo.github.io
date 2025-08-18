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
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatdbService {
  private injector = inject(Injector);
  firestore = inject(Firestore);
  private chatCollection;

  constructor() {
    this.chatCollection = collection(this.firestore, 'chat'); // ← Move here
  }
  getChat(userEmail: string): Observable<Chat[]> {
    return runInInjectionContext(this.injector, () => {
      const chatCollection = collection(this.firestore, 'chat');
      const userChatsQuery = query(
        this.chatCollection,
        where('email', '==', userEmail) // Filter by user email
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

  async createChat(
    email: string,
    prompt: string,
    response: string,
    sessionId?: number
  ): Promise<string> {
    return runInInjectionContext(this.injector, async () => {
      let finalSessionId = sessionId;

      // Auto-generate sessionId if not provided
      if (!sessionId) {
        finalSessionId = await this.getNextSessionId(email);
      }

      const chatData = {
        sessionId: finalSessionId,
        email: email,
        prompt: prompt,
        response: response,
        create_at: serverTimestamp(), // Server-side timestamp
      };

      const docRef = await addDoc(collection(this.firestore, 'chat'), chatData);
      return docRef.id; // Return document ID
    });
  }

  private async getNextSessionId(email: string): Promise<number> {
    const chatCollection = collection(this.firestore, 'chat');
    const q = query(
      chatCollection,
      where('email', '==', email),
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

  getChatsByUserSession(email: string, sessionId: number): Observable<Chat[]> {
    return runInInjectionContext(this.injector, () => {
      const chatCollection = collection(this.firestore, 'chat');
      const sessionChatsQuery = query(
        chatCollection,
        where('email', '==', email),
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

  getAllUserSessions(email: string): Observable<Chat[]> {
    return runInInjectionContext(this.injector, () => {
      const chatCollection = collection(this.firestore, 'chat');
      const userChatsQuery = query(
        chatCollection,
        where('email', '==', email),
        orderBy('sessionId', 'asc'),
        orderBy('create_at', 'asc') // Order by session, then by time
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
}
