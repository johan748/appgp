import { User, SmallGroup, Member, Church, District, Zone, Association, WeeklyReport, MissionaryPair, Union } from '../types';

export interface IBackendService {
    // Auth
    authenticate(username: string, password: string): Promise<User | null>;
    signOut?(): Promise<void>;

    // User Management
    getUsers(): Promise<User[]>;
    createUser(userData: Omit<User, 'id'>): Promise<User>;
    updateUser(user: User): Promise<User>;
    deleteUser(id: string): Promise<void>;

    // Small Groups (GP)
    getGPs(): Promise<SmallGroup[]>;
    getGPById(id: string): Promise<SmallGroup | undefined>;
    createGP(gp: Omit<SmallGroup, 'id'>): Promise<SmallGroup>;
    updateGP(gp: SmallGroup): Promise<SmallGroup>;

    // Members
    getMembers(): Promise<Member[]>;
    getMembersByGP(gpId: string): Promise<Member[]>;
    addMember(member: any): Promise<Member | void>;
    updateMember(member: Member): Promise<void>;
    deleteMember(id: string): Promise<void>;

    // Churches
    getChurches(): Promise<Church[]>;
    addChurch(church: Church): Promise<Church>;
    updateChurch(church: Church): Promise<void>;
    deleteChurch(id: string): Promise<void>;

    // Districts
    getDistricts(): Promise<District[]>;
    addDistrict(district: District): Promise<District>;
    updateDistrict(district: District): Promise<void>;
    deleteDistrict(id: string): Promise<void>;

    // Zones
    getZones(): Promise<Zone[]>;
    addZone(zone: Zone): Promise<Zone>;
    updateZone(zone: Zone): Promise<void>;
    deleteZone(id: string): Promise<void>;

    // Associations
    getAssociations(): Promise<Association[]>;
    getAssociationById(id: string): Promise<Association | undefined>;
    addAssociation(assoc: Association): Promise<Association>;
    updateAssociation(assoc: Association): Promise<void>;
    deleteAssociation(id: string): Promise<void>;

    // Unions
    getUnions(): Promise<Union[]>;
    getUnionById(id: string): Promise<Union | undefined>;
    addUnion(union: Union): Promise<Union>;
    updateUnion(union: Union): Promise<void>;
    deleteUnion(id: string): Promise<void>;

    // Reports
    getReports(): Promise<WeeklyReport[]>; // Should probably filter by GP, but keeping compatible
    createReport(report: Omit<WeeklyReport, 'id'>): Promise<WeeklyReport>;
    updateReport(report: any): Promise<void>;
    deleteReport(id: string): Promise<void>;

    // Missionary Pairs
    getMissionaryPairs(): Promise<MissionaryPair[]>;
    createMissionaryPair(pair: MissionaryPair): Promise<MissionaryPair>;
    deleteMissionaryPair(id: string): Promise<void>;

    // Initialization
    initialize(): void;

    // Cleanup (mostly for mock)
    cleanupDuplicates?(): void;
}
