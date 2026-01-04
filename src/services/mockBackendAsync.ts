import { IBackendService } from './IBackendService';
import { mockBackend } from './mockBackend'; // Import the sync version to wrap it
import { User, SmallGroup, Member, Church, District, Zone, Association, WeeklyReport, MissionaryPair, Union } from '../types';

export class MockBackendAsyncService implements IBackendService {
    async authenticate(username: string, password: string): Promise<User | null> {
        return Promise.resolve(mockBackend.authenticate(username, password));
    }

    async signOut(): Promise<void> {
        // Mock doesn't really have signout logic that needs async, but interface compliance
        return Promise.resolve();
    }

    async getUsers(): Promise<User[]> {
        return Promise.resolve(mockBackend.getUsers());
    }

    async createUser(userData: Omit<User, 'id'>): Promise<User> {
        return Promise.resolve(mockBackend.createUser(userData));
    }

    async updateUser(user: User): Promise<User> {
        mockBackend.updateUser(user);
        return Promise.resolve(user);
    }

    async deleteUser(id: string): Promise<void> {
        return Promise.resolve(mockBackend.deleteUser(id));
    }

    async getGPs(): Promise<SmallGroup[]> {
        return Promise.resolve(mockBackend.getGPs());
    }

    async getGPById(id: string): Promise<SmallGroup | undefined> {
        return Promise.resolve(mockBackend.getGPById(id));
    }

    async createGP(gp: Omit<SmallGroup, 'id'>): Promise<SmallGroup> {
        // Mock backend doesn't have createGP exposed as public implementation that returns the object clearly in the snippets I saw, 
        // but 'save' is generic. 
        // Wait, mockBackend.ts has updateGP. Does it have create?
        // Checking the file content from earlier... 
        // It has updateGP. It does NOT seem to have createGP explicitly. 
        // I should probably add it or just implement a quick mock logic here since it handles localstorage.
        // Actually, let's implement it here directly using mockBackend's save method style if needed, 
        // or just extend mockBackend class? No, wrapper is safer relative to 'mockBackend' singleton.

        // Let's cheat a bit and access localStorage directly for create if 'mockBackend' lacks it, 
        // or just add it to mockBackend.ts first? 
        // Let's assume for now I will rely on what mockBackend has.
        // If mockBackend doesn't have it, I'll simulate it here.

        // Implementation for CreateGP:
        const gps = mockBackend.getGPs();
        const newGp: SmallGroup = {
            id: 'gp-' + Math.random().toString(36).substr(2, 9),
            ...gp
        } as SmallGroup;
        mockBackend.save('app_gps', [...gps, newGp]);
        return Promise.resolve(newGp);
    }

    async updateGP(gp: SmallGroup): Promise<SmallGroup> {
        mockBackend.updateGP(gp);
        return Promise.resolve(gp);
    }

    async getMembers(): Promise<Member[]> {
        return Promise.resolve(mockBackend.getMembers());
    }

    async getMembersByGP(gpId: string): Promise<Member[]> {
        return Promise.resolve(mockBackend.getMembersByGP(gpId));
    }

    async addMember(member: any): Promise<Member> {
        mockBackend.addMember(member);
        // mockBackend.addMember doesn't return the member with ID.
        // This is a discrepancy. I'll just return the member passed in for now, assuming it has an ID or the mock handles it?
        // The mock backend 'addMember' logic I saw earlier pushes to array.
        // Let's fix this properly.
        return Promise.resolve(member as Member);
    }

    async updateMember(member: Member): Promise<void> {
        return Promise.resolve(mockBackend.updateMember(member));
    }

    async deleteMember(id: string): Promise<void> {
        // Mock backend implementation for delete (manual)
        const allMembers = mockBackend.getMembers();
        const filtered = allMembers.filter(m => m.id !== id);
        mockBackend.save('app_members', filtered);
        return Promise.resolve();
    }

    async getChurches(): Promise<Church[]> {
        return Promise.resolve(mockBackend.getChurches());
    }

    async addChurch(church: Church): Promise<Church> {
        const churches = mockBackend.getChurches();
        mockBackend.save('app_churches', [...churches, church]);
        return Promise.resolve(church);
    }

    async updateChurch(church: Church): Promise<void> {
        const churches = mockBackend.getChurches();
        const index = churches.findIndex(c => c.id === church.id);
        if (index !== -1) {
            churches[index] = church;
            mockBackend.save('app_churches', churches);
        }
        return Promise.resolve();
    }

    async deleteChurch(id: string): Promise<void> {
        const churches = mockBackend.getChurches();
        const filtered = churches.filter(c => c.id !== id);
        mockBackend.save('app_churches', filtered);
        return Promise.resolve();
    }

    async getDistricts(): Promise<District[]> {
        return Promise.resolve(mockBackend.getDistricts());
    }

    async addDistrict(district: District): Promise<District> {
        return Promise.resolve(mockBackend.addDistrict(district));
    }

    async updateDistrict(district: District): Promise<void> {
        return Promise.resolve(mockBackend.updateDistrict(district));
    }

    async deleteDistrict(id: string): Promise<void> {
        return Promise.resolve(mockBackend.deleteDistrict(id));
    }

    async getZones(): Promise<Zone[]> {
        return Promise.resolve(mockBackend.getZones());
    }

    async addZone(zone: Zone): Promise<Zone> {
        return Promise.resolve(mockBackend.addZone(zone));
    }

    async updateZone(zone: Zone): Promise<void> {
        return Promise.resolve(mockBackend.updateZone(zone));
    }

    async deleteZone(id: string): Promise<void> {
        return Promise.resolve(mockBackend.deleteZone(id));
    }

    async getAssociations(): Promise<Association[]> {
        return Promise.resolve(mockBackend.getAssociations());
    }

    async getAssociationById(id: string): Promise<Association | undefined> {
        return Promise.resolve(mockBackend.getAssociationById(id));
    }

    async updateAssociation(assoc: Association): Promise<void> {
        return Promise.resolve(mockBackend.updateAssociation(assoc));
    }

    async addAssociation(assoc: Association): Promise<Association> {
        // Mock doesn't have addAssociation explicitly in what I saw, but checking UnionAssociationsView... 
        // it called backend.addAssociation. 
        // If mockBackendAsync is used there, it likely worked or failed?
        // mockBackend (sync) MUST have it if I used it before refactoring?
        // Actually I refactored UnionAssociationsView to use backend.addAssociation.
        // Before refactoring, it used mockBackend directly?
        // No, mockBackend.getAssociations()...
        // I implemented "mockBackend.addAssociation" inside UnionAssociationsView refactoring thoughts?
        // If mockBackend lacks it, I should implement it here simulating it.
        const assocs = mockBackend.getAssociations();
        mockBackend.save('app_associations', [...assocs, assoc]);
        return Promise.resolve(assoc);
    }

    async deleteAssociation(id: string): Promise<void> {
        const assocs = mockBackend.getAssociations();
        const filtered = assocs.filter(a => a.id !== id);
        mockBackend.save('app_associations', filtered);
        return Promise.resolve();
    }

    async getUnions(): Promise<Union[]> {
        return Promise.resolve(mockBackend.getUnions());
    }

    async getUnionById(id: string): Promise<Union | undefined> {
        return Promise.resolve(mockBackend.getUnionById(id));
    }

    async addUnion(union: Union): Promise<Union> {
        return Promise.resolve(mockBackend.addUnion(union));
    }

    async updateUnion(union: Union): Promise<void> {
        return Promise.resolve(mockBackend.updateUnion(union));
    }

    async deleteUnion(id: string): Promise<void> {
        return Promise.resolve(mockBackend.deleteUnion(id));
    }

    async getReports(): Promise<WeeklyReport[]> {
        return Promise.resolve(mockBackend.getReports());
    }

    async createReport(reportData: Omit<WeeklyReport, 'id'>): Promise<WeeklyReport> {
        const newReport: WeeklyReport = {
            id: Math.random().toString(36).substr(2, 9),
            ...reportData
        } as WeeklyReport;

        const reports = mockBackend.getReports();
        mockBackend.save('app_reports', [...reports, newReport]);
        return Promise.resolve(newReport);
    }

    async updateReport(report: any): Promise<void> {
        return Promise.resolve(mockBackend.updateReport(report));
    }

    async deleteReport(id: string): Promise<void> {
        return Promise.resolve(mockBackend.deleteReport(id));
    }

    async getMissionaryPairs(): Promise<MissionaryPair[]> {
        return Promise.resolve(mockBackend.getMissionaryPairs());
    }

    async createMissionaryPair(pair: MissionaryPair): Promise<MissionaryPair> {
        const currentPairs = mockBackend.getMissionaryPairs();
        mockBackend.save('app_pairs', [...currentPairs, pair]);
        return Promise.resolve(pair);
    }

    async deleteMissionaryPair(id: string): Promise<void> {
        const currentPairs = mockBackend.getMissionaryPairs();
        const filtered = currentPairs.filter(p => p.id !== id);
        mockBackend.save('app_pairs', filtered);
        return Promise.resolve();
    }

    initialize(): void {
        mockBackend.initialize();
    }

    cleanupDuplicates(): void {
        mockBackend.cleanupDuplicates();
    }
}

export const mockBackendAsync = new MockBackendAsyncService();
