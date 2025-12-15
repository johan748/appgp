export type Role = 'LIDER_GP' | 'DIRECTOR_MP' | 'PASTOR' | 'DIRECTOR_ZONA' | 'ASOCIACION' | 'ADMIN';

export interface User {
    id: string;
    username: string;
    password: string; // In a real app, this would be hashed.
    role: Role;
    relatedEntityId?: string; // ID of the GP, Church, District, etc. they manage
    name: string; // Display name
}

export interface Member {
    id: string;
    firstName: string;
    lastName: string;
    cedula: string;
    birthDate: string; // ISO date string
    phone: string;
    email: string;
    address: string;
    isBaptized: boolean;
    gender: 'M' | 'F';
    role: 'LIDER' | 'LIDER_EN_FORMACION' | 'SECRETARIO' | 'MIEMBRO';
    gpId: string;
    // Leadership progress tracking
    leadershipProgress?: {
        liderEnFormacionDate?: string;
        secretarioDate?: string;
        liderGpDate?: string;
    };
    // Friend progress tracking (for non-baptized)
    friendProgress?: {
        invitedDate?: string;
        regularAttenderDate?: string;
        studentDate?: string;
        baptizedDate?: string;
    };
}

export interface SmallGroup {
    id: string;
    name: string;
    motto: string;
    verse: string;
    meetingDay: string;
    meetingTime: string;
    churchId: string;
    leaderId: string; // Links to a Member with role LIDER
    goals: {
        baptisms: { target: number; period: string };
        weeklyAttendanceMembers: { target: number; period: string }; // percentage
        weeklyAttendanceGp: { target: number; period: string }; // percentage
        missionaryPairs: { target: number; period: string };
        friends: { target: number; period: string };
        bibleStudies: { target: number; period: string };
    };
}

export interface Church {
    id: string;
    name: string;
    districtId: string;
    directorId?: string; // Links to a User or Member
    address: string;
}

export interface District {
    id: string;
    name: string;
    pastorId: string; // Links to a User
    zoneId: string;
    goals: any; // Similar structure to GP goals but aggregated or specific to district
}

export interface Zone {
    id: string;
    name: string;
    directorId: string;
    associationId: string;
    goals: any;
}

export interface Association {
    id: string;
    name: string;
    departmentHead: string;
    unionName: string;
    membershipCount: number;
    config: {
        username: string;
        password: string;
        annualBaptismGoal?: number; // Goal or Record
    };
}

export interface MissionaryPair {
    id: string;
    gpId: string;
    member1Id: string;
    member2Id: string;
    studiesGiven: number;
}

export interface WeeklyReport {
    id: string;
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
        baptisms?: number; // Added for aggregation convenience
    };
}
