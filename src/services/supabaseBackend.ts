import { supabase, getCurrentUserId, getCurrentUser } from '../../supabaseClient.js'
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
                    .single()

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
                    .single()

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
                    is_active: userData.isActive ?? true
                }])
                .select()
                .single()

            if (error) {
                console.error('Error creating user:', error)
                throw error
            }

            return {
                id: data.id,
                username: data.username,
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
                    is_active: user.isActive ?? true
                })
                .eq('id', user.id)
                .select()
                .single()

            if (error) {
                console.error('Error updating user:', error)
                throw error
            }

            return {
                id: data.id,
                username: data.username,
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
                .single()

            if (error) {
                console.error('Error fetching GP:', error)
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

    async createGP(gpData: Omit<SmallGroup, 'id'>): Promise<SmallGroup> {
        try {
            const currentUserId = await getCurrentUserId()
            if (!currentUserId) {
                throw new Error('Usuario no autenticado')
            }

            const { data, error } = await supabase
                .from('small_groups')
                .insert([{
                    name: gpData.name,
                    motto: gpData.motto,
                    verse: gpData.verse,
                    meeting_day: gpData.meetingDay,
                    meeting_time: gpData.meetingTime,
                    church_id: gpData.churchId,
                    leader_id: currentUserId, // Usar el ID del usuario actual
                    goals: gpData.goals
                }])
                .select()
                .single()

            if (error) {
                console.error('Error creating GP:', error)
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
                .single()

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
                    first_name: member.firstName,
                    last_name: member.lastName,
                    cedula: member.cedula,
                    birth_date: member.birthDate,
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
                .single()

            if (error) {
                console.error('Error adding member:', error)
                throw error
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

    // Compatibility methods
    cleanupDuplicates(): void {
        console.log('Cleanup not needed for Supabase')
    }

    initialize(): void {
        console.log('Supabase backend initialized')
    }

    // Placeholder methods for other entities (to be implemented as needed)
    getChurches(): Promise<Church[]> { return Promise.resolve([]) }
    getDistricts(): Promise<District[]> { return Promise.resolve([]) }
    getZones(): Promise<Zone[]> { return Promise.resolve([]) }
    getAssociations(): Promise<Association[]> { return Promise.resolve([]) }
    getMissionaryPairs(): Promise<MissionaryPair[]> { return Promise.resolve([]) }
    getReports(): Promise<WeeklyReport[]> { return Promise.resolve([]) }
}

export const supabaseBackend = new SupabaseBackendService()
