import { 
  db,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  addDoc,
  deleteDoc,
  updateDoc,
  orderBy,
  limit,
  handleFirestoreError, 
  OperationType 
} from '../firebase/firestore';
import { auth } from '../firebase/auth';
import { 
  Campaign, 
  Session, 
  NPC, 
  Location, 
  Encounter, 
  MasterNote, 
  MasterRoll, 
  CampaignPlayer,
  Milestone
} from '../types/master';

const cleanUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof Timestamp)) {
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        newObj[key] = cleanUndefined(obj[key]);
      }
    });
    return newObj;
  }
  return obj;
};

export const MasterService = {
  // --- Campaigns ---
  async createCampaign(masterId: string, data: Partial<Campaign>) {
    try {
      const campaignData = cleanUndefined({
        masterId,
        identity: {
          name: data.identity?.name || 'Nova Campanha',
          subtitle: data.identity?.subtitle || '',
          shortDescription: data.identity?.shortDescription || '',
          fullDescription: data.identity?.fullDescription || '',
          system: data.identity?.system || 'D&D 5e',
          setting: data.identity?.setting || '',
          narrativeTone: data.identity?.narrativeTone || 'heroico',
          coverUrl: data.identity?.coverUrl || '',
          bannerUrl: data.identity?.bannerUrl || '',
        },
        status: {
          state: 'active',
          visibility: 'private',
          isFavorite: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        settings: {
          acceptsPlayers: false,
          playerLimit: 5,
          quickSessionMode: true,
          allowCharacterLinking: true,
          showAutomaticSummary: true,
        },
        narrative: {
          premise: data.narrative?.premise || '',
          mainObjective: data.narrative?.mainObjective || '',
          centralConflicts: data.narrative?.centralConflicts || [],
          themes: data.narrative?.themes || [],
          factions: data.narrative?.factions || [],
          relevantDeities: data.narrative?.relevantDeities || [],
          importantRegions: data.narrative?.importantRegions || [],
          centralDangers: data.narrative?.centralDangers || [],
          narrativeNotes: data.narrative?.narrativeNotes || '',
        },
        progress: {
          totalSessions: 0,
          totalPlayers: 0,
          totalCharacters: 0,
          totalNPCs: 0,
          totalLocations: 0,
          totalEncounters: 0,
          totalNotes: 0,
          lastSummary: '',
          importantMilestones: [],
        },
        relations: {
          playerIds: [],
          characterIds: [],
          sessionIds: [],
          npcIds: [],
          locationIds: [],
          encounterIds: [],
          noteIds: [],
        },
        organization: {
          tags: data.organization?.tags || [],
          themeColor: data.organization?.themeColor || '#D4AF37',
          icon: data.organization?.icon || 'scroll',
        }
      });
      const docRef = await addDoc(collection(db, 'campaigns'), campaignData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'campaigns');
    }
  },

  async updateCampaign(campaignId: string, data: Partial<Campaign>) {
    try {
      const docRef = doc(db, 'campaigns', campaignId);
      await updateDoc(docRef, cleanUndefined({
        ...data,
        'status.updatedAt': serverTimestamp(),
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `campaigns/${campaignId}`);
    }
  },

  async toggleCampaignFavorite(campaignId: string, favorite: boolean) {
    try {
      const docRef = doc(db, 'campaigns', campaignId);
      await updateDoc(docRef, {
        'status.isFavorite': favorite,
        'status.updatedAt': serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `campaigns/${campaignId}`);
    }
  },

  async archiveCampaign(campaignId: string, archived: boolean = true) {
    try {
      const docRef = doc(db, 'campaigns', campaignId);
      await updateDoc(docRef, {
        'status.state': archived ? 'archived' : 'active',
        'status.updatedAt': serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `campaigns/${campaignId}`);
    }
  },

  async duplicateCampaign(campaignId: string, masterId?: string) {
    try {
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) throw new Error('Campanha não encontrada');

      const { id, ...dataToCopy } = campaign;
      dataToCopy.identity.name = `${dataToCopy.identity.name} (Cópia)`;
      dataToCopy.status.createdAt = serverTimestamp();
      dataToCopy.status.updatedAt = serverTimestamp();
      dataToCopy.status.isFavorite = false;
      dataToCopy.status.state = 'active';
      if (masterId) dataToCopy.masterId = masterId;
      
      // Reset relations for the copy
      dataToCopy.relations = {
        playerIds: [],
        characterIds: [],
        sessionIds: [],
        npcIds: [],
        locationIds: [],
        encounterIds: [],
        noteIds: [],
      };

      const docRef = await addDoc(collection(db, 'campaigns'), cleanUndefined(dataToCopy));
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `campaigns/${campaignId}`);
    }
  },

  async deleteCampaign(campaignId: string) {
    try {
      await deleteDoc(doc(db, 'campaigns', campaignId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `campaigns/${campaignId}`);
    }
  },

  subscribeToCampaigns(masterId: string, callback: (campaigns: Campaign[]) => void) {
    const q = query(
      collection(db, 'campaigns'), 
      where('masterId', '==', masterId),
      orderBy('status.updatedAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
      callback(campaigns);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'campaigns');
    });
  },

  async getCampaign(campaignId: string) {
    try {
      const docSnap = await getDoc(doc(db, 'campaigns', campaignId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Campaign;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `campaigns/${campaignId}`);
    }
  },

  subscribeToCampaign(campaignId: string, callback: (campaign: Campaign) => void) {
    const docRef = doc(db, 'campaigns', campaignId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as Campaign);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `campaigns/${campaignId}`);
    });
  },

  // --- Milestones ---
  async createMilestone(campaignId: string, data: Partial<Milestone>) {
    try {
      const milestoneData = cleanUndefined({
        campaignId,
        title: data.title || 'Novo Marco',
        description: data.description || '',
        type: data.type || 'discovery',
        date: data.date || serverTimestamp(),
        isHighlighted: data.isHighlighted || false,
        createdAt: serverTimestamp(),
      });
      const docRef = await addDoc(collection(db, 'milestones'), milestoneData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'milestones');
    }
  },

  subscribeToMilestones(campaignId: string, callback: (milestones: Milestone[]) => void) {
    const q = query(
      collection(db, 'milestones'),
      where('campaignId', '==', campaignId),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const milestones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone));
      callback(milestones);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'milestones');
    });
  },

  async deleteMilestone(milestoneId: string) {
    try {
      await deleteDoc(doc(db, 'milestones', milestoneId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `milestones/${milestoneId}`);
    }
  },

  // --- Sessions ---
  async getSession(sessionId: string) {
    try {
      const docSnap = await getDoc(doc(db, 'sessions', sessionId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Session;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `sessions/${sessionId}`);
    }
  },

  async createSession(campaignId: string, data: Partial<Session>) {
    try {
      const sessionData = cleanUndefined({
        ...data,
        masterId: auth.currentUser?.uid,
        campaignId,
        isCompleted: data.isCompleted || false,
        npcIds: data.npcIds || [],
        locationIds: data.locationIds || [],
      });
      const docRef = await addDoc(collection(db, 'sessions'), sessionData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'sessions');
    }
  },

  async updateSession(sessionId: string, data: Partial<Session>) {
    try {
      const docRef = doc(db, 'sessions', sessionId);
      await updateDoc(docRef, cleanUndefined({
        ...data,
        updatedAt: serverTimestamp(),
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `sessions/${sessionId}`);
    }
  },

  async deleteSession(sessionId: string) {
    try {
      await deleteDoc(doc(db, 'sessions', sessionId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `sessions/${sessionId}`);
    }
  },

  subscribeToSessions(campaignId: string, callback: (sessions: Session[]) => void) {
    const q = query(
      collection(db, 'sessions'), 
      where('masterId', '==', auth.currentUser?.uid),
      where('campaignId', '==', campaignId),
      orderBy('number', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
      callback(sessions);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sessions');
    });
  },

  async getSessions(campaignId: string) {
    try {
      const q = query(
        collection(db, 'sessions'), 
        where('masterId', '==', auth.currentUser?.uid),
        where('campaignId', '==', campaignId),
        orderBy('number', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `sessions?campaignId=${campaignId}`);
    }
  },

  // --- NPCs ---
  async getNPC(npcId: string) {
    try {
      const docSnap = await getDoc(doc(db, 'npcs', npcId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as NPC;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `npcs/${npcId}`);
    }
  },

  async createNPC(masterId: string, campaignId: string | null, data: Partial<NPC>) {
    try {
      const npcData = cleanUndefined({
        category: 'npc',
        ...data,
        masterId,
        campaignId,
        isFavorite: data.isFavorite || false,
        isImportant: data.isImportant || false,
      });
      const docRef = await addDoc(collection(db, 'npcs'), npcData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'npcs');
    }
  },

  async updateNPC(npcId: string, data: Partial<NPC>) {
    try {
      const docRef = doc(db, 'npcs', npcId);
      await updateDoc(docRef, cleanUndefined({
        ...data,
        updatedAt: serverTimestamp(),
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `npcs/${npcId}`);
    }
  },

  async deleteNPC(npcId: string) {
    try {
      await deleteDoc(doc(db, 'npcs', npcId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `npcs/${npcId}`);
    }
  },

  subscribeToNPCs(campaignId: string, callback: (npcs: NPC[]) => void, category: 'npc' | 'monster' = 'npc') {
    const q = query(
      collection(db, 'npcs'), 
      where('masterId', '==', auth.currentUser?.uid),
      where('campaignId', '==', campaignId),
      where('category', '==', category),
      orderBy('name', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const npcs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NPC));
      callback(npcs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'npcs');
    });
  },

  subscribeToAllNPCs(masterId: string, callback: (npcs: NPC[]) => void, category: 'npc' | 'monster' = 'npc') {
    const q = query(
      collection(db, 'npcs'), 
      where('masterId', '==', masterId),
      where('category', '==', category),
      orderBy('name', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const npcs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NPC));
      callback(npcs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'npcs');
    });
  },

  // --- Locations ---
  async getLocation(locationId: string) {
    try {
      const docSnap = await getDoc(doc(db, 'locations', locationId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Location;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `locations/${locationId}`);
    }
  },

  async createLocation(masterId: string, campaignId: string, data: Partial<Location>) {
    try {
      const locationData = cleanUndefined({
        ...data,
        masterId,
        campaignId,
        npcIds: data.npcIds || [],
      });
      const docRef = await addDoc(collection(db, 'locations'), locationData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'locations');
    }
  },

  async updateLocation(locationId: string, data: Partial<Location>) {
    try {
      const docRef = doc(db, 'locations', locationId);
      await updateDoc(docRef, cleanUndefined({
        ...data,
        updatedAt: serverTimestamp(),
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `locations/${locationId}`);
    }
  },

  async deleteLocation(locationId: string) {
    try {
      await deleteDoc(doc(db, 'locations', locationId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `locations/${locationId}`);
    }
  },

  subscribeToLocations(campaignId: string, callback: (locations: Location[]) => void) {
    const q = query(
      collection(db, 'locations'), 
      where('masterId', '==', auth.currentUser?.uid),
      where('campaignId', '==', campaignId),
      orderBy('name', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const locations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
      callback(locations);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'locations');
    });
  },

  // --- Encounters ---
  async getEncounter(encounterId: string) {
    try {
      const docSnap = await getDoc(doc(db, 'encounters', encounterId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Encounter;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `encounters/${encounterId}`);
    }
  },

  async createEncounter(masterId: string, campaignId: string, data: Partial<Encounter>) {
    try {
      const encounterData = cleanUndefined({
        ...data,
        masterId,
        campaignId,
        isActive: data.isActive || false,
        currentTurn: data.currentTurn || 0,
        participants: data.participants || [],
      });
      const docRef = await addDoc(collection(db, 'encounters'), encounterData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'encounters');
    }
  },

  async updateEncounter(encounterId: string, data: Partial<Encounter>) {
    try {
      const docRef = doc(db, 'encounters', encounterId);
      await updateDoc(docRef, cleanUndefined({
        ...data,
        updatedAt: serverTimestamp(),
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `encounters/${encounterId}`);
    }
  },

  async deleteEncounter(encounterId: string) {
    try {
      await deleteDoc(doc(db, 'encounters', encounterId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `encounters/${encounterId}`);
    }
  },

  subscribeToEncounters(campaignId: string, callback: (encounters: Encounter[]) => void) {
    const q = query(
      collection(db, 'encounters'), 
      where('masterId', '==', auth.currentUser?.uid),
      where('campaignId', '==', campaignId)
    );
    return onSnapshot(q, (snapshot) => {
      const encounters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Encounter));
      callback(encounters);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'encounters');
    });
  },

  // --- Master Notes ---
  async createMasterNote(masterId: string, campaignId: string | null, data: Partial<MasterNote>) {
    try {
      const noteData = cleanUndefined({
        ...data,
        masterId,
        campaignId: campaignId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPinned: data.isPinned || false,
      });
      const docRef = await addDoc(collection(db, 'master_notes'), noteData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'master_notes');
    }
  },

  async updateMasterNote(noteId: string, data: Partial<MasterNote>) {
    try {
      const docRef = doc(db, 'master_notes', noteId);
      await updateDoc(docRef, cleanUndefined({
        ...data,
        updatedAt: serverTimestamp(),
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `master_notes/${noteId}`);
    }
  },

  async deleteMasterNote(noteId: string) {
    try {
      await deleteDoc(doc(db, 'master_notes', noteId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `master_notes/${noteId}`);
    }
  },

  subscribeToMasterNotes(campaignId: string, callback: (notes: MasterNote[]) => void) {
    const q = query(
      collection(db, 'master_notes'), 
      where('masterId', '==', auth.currentUser?.uid),
      where('campaignId', '==', campaignId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MasterNote));
      callback(notes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'master_notes');
    });
  },

  subscribeToAllMasterNotes(masterId: string, callback: (notes: MasterNote[]) => void) {
    const q = query(
      collection(db, 'master_notes'), 
      where('masterId', '==', masterId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MasterNote));
      callback(notes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'master_notes');
    });
  },

  // --- Dice Rolls ---
  async createRoll(masterId: string, data: Partial<MasterRoll>) {
    try {
      const rollData = cleanUndefined({
        ...data,
        masterId,
        timestamp: serverTimestamp(),
      });
      await addDoc(collection(db, 'master_rolls'), rollData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'master_rolls');
    }
  },

  subscribeToRolls(masterId: string, callback: (rolls: MasterRoll[]) => void) {
    const q = query(
      collection(db, 'master_rolls'), 
      where('masterId', '==', masterId),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (snapshot) => {
      const rolls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MasterRoll));
      callback(rolls);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'master_rolls');
    });
  },

  // --- Players ---
  async addPlayerToCampaign(campaignId: string, data: Partial<CampaignPlayer>) {
    try {
      const playerData = cleanUndefined({
        ...data,
        masterId: auth.currentUser?.uid,
        campaignId,
      });
      const docRef = await addDoc(collection(db, 'campaign_players'), playerData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'campaign_players');
    }
  },

  subscribeToPlayers(campaignId: string, callback: (players: CampaignPlayer[]) => void) {
    const q = query(
      collection(db, 'campaign_players'), 
      where('campaignId', '==', campaignId)
    );
    return onSnapshot(q, (snapshot) => {
      const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CampaignPlayer));
      callback(players);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'campaign_players');
    });
  }
};
