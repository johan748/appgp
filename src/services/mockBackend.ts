import { User, SmallGroup, Member, Church, District, Zone, Association, WeeklyReport, MissionaryPair, Role } from '../types';

const STORAGE_KEYS = {
    USERS: 'app_users',
    GPS: 'app_gps',
    MEMBERS: 'app_members',
    CHURCHES: 'app_churches',
    DISTRICTS: 'app_districts',
    ZONES: 'app_zones',
    ASSOCIATION: 'app_association',
    REPORTS: 'app_reports',
    PAIRS: 'app_pairs',
};

const generateId = () => Math.random().toString(36).substr(2, 9);

class MockBackendService {
    // Helper to get data
    private get<T>(key: string): T[] {
        const data = localStorage.getItem(key);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`Error parsing data for key ${key}`, e);
            return [];
        }
    }

    // Helper to save data
    private save(key: string, data: any[]) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Helper to get single item
    private getOne<T>(key: string, id: string): T | undefined {
        const items = this.get<any>(key);
        return items.find((i: any) => i.id === id);
    }


    // Initialization / Seeding
    initialize() {
        if (!localStorage.getItem(STORAGE_KEYS.ASSOCIATION)) {
            console.log('Seeding initial data...');
            this.seedData();
        }
    }

    seedData() {
        // 1. Association
        const association: Association = {
            id: 'assoc-1',
            name: 'Asociación Ejemplo',
            departmentHead: 'Pr. Director MP',
            unionName: 'Unión Ejemplo',
            membershipCount: 5000,
            config: { username: 'admin_assoc', password: 'password' }
        };
        localStorage.setItem(STORAGE_KEYS.ASSOCIATION, JSON.stringify([association]));

        // 2. Zone
        const zone: Zone = {
            id: 'zone-1',
            name: 'Zona Norte',
            directorId: 'dir-zone-1',
            associationId: association.id,
            goals: {}
        };
        this.save(STORAGE_KEYS.ZONES, [zone]);

        // 3. District
        const district: District = {
            id: 'dist-1',
            name: 'Distrito Central',
            pastorId: 'pastor-1',
            zoneId: zone.id,
            goals: {}
        };
        this.save(STORAGE_KEYS.DISTRICTS, [district]);

        // 4. Church
        const church: Church = {
            id: 'church-1',
            name: 'Iglesia Central',
            districtId: district.id,
            directorId: 'dir-mp-1',
            address: 'Av. Principal 123'
        };
        this.save(STORAGE_KEYS.CHURCHES, [church]);

        // 5. Small Group (GP)
        const gp: SmallGroup = {
            id: 'gp-1',
            name: 'GP Esperanza',
            motto: 'Maranatha',
            verse: 'Juan 3:16',
            meetingDay: 'Viernes',
            meetingTime: '19:00',
            churchId: church.id,
            leaderId: 'leader-1',
            goals: {
                baptisms: { target: 5, period: 'Anual' },
                weeklyAttendanceMembers: { target: 80, period: 'Semanal' },
                weeklyAttendanceGp: { target: 90, period: 'Semanal' },
                missionaryPairs: { target: 3, period: 'Anual' },
                friends: { target: 10, period: 'Trimestral' },
                bibleStudies: { target: 15, period: 'Semestral' }
            }
        };
        this.save(STORAGE_KEYS.GPS, [gp]);

        // 6. Users & Members
        const users: User[] = [
            { id: 'u-admin', username: 'admin', password: 'password', role: 'ADMIN', name: 'Administrador' },
            { id: 'u-assoc', username: 'asociacion', password: 'password', role: 'ASOCIACION', relatedEntityId: association.id, name: 'Pr. Departamental' },
            { id: 'u-zone', username: 'zona', password: 'password', role: 'DIRECTOR_ZONA', relatedEntityId: zone.id, name: 'Dir. Zona' },
            { id: 'u-pastor', username: 'pastor', password: 'password', role: 'PASTOR', relatedEntityId: district.id, name: 'Pr. Juan Pérez' },
            { id: 'u-dir-mp', username: 'director', password: 'password', role: 'DIRECTOR_MP', relatedEntityId: church.id, name: 'Dir. MP Iglesia' },
            { id: 'u-leader', username: 'lider', password: 'password', role: 'LIDER_GP', relatedEntityId: gp.id, name: 'Líder GP' },
        ];
        this.save(STORAGE_KEYS.USERS, users);

        const members: Member[] = [
            {
                id: 'leader-1', firstName: 'Carlos', lastName: 'Líder', cedula: '123456', birthDate: '1990-01-01',
                phone: '555-5555', email: 'leader@test.com', address: 'Calle 1', isBaptized: true, gender: 'M', role: 'LIDER', gpId: gp.id
            },
            {
                id: 'sec-1', firstName: 'Ana', lastName: 'Secretaria', cedula: '654321', birthDate: '1995-05-05',
                phone: '555-1234', email: 'sec@test.com', address: 'Calle 2', isBaptized: true, gender: 'F', role: 'SECRETARIO', gpId: gp.id
            },
            {
                id: 'mem-1', firstName: 'Pedro', lastName: 'Miembro', cedula: '111222', birthDate: '1988-08-08',
                phone: '555-9876', email: 'mem@test.com', address: 'Calle 3', isBaptized: true, gender: 'M', role: 'MIEMBRO', gpId: gp.id
            }
        ];
        this.save(STORAGE_KEYS.MEMBERS, members);
    }

    // --- PUBLIC API ---

    // Auth
    authenticate(username: string, password: string): User | null {
        const users = this.get<User>(STORAGE_KEYS.USERS);

        // Check ALL association configs
        const assocs = this.get<Association>(STORAGE_KEYS.ASSOCIATION);
        const matchingAssoc = assocs.find(a => a.config?.username === username && a.config?.password === password);

        if (matchingAssoc) {
            // Find existing user linked to this association
            const existing = users.find(u => u.role === 'ASOCIACION' && u.relatedEntityId === matchingAssoc.id);
            if (existing) return existing;

            // If user doesn't exist in users table but config matches, create ephemeral/temp user (or should we create it?)
            // Ideally we return a valid user object even if not in table, 
            // but for consistency let's assume seedData created it or we just mock it here.
            return {
                id: 'temp-assoc-' + matchingAssoc.id,
                username: matchingAssoc.config.username,
                password: matchingAssoc.config.password,
                role: 'ASOCIACION',
                relatedEntityId: matchingAssoc.id,
                name: matchingAssoc.departmentHead || matchingAssoc.name
            };
        }

        return users.find(u => u.username === username && u.password === password) || null;
    }

    // Generic Getters
    getUsers() { return this.get<User>(STORAGE_KEYS.USERS); }
    getGPs() { return this.get<SmallGroup>(STORAGE_KEYS.GPS); }
    getMembers() { return this.get<Member>(STORAGE_KEYS.MEMBERS); }
    getChurches() { return this.get<Church>(STORAGE_KEYS.CHURCHES); }
    getDistricts() { return this.get<District>(STORAGE_KEYS.DISTRICTS); }
    getZones() { return this.get<Zone>(STORAGE_KEYS.ZONES); }
    getMissionaryPairs() { return this.get<MissionaryPair>(STORAGE_KEYS.PAIRS); }

    updateGP(gp: SmallGroup) {
        const gps = this.get<SmallGroup>(STORAGE_KEYS.GPS);
        const index = gps.findIndex(g => g.id === gp.id);
        if (index !== -1) {
            gps[index] = gp;
            this.save(STORAGE_KEYS.GPS, gps);
        }
    }

    getMembersByGP(gpId: string) {
        return this.getMembers().filter(m => m.gpId === gpId);
    }

    getGPById(id: string) {
        return this.getGPs().find(g => g.id === id);
    }

    // Association Getters
    getAssociations() { return this.get<Association>(STORAGE_KEYS.ASSOCIATION); }
    getAssociation() { return this.get<Association>(STORAGE_KEYS.ASSOCIATION)[0]; } // Deprecated but kept for compat if needed, prefer getAssociationById
    getAssociationById(id: string) { return this.getOne<Association>(STORAGE_KEYS.ASSOCIATION, id); }

    updateAssociation(assoc: Association) {
        const assocs = this.get<Association>(STORAGE_KEYS.ASSOCIATION);
        const index = assocs.findIndex(a => a.id === assoc.id);

        if (index !== -1) {
            assocs[index] = assoc;
            this.save(STORAGE_KEYS.ASSOCIATION, assocs);
        } else {
            // If strictly updating, we might error, but let's be safe
            // If it doesn't exist, we don't save. 
        }

        // Also update the linked user 'asociacion' credentials if config changed
        if (assoc.config) {
            const users = this.get<User>(STORAGE_KEYS.USERS);
            // Find the user linked to THIS association
            const assocUserIndex = users.findIndex(u => u.role === 'ASOCIACION' && u.relatedEntityId === assoc.id);
            if (assocUserIndex !== -1) {
                users[assocUserIndex].username = assoc.config.username;
                users[assocUserIndex].password = assoc.config.password;
                this.save(STORAGE_KEYS.USERS, users);
            }
        }
    }

    // Zone Management
    addZone(zone: Zone) {
        const zones = this.get<Zone>(STORAGE_KEYS.ZONES);
        zones.push(zone);
        this.save(STORAGE_KEYS.ZONES, zones);
        return zone;
    }

    updateZone(zone: Zone) {
        const zones = this.get<Zone>(STORAGE_KEYS.ZONES);
        const index = zones.findIndex(z => z.id === zone.id);
        if (index !== -1) {
            zones[index] = zone;
            this.save(STORAGE_KEYS.ZONES, zones);
        }
    }

    deleteZone(id: string) {
        let zones = this.get<Zone>(STORAGE_KEYS.ZONES);
        zones = zones.filter(z => z.id !== id);
        this.save(STORAGE_KEYS.ZONES, zones);
    }

    // District Management
    addDistrict(district: District) {
        const districts = this.get<District>(STORAGE_KEYS.DISTRICTS);
        districts.push(district);
        this.save(STORAGE_KEYS.DISTRICTS, districts);
        return district;
    }

    updateDistrict(district: District) {
        const districts = this.get<District>(STORAGE_KEYS.DISTRICTS);
        const index = districts.findIndex(d => d.id === district.id);
        if (index !== -1) {
            districts[index] = district;
            this.save(STORAGE_KEYS.DISTRICTS, districts);
        }
    }

    deleteDistrict(id: string) {
        let districts = this.get<District>(STORAGE_KEYS.DISTRICTS);
        districts = districts.filter(d => d.id !== id);
        this.save(STORAGE_KEYS.DISTRICTS, districts);
    }

    // User Management
    createUser(userData: Omit<User, 'id'>): User {
        const users = this.get<User>(STORAGE_KEYS.USERS);

        // Check for duplicate username
        const existing = users.find(u => u.username === userData.username);
        if (existing) {
            throw new Error(`El nombre de usuario "${userData.username}" ya está en uso.`);
        }

        const newUser: User = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            ...userData
        };

        users.push(newUser);
        this.save(STORAGE_KEYS.USERS, users);
        return newUser;
    }

    updateUser(user: User) {
        const users = this.get<User>(STORAGE_KEYS.USERS);
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index] = user;
            this.save(STORAGE_KEYS.USERS, users);
        }
    }

    addMember(member: any) {
        const members = this.get<any>(STORAGE_KEYS.MEMBERS);
        members.push(member);
        this.save(STORAGE_KEYS.MEMBERS, members);
    }

    updateMember(member: Member) {
        const members = this.get<Member>(STORAGE_KEYS.MEMBERS);
        const index = members.findIndex(m => m.id === member.id);
        if (index !== -1) {
            members[index] = member;
            this.save(STORAGE_KEYS.MEMBERS, members);
        }
    }

    getReports() {
        return this.get<any>(STORAGE_KEYS.REPORTS);
    }

    cleanupDuplicates() {
        // Clean Zones
        const zones = this.get<Zone>(STORAGE_KEYS.ZONES);
        const uniqueZones: Zone[] = [];
        const seenZoneIds = new Set<string>();
        let zonesChanged = false;

        zones.forEach(z => {
            if (z && z.id && !seenZoneIds.has(z.id)) {
                uniqueZones.push(z);
                seenZoneIds.add(z.id);
            } else {
                zonesChanged = true;
            }
        });

        if (zonesChanged) {
            console.log('Cleaning up invalid/duplicate zones');
            this.save(STORAGE_KEYS.ZONES, uniqueZones);
        }

        // Clean Districts
        const districts = this.get<District>(STORAGE_KEYS.DISTRICTS);
        const uniqueDistricts: District[] = [];
        const seenDistrictIds = new Set<string>();
        let districtsChanged = false;

        districts.forEach(d => {
            if (d && d.id && !seenDistrictIds.has(d.id)) {
                uniqueDistricts.push(d);
                seenDistrictIds.add(d.id);
            } else {
                districtsChanged = true;
            }
        });

        if (districtsChanged) {
            console.log('Cleaning up invalid/duplicate districts');
            this.save(STORAGE_KEYS.DISTRICTS, uniqueDistricts);
        }
    }
}

export const mockBackend = new MockBackendService();
