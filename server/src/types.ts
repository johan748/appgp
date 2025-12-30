export type Role = 'ADMIN' | 'UNION' | 'ASOCIACION' | 'DIRECTOR_ZONA' | 'PASTOR' | 'DIRECTOR_MP' | 'LIDER_GP' | 'SECRETARIO' | 'LIDER_EN_FORMACION' | 'MIEMBRO';

export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface User extends BaseEntity {
    username: string;
    password: string;
    role: Role;
    relatedEntityId?: string;
    name: string;
    email?: string;
    isActive: boolean;
}

export interface Union extends BaseEntity {
    name: string;
    evangelismDepartmentHead: string;
    config?: {
        username: string;
        password: string;
    };
}

export interface Member extends BaseEntity {
    firstName: string;
    lastName: string;
    cedula: string;
    birthDate: string;
    phone: string;
    email: string;
    address: string;
    isBaptized: boolean;
    gender: 'M' | 'F';
    role: 'LIDER' | 'LIDER_EN_FORMACION' | 'SECRETARIO' | 'MIEMBRO';
    gpId: string;
    leadershipProgress?: {
        liderEnFormacionDate?: string;
        secretarioDate?: string;
        liderGpDate?: string;
    };
    friendProgress?: {
        invitedDate?: string;
        regularAttenderDate?: string;
        studentDate?: string;
        baptizedDate?: string;
    };
}

export interface SmallGroup extends BaseEntity {
    name: string;
    motto: string;
    verse: string;
    meetingDay: string;
    meetingTime: string;
    churchId: string;
    leaderId: string;
    goals: {
        baptisms: { target: number; period: string };
        weeklyAttendanceMembers: { target: number; period: string };
        weeklyAttendanceGp: { target: number; period: string };
        missionaryPairs: { target: number; period: string };
        friends: { target: number; period: string };
        bibleStudies: { target: number; period: string };
    };
}

export interface Church extends BaseEntity {
    name: string;
    districtId: string;
    directorId?: string;
    address: string;
    pastorId?: string;
}

export interface District extends BaseEntity {
    name: string;
    pastorId: string;
    zoneId: string;
    goals: {
        baptisms: { target: number; period: string };
        churches: { target: number; period: string };
        smallGroups: { target: number; period: string };
    };
}

export interface Zone extends BaseEntity {
    name: string;
    directorId: string;
    associationId: string;
    goals: {
        baptisms: { target: number; period: string };
        districts: { target: number; period: string };
        churches: { target: number; period: string };
    };
}

export interface Association extends BaseEntity {
    name: string;
    departmentHead: string;
    unionId: string;
    membershipCount: number;
    config: {
        username: string;
        password: string;
        annualBaptismGoal?: number;
    };
}

export interface MissionaryPair extends BaseEntity {
    gpId: string;
    member1Id: string;
    member2Id: string;
    studiesGiven: number;
    isActive: boolean;
}

export interface WeeklyReport extends BaseEntity {
    gpId: string;
    date: string;
    attendance: {
        memberId: string;
        present: boolean;
        participated: boolean;
        studiesGiven: boolean;
        guests: number;
    }[];
    missionaryPairsStats: {
        pairId: string;
        studiesGiven: number;
    }[];
    baptisms: number;
    summary: {
        totalAttendance: number;
        totalStudies: number;
        totalGuests: number;
        baptisms?: number;
    };
}

// Request/Response types
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    user: User;
    token: string;
}

export interface ErrorResponse {
    success: boolean;
    message: string;
    errors?: any[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
