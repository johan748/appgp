import { User, SmallGroup, Member, Church, District, Zone, Association, WeeklyReport, MissionaryPair, Role, Union } from '../types';
import * as api from './api';

class RealBackendService {
    // Auth
    async authenticate(username: string, password: string): Promise<User | null> {
        try {
            const response = await api.authAPI.login(username, password);
            if (response.success && response.user) {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('current_user', JSON.stringify(response.user));
                return response.user;
            }
            return null;
        } catch (error) {
            console.error('Authentication failed:', error);
            return null;
        }
    }

    // Generic Getters
    async getUsers(): Promise<User[]> {
        try {
            const response = await api.userAPI.getAll();
            return response.data || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    async getGPs(): Promise<SmallGroup[]> {
        try {
            const response = await api.smallGroupAPI.getAll();
            return response.data || [];
        } catch (error) {
            console.error('Error fetching small groups:', error);
            return [];
        }
    }

    async getChurches(): Promise<Church[]> {
        try {
            const response = await api.churchAPI.getAll();
            return response.data || [];
        } catch (error) {
            console.error('Error fetching churches:', error);
            return [];
        }
    }

    async getDistricts(): Promise<District[]> {
        try {
            const response = await api.districtAPI.getAll();
            return response.data || [];
        } catch (error) {
            console.error('Error fetching districts:', error);
            return [];
        }
    }

    async getZones(): Promise<Zone[]> {
        try {
            const response = await api.zoneAPI.getAll();
            return response.data || [];
        } catch (error) {
            console.error('Error fetching zones:', error);
            return [];
        }
    }

    async getMissionaryPairs(): Promise<MissionaryPair[]> {
        try {
            const response = await api.missionaryPairAPI.getAll();
            return response.data || [];
        } catch (error) {
            console.error('Error fetching missionary pairs:', error);
            return [];
        }
    }

    // Union Management
    async getUnions(): Promise<Union[]> {
        try {
            const response = await api.unionAPI.getAll();
            return response.data || [];
        } catch (error) {
            console.error('Error fetching unions:', error);
            return [];
        }
    }

    async getUnionById(id: string): Promise<Union | undefined> {
        try {
            const response = await api.unionAPI.getById(id);
            return response.data;
        } catch (error) {
            console.error('Error fetching union:', error);
            return undefined;
        }
    }

    async addUnion(union: Union): Promise<Union> {
        try {
            const response = await api.unionAPI.create(union);
            return response.data;
        } catch (error) {
            console.error('Error adding union:', error);
            throw error;
        }
    }

    async updateUnion(union: Union): Promise<Union> {
        try {
            const response = await api.unionAPI.update(union.id, union);
            return response.data;
        } catch (error) {
            console.error('Error updating union:', error);
            throw error;
        }
    }

    async deleteUnion(id: string): Promise<void> {
        try {
            await api.unionAPI.delete(id);
        } catch (error) {
            console.error('Error deleting union:', error);
            throw error;
        }
    }

    // Association Management
    async getAssociations(): Promise<Association[]> {
        try {
            const response = await api.associationAPI.getAll();
            return response.data || [];
        } catch (error) {
            console.error('Error fetching associations:', error);
            return [];
        }
    }

    async getAssociationById(id: string): Promise<Association | undefined> {
        try {
            const response = await api.associationAPI.getById(id);
            return response.data;
        } catch (error) {
            console.error('Error fetching association:', error);
            return undefined;
        }
    }

    async updateAssociation(assoc: Association): Promise<Association> {
        try {
            const response = await api.associationAPI.update(assoc.id, assoc);
            return response.data;
        } catch (error) {
            console.error('Error updating association:', error);
            throw error;
        }
    }

    // Zone Management
    async addZone(zone: Zone): Promise<Zone> {
        try {
            const response = await api.zoneAPI.create(zone);
            return response.data;
        } catch (error) {
            console.error('Error adding zone:', error);
            throw error;
        }
    }

    async updateZone(zone: Zone): Promise<Zone> {
        try {
            const response = await api.zoneAPI.update(zone.id, zone);
            return response.data;
        } catch (error) {
            console.error('Error updating zone:', error);
            throw error;
        }
    }

    async deleteZone(id: string): Promise<void> {
        try {
            await api.zoneAPI.delete(id);
        } catch (error) {
            console.error('Error deleting zone:', error);
            throw error;
        }
    }

    // District Management
    async addDistrict(district: District): Promise<District> {
        try {
            const response = await api.districtAPI.create(district);
            return response.data;
        } catch (error) {
            console.error('Error adding district:', error);
            throw error;
        }
    }

    async updateDistrict(district: District): Promise<District> {
        try {
            const response = await api.districtAPI.update(district.id, district);
            return response.data;
        } catch (error) {
            console.error('Error updating district:', error);
            throw error;
        }
    }

    async deleteDistrict(id: string): Promise<void> {
        try {
            await api.districtAPI.delete(id);
        } catch (error) {
            console.error('Error deleting district:', error);
            throw error;
        }
    }

    // User Management
    async createUser(userData: Omit<User, 'id'>): Promise<User> {
        try {
            const response = await api.userAPI.create(userData);
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async updateUser(user: User): Promise<User> {
        try {
            const response = await api.userAPI.update(user.id, user);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Member Management
    async getMembers(): Promise<Member[]> {
        try {
            const response = await api.memberAPI.getAll();
            return response.data || [];
        } catch (error) {
            console.error('Error fetching members:', error);
            return [];
        }
    }

    async addMember(member: any): Promise<Member> {
        try {
            const response = await api.memberAPI.create(member);
            return response.data;
        } catch (error) {
            console.error('Error adding member:', error);
            throw error;
        }
    }

    async updateMember(member: Member): Promise<Member> {
        try {
            const response = await api.memberAPI.update(member.id, member);
            return response.data;
        } catch (error) {
            console.error('Error updating member:', error);
            throw error;
        }
    }

    // Report Management
    async getReports(): Promise<WeeklyReport[]> {
        try {
            const response = await api.reportAPI.getAll();
            return response.data || [];
        } catch (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
    }

    async updateReport(report: any): Promise<WeeklyReport> {
        try {
            const response = await api.reportAPI.update(report.id, report);
            return response.data;
        } catch (error) {
            console.error('Error updating report:', error);
            throw error;
        }
    }

    async deleteReport(id: string): Promise<void> {
        try {
            await api.reportAPI.delete(id);
        } catch (error) {
            console.error('Error deleting report:', error);
            throw error;
        }
    }

    // Helper methods for specific queries
    async getMembersByGP(gpId: string): Promise<Member[]> {
        try {
            const response = await api.memberAPI.getBySmallGroup(gpId);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching members by GP:', error);
            return [];
        }
    }

    async getGPById(id: string): Promise<SmallGroup | undefined> {
        try {
            const response = await api.smallGroupAPI.getById(id);
            return response.data;
        } catch (error) {
            console.error('Error fetching GP:', error);
            return undefined;
        }
    }

    async updateGP(gp: SmallGroup): Promise<SmallGroup> {
        try {
            const response = await api.smallGroupAPI.update(gp.id, gp);
            return response.data;
        } catch (error) {
            console.error('Error updating GP:', error);
            throw error;
        }
    }

    // Global Report Methods
    async getAssociationReports(associationId: string, startDate: string, endDate: string): Promise<any[]> {
        try {
            const response = await api.globalReportAPI.getAssociationReports(associationId, startDate, endDate);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching association reports:', error);
            return [];
        }
    }

    async getUnionReports(unionId: string, startDate: string, endDate: string): Promise<any[]> {
        try {
            const response = await api.globalReportAPI.getUnionReports(unionId, startDate, endDate);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching union reports:', error);
            return [];
        }
    }

    async getGrowthReport(associationId: string, startDate: string, endDate: string): Promise<any> {
        try {
            const response = await api.globalReportAPI.getGrowthReport(associationId, startDate, endDate);
            return response.data;
        } catch (error) {
            console.error('Error fetching growth report:', error);
            return null;
        }
    }

    // Cleanup method (for compatibility with mockBackend)
    cleanupDuplicates(): void {
        // No cleanup needed for real backend
        console.log('Cleanup not needed for real backend');
    }

    // Initialize method (for compatibility with mockBackend)
    initialize(): void {
        // No initialization needed for real backend
        console.log('Real backend initialized');
    }
}

export const realBackend = new RealBackendService();
