import { supabase, getCurrentUserId, getCurrentUser } from '../../supabaseClient'
import { User, SmallGroup, Member, Church, District, Zone, Association, WeeklyReport, MissionaryPair, Role, Union } from '../types'

class SupabaseBackendService {
    // Auth methods
    async authenticate(username: string, password: string): Promise<User | null> {
        try {
            // For now, we'll use email-based auth if username looks like email, otherwise use a custom sign-in
            const isEmail = username.includes('@')

            let authResult
            if (isEmail) {
                authResult = await supabase.auth.signInWithPassword({
                    email: username,
                    password: password,
                })
            } else {
                // For username-based auth, we need to find the user first
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('username', username)
                    .maybeSingle()

                if (userError || !userData) {
                    return null
                }

                // Use email from user data for auth
                authResult = await supabase.auth.signInWithPassword({
                    email: userData.email,
                    password: password,
                })
            }

            if (authResult.error) {
                console.error('Supabase auth error:', authResult.error)
                return null
            }

            if (authResult.data.user) {
                // Get user profile from our users table
                const { data: userProfile, error: profileError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', authResult.data.user.email)
                    .maybeSingle()

                if (profileError) {
                    console.error('Error fetching user profile:', profileError)
                    return null
                }

                const user: User = {
                    id: userProfile.id,
                    username: userProfile.username,
                    name: userProfile.name,
                    role: userProfile.role,
                    relatedEntityId: userProfile.related_entity_id,
                    email: userProfile.email,
                    isActive: userProfile.is_active ?? true
                }

                // Store in localStorage for compatibility
                localStorage.setItem('auth_token', authResult.data.session?.access_token || '')
                localStorage.setItem('current_user', JSON.stringify(user))

                return user
            }

            return null
        } catch (error) {
            console.error('Authentication failed:', error)
            return null
        }
    }

    async signOut(): Promise<void> {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error signing out:', error)
        }
        localStorage.removeItem('auth_token')
        localStorage.removeItem('current_user')
    }

    // User Management
    async getUsers(): Promise<User[]> {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching users:', error)
                return []
            }

            return data.map(user => ({
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                relatedEntityId: user.related_entity_id,
                email: user.email,
                isActive: user.is_active ?? true
            }))
        } catch (error) {
            console.error('Error fetching users:', error)
            return []
        }
    }

    async createUser(userData: Omit<User, 'id'>): Promise<User> {
        try {
            const { data, error } = await supabase
                .from('users')
                .insert([{
                    username: userData.username,
                    name: userData.name,
                    role: userData.role,
                    related_entity_id: userData.relatedEntityId,
                    email: userData.email,
                    password: userData.password,
                    is_active: userData.isActive ?? true
                }])
                .select()
                .maybeSingle()

            if (error || !data) {
                console.error('Error creating user record:', error || 'No data returned')
                throw error || new Error('No se pudo crear el registro de usuario')
            }

            return {
                id: data.id,
                username: data.username,
                password: data.password,
                name: data.name,
                role: data.role,
                relatedEntityId: data.related_entity_id,
                email: data.email,
                isActive: data.is_active ?? true
            }
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    }

    async updateUser(user: User): Promise<User> {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    related_entity_id: user.relatedEntityId,
                    email: user.email,
                    password: user.password,
                    is_active: user.isActive ?? true
                })
                .eq('id', user.id)
                .select()
                .maybeSingle()

            if (error || !data) {
                console.error('Error updating user record:', error || 'No data returned')
                throw error || new Error('No se pudo actualizar el registro de usuario')
            }

            return {
                id: data.id,
                username: data.username,
                password: data.password,
                name: data.name,
                role: data.role,
                relatedEntityId: data.related_entity_id,
                email: data.email,
                isActive: data.is_active ?? true
            }
        } catch (error) {
            console.error('Error updating user:', error)
            throw error
        }
    }

    async deleteUser(userId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId)

            if (error) {
                console.error('Error deleting user:', error)
                throw error
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            throw error
        }
    }

    // Auth Automation
    async createAuthUser(email: string, password: string, userMetadata: any = {}): Promise<any> {
        try {
            const response = await fetch('/api/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    user_metadata: userMetadata
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create auth user');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating auth user:', error);
            throw error;
        }
    }

    // Small Groups
    async getGPs(): Promise<SmallGroup[]> {
        try {
            const { data, error } = await supabase
                .from('small_groups')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching small groups:', error)
                return []
            }

            return data.map(gp => ({
                id: gp.id,
                name: gp.name,
                motto: gp.motto,
                verse: gp.verse,
                meetingDay: gp.meeting_day,
                meetingTime: gp.meeting_time,
                churchId: gp.church_id,
                leaderId: gp.leader_id,
                goals: gp.goals || {}
            }))
        } catch (error) {
            console.error('Error fetching GPs:', error)
            return []
        }
    }

    async getGPById(id: string): Promise<SmallGroup | undefined> {
        try {
            const { data, error } = await supabase
                .from('small_groups')
                .select('*')
                .eq('id', id)
                .maybeSingle()

            if (error || !data) {
                if (error) console.error('Error fetching GP:', error)
                return undefined
            }

            return {
                id: data.id,
                name: data.name,
                motto: data.motto,
                verse: data.verse,
                meetingDay: data.meeting_day,
                meetingTime: data.meeting_time,
                churchId: data.church_id,
                leaderId: data.leader_id,
                goals: data.goals || {}
            }
        } catch (error) {
            console.error('Error fetching GP by ID:', error)
            return undefined
        }
    }

    async createGP(gpData: SmallGroup): Promise<SmallGroup> {
        try {
            const { data, error } = await supabase
                .from('small_groups')
                .insert([{
                    id: gpData.id || `gp-${Math.random().toString(36).substr(2, 9)}`,
                    name: gpData.name,
                    motto: gpData.motto,
                    verse: gpData.verse,
                    meeting_day: gpData.meetingDay,
                    meeting_time: gpData.meetingTime,
                    church_id: gpData.churchId,
                    leader_id: gpData.leaderId, // Use the provided leaderId (User UUID)
                    goals: gpData.goals
                }])
                .select()
                .maybeSingle()

            if (error || !data) {
                console.error('Error creating GP:', error || 'No data returned')
                throw error || new Error('No se pudo crear el Grupo Pequeño')
            }

            return {
                id: data.id,
                name: data.name,
                motto: data.motto,
                verse: data.verse,
                meetingDay: data.meeting_day,
                meetingTime: data.meeting_time,
                churchId: data.church_id,
                leaderId: data.leader_id,
                goals: data.goals || {}
            }
        } catch (error) {
            console.error('Error creating GP:', error)
            throw error
        }
    }

    async updateGP(gp: SmallGroup): Promise<SmallGroup> {
        try {
            const { data, error } = await supabase
                .from('small_groups')
                .update({
                    name: gp.name,
                    motto: gp.motto,
                    verse: gp.verse,
                    meeting_day: gp.meetingDay,
                    meeting_time: gp.meetingTime,
                    church_id: gp.churchId,
                    leader_id: gp.leaderId,
                    goals: gp.goals
                })
                .eq('id', gp.id)
                .select()
                .maybeSingle()

            if (error) {
                console.error('Error updating GP:', error)
                throw error
            }

            return {
                id: data.id,
                name: data.name,
                motto: data.motto,
                verse: data.verse,
                meetingDay: data.meeting_day,
                meetingTime: data.meeting_time,
                churchId: data.church_id,
                leaderId: data.leader_id,
                goals: data.goals || {}
            }
        } catch (error) {
            console.error('Error updating GP:', error)
            throw error
        }
    }

    // Members
    async getMembers(): Promise<Member[]> {
        try {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching members:', error)
                return []
            }

            return data.map(member => ({
                id: member.id,
                firstName: member.first_name,
                lastName: member.last_name,
                cedula: member.cedula,
                birthDate: member.birth_date,
                phone: member.phone,
                email: member.email,
                address: member.address,
                isBaptized: member.is_baptized ?? false,
                gender: member.gender,
                role: member.role,
                gpId: member.gp_id,
                leadershipProgress: member.leadership_progress || {},
                friendProgress: member.friend_progress || {}
            }))
        } catch (error) {
            console.error('Error fetching members:', error)
            return []
        }
    }

    async getMembersByGP(gpId: string): Promise<Member[]> {
        try {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .eq('gp_id', gpId)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching members by GP:', error)
                return []
            }

            return data.map(member => ({
                id: member.id,
                firstName: member.first_name,
                lastName: member.last_name,
                cedula: member.cedula,
                birthDate: member.birth_date,
                phone: member.phone,
                email: member.email,
                address: member.address,
                isBaptized: member.is_baptized ?? false,
                gender: member.gender,
                role: member.role,
                gpId: member.gp_id,
                leadershipProgress: member.leadership_progress || {},
                friendProgress: member.friend_progress || {}
            }))
        } catch (error) {
            console.error('Error fetching members by GP:', error)
            return []
        }
    }

    async addMember(member: any): Promise<Member> {
        try {
            const { data, error } = await supabase
                .from('members')
                .insert([{
                    id: member.id || `mem-${Math.random().toString(36).substr(2, 9)}`,
                    first_name: member.firstName,
                    last_name: member.lastName,
                    cedula: member.cedula,
                    birth_date: member.birthDate || null,
                    phone: member.phone,
                    email: member.email,
                    address: member.address,
                    is_baptized: member.isBaptized ?? false,
                    gender: member.gender,
                    role: member.role,
                    gp_id: member.gpId,
                    leadership_progress: member.leadershipProgress || {},
                    friend_progress: member.friendProgress || {}
                }])
                .select()
                .maybeSingle()

            if (error || !data) {
                console.error('Error adding member:', error || 'No data returned')
                throw error || new Error('No se pudo añadir al miembro')
            }

            return {
                id: data.id,
                firstName: data.first_name,
                lastName: data.last_name,
                cedula: data.cedula,
                birthDate: data.birth_date,
                phone: data.phone,
                email: data.email,
                address: data.address,
                isBaptized: data.is_baptized ?? false,
                gender: data.gender,
                role: data.role,
                gpId: data.gp_id,
                leadershipProgress: data.leadership_progress || {},
                friendProgress: data.friend_progress || {}
            }
        } catch (error) {
            console.error('Error adding member:', error)
            throw error
        }
    }

    async updateMember(member: Member): Promise<void> {
        try {
            const { error } = await supabase
                .from('members')
                .update({
                    first_name: member.firstName,
                    last_name: member.lastName,
                    cedula: member.cedula,
                    birth_date: member.birthDate || null,
                    phone: member.phone,
                    email: member.email,
                    address: member.address,
                    is_baptized: member.isBaptized,
                    gender: member.gender,
                    role: member.role,
                    leadership_progress: member.leadershipProgress,
                    friend_progress: member.friendProgress
                })
                .eq('id', member.id)

            if (error) {
                console.error('Error updating member:', error)
                throw error
            }
        } catch (error) {
            console.error('Error updating member:', error)
            throw error
        }
    }

    async deleteMember(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('members')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('Error deleting member:', error)
                throw error
            }
        } catch (error) {
            console.error('Error deleting member:', error)
            throw error
        }
    }

    // Union methods
    // Union methods
    async getUnions(): Promise<Union[]> {
        try {
            const { data, error } = await supabase
                .from('unions')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching unions:', error)
                return []
            }

            return data.map(union => ({
                id: union.id,
                name: union.name,
                evangelismDepartmentHead: union.evangelism_department_head,
                config: union.config || {}
            }))
        } catch (error) {
            console.error('Error fetching unions:', error)
            return []
        }
    }

    async getUnionById(id: string): Promise<Union | undefined> {
        try {
            const { data, error } = await supabase
                .from('unions')
                .select('*')
                .eq('id', id)
                .maybeSingle()

            if (error || !data) {
                if (error) console.error('Error fetching union by ID:', error)
                return undefined
            }

            return {
                id: data.id,
                name: data.name,
                evangelismDepartmentHead: data.evangelism_department_head,
                config: data.config || {}
            }
        } catch (error) {
            console.error('Error fetching union by ID:', error)
            return undefined
        }
    }

    async addUnion(union: Union): Promise<Union> {
        try {
            const { data, error } = await supabase
                .from('unions')
                .insert([{
                    id: union.id,
                    name: union.name,
                    evangelism_department_head: union.evangelismDepartmentHead,
                    config: union.config
                }])
                .select()
                .maybeSingle()

            if (error || !data) throw error || new Error('Failed to create union')

            return {
                id: data.id,
                name: data.name,
                evangelismDepartmentHead: data.evangelism_department_head,
                config: data.config
            }
        } catch (error) {
            console.error('Error adding union:', error)
            throw error
        }
    }

    async updateUnion(union: Union): Promise<Union> {
        try {
            const { data, error } = await supabase
                .from('unions')
                .update({
                    name: union.name,
                    evangelism_department_head: union.evangelismDepartmentHead,
                    config: union.config
                })
                .eq('id', union.id)
                .select()
                .maybeSingle()

            if (error || !data) throw error || new Error('Failed to update union')

            return {
                id: data.id,
                name: data.name,
                evangelismDepartmentHead: data.evangelism_department_head,
                config: data.config
            }
        } catch (error) {
            console.error('Error updating union:', error)
            throw error
        }
    }

    async deleteUnion(id: string): Promise<void> {
        try {
            const { error } = await supabase.from('unions').delete().eq('id', id)
            if (error) throw error
        } catch (error) {
            console.error('Error deleting union:', error)
            throw error
        }
    }

    // Association methods
    async getAssociations(): Promise<Association[]> {
        try {
            const { data, error } = await supabase.from('associations').select('*')
            if (error) throw error
            return data.map(a => ({
                id: a.id,
                name: a.name,
                departmentHead: a.department_head,
                unionId: a.union_id,
                membershipCount: a.membership_count,
                config: a.config
            }))
        } catch (error) {
            console.error('Error fetching associations:', error)
            return []
        }
    }

    async getAssociationById(id: string): Promise<Association | undefined> {
        try {
            const { data, error } = await supabase
                .from('associations')
                .select('*')
                .eq('id', id)
                .maybeSingle()

            if (error || !data) {
                if (error) console.error('Error fetching association by ID:', error)
                return undefined
            }

            return {
                id: data.id,
                name: data.name,
                departmentHead: data.department_head,
                unionId: data.union_id,
                membershipCount: data.membership_count,
                config: data.config
            }
        } catch (error) {
            console.error('Error fetching association by ID:', error)
            return undefined
        }
    }

    async addAssociation(assoc: Association): Promise<Association> {
        try {
            const { data, error } = await supabase
                .from('associations')
                .insert([{
                    id: assoc.id,
                    name: assoc.name,
                    department_head: assoc.departmentHead,
                    union_id: assoc.unionId,
                    membership_count: assoc.membershipCount,
                    config: assoc.config
                }])
                .select()
                .maybeSingle()
            if (error || !data) throw error || new Error('Failed to create association')
            return {
                id: data.id,
                name: data.name,
                departmentHead: data.department_head,
                unionId: data.union_id,
                membershipCount: data.membership_count,
                config: data.config
            }
        } catch (e) { console.error(e); throw e; }
    }

    async updateAssociation(assoc: Association): Promise<Association> {
        try {
            const { data, error } = await supabase
                .from('associations')
                .update({
                    name: assoc.name,
                    department_head: assoc.departmentHead,
                    union_id: assoc.unionId,
                    membership_count: assoc.membershipCount,
                    config: assoc.config
                })
                .eq('id', assoc.id)
                .select()
                .maybeSingle()
            if (error || !data) throw error || new Error('Failed to update association')
            return {
                id: data.id,
                name: data.name,
                departmentHead: data.department_head,
                unionId: data.union_id,
                membershipCount: data.membership_count,
                config: data.config
            }
        } catch (e) { console.error(e); throw e; }
    }

    async deleteAssociation(id: string): Promise<void> {
        await supabase.from('associations').delete().eq('id', id);
    }

    // Zone methods
    async getZones(): Promise<Zone[]> {
        const { data, error } = await supabase.from('zones').select('*')
        if (error || !data) return []
        return data.map(z => ({
            id: z.id,
            name: z.name,
            directorId: z.director_id,
            associationId: z.association_id,
            goals: z.goals
        }))
    }

    async addZone(zone: Zone): Promise<Zone> {
        const { data, error } = await supabase.from('zones').insert([{
            id: zone.id, name: zone.name, director_id: zone.directorId, association_id: zone.associationId, goals: zone.goals
        }]).select().maybeSingle();
        if (error || !data) throw error || new Error('Failed to create zone');
        return { id: data.id, name: data.name, directorId: data.director_id, associationId: data.association_id, goals: data.goals };
    }

    async updateZone(zone: Zone): Promise<void> {
        const { error } = await supabase.from('zones').update({
            name: zone.name, director_id: zone.directorId, association_id: zone.associationId, goals: zone.goals
        }).eq('id', zone.id);
        if (error) throw error;
    }

    async deleteZone(id: string): Promise<void> {
        const { error } = await supabase.from('zones').delete().eq('id', id);
        if (error) throw error;
    }

    // District methods
    async getDistricts(): Promise<District[]> {
        const { data, error } = await supabase.from('districts').select('*')
        if (error || !data) return []
        return data.map(d => ({
            id: d.id,
            name: d.name,
            pastorId: d.pastor_id,
            zoneId: d.zone_id,
            goals: d.goals
        }))
    }

    async addDistrict(district: District): Promise<District> {
        const { data, error } = await supabase.from('districts').insert([{
            id: district.id, name: district.name, pastor_id: district.pastorId, zone_id: district.zoneId, goals: district.goals
        }]).select().maybeSingle();
        if (error || !data) throw error || new Error('Failed to create district');
        return { id: data.id, name: data.name, pastorId: data.pastor_id, zoneId: data.zone_id, goals: data.goals };
    }

    async updateDistrict(district: District): Promise<void> {
        const { error } = await supabase.from('districts').update({
            name: district.name, pastor_id: district.pastorId, zone_id: district.zoneId, goals: district.goals
        }).eq('id', district.id);
        if (error) throw error;
    }

    async deleteDistrict(id: string): Promise<void> {
        const { error } = await supabase.from('districts').delete().eq('id', id);
        if (error) throw error;
    }

    // Church methods
    async getChurches(): Promise<Church[]> {
        const { data, error } = await supabase.from('churches').select('*')
        if (error || !data) return []
        return data.map(c => ({
            id: c.id,
            name: c.name,
            districtId: c.district_id,
            directorId: c.director_id,
            address: c.address
        }))
    }

    async addChurch(church: Church): Promise<Church> {
        const { data, error } = await supabase.from('churches').insert([{
            id: church.id, name: church.name, district_id: church.districtId, director_id: church.directorId, address: church.address
        }]).select().maybeSingle();
        if (error || !data) throw error || new Error('Failed to create church');
        return { id: data.id, name: data.name, districtId: data.district_id, directorId: data.director_id, address: data.address };
    }

    async updateChurch(church: Church): Promise<void> {
        const { error } = await supabase.from('churches').update({
            name: church.name, district_id: church.districtId, director_id: church.directorId, address: church.address
        }).eq('id', church.id);
        if (error) throw error;
    }

    async deleteChurch(id: string): Promise<void> {
        const { error } = await supabase.from('churches').delete().eq('id', id);
        if (error) throw error;
    }

    // Missionary Pairs
    async getMissionaryPairs(): Promise<MissionaryPair[]> {
        const { data, error } = await supabase.from('missionary_pairs').select('*')
        if (error || !data) return []
        return data.map(p => ({
            id: p.id,
            gpId: p.gp_id,
            member1Id: p.member1_id,
            member2Id: p.member2_id,
            studiesGiven: p.studies_given,
            createdAt: p.created_at || new Date().toISOString()
        }))
    }
    async createMissionaryPair(pair: MissionaryPair): Promise<MissionaryPair> {
        const { data, error } = await supabase.from('missionary_pairs').insert([{
            id: pair.id, gp_id: pair.gpId, member1_id: pair.member1Id, member2_id: pair.member2Id, studies_given: pair.studiesGiven
        }]).select().maybeSingle();
        if (error || !data) throw error || new Error('Failed to create missionary pair');
        return {
            id: data.id,
            gpId: data.gp_id,
            member1Id: data.member1_id,
            member2Id: data.member2_id,
            studiesGiven: data.studies_given,
            createdAt: data.created_at || new Date().toISOString()
        };
    }
    async deleteMissionaryPair(id: string): Promise<void> {
        const { error } = await supabase.from('missionary_pairs').delete().eq('id', id);
        if (error) throw error;
    }

    // Reports
    async getReports(): Promise<WeeklyReport[]> {
        const { data, error } = await supabase.from('weekly_reports').select('*')
        if (error || !data) return []
        return data.map(r => ({
            id: r.id,
            gpId: r.gp_id,
            date: r.date,
            attendance: r.attendance || [],
            studies: r.studies || [], // Ensure studies exists
            summary: r.summary || { totalAttendance: 0, totalStudies: 0, totalGuests: 0, baptisms: 0 },
            missionaryPairsStats: r.missionary_pairs_stats || [],
            baptisms: r.baptisms || r.summary?.baptisms || 0
        }))
    }
    async createReport(report: Omit<WeeklyReport, 'id'>): Promise<WeeklyReport> {
        const newId = report.date + '-' + report.gpId + '-' + Math.floor(Math.random() * 1000);
        const { data, error } = await supabase.from('weekly_reports').insert([{
            id: newId,
            gp_id: report.gpId,
            date: report.date,
            attendance: report.attendance,
            studies: report.studies,
            summary: report.summary,
            missionary_pairs_stats: report.missionaryPairsStats
        }]).select().maybeSingle();

        if (error || !data) throw error || new Error('Failed to create report');
        return {
            id: data.id,
            gpId: data.gp_id,
            date: data.date,
            attendance: data.attendance || [],
            studies: data.studies || [],
            summary: data.summary || { totalAttendance: 0, totalStudies: 0, totalGuests: 0, baptisms: 0 },
            missionaryPairsStats: data.missionary_pairs_stats || [],
            baptisms: data.baptisms || data.summary?.baptisms || 0
        };
    }
    async updateReport(report: any): Promise<void> {
        const { error } = await supabase.from('weekly_reports').update({
            attendance: report.attendance,
            studies: report.studies,
            summary: report.summary,
            missionary_pairs_stats: report.missionaryPairsStats
        }).eq('id', report.id);
        if (error) throw error;
    }
    async deleteReport(id: string): Promise<void> {
        const { error } = await supabase.from('weekly_reports').delete().eq('id', id);
        if (error) throw error;
    }

    // Compatibility methods
    cleanupDuplicates(): void {
        console.log('Cleanup not needed for Supabase')
    }

    initialize(): void {
        console.log('Supabase backend initialized')
    }

    // Placeholder methods for other entities (to be implemented as needed)

}

export const supabaseBackend = new SupabaseBackendService()
